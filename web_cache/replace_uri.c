/************************************************************
Copyright (C), 2016, Leon, All Rights Reserved.
FileName: replace_uri.c
Description: 输入两个文件
    关键字文件：记录需要替换的uri对
    目标文件：记录需要替换的目标文件
Author: Leon
Version: 1.0
Date: 
Function:

History:
<author>    <time>  <version>   <description>
 Leon
 Leon       2017.5.11   v1.1    修复当资源文件有同名时，程序卡住问题。在同名时
                                虽然程序不会卡住，但是此时对同名文件的替换结果将
                                是同一个MD5值，这结果可能不是你想要的！
************************************************************/

#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#include<sys/stat.h>
#include<unistd.h>

#define KEY_LEN 128
#define FILE_NAME_LEN   256

/* 匹配的关键字对 */
struct key
{
    char src[KEY_LEN];
    char dest[KEY_LEN];
    struct key *next;
};

struct file_list
{
    char name[FILE_NAME_LEN];
    struct file_list *next;
};

struct match_result
{
    char key_src[KEY_LEN];
    char key_dest[KEY_LEN]; /*方便写文件*/
    char *index;
    struct match_result *next;
};

struct key key_head = {0};
struct file_list file_list_head = {0};
struct match_result match_result_head = {0};

/******************************************************************************/

int r_fread(void *ptr, int size, int nmemb, FILE *stream);
int r_fwrite(void *ptr, int size, int nmemb, FILE *stream);
int update_key_list(char *src, char *dest);
int update_file_list(char *name);
int init(char *key_file, char *target_file);
void fini(void);
void free_key_list(void);
void free_file_list(void);
char *match_key(char *buff, char *key, char **index);
void match_all_key(char *buff);
int update_match_result(char *key_src, char *key_dest, char *index);
void free_match_result();
void print_match_result(char *filename);
void *r_malloc(int size);
int file_replace(FILE *fp, char *buf, int buf_size);
int main_loop(void);

/******************************************************************************/


int r_fread(void *ptr, int size, int nmemb, FILE *stream)
{
    int ret = 0;
    int read_size = 0;
    int need_read = size*nmemb;

    do
    {
        ret = fread(ptr, size, nmemb, stream);
        need_read -= ret;
        read_size += ret;
    }while(need_read && !feof(stream));
    return read_size;
}

int r_fwrite(void *ptr, int size, int nmemb, FILE *stream)
{
    int ret = 0;
    int write_size = 0;
    int need_write = size*nmemb;
    
    do
    {
        ret = fwrite(ptr, size, nmemb, stream);
        need_write -= ret;
        write_size += ret;
    }while(need_write);
    return write_size;
}

int update_key_list(char *src, char *dest)
{
    struct key *new = NULL;

    if(!src || !dest)
        return -1;

    new = r_malloc(sizeof(struct key));
    if(!new)
        return -1;
    strncpy(new->src, src, KEY_LEN - 1);
    strncpy(new->dest, dest, KEY_LEN - 1);
    /* 头插法 */
    new->next = key_head.next;
    key_head.next = new;
    return 0;
}

int update_file_list(char *name)
{
    struct file_list *new = NULL;

    if(!name)
        return -1;

    new = r_malloc(sizeof(struct file_list));
    if(!new)
        return -1;
    strncpy(new->name, name, FILE_NAME_LEN - 1);
    /* 头插法 */
    new->next = file_list_head.next;
    file_list_head.next = new;
    return 0;
}

//解析输入文件,初始化key_head链表和file_list_head链表
int init(char *key_file, char *target_file)
{
    FILE *fp = NULL;
    char buf[1024] = {0};

    /* 初始化key list */
    fp = fopen(key_file, "r");
    if(!fp)
    {
        fprintf(stderr, "fopen %s failed: %m\n", key_file);
        return -1;
    }
    while(fgets(buf, sizeof(buf), fp))
    {
        char *src = NULL, *dest = NULL;
        int len = strlen(buf);
        if(buf[len - 1] == '\n')
            buf[len - 1] = '\0';
        dest = strchr(buf, ' ');
        if(!dest)
        {
            fprintf(stderr, "format error, %s\n", buf);
        }
        else
        {
            *dest = 0;
            dest++;
            src = buf;
        }
        update_key_list(src, dest);
        memset(buf, 0x0, sizeof(buf));
    }
    fclose(fp);

    /* 初始化file list */
    fp = fopen(target_file, "r");
    if(!fp)
    {
        fprintf(stderr, "fopen %s failed: %m\n", key_file);
        free_key_list();
        return -1;
    }
    while(fgets(buf, sizeof(buf), fp))
    {
        int len = strlen(buf);
        if(buf[len - 1] == '\n')
            buf[len - 1] = '\0';
        update_file_list(buf);
        memset(buf, 0x0, sizeof(buf));
    }
    fclose(fp);

    return 0;
}

void fini(void)
{
    free_key_list();
    free_file_list();
    free_match_result();
}

