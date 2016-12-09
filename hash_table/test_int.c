/************************************************************
Copyright (C), 2016, Leon, All Rights Reserved.
FileName: test.c
Description: 整形数据作为数据内容的简单测试
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

void print_hash(void *data)
{
    printf("%d", *(int *)data);
}

// u_int hash(const char *s, u_int len)
// {
//     return *(int*)s;
// }

int main(int argc, char *argv[])
{
    htable_t *H = init_hash_table(5, 4, NULL, NULL, print_hash);
    int i = 0;

    for(i = 0; i < 10; i++)
    {
        put_to_hash_table(H, &i);
    }

    int del = 3;
    del_node_from_hash_table(H, &del);
    print_hash_table(H);

    del = 8;
    del_node_from_hash_table(H, &del);
    print_hash_table(H);

    del = 0;
    del_node_from_hash_table(H, &del);
    print_hash_table(H);

    put_to_hash_table(H, &del);
    print_hash_table(H);

    destory_hash_table(H);
    return 0;
}

// 测试结果：正常
// root@ubuntu:hash_table# make
// cc -MM test_int.c > test_int.d
// cc -c test_int.c
// cc -o test hash_table.o test_int.o
// ./test
// ***********print hash table*************
// **0** [0]->[5]->[NULL]
// **1** [8]->[NULL]
// **2** [1]->[6]->[NULL]
// **3** [4]->[9]->[NULL]
// **4** [2]->[7]->[NULL]
// ***********print hash table*************
// **0** [0]->[5]->[NULL]
// **1** [NULL]
// **2** [1]->[6]->[NULL]
// **3** [4]->[9]->[NULL]
// **4** [2]->[7]->[NULL]
// ***********print hash table*************
// **0** [5]->[NULL]
// **1** [NULL]
// **2** [1]->[6]->[NULL]
// **3** [4]->[9]->[NULL]
// **4** [2]->[7]->[NULL]
// ***********print hash table*************
// **0** [5]->[0]->[NULL]
// **1** [NULL]
// **2** [1]->[6]->[NULL]
// **3** [4]->[9]->[NULL]
// **4** [2]->[7]->[NULL]