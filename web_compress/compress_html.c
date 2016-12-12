/************************************************************
Copyright (C), 2016, Leon, All Rights Reserved.
FileName: compress_html.c
Description: 压缩html
Author: Leon
Version: 1.0
Date: 2016年10月14日14:06:37
Function:

History:
<author>    <time>  <version>   <description>
 Leon

bug: 如下这种js代码里的字符串会被破坏
<html>
<script>
    var str="haha: <>  <";
</script>
</html>
************************************************************/

#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#include <sys/types.h>
#include <fcntl.h>
#include <sys/stat.h>
#include <unistd.h>
#include <sys/mman.h>

void usage(void)
{
    printf("ex: ./compress_html login.html > login.mini.html\n");
}

/*****************************************************************************
 函 数 名  : need_compress
 功能描述  : 判断字符串是否需要压缩，即全是空格、tab、换行符
 输入参数  : start：字符串开始，end：字符串结束  
 输出参数  : 无
 返 回 值  : 需要压缩返回1，不需要压缩返回0
 
 修改历史      :
  1.日    期   : 2016年10月14日14:03:37
    作    者   : leon
    修改内容   : 新生成函数

*****************************************************************************/
int need_compress(char *start, char *end)
{
    if(!start || !end)
        return 0;

    for( ;start <= end; start++)
    {
        switch(*start)
        {
            case ' ':
            case '\t':
            case '\n':
            case '\r':
                break;
            default:
                return 0;
        }
    }
    return 1;
}

/*****************************************************************************
 函 数 名  : compress_data
 功能描述  : 解析输入数据，并压缩写入文件
 输入参数  : data：欲压缩的字符串
             len: 数据长度
             output_fp: 需要写入的文件描述符

 输出参数  : 无
 返 回 值  : 无
 
 修改历史      :
  1.日    期   : 2016年10月14日14:05:13
    作    者   : leon
    修改内容   : 新生成函数

*****************************************************************************/
void compress_data(char *data, int len, FILE *output_fp)
{
    if(!data || !len || !output_fp)
        return;

    char *cur = NULL, *start = NULL, *end = NULL;
    int flag = 0;   /*右尖括号'>'是否记录的标志*/

    for(cur = data; cur <= data + len; cur++)
    {
        switch(*cur)
        {
            case '>':
                if(flag == 0)
                {
                    fprintf(output_fp, "%c", *cur);
                    start = cur + 1;
                    flag = 1;
                }
                break;
            case '<':
                if(flag == 0)
                {
                    fprintf(output_fp, "%c", *cur);
                    break;
                }
                end = cur - 1;
                flag = 0;
                /*判断是否只有空格tab换行符*/
                if(!need_compress(start, end))
                    fwrite(start, end - start + 1, 1, output_fp);
                fprintf(output_fp, "%c", *cur);
                break;
            default:
                if(flag == 0)
                    fprintf(output_fp, "%c", *cur);
                break;
        }
    }
}

int main(int argc, char *argv[])
{
    char *file_name = NULL;
    int input_fd = -1;
    char *data = NULL;
    struct stat st;
    int file_size = 0;

    if(argc < 2)
    {
        usage();
        return -1;
    }

    file_name = argv[1];

    if(-1 == stat(file_name,&st))
    {
        fprintf(stderr , "stat %s error: %m\n", file_name);
        return -1;
    }
    file_size = st.st_size;

    input_fd = open(file_name, O_RDONLY);
    if(-1 == input_fd)
    {
        fprintf(stderr, "open %s error:%m\n", file_name);
        return -1;
    }

    data = (char *)mmap(NULL, file_size, PROT_READ, MAP_PRIVATE, input_fd, 0);
    if((char *)-1 == data)
    {
        fprintf(stderr, "mmap error:%m\n");
        close(input_fd);
        return -1;
    }

    /*解析数据*/
    compress_data(data, file_size, stdout);
    /*清理*/
    munmap(data, file_size);
    close(input_fd);

    return 0;
}