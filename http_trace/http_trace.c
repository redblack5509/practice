/************************************************************
Copyright (C), 2017, Leon, All Rights Reserved.
FileName: http_trace.c
Description: 跟踪自己的http，https请求
Author: Leon
Version: 1.0
Date: 2017-7-19 13:47:04
Function:

History:
<author>    <time>  <version>   <description>
 Leon

 安装依赖库：
 apt install libnetfilter-log-dev libnfnetlink-dev

 编译方法：
 gcc http_trace.c -lnetfilter_log
************************************************************/

#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#include <sys/socket.h>
#include <sys/types.h>
#include <linux/netlink.h>
#include <sys/select.h>
#include <sys/time.h>
#include <unistd.h>

#include <libnetfilter_log/libnetfilter_log.h>

#include <linux/ip.h>
#include <linux/tcp.h>
#include <linux/in.h>

#include "https.h"

#define LISTEN_GROUP 1
#define BUFF_SIZE 4096

#define lprintf(format, argv...) printf("%s(%d): " format , __FUNCTION__, __LINE__, ##argv)

void print_pkt(unsigned char *pkt, int len, char *title)
{
    char hex[64] = {0};
    char assic[64] = {0};
    char *p_hex = hex, *p_assic = assic;
    int i = 0;

    printf("*******************%s start*****************\n", title);
    while(len--)
    {
        if(i != 0 && !(i%16))
        {
            printf("%s %s\n", hex, assic);
            memset(hex, 0x0, sizeof(hex));
            memset(assic, 0x0, sizeof(assic));
            p_hex = hex;
            p_assic = assic;
            i = 0;
        }
        sprintf(p_hex, "%02x ", *pkt);
        p_hex += 3;
        sprintf(p_assic, "%c", *pkt < 32 || *pkt > 127? '.' : *pkt);
        p_assic += 1;
        i++;
        pkt++;
        if(!(i%8))
        {
            sprintf(p_hex, "  ");
            p_hex += 2;
            sprintf(p_assic, "  ");
            p_assic += 2;
        }
    }
    printf("%s %s\n", hex, assic);
    printf("\n\n*******************%s end*****************\n", title);
}

void save_server_name(char *server_name)
{
    printf("%s\n", server_name);
}

int find_server_name(__u8 *edata, int data_len, char *server_name, int sn_len)
{
    __u8 *p = edata;
    __u16 type;
    __u16 len;

    while(p < edata + data_len)
    {
        type = ntohs(*(__u16 *)p);
        p += 2;
        len = ntohs(*(__u16 *)p);
        p += 2;
        
        if(type == SERVER_NAME)
        {
            p += 3; /* 跳过server name list length和server name type字段 */
            len = ntohs(*(__u16 *)p);
            p += 2;
            if(len > sn_len)
            {
                memcpy(server_name, p, sn_len);
                server_name[sn_len - 1] = '\0';
            }
            else
            {
                memcpy(server_name, p, len);
                server_name[len] = '\0';
            }
            return 1;
        }
        p += len;
    }

    return 0;
}


#define POINT_OVERFLOW_CHECK(point, limit) do{\
        if((point) > (limit))   \
            goto point_overflow;    \
    }while(0)

void https_handle(struct iphdr *iph)
{
    struct tcphdr *tcph = (void*)iph + iph->ihl*4;
    __u8 *tcpdata = (void*)tcph + tcph->doff*4;
    int len = ntohs(iph->tot_len) - (iph->ihl*4) - (tcph->doff*4);
        
    struct https_head *https = (struct https_head *)tcpdata;
    __u8 *p = tcpdata;
    __u16 tmp_len;
    __u8 *point_limit = tcpdata + len;
    char server_name[HOSTNAME_MAX_LEN] = {0};

    if(len < sizeof(struct https_head))
        return;

    if(https->content_type != HANDSHAKE)
        return;

    if(https->handshake_type != CLIENT_HELLO)
        return;

    /* TLS1.0开始支持server name字段 */
    if(https->version < htons(TLS1_0_VERSION) 
        && https->version2 < htons(TLS1_0_VERSION))
        return;

    p = &(https->session_id_length);
    
    /* 跳过session_id_length字段 */
    tmp_len = *p;
    p++;
    p += tmp_len;
    POINT_OVERFLOW_CHECK(p, point_limit);
    
    /* 跳过cipher_suites_length字段 */
    tmp_len = ntohs(*(__u16 *)p);
    p += 2;
    p += tmp_len;
    POINT_OVERFLOW_CHECK(p, point_limit);

    /* 跳过compression_methonds_length字段 */
    tmp_len = *p;
    p++;
    p += tmp_len;
    POINT_OVERFLOW_CHECK(p, point_limit);

    /* 现在为扩展字段 */
    tmp_len = ntohs(*(__u16 *)p);
    p += 2;

    if(0 == find_server_name(p, tmp_len, server_name, sizeof(server_name)))
    {
        return;
    }
    else
    {
        save_server_name(server_name);
        return;
    }

point_overflow:
    lprintf("point overflow\n");
    return;
        
}

