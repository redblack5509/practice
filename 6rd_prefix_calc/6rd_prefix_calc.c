/*
 * 计算6rd前缀
 */

#include <stdio.h>
#include <string.h>
#include <stdlib.h>

#include <sys/socket.h>
#include <netinet/in.h>
#include <arpa/inet.h>

typedef struct{
    struct in6_addr addr;
    int prefix_len;
}ipv6_addr_struct;

typedef unsigned char uchar;

/* 数组向右移位 */
void shift_right(uchar *ar, int size, int shift)
{
    uchar carry = 0;                    
    uchar next = 0;
    int i = 0;
    while (shift--) 
    {                          
        carry = 0;
        for (i = 0; i < size; i++) 
        {   
            next = (ar[i] & 1) ? 0x80 : 0; 
            ar[i] = carry | (ar[i] >> 1);      
            carry = next;                   
        }   
    }
}   

/* dst和src进行或运算，结果保存在dst */
void binary_or_op(uchar *dst, uchar *src, int size)
{
    int i = 0;

    for(i = 0; i < size; i++)
    {
        dst[i] |= src[i];
    }
}


/* 打印字符串的二进制 */
void print_binary(uchar *s, int size)
{
    int i = 0;
    int j = 0;
    for(i = 0; i < size; i++)
    {
        for(j = 0; j < 8; j++)
        {
            if((s[i] << j) & 0x80)
                printf("1");
            else
                printf("0");
        }
        printf(" ");
    }
    printf("\n");
}

/* 
 * 计算6rd的前缀，得到IPV4的尾部地址后移位Prefix len长度再与prefix进行或运算 
 * prefix: 上级下发的前缀
 * prefix_len: 下发的前缀长度
 * wan_ip: wan口IP
 * mask_len: 边界路由器ipv4地址的掩码长度
 * ipv6_addr: 保存计算结果，其中含计算出的LAN前缀和前缀长度
 */

int calc_6rd_prefix(char *prefix, int prefix_len, char *wan_ip, int mask_len, 
    ipv6_addr_struct *ipv6_addr)
{
    unsigned long wan_ip_tail = (inet_addr(wan_ip) >> mask_len); //网络字节序，大端，右移
    uchar addr_pad[16] = {0};
    struct in6_addr prefix_addr; 

    inet_pton(AF_INET6, prefix, &prefix_addr);

    memcpy(addr_pad, &wan_ip_tail, sizeof(wan_ip_tail));
    shift_right(addr_pad, sizeof(addr_pad), prefix_len);
    binary_or_op((uchar*)addr_pad, (uchar*)&prefix_addr, sizeof(addr_pad));

    memcpy(ipv6_addr, addr_pad, sizeof(*ipv6_addr));
    ipv6_addr->prefix_len = prefix_len + (32 - mask_len);
    return 0;
}


int main(int argc, char *argv[])
{
    if(argc < 5)
        return 0;

    ipv6_addr_struct ipv6_addr;
    char ip[128] = {0};

    calc_6rd_prefix(argv[1], atoi(argv[2]), argv[3], atoi(argv[4]), &ipv6_addr);

    inet_ntop(AF_INET6, &ipv6_addr.addr, ip, sizeof(ip));
    printf("%s/%d\n", ip, ipv6_addr.prefix_len);
    return 0;
}

/* 测试

root@leon-virtual-machine:6rd_prefix_calc# ./a.out 2001:db8:: 32 192.168.3.4 16
2001:db8:304::/48
root@leon-virtual-machine:6rd_prefix_calc# ./a.out 2001:db8:: 32 192.168.3.4 24
2001:db8:400::/40
root@leon-virtual-machine:6rd_prefix_calc# ./a.out 2001:db8:: 32 192.168.3.4 8
2001:db8:a803:400::/56
root@leon-virtual-machine:6rd_prefix_calc# ./a.out 2001:db8:: 32 192.168.3.4 0
2001:db8:c0a8:304::/64
root@leon-virtual-machine:6rd_prefix_calc# ./a.out 2001:db8:: 48 192.168.3.4 0
2001:db8:0:c0a8:304::/80
root@leon-virtual-machine:6rd_prefix_calc# ./a.out 2001:db8:: 48 192.168.3.4 16
2001:db8:0:304::/64
root@leon-virtual-machine:6rd_prefix_calc# ./a.out 2001:db8:: 33 192.168.3.4 16
2001:db8:182::/49
root@leon-virtual-machine:6rd_prefix_calc# ./a.out 2001:db8:: 33 192.168.3.4 24
2001:db8:200::/41
root@leon-virtual-machine:6rd_prefix_calc# ./a.out 2001:db8:: 33 192.168.3.4 15
2001:db8:384::/50

*/