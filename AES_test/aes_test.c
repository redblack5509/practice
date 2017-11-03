/*
    编译方法：gcc aes_test.c -lcrypto
*/

#include <stdio.h>
#include <string.h>
#include <sys/types.h>
#include <sys/stat.h>
#include <fcntl.h>
#include <errno.h>
#include <stdlib.h>
#include <unistd.h>
#include <openssl/aes.h>

#define AES_BLOCK_SIZE_128  16  /* 块大小，16字节，128位 */

#define IV "0000000000000000"   /* 初始向量，16字节，加密解密时需使用 */

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


/*
    以128位为一块来进行加密，输入数据填充方式为PKCS5填充到128位整形倍，key长度要
求为128,192,256位,如果不够长度那么填充0
    in: 输入数据
    in_len: 输入数据长度
    out: 加密后的输出缓冲区
    out_len: 输出缓冲区长度
    key: 秘钥
    返回值：加密后的数据长度，0表示加密失败。
*/

/* 测试通过，与网站比对 */
/* 
    用例:
./a.out 123 12345678
./a.out 123 1234567890
./a.out 0 1234567890
./a.out 123456781234567812345678 1234567890
./a.out 123456781234567812345678 12345678901234567890154567897897
./a.out 1234567812345678 12345678901234567890154567897897
./a.out 1234567812345678 1234567812345678
*/
int aes128_cbc_pkcs5pad_encrypt(char *in, int in_len, char *out, int out_len, char *key)
{
    if(!in || !in_len || !out || !out_len || !key)
        return 0;

    int pad_len = AES_BLOCK_SIZE_128 - in_len % AES_BLOCK_SIZE_128;   /* 数据需要填充多少字节 */
    char *pad_data = NULL;  /* 填充后的数据 */
    char *pad_key = NULL;   /* 填充后的秘钥 */
    int key_len = strlen(key);
    int pad_key_len = 0;    /* 秘钥填充后的长度 */
    char *en_data = NULL;   /* 加密后的数据 */
    AES_KEY AesKey;
    char ivec[AES_BLOCK_SIZE_128] = {0};
    int ret = 0;

    /* 判断输出缓冲区是否足够 */
    if(pad_len + in_len > out_len)
    {
        printf("output buffer need %d bytes\n", pad_len + in_len);
        return 0;
    }

    /* 填充数据 */
    pad_data = malloc(in_len + pad_len);
    if(!pad_data)
    {
        perror("malloc failed");
        goto err;
    }
    memcpy(pad_data, in, in_len);
    memset(pad_data + in_len, pad_len, pad_len); //PKCS5填充

    /* 填充秘钥到128/192/256位 */
    switch(key_len/8)
    {
        case 0: 
        case 1:
            pad_key_len = 16;
            break;
        case 2:
        case 3:
            pad_key_len = key_len + key_len % 8;
            break;
        case 4:
            if(0 != key_len % 8)
            {
                printf("key is too long\n");    
                goto err;
            }
            pad_key_len = key_len;
            break;
        default:
            printf("key is too long\n");
            goto err;
    }
    pad_key = malloc(pad_key_len);
    if(!pad_key)
    {
        perror("malloc failed");
        goto err;
    }
    memset(pad_key, 0x0, pad_key_len);
    memcpy(pad_key, key, key_len);

    /* 分配加密后的数据区 */
    en_data = malloc(in_len + pad_len);
    if(!en_data)
    {
        perror("malloc failed");
        goto err;
    }

    /* 下面开始AES库函数调用 */
    memset(&AesKey, 0x0, sizeof(AES_KEY));
    if(AES_set_encrypt_key(pad_key, pad_key_len*8, &AesKey) < 0)
    {
        printf("AES_set_encrypt_key failed\n");
        goto err;
    }

    memset(ivec, 0x0, sizeof(ivec));
    memcpy(ivec, IV, AES_BLOCK_SIZE_128);

    //加密
    AES_cbc_encrypt(pad_data, en_data, in_len + pad_len, &AesKey, ivec, AES_ENCRYPT); 

    memcpy(out, en_data, in_len + pad_len);
    ret = in_len + pad_len;

err:
    if(pad_data)
        free(pad_data);
    if(pad_key)
        free(pad_key);
    if(en_data)
        free(en_data);
    return ret;
}