void free_key_list(void)
{
    struct key *tmp, *p = key_head.next;

    if(p)
    {
        tmp = p;
        p = p->next;
        free(tmp);
    }
    key_head.next = NULL;
}

void free_file_list(void)
{
    struct file_list *tmp, *p = file_list_head.next;

    if(p)
    {
        tmp = p;
        p = p->next;
        free(tmp);
    }
    file_list_head.next = NULL;
}

//buff全部匹配完则返回NULL，否则返回当前匹配位置加上key长度的指针，index为输出参数。
char *match_key(char *buff, char *key, char **index)
{
    if(!buff || !key || !index)
        return NULL;

    char *result = NULL;

again:
    result = strstr(buff, key);
    if(result)
    {
        /* 过滤一下部分匹配的问题，这么做对于文件名包含这些的自然就不行了 */
        --result;
        if(*result != '/' && *result != '"' && *result != '\'' && *result != '(')
        {
            //文件名只是部分匹配，需要重新匹配
            buff = result + 1 + strlen(key);
            goto again; 
        }
        ++result;
        *index = result;
        return result + strlen(key);
    }
    return NULL;
}

void match_all_key(char *buff)
{
    struct key *p = key_head.next;
    char *index = NULL;
    char *tmp = buff;

    while(p)
    {
        while((buff = match_key(buff, p->src, &index)))
        {
            update_match_result(p->src, p->dest, index);
        }
        p = p->next;
        buff = tmp;
    } 
}

//更新匹配结果列表,按index大小升序排序
int update_match_result(char *key_src, char *key_dest, char *index)
{
    struct match_result *cru, *pre, *new;

    if(!key_src || !key_dest || !index)
        return -1;

    new = r_malloc(sizeof(struct match_result));
    if(!new)
        return -1;

    strcpy(new->key_src, key_src);
    strcpy(new->key_dest, key_dest);
    new->index = index;

    pre = &match_result_head;
    cru = pre->next;
    while(cru)
    {
        /* key.txt出现两个同名关键字时，会出现同一个位置被匹配两次的异常 */
        if(cru->index == index)
        {
            free(new);
            return 0;
        }
        if(cru->index > index)
        {
            break;
        }
        pre = cru;
        cru = pre->next;
    }
    pre->next = new;
    new->next = cru;
    return 0;
}

void print_match_result(char *filename)
{
    struct match_result *p = match_result_head.next;

    printf("****%s*****\n", filename);
    while(p)
    {
        printf("%s\n", p->key_src);
        p = p->next;
    }
    printf("*********\n\n");
}

void free_match_result()
{
    struct match_result *tmp, *p = match_result_head.next;

    if(p)
    {
        tmp = p;
        p = p->next;
        free(tmp);
    }
    match_result_head.next = NULL;
}

void *r_malloc(int size)
{
    void *p = malloc(size);

    if(!p)
    {
        fprintf(stderr, "malloc failed: %m\n");
        return NULL;
    }
    memset(p, 0x0, size);
    return p;
}

int file_replace(FILE *fp, char *buf, int buf_size)
{
    struct match_result *p = match_result_head.next;
    char *begin = buf, *end = NULL;
    int ret = 0;

    if(!p)
    {
        /* 没匹配上，不需要替换，直接返回 */
        return 0;
    }

    /*文件游标移到第一个匹配处*/
    //fseek(fp, p->index - buf, SEEK_SET);
    begin = buf;
    while(p)
    {
        end = p->index;
        ret = r_fwrite(begin, 1, end - begin, fp);
        r_fwrite(p->key_dest, 1, strlen(p->key_dest), fp);
        begin = begin + ret + strlen(p->key_src);
        p = p->next;
    }
    r_fwrite(begin, 1, buf + buf_size - begin, fp);
    return 0;
}

int main_loop(void)
{
    struct file_list *p = file_list_head.next;
    FILE *fp = NULL;
    struct stat st;
    int size = 0;
    char *buf = NULL;

    while(p)
    {
        if(-1 == stat(p->name, &st))
        {
            fprintf(stderr, "stat %s failed: %m\n", p->name);
            return -1;
        }
        size = st.st_size;

        fp = fopen(p->name, "r+");
        if(!fp)
        {
            fprintf(stderr, "fopen file %s failed: %m\n", p->name);
            return -1;
        }

        buf = r_malloc(size);
        if(!buf)
        {
            fprintf(stderr, "malloc failed: %m\n");
            fclose(fp);
            return -1;
        }
        r_fread(buf, size, 1, fp);
        /*匹配*/
        match_all_key(buf);
        //print_match_result(p->name);
        /*改写文件*/
        //直接写文件，因为新文件长度肯定不会比老文件短
        fseek(fp, 0, SEEK_SET);
        file_replace(fp, buf, size);
        fclose(fp);
        free(buf);
        free_match_result();
        p = p->next;
    }

    return 0;
}

int main(int argc, char *argv[])
{
    if(argc < 3)
    {
        return -1;
    }

    init(argv[1], argv[2]);
    main_loop();
    fini();
    return 0;
}