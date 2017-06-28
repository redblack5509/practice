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
#include <ifaddrs.h>
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
    return 0;
}


int get_if_link_local_addr6(char *ifname, struct sockaddr_in6 *addr6)
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
            ifa->ifa_addr->sa_family == AF_INET6)
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
        printf("Not find the interface: %s\n", ifname);
        return -1;
    }    
    return 0;
}


ssize_t build_rs(solicit_packet *rs, const char *ifname)
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

int main(int argc, char *argv[])
{
    int s = -1;
    struct sockaddr_in6 src;
    solicit_packet packet;
    struct sockaddr_in6 dst;
    char *ifname = NULL;
    ssize_t plen;

    if(argc < 2)
    {
        printf("usage: %s [ifname]\n", argv[0]);
        return -1;
    }
    ifname = argv[1];

    s = socket(PF_INET6, SOCK_RAW, IPPROTO_ICMPV6);
    if(-1 == s)
    {
        perror("socket create");
        return -1;
    }

    get_if_link_local_addr6(ifname, &src);
    if(-1 == bind(s, (struct sockaddr *)&src, sizeof(src)))
    {
        perror("bind");
        close(s);
        return -1;
    }

    memcpy(&dst, &src, sizeof (dst));  /* copy some address info */
    memcpy(dst.sin6_addr.s6_addr, "\xff\x02\x00\x00\x00\x00\x00\x00"
                                    "\x00\x00\x00\x00\x00\x00\x00\x02", 16);

    plen = build_rs(&packet, ifname);
    if (sendto(s, &packet, plen, 0, (const struct sockaddr *)&dst, sizeof (dst)) != plen)
    {
        perror("Sending ICMPv6 packet");
        close(s);
        return -1;
    }

    return 0;
}