/*
    解密函数，输入数据的长度必须为128位的整数倍，key长度任意,如果不够长度那么填充0。解密后
    自动去掉尾部的填充数据。
    in: 输入数据
    in_len: 输入数据长度
    out: 加密后的输出缓冲区
    out_len: 输出缓冲区长度，out_len不能小于in_len
    key: 秘钥
    返回值：解密后的数据长度，0表示加密失败。
*/
/* 直接用上一步加密后的数据测试解密OK */
int aes128_cbc_pkcs5pad_decrypt(char *in, int in_len, char *out, int out_len, char *key)
{
    if(!in || !in_len || !out || !out_len || !key)
        return 0;

    char *pad_key = NULL;   /* 填充后的秘钥 */
    int key_len = strlen(key);
    int pad_key_len = 0;    /* 秘钥填充后的长度 */
    AES_KEY AesKey;
    char ivec[AES_BLOCK_SIZE_128] = {0};
    int ret = 0;

    /* 判断输出缓冲区是否足够 */
    if(in_len > out_len)
    {
        printf("output buffer need %d bytes\n", in_len);
        return 0;
    }

    if(0 != in_len % AES_BLOCK_SIZE_128)
    {
        printf("input decrypt data is invalid\n");
        return 0;
    }

    /* 填充秘钥到128/192/256位 */
    switch(key_len/8)
    {
        case 0: 
        case 1:
            pad_key_len = 16;
            break;
        case 2:
        case 3:
            pad_key_len = key_len + key_len % 8;
            break;
        case 4:
            if(0 != key_len % 8)
            {
                printf("key is too long\n");    
                goto err;
            }
            pad_key_len = key_len;
            break;
        default:
            printf("key is too long\n");
            goto err;
    }
    pad_key = malloc(pad_key_len);
    if(!pad_key)
    {
        perror("malloc failed");
        goto err;
    }
    memset(pad_key, 0x0, pad_key_len);
    memcpy(pad_key, key, key_len);


    /* 下面开始AES库函数调用 */
    memset(&AesKey, 0x0, sizeof(AES_KEY));
    if(AES_set_decrypt_key(pad_key, pad_key_len*8, &AesKey) < 0)
    {
        printf("AES_set_encrypt_key failed\n");
        goto err;
    }

    memset(ivec, 0x0, sizeof(ivec));
    memcpy(ivec, IV, AES_BLOCK_SIZE_128);

    //解密
    AES_cbc_encrypt(in, out, in_len, &AesKey, ivec, AES_DECRYPT); 

    //去掉尾部的填充
    ret = in_len - out[in_len - 1];
    memset(out + ret, 0x0, out[in_len - 1]);

err:
    if(pad_key)
        free(pad_key);
    return ret;
}

int main(int argc, char *argv[])
{
    if(argc < 2)
    {
        printf("usage: %s [key] [string]\n", argv[0]);
        return 0;
    }

    struct stat st;
    FILE *in_fp = NULL, *out_fp = NULL;
    char *in_data = NULL, *out_data = NULL;
    int in_len = 0, out_len = 0;
    int ret = 0;

    //加解密字符串
    in_data = argv[2];
    in_len = strlen(in_data);

    //128位加密，16字节对齐，加解密数据不膨胀，这里随意加32个字节长度足矣。
    out_len = in_len + 32;
    out_data = malloc(out_len);

    // 加密
    ret = aes128_cbc_pkcs5pad_encrypt(in_data, in_len, out_data, out_len, argv[1]);
    print_pkt(out_data, ret, "encrypt");

    // 解密
    char *de_data = malloc(ret);
    memset(de_data, 0x0, ret);
    ret = aes128_cbc_pkcs5pad_decrypt(out_data, ret,  de_data, ret, argv[1]);

    print_pkt(de_data, ret, "decrypt");
    printf("\n\ndecrypt data: [%s]\n", de_data);

    return 0;
}