/* 不区分大小写的strstr */
char *strncasestr(char *str, char *sub)
{
    if(!str || !sub)
        return NULL;

    int len = strlen(sub);
    if (len == 0)
    {
        return NULL;
    }

    while (*str)
    {
        if (strncasecmp(str, sub, len) == 0)
        {
            return str;
        }
        ++str;
    }
    return NULL;
}

/* 从字符串缓冲区读取一行数据(跳过空行)，返回下一个字符串的开始位置 */
char *readline_from_buf(char *from, int from_len, char *to, int to_len)
{
    int i = 0;

    memset(to, 0x0, to_len);

    while(*from == '\r' || *from == '\n')
    {
        from++;
        from_len--;
    }

    for(i = 0; i < to_len && i < from_len; i++)
    {
        if(from[i] == '\r' || from[i] == '\n')
        {
            memcpy(to, from, i);
            return from + i;
        }
    }
    return NULL;
}

void http_handle(struct iphdr *iph)
{
    struct tcphdr *tcph = (void*)iph + iph->ihl*4;
    __u8 *tcpdata = (void*)tcph + tcph->doff*4;
    int len = ntohs(iph->tot_len) - (iph->ihl*4) - (tcph->doff*4);
    char line[1024];
    char *p = NULL;

    if(len && tcpdata[0] != 'G' && tcpdata[0] != 'P')
        return;

    while(tcpdata = readline_from_buf(tcpdata, len, line, sizeof(line)))
    {
        //printf("%s\n", line);
        if(strncasestr(line, "host:"))
        {
            p = (char *)line + strlen("host:");
            while(*p == ' ')
                p++;
            save_server_name(p);
            break;
        }
    }
}


static int cb(struct nflog_g_handle *gh, struct nfgenmsg *nfmsg,
        struct nflog_data *nfa, void *data)
{
    struct nfulnl_msg_packet_hdr *ph = nflog_get_msg_packet_hdr(nfa);
    u_int32_t mark = nflog_get_nfmark(nfa);
    u_int32_t indev = nflog_get_indev(nfa);
    u_int32_t outdev = nflog_get_outdev(nfa);
    char *prefix = nflog_get_prefix(nfa);
    char *payload;
    int payload_len = nflog_get_payload(nfa, &payload);
    struct iphdr *iph = (struct iphdr *)payload;

    struct tcphdr *tcph;

    if (iph->protocol != IPPROTO_TCP) /* not TCP */
        return 0;

    tcph = (void*)iph + iph->ihl*4;

    if(tcph->dest == htons(443))
    {
        https_handle(iph);  
        return 0;
    }

    if(tcph->dest == htons(80))
    {
        http_handle(iph);
        return 0;
    }

    return 0;
}

int main(int argc, char *argv[])
{
    char buf[BUFF_SIZE] = {0};
    int len = 0;
    struct timeval tv = {10, 0};
    int ret = 0;
    fd_set rfds;
    struct nflog_handle *h;
    struct nflog_g_handle *gh;
    int fd;

    h = nflog_open();
    if (!h) {
        fprintf(stderr, "error during nflog_open()\n");
        exit(1);
    }

    if (nflog_bind_pf(h, AF_INET) < 0) {
        fprintf(stderr, "error during nflog_bind_pf()\n");
        exit(1);
    }
    
    gh = nflog_bind_group(h, 1);
    if (!gh) {
        fprintf(stderr, "no handle for grup 1\n");
        exit(1);
    }

    if (nflog_set_mode(gh, NFULNL_COPY_PACKET, 0xffff) < 0) {
        fprintf(stderr, "can't set packet copy mode\n");
        exit(1);
    }

    fd = nflog_fd(h);

    nflog_callback_register(gh, &cb, NULL);

    while(1)
    {
        tv.tv_sec = 10;
        tv.tv_usec = 0;
        FD_ZERO(&rfds);
        FD_SET(fd, &rfds);

        ret = select(fd + 1, &rfds, NULL, NULL, &tv);
        if(ret > 0)
        {
            len = recv(fd, buf, sizeof(buf), 0); 
            if(len)
            {
                nflog_handle_packet(h, buf, len);   
            }
        }
    }

    return 0;
}