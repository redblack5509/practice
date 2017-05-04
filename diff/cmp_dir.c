/************************************************************
Copyright (C), 2016, Leon, All Rights Reserved.
FileName: cmp_dir.c
Description: 对比两个目录的差异
Author: Leon
Version: 1.0
Date: 
Function:

History:
<author>    <time>  <version>   <description>
 Leon
************************************************************/

#define _XOPEN_SOURCE 500   /* nftw 需要, 而且要写在前面 */

#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#include <sys/stat.h>
#include <errno.h>
#include <unistd.h>

#include <sys/types.h>
#include <ftw.h>


#define PATH_LEN 256
#define IGNORE_CONFIG "ignore.conf"

char org_path[PATH_LEN];
char modify_path[PATH_LEN];
char ignore_conf_file[PATH_LEN] = IGNORE_CONFIG;

int cmp_binary = 0;  /* 默认只比较文件的大小 */
int cmp_modify_only = 0;  /* 只管修改过的文件，忽略增加删除的文件 */

/* 一次创建多级目录，类似mkdir -p参数 */
/* mkdir("/a/b/c", 0777) */
int mkdir_r(char *path, int mode)
{
    int len = 0;
    char *child_dir = NULL;
    char tmp_path[PATH_LEN] = {0};

    if(!path)
    {
        printf("mkdir_r failed: path is NULL\n");
        return -1;
    }

    len = strlen(path);

    child_dir = path;
    while((child_dir = strchr(child_dir, '/')) != NULL)
    {
        memset(tmp_path, 0x0, sizeof(tmp_path));
        strncpy(tmp_path, path, child_dir - path + 1);
        if(mkdir(tmp_path, mode) == -1 && errno != EEXIST)
        {
            printf("mkdir fialed: %m\n");
            return -1;
        }
        child_dir++;
    }
    /*处理最后一个子目录*/
    if(path[len-1] != '/')
    {
        memset(tmp_path, 0x0, sizeof(tmp_path));
        strncpy(tmp_path, path, len);
        if(mkdir(tmp_path, mode) == -1 && errno != EEXIST)
        {
            printf("mkdir fialed: %m\n");
            return -1;
        }
    }

    return 0;
}

int write_file_from_buff(const char *file, char *buf, int size)
{
    FILE *fp = fopen(file, "w");
    int rtn, off = 0;

    if(!fp)
    {
        printf("Can't open %s : %m\n", file);
        exit(-1);
    }

    do
    {
        rtn = fwrite(buf+off, 1, size, fp);
        if(rtn > 0)
        {
            size -= rtn;
            off += rtn;
        }
    }while(size > 0);

    fclose(fp);
    return 0;
}

/* 复制文件，会自动创建需要的目录 */
int copy(const char *src_file, const char *dest_file)
{
    char new_dir[PATH_LEN] = {0};
    struct stat st;
    char *buf = NULL;

    if(!src_file || !dest_file)
        return -1;

    /* 创建相应目录 */
    if(strchr(dest_file, '/'))
    {
        strncpy(new_dir, dest_file, strrchr(dest_file, '/') - dest_file);
        mkdir_r(new_dir, 0777);
    }

    if(stat(src_file, &st) == -1)
        return -1;

    buf = (char *)malloc(st.st_size);
    if(!buf)
    {
        printf("malloc failed: %m");
        return -1;
    }

    read_file_to_buff(src_file, buf, st.st_size);
    write_file_from_buff(dest_file, buf, st.st_size);

    free(buf);
    return 0;
}

char *strip(char *s)
{
    if(!s)
        return NULL;

    char *end = s + strlen(s);

    while(s < end)
    {
        if(*s != ' ' && *s != '\t' && *s != '\n' && *s != '\r')
            break;
        *s = 0;
        s++;
    }
    --end;
    while(s < end)
    {
        if(*end != ' ' && *end != '\t' && *end != '\n' && *end != '\r')
            break;
        *end = 0;
        end--;
    }
    return s;
}

/* 从配置文件读取要过滤的目录,需要过滤返回1，否则返回0 */
int filter_with_config_file(const char *path)
{
    FILE *fp = fopen(ignore_conf_file, "r");
    char buf[256] = {0};

    if(!fp)
    {
        printf("can't open %s\n", ignore_conf_file);
        return 0;
    }

    while(fgets(buf, sizeof(buf), fp))
    {
        strip(buf);

        /* 跳过注释行 */
        if('#' == buf[0] || '\0' == buf[0])
            continue;

        if(strstr(path, buf))
        {
            fclose(fp);
            return 1;
        }
    }

    fclose(fp);
    return 0;
}

/* 过滤掉像svn的文件,需要过滤返回1，否则返回0 */
int filter(const char *path)
{
    int i = 0;
    char *key[] = {
        ".svn",
        ".o",
        ".d",
        ".ko",
        ".cmd",
        ".la",
        ".pc",
        ".lai",
        ".a",
        ".so",
        ".bin",
        ".trx"
    };

    for(i = 0; i < sizeof(key)/sizeof(char *); i++)
    {
        if(strstr(path, key[i]))
            return 1;
    }

    return filter_with_config_file(path);
}

