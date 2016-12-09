/************************************************************
Copyright (C), 2016, Leon, All Rights Reserved.
FileName: test.c
Description: 结构体作为数据内容测试
Author: Leon
Version: 1.0
Date: 
Function:

History:
<author>    <time>  <version>   <description>
 Leon
************************************************************/

#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#include "hash_table.h"

#define NAME_SIZE 4

typedef struct{
    int number;
    int age;
    char name[NAME_SIZE + 1];
}people_t;

//自定义打印函数
void print_data(void *data)
{
    people_t *p = (people_t *)data;

    printf("%d, %d, %s", p->number, p->age, p->name);
}

//自定义hash函数
u_int hash(const char *s, u_int len)
{
    people_t *p = (people_t *)s;

    return p->number;
}

//自定义比较函数,比较编号
int cmp(const void *src, const void *dest, u_int len)
{
    int number1 = ((people_t *)src)->number;
    int number2 = ((people_t *)dest)->number;
    
    return number1 - number2; 
}

int main(int argc, char *argv[])
{
    htable_t *H = init_hash_table(6, sizeof(people_t), hash, cmp, print_data);
    int i = 0;
    people_t people = {0};

    //添加数据
    for(i = 0; i < 10; i++)
    {
        people.number = i;
        people.age = i + 18;
        memset(people.name, 'a' + i, NAME_SIZE);
        put_to_hash_table(H, &people);
    }
    print_hash_table(H);

    /*测试提取数据*/
    people.number = 3;
    get_from_hash_table(H, &people);
    print_data(&people);
    printf("\n");

    /*测试删除数据*/
    people.number = 8; //删除编号为8的数据
    del_node_from_hash_table(H, &people);
    if(0 != get_from_hash_table(H, &people))
    {
        printf("get 失败\n");
        print_hash_table(H);
    }

    /*测试删除数据*/
    people.number = 3; //删除编号为3的数据
    del_node_from_hash_table(H, &people);
    if(0 != get_from_hash_table(H, &people))
    {
        printf("get 失败\n");
        print_hash_table(H);
    }

    /*添加数据测试*/

    people.number = 103; //添加编号为103的数据
    people.age = 50;
    strcpy(people.name, "leon");
    put_to_hash_table(H, &people);
    print_hash_table(H);

    destory_hash_table(H);

    return 0;
}

// 测试结果：正常
// root@ubuntu:hash_table# make
// cc -MM test.c > test.d
// cc -c test.c
// cc -o test hash_table.o test.o
// ./test
// ***********print hash table*************
// **0** [0, 18, aaaa]->[5, 23, ffff]->[NULL]
// **1** [1, 19, bbbb]->[6, 24, gggg]->[NULL]
// **2** [2, 20, cccc]->[7, 25, hhhh]->[NULL]
// **3** [3, 21, dddd]->[8, 26, iiii]->[NULL]
// **4** [4, 22, eeee]->[9, 27, jjjj]->[NULL]
// 3, 21, dddd
// get 失败
// ***********print hash table*************
// **0** [0, 18, aaaa]->[5, 23, ffff]->[NULL]
// **1** [1, 19, bbbb]->[6, 24, gggg]->[NULL]
// **2** [2, 20, cccc]->[7, 25, hhhh]->[NULL]
// **3** [3, 21, dddd]->[NULL]
// **4** [4, 22, eeee]->[9, 27, jjjj]->[NULL]
// get 失败
// ***********print hash table*************
// **0** [0, 18, aaaa]->[5, 23, ffff]->[NULL]
// **1** [1, 19, bbbb]->[6, 24, gggg]->[NULL]
// **2** [2, 20, cccc]->[7, 25, hhhh]->[NULL]
// **3** [NULL]
// **4** [4, 22, eeee]->[9, 27, jjjj]->[NULL]
// ***********print hash table*************
// **0** [0, 18, aaaa]->[5, 23, ffff]->[NULL]
// **1** [1, 19, bbbb]->[6, 24, gggg]->[NULL]
// **2** [2, 20, cccc]->[7, 25, hhhh]->[NULL]
// **3** [103, 50, leon]->[NULL]
// **4** [4, 22, eeee]->[9, 27, jjjj]->[NULL]