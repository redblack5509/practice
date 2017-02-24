/************************************************************
Copyright (C), 2017, Leon, All Rights Reserved.
FileName: get_if_addr.c
Description: 获取接口地址
Author: Leon
Version: 1.0
Date: 
Function:

History:
<author>    <time>  <version>   <description>
 Leon
************************************************************/

#include <arpa/inet.h>
#include <sys/socket.h>
#include <netdb.h>
#include <ifaddrs.h>
#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#include <unistd.h>

int get_if_addr(const char *ifname, char *addr, int len)
{
    struct ifaddrs *ifaddr, *ifa;
    int family, s;
    char host[NI_MAXHOST];
    int find_flag = 0;
    int addr_len = sizeof(struct sockaddr_in);

    if(!ifname || !addr || !len)
    {
        return -1;
    }

    if(-1 == getifaddrs(&ifaddr))
    {
        perror("getifaddrs");
        return -1;
    }

    for(ifa = ifaddr; ifa != NULL; ifa = ifa->ifa_next)
    {
        if(ifa->ifa_name && !strcmp(ifa->ifa_name, ifname))
        {
            find_flag = 1;
            family = ifa->ifa_addr->sa_family;
            if(family == AF_INET6)
                addr_len = sizeof(struct sockaddr_in6);
            if(family == AF_INET || family == AF_INET6)
            {
                s = getnameinfo(ifa->ifa_addr, addr_len,
                        host, NI_MAXHOST, NULL, 0, NI_NUMERICHOST);
                if(0 != s)
                {
                    printf("getnameinfo() failed: %s\n", gai_strerror(s));
                    freeifaddrs(ifaddr);
                    return -1;
                }
                printf("%s\n", host);
            }
            // break;
        }
    }
    if(0 == find_flag)
    {
        printf("Not valid ifname\n");
        freeifaddrs(ifaddr);
        return -1;
    }
    // family = ifa->ifa_addr->sa_family;
    // if(family == AF_INET6)
    //     addr_len = sizeof(struct sockaddr_in6);

    // if(family == AF_INET || family == AF_INET6)
    // {
    //     s = getnameinfo(ifa->ifa_addr, addr_len,
    //             host, NI_MAXHOST, NULL, 0, NI_NUMERICHOST);
    //     if(0 != s)
    //     {
    //         printf("getnameinfo() failed: %s\n", gai_strerror(s));
    //         freeifaddrs(ifaddr);
    //         return -1;
    //     }
    // }

    // strncpy(addr, host, len - 1);
    return 0;
}

int main(int argc, char *argv[])
{
    char buf[256] = {0};
    get_if_addr(argv[1], buf, sizeof(buf));
    return 0;
}