int read_file_to_buff(const char *file, char *buf, int size)
{
    FILE *fp = fopen(file, "r");
    int rtn, off = 0;

    if(!fp)
    {
        printf("Can't open %s : %m\n", file);
        exit(-1);
    }

    do
    {
        rtn = fread(buf+off, 1, size, fp);
        if(rtn > 0)
        {
            size -= rtn;
            off += rtn;
        }
    }while(size > 0);

    fclose(fp);
    return 0;
}

/*文件相同返回0，不存在返回-1，有差异返回1*/
int cmp_file_core(const char *file1, const char * file2)
{
    struct stat st1, st2;
    char *buf1, *buf2;
    int rst;

    /* 文件是否存在 */
    if(stat(file1, &st1) == -1 || stat(file2, &st2) == -1)
    {
        return -1;
    }

    /* 文件大小是否一样 */
    if(st1.st_size != st2.st_size)
    {
        return 1;
    }

    if(!cmp_binary)
        return 0;

    /* 比较文件内容 */
    buf1 = (char *)malloc(st1.st_size);
    buf2 = (char *)malloc(st2.st_size);
    if(!buf1 || !buf2)
    {
        perror("malloc failed: ");
        exit(-1);
    }
    read_file_to_buff(file1, buf1, st1.st_size);
    read_file_to_buff(file2, buf2, st2.st_size);
    rst = memcmp(buf1, buf2, st1.st_size);

    free(buf1);
    free(buf2);

    return (rst == 0 ? 0 : 1);
}

/* nftw的回调函数，这里主要处理目录 */
int dir_handle(const char *fpath, const struct stat *sb,
             int tflag, struct FTW *ftwbuf)
{
    const char *child_dir = NULL;
    char path[PATH_LEN] = {0};
    char patch_path1[PATH_LEN] = {0};
    char patch_path2[PATH_LEN] = {0};
    int rst = 0;

    /* 过滤 */
    if(tflag != FTW_F || filter(fpath))
        return 0;

    /* 提取目录 */
    child_dir = fpath + strlen(org_path);
    sprintf(path, "%s%s", modify_path, child_dir);

    rst = cmp_file_core(path, fpath);
    if(1 == rst)    /*内容不同*/
    {
        sprintf(patch_path1, "%s%s%s", org_path, "_patch_l", child_dir);
        sprintf(patch_path2, "%s%s%s", modify_path, "_patch_l", child_dir);        
        copy(fpath, patch_path1);
        copy(path, patch_path2);
    }
    else if(-1 == rst)  /*缺少文件，这里肯定是path的文件缺少，单独复制fpath文件到对应patch_L目录*/
    {
        if(cmp_modify_only == 0)
        {
            sprintf(patch_path1, "%s%s%s", org_path, "_patch_l", child_dir);
            copy(fpath, patch_path1);
        }
    }    

    return 0;
}

int find_add_file(const char *fpath, const struct stat *sb,
             int tflag, struct FTW *ftwbuf)
{
    const char *child_dir = NULL;
    char path[PATH_LEN] = {0};
    char patch_path1[PATH_LEN] = {0};
    char patch_path2[PATH_LEN] = {0};

    /* 过滤 */
    if(tflag != FTW_F || filter(fpath))
        return 0;

    /* 提取目录 */
    child_dir = fpath + strlen(modify_path);
    sprintf(path, "%s%s", org_path, child_dir);

    /* 如果不存在则复制文件 */
    if(access(path, 0) == -1)
    {
        sprintf(patch_path2, "%s%s%s", modify_path, "_patch_l", child_dir);        
        copy(fpath, patch_path2);
    }    

    return 0;
}

void usage(void)
{
    printf(
        "----------------------\n"
        "-m :ignore alone file\n"
        "-b :compare binary, default compare size\n"
        "-i :ignore config file, default ignore.conf"
        );
}

int main(int argc, char *argv[])
{
    int cmp;
    int flags = 0;
    int c = -1;
    char *optstring = "mbh:i";

    if (argc < 3)
    {
        usage();
        return 0;
    }

    while((c = getopt(argc, argv, optstring)) != -1)
    {
        switch(c)
        {
            case 'm':
                cmp_modify_only = 1;
                break;
            case 'b':
                cmp_binary = 1;
                break;
            case 'i':
                strncpy(ignore_conf_file, optarg, PATH_LEN - 1);
                break;
            case 'h':
            default:
                usage();
                return -1;
        }
    }

    flags |= FTW_PHYS;
    strncpy(org_path, *(argv + optind), PATH_LEN);
    strncpy(modify_path, *(argv + optind + 1), PATH_LEN);

    /* 去掉末尾的'/'结尾 */
    if(org_path[strlen(org_path) - 1] == '/')
        org_path[strlen(org_path) - 1] = 0;
    if(modify_path[strlen(modify_path) - 1] == '/')
        modify_path[strlen(modify_path) - 1] = 0;

    /* 遍历org目录，找出modify目录修改和删除的文件 */
    if (nftw(org_path, dir_handle, 100, flags) == -1) 
    {
        perror("nftw");
        return -1;
    }

    /* 遍历modify目录，找出modify目录增加的文件 */
    if(cmp_modify_only == 0)
    {
        if (nftw(modify_path, find_add_file, 100, flags) == -1) 
        {
            perror("nftw");
            return -1;
        }
    }

    return 0;
}