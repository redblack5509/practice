/************************************************************
Copyright (C), 2016, Leon, All Rights Reserved.
FileName: hash_table.c
Description: 一个通用hash表的实现
Author: Leon
Version: 1.0
Date: 2016-11-30 13:37:01
Function:

History:
<author>    <time>  <version>   <description>
 Leon
************************************************************/


#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#include "hash_table.h"

/* DJB hash函数 */
unsigned int DJBHash(const char *str, u_int len)
{
    unsigned int hash = 5381;
    while (len--)
    {
        hash += (hash << 5) + (*str++);
    }
    return hash;
}

/* 默认的打印数据域的函数，打印指针 */
void default_print(void *data)
{
    printf("%p", data);
}

/* 二分法求n的开平方，向上取整 */
int sqrt_ceil(int n)
{
    int left = 0, right = n, mid = 0;
    int last = 0;
    int tmp = 0;
    
    while(left < right)
    {
        mid = (left + right) / 2;
        tmp = mid * mid;
        if(tmp == n)
        {
            return mid;
        }
        else if(tmp > n)
        {
            right = mid - 1;
            last = mid;
        }
        else
        {
            left = mid + 1;
            last = mid + 1;
        }
    }
    return last;
}

/* 判断一个数是否是素数 */
int is_prime(int n)
{
    int i = 0;

    if(n % 2 == 0)
        return 0;
    
    for(i = 3; i <= sqrt_ceil(n); i = i + 2)
    {
        if(n % i == 0)
            return 0;
    }
    return 1;
}

/* 获得一个不小于入参的最小素数 */
int get_prime(int n)
{
    if(n < 0)
        return 2;

    while(!is_prime(n++));
    return --n;
}

/*****************************************************************************
 函 数 名  : init_hash_table
 功能描述  : 初始化一个hash表
 输入参数  : table_size: hash表的大小
             member_size: 数据域结构的大小
             hash：hash函数，返回的结果会对hash大小取余。默认为DJBHash
             cmp: 比较数据域的函数指针。默认为memcmp
             print_func: 打印数据域的函数指针。默认为打印指针。
 输出参数  : 无
 返 回 值  : 初始化后的hash结构指针
 
 修改历史      :
  1.日    期   : 
    作    者   : leon
    修改内容   : 新生成函数

*****************************************************************************/
htable_t *init_hash_table(u_int table_size, u_int member_size, 
                u_int (*hash)(const char *s, u_int len),
                int (*cmp)(const void *src, const void *dest, u_int len),
                void (*print_func)(void *data))
{
    htable_t *H = (htable_t *)malloc(sizeof(htable_t));

    if(!H)
    {
        printf("malloc failed: %m, exit!\n");
        exit(-1);
    }

    H->table = malloc(table_size * sizeof(hlist_t *));
    if(!H->table)
    {
        printf("malloc failed: %m, exit!\n");
        exit(-1);
    }

    memset(H->table, 0x0, table_size * sizeof(hlist_t *));
    H->table_size = get_prime(table_size);
    H->member_size = member_size;
    H->hash = hash ? hash : &DJBHash;
    H->cmp = cmp ? cmp : &memcmp;
    H->print = print_func ? print_func : &default_print;

    return H;
}

// 销毁hash表，回收内存
void destory_hash_table(htable_t *H)
{
    int i = 0;
    hlist_t *cur = NULL, *tmp;

    if(!H)
        return;

    for(i = 0; i < H->table_size; i++)
    {
        // 判断头是否为空
        cur = H->table[i];
        while(cur)
        {
            tmp = cur;
            cur = cur->next;
            free(tmp->data);
            free(tmp);
        }
    }
    free(H->table);
    free(H);
}

// 插入到末尾
void insert_core(htable_t *H, u_int key, hlist_t *new)
{
    hlist_t *tmp = H->table[key];

    if(!tmp)
    {
        H->table[key] = new;    
    }
    else
    {
        while(tmp->next)
            tmp = tmp->next;
        tmp->next = new;
    }
}

