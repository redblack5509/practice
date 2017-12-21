/************************************************************
Copyright (C), 2017, Leon, All Rights Reserved.
FileName: test.c
Description: 
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

#include "list.h"

struct node{
    struct list_head list;
    int n;
};

struct node all;

void create_list(void)
{
    struct node *new = NULL;
    int ch;

    /* 初始化头结点 */
    all.n = 'a';
    INIT_LIST_HEAD(&all.list);

    while(EOF != (ch = getchar()))
    {
        new = malloc(sizeof(struct node));
        new->n = ch;
        list_add(&new->list, &all.list);
    }
}

void print_list(void)
{
    struct node *p = NULL;
    list_for_each_entry(p, &all.list, list)
    {
        printf("%c\n", p->n);
    }
}

void del_list(void)
{
    struct node *p = NULL, *n = NULL;
    list_for_each_entry_safe(p, n, &all.list, list)
    {
        printf("del %c\n", p->n);
        list_del(&p->list);
        free(p);
    }
}
/*====================================*/
struct num{
    struct hlist_node list;
    int n;
};

#define N 23
struct hlist_head all_num[N] = {0};

void create_hlist(void)
{
    struct num *pnode = 0;
    int i = 0;
    int n = 0;
    int hash = 0;

    srand(time(0));
    for(i = 0; i < N; i++)
    {
        n = rand();
        hash = n % N;
        pnode = malloc(sizeof(struct num));
        pnode->n = n;
        hlist_add_head(&pnode->list, &all_num[hash]);
    }
}

void print_hlist(void)
{
    struct num *tpos;
    struct hlist_node *pos;
    int i = 0;

    for(i = 0; i < N; i++)
    {
        printf("[%d] ", i);
        hlist_for_each_entry(tpos, pos, &all_num[i], list)
        {
            printf("%d ", tpos->n);
        }
        printf("\n");
    }
}

int main(int argc, char *argv[])
{
    printf("list测试...\n");
    create_list();
    print_list();
    del_list();
    print_list();

    /* hlist测试 */
    printf("hlist测试...\n");
    create_hlist();
    print_hlist();
    return 0;
}