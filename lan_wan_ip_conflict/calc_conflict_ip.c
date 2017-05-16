
/*
 * 判断LAN WAN网段冲突并计算新的LNA IP地址
 */

#include <stdio.h>
#include <sys/socket.h>
#include <netinet/in.h>
#include <arpa/inet.h>

#define print_ip(ip) printf(#ip ": %s\n", inet_ntoa(*((struct in_addr *)&(ip))))

unsigned int lan_wan_ip_conflict(unsigned int lanip, unsigned int lan_mask, unsigned int wanip, unsigned int wan_mask)
{
    unsigned int min_mask = lan_mask > wan_mask ? wan_mask : lan_mask;
    unsigned int new_lan_ip = 0;

    /* 打印 */
    print_ip(lanip);
    print_ip(lan_mask);
    print_ip(wanip);
    print_ip(wan_mask);

    /* 判断是否冲突 */
    if((lanip & min_mask) != (wanip & min_mask))
    {
        return new_lan_ip;
    }

    printf("Conflict!\n");

    /* 计算修改后的lanip */
    new_lan_ip = lanip + ~min_mask + htonl(1);
    //new_lan_ip = htonl(new_lan_ip);
    print_ip(new_lan_ip);

    return new_lan_ip;
}

int main(int argc, char *argv[])
{
    if(argc < 5)
    {
        printf("help: %s [lanip] [lanmask] [wanip] [wanmask]\n", argv[0]);
        return;
    }

    in_addr_t lanip = inet_addr(argv[1]);
    in_addr_t lan_mask = inet_addr(argv[2]);
    in_addr_t wanip = inet_addr(argv[3]);
    in_addr_t wan_mask = inet_addr(argv[4]);

    lan_wan_ip_conflict(lanip, lan_mask, wanip, wan_mask);

    return 0;
}
