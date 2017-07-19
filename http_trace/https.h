/*
    https协议数据包头定义
*/

#ifndef __HTTPS_H__
#define __HTTPS_H__

#include <linux/types.h>

#define HANDSHAKE 0x16
#define CLIENT_HELLO 0x01
#define TLS1_0_VERSION 0x0301
#define TLS1_1_VERSION 0x0302
#define TLS1_2_VERSION 0x0302
#define SERVER_NAME 0x0000
#define HOSTNAME_MAX_LEN 256

#pragma pack(1)
struct https_head
{
    __u8 content_type;
    __u16 version;
    __u16 length;
    __u8 handshake_type;
    __u8 length2[3];    /* 暂未看出来这个length2作用, length2 = length - 4 */
    __u16 version2;     /* 当IE选项只勾选一种协议时，它和version一样，勾选多种时，
                        可能不一样 */
    __u8 random[32];
    __u8 session_id_length;
    /* session_id_length长度数据 */
    /* __u16 cipher_suites_length */
    /* cipher_suites_length 长度数据 */
    /* __u8 compression_methonds_length */
    /* compression_methonds_length长度数据 */
    /* __u16 extensions_length */
    /* extensions_length长度数据 */
    /* 逐个解析扩展选项...（格式为：类型，长度，数据） */
};
#pragma pack()

#endif  /* __HTTPS_H__ */