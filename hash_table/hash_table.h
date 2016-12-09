#ifndef HASH_TABLE_H 
#define HASH_TABLE_H

typedef unsigned int u_int;

typedef struct hash_list{
    void *data; //真正存放用户数据的地方
    struct hash_list *next; //单链表解决冲突
}hlist_t;

typedef struct htable{
    hlist_t **table;        //hash表
    u_int table_size;       //hash表的大小
    u_int member_size;      //表里存放用户数据的数据域结构体大小 
    u_int (*hash)(const char *s, u_int len);  //hash函数指针
    int (*cmp)(const void *src, const void *dest, u_int len);    //比较数据域的函数指针
    void (*print)(void *data);  //打印数据域的函数指针
}htable_t;


/* 初始化hash表 */
htable_t *init_hash_table(u_int table_size, u_int member_size, 
                u_int (*hash)(const char *s, u_int len),
                int (*cmp)(const void *src, const void *dest, u_int len),
                void (*print_func)(void *data));

/* 销毁 */
void destory_hash_table(htable_t *H);

/* 存数据 */
int put_to_hash_table(htable_t *H, void *value);

/* 取数据 */
int get_from_hash_table(htable_t *H, void *value);

/* 删除数据 */
int del_node_from_hash_table(htable_t *H, void *value);

/* 打印整个hash表 */
void print_hash_table(htable_t *H);

#endif /*HASH_TABLE_H*/