/*****************************************************************************
 函 数 名  : put_to_hash_table
 功能描述  : 把一个数据放入哈希表
 输入参数  : H：hash表结构体指针
             value： 数据域指针  
 输出参数  : 无
 返 回 值  : 0，成功；-1，失败
 
 修改历史      :
  1.日    期   : 
    作    者   : leon
    修改内容   : 新生成函数

*****************************************************************************/
int put_to_hash_table(htable_t *H, void *value)
{
    void *data = NULL;
    hlist_t *node = NULL; 
    u_int key = 0;

    if(!H || !value)
        return -1;

    //分配节点
    node = (hlist_t *)malloc(sizeof(hlist_t));
    data = malloc(H->member_size);

    if(!node)
    {
        printf("malloc failed: %m, exit!\n");
        exit(-1);
    }
    if(!data)
    {
        printf("malloc failed: %m, exit!\n");
        exit(-1);
    }

    // 初始化内容
    memcpy(data, value, H->member_size); 
    node->data = data;
    node->next = NULL;

    // 计算key
    key = H->hash(value, H->member_size) % H->table_size;

    // 插入到hash表
    insert_core(H, key, node);

    return 0;
}

void *get_core(htable_t *H, u_int key, void *value)
{
    hlist_t *tmp = H->table[key];

    while(tmp)
    {
        if(!H->cmp(tmp->data, value, H->member_size))
            return tmp->data;
        tmp = tmp->next;
    }

    return NULL;
}

/*****************************************************************************
 函 数 名  : get_from_hash_table
 功能描述  : 从hash表里获取某个元素，参数value为自己定义的结构体，需要自己填词需要的
             关键字。然后通过比较函数比较value和hash表里的是否匹配。
 输入参数  : H：hash表的结构体
             value: 查询需要填入的关键字信息 
 输出参数  : value：查询成功则复制内容到value
 返 回 值  : -1，查询失败；0，查询成功
 
 修改历史      :
  1.日    期   : 
    作    者   : leon
    修改内容   : 新生成函数

*****************************************************************************/
int get_from_hash_table(htable_t *H, void *value)
{
    u_int key = 0;
    void *result = NULL;

    if(!H || !value)
        return -1;

    key = H->hash(value, H->member_size) % H->table_size;
    result = get_core(H, key, value);
    if(!result)
        return -1;
    memcpy(value, result, H->member_size);
    return 0;
}

/*****************************************************************************
 函 数 名  : del_node_from_hash_table
 功能描述  : 从hash表中删除一个元素
 输入参数  : H: hash表结构体
             value：需要删除的数据，计算hash值和查询时会使用这个value  
 输出参数  : 无
 返 回 值  : 0，删除成功；-1，删除失败（没有找到该记录）
 
 修改历史      :
  1.日    期   : 
    作    者   : leon
    修改内容   : 新生成函数

*****************************************************************************/
int del_node_from_hash_table(htable_t *H, void *value)
{
    u_int key = 0;
    void *result = NULL;
    hlist_t *cur = NULL, *pre = NULL;

    if(!H || !value)
        return -1;

    key = H->hash(value, H->member_size) % H->table_size;
    cur = H->table[key];
    pre = cur;

    if(!cur)
        return -1;
    /* 判断是不是第一个节点 */
    if(!H->cmp(cur->data, value, H->member_size))
    {
        H->table[key] = cur->next;
        free(cur->data);
        free(cur);
        return 0;
    }

    pre = cur;
    cur = cur->next;
    while(cur)
    {
        if(!H->cmp(cur->data, value, H->member_size))
        {
            pre->next = cur->next;
            free(cur->data);
            free(cur);
            return 0;
        }
        pre = cur;
        cur = cur->next;
    }
    return -1;
}

/* 打印hash表 */
void print_hash_table(htable_t *H)
{
    int i = 0;
    hlist_t *tmp = NULL;

    if(!H)
        return;
    
    printf("***********print hash table*************\n");
    for(i = 0; i < H->table_size; i++)
    {
        tmp = H->table[i];
        printf("**%d** ", i);
        while(tmp)
        {
            printf("[");
            H->print(tmp->data);
            printf("]->");
            tmp = tmp->next;
        }
        printf("[NULL]\n");
    }
}
