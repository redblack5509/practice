/*
 * use special interface to send ipv6 router solicit packet
 * leon, 2017-6-28 15:22:11
 */

#include <stdio.h>
#include <string.h>
#include <stdlib.h>
#include <unistd.h>
#include <sys/types.h>
#include <sys/socket.h>
#include <fcntl.h>
#include <sys/ioctl.h>

#include <netdb.h> /* getaddrinfo() */
#include <arpa/inet.h> /* inet_ntop() */
#include <net/if.h> /* if_nametoindex() */

#include <netinet/in.h>
#include <netdb.h>
#include "ifaddrs.h"
#include <netinet/icmp6.h>

typedef struct
{
    struct nd_router_solicit hdr;
    struct nd_opt_hdr opt;
    uint8_t hw_addr[6];
} solicit_packet;

static int get_mac_address(const char *ifname, uint8_t *addr)
{
    struct ifreq req;
    memset(&req, 0, sizeof (req));

    if(((unsigned)strlen(ifname)) >= (unsigned)IFNAMSIZ)
        return -1; /* buffer overflow = local root */
    strcpy(req.ifr_name, ifname);

    int fd = socket(AF_INET6, SOCK_DGRAM, 0);
    if (fd == -1)
        return -1;

    if (ioctl(fd, SIOCGIFHWADDR, &req))
    {
        perror(ifname);
        close(fd);
        return -1;
    }
    close(fd);

    memcpy(addr, req.ifr_hwaddr.sa_data, 6);

    /* ppp interface maybe get zero mac address */
    uint8_t zero_mac[6] = {0};
    if(!memcmp(addr, zero_mac, sizeof(zero_mac)))
        return -1;

    return 0;
}

#if 0
static int get_if_link_local_addr6(char *ifname, struct sockaddr_in6 *addr6)
{   
    struct ifaddrs *ifaddr, *ifa;   
    char ip_str[64];
    struct in6_addr *tmp;
    int ok = 0;

    if(!ifname || !addr6)
        return 0;

    if (-1 == getifaddrs(&ifaddr))
    {
        perror("getifaddrs");
        return; 
    }

    for(ifa = ifaddr; ifa != NULL; ifa = ifa->ifa_next) 
    {       
        if(ifa->ifa_name && !strcmp(ifa->ifa_name, ifname) && 
            ifa->ifa_addr && ifa->ifa_addr->sa_family == AF_INET6)
        {   
            tmp = &((struct sockaddr_in6 *)(ifa->ifa_addr))->sin6_addr;
            if(IN6_IS_ADDR_LINKLOCAL(tmp))
            {
                memcpy(addr6, ifa->ifa_addr, sizeof(struct sockaddr_in6)); 
                ok = 1;
                //inet_ntop(AF_INET6, tmp, ip_str, sizeof(ip_str));
                //printf("%s\n", ip_str);
            }
        }
    }   
    freeifaddrs(ifaddr);  
    if(!ok)
    {
        printf("Not find the interface(%s) address\n", ifname);
        return -1;
    }    
    return 0;
}
#else
static int get_if_link_local_addr6(char *ifname, struct sockaddr_in6 *addr6)
{
    if(!ifname || !addr6)
        return -1;

    // 自己添加的函数
    get_link_local_sockaddr_in6(ifname, addr6);
    
    //char buf[64] = {0};
    //inet_ntop(AF_INET6, &addr6->sin6_addr, buf, sizeof(buf));
    //printf("%s\n", buf);

    return 0;
}

#endif

static ssize_t build_rs(solicit_packet *rs, const char *ifname)
{
    /* builds ICMPv6 Router Solicitation packet */
    rs->hdr.nd_rs_type = ND_ROUTER_SOLICIT;
    rs->hdr.nd_rs_code = 0;
    rs->hdr.nd_rs_cksum = 0; /* computed by the kernel */
    rs->hdr.nd_rs_reserved = 0;

    /* gets our own interface's link-layer address (MAC) */
    if (get_mac_address(ifname, rs->hw_addr))
        return sizeof(rs->hdr);
    
    rs->opt.nd_opt_type = ND_OPT_SOURCE_LINKADDR;
    rs->opt.nd_opt_len = 1; /* 8 bytes */

    return sizeof(*rs);
}

/* ecos江湖救急，接口不同目的地址不同，不然send不出去，说找不到路由 */
/* 路由如下
ff02:1::        ::1             /32             U        lo0      
ff02:2::        ff02:2::        /32             U        br0      
ff02:3::        ff02:3::        /32             U        eth0     
ff02:4::        ff02:4::        /32             U        eth1     
ff02:5::        ff02:5::        /32             U        vlan1    
ff02:6::        ff02:6::        /32             U        vlan2 
*/

void calc_dest_addr(char *ifname, unsigned char *addr)
{
    int i = 0;
    char *ifnames[] = {"", 
                       "lo0",   // 1 
                       "br0", 
                       "eth0",
                       "eth1",
                       "vlan1", //5
                       "vlan2", 
                       "ppp0"};
    
    // 这才是正确地址
    memcpy(addr, "\xff\x02\x00\x00\x00\x00\x00\x00"
                 "\x00\x00\x00\x00\x00\x00\x00\x02", 16);

                                    
    for(i = 0; i < sizeof(ifnames)/sizeof(char *); i++)
    {
        if(!strcmp(ifname, ifnames[i]))
        {
            addr[3] = i;
            break;
        }
    }

    return;
}

static int sethoplimit(int fd, int value)
{
    return(setsockopt(fd, IPPROTO_IPV6, IPV6_MULTICAST_HOPS,
	                    &value, sizeof (value))
	        || setsockopt(fd, IPPROTO_IPV6, IPV6_UNICAST_HOPS,
	                    &value, sizeof (value))) ? -1 : 0;
}

int send_rs(char *ifname)
{
    int s = -1;
    struct sockaddr_in6 src;
    solicit_packet packet;
    struct sockaddr_in6 dst;
    ssize_t plen;

    if(!ifname)
    {
        return -1;
    }

    s = socket(PF_INET6, SOCK_RAW, IPPROTO_ICMPV6);
    if(-1 == s)
    {
        perror("socket create");
        goto err;
    }

    get_if_link_local_addr6(ifname, &src);
    if(-1 == bind(s, (struct sockaddr *)&src, sizeof(src)))
    {
        perror("bind");
        goto err;
    }

    sethoplimit(s, 255);

    memcpy(&dst, &src, sizeof (dst));  /* copy some address info */
    calc_dest_addr(ifname, &dst.sin6_addr.s6_addr);

    plen = build_rs(&packet, ifname);
    if (sendto(s, &packet, plen, 0, (const struct sockaddr *)&dst, sizeof(dst)) != plen)
    {
        perror("Sending ICMPv6 packet");
        goto err;
    }
    close(s);
    return 0;
    
err:
    if(s != -1)
        close(s);
    return -1;
}



