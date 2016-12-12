
/************************************************************
Copyright (C), 2016, Leon, All Rights Reserved.
FileName: 
Description: 压缩json翻译文件
Author: Leon
Version: 1.0
Date: 2016-10-17 16:37:53
Function:

History:
<author>    <time>  <version>   <description>
 Leon

测试了AC6的韩语、繁体中文，A9的德语语言包，和网上的在线json压缩后内容一致 
************************************************************/

#include <stdio.h>
#include <stdlib.h>
#include <string.h>

#define BUF_SIZE (100*1024)     //处理超长行
#define quota_mark_is_matched(count) (!(count%2))

void usage(void)
{
    char *help = "\
    help:\n\
    example：./compress_json translate.json > translate_tiny.json\
    ";
    fprintf(stderr, "%s\n", help);
}

int deal_text_line(char *line, FILE *output)
{
    int quota_mark_count = 0;   //引号计数
    char *p = line;

    if(!line)
        return -1;

    while(*p)
    {
        switch(*p)
        {
            case ' ':
            case '\t':
            case '\n':
            case '\r':
                if(!quota_mark_is_matched(quota_mark_count))   //引号不匹配
                    fprintf(output, "%c", *p);
                break;
            case '\\':
                //遇到转译字符则跳过转义字符和下一个字符
                fprintf(output, "%c%c", *p, *(p+1));
                p++;
                break;
            case '"':
                quota_mark_count++;
                fprintf(output, "%c", *p);
                break;
            default:
                fprintf(output, "%c", *p);
                break;
        }
        p++;
    }

    if(!quota_mark_is_matched(quota_mark_count))   //引号不匹配
        return -1;
    return 0;
}

int main(int argc, char *argv[])
{
    if(argc < 2)
    {
        usage();
        return -1;
    }

    char *file_name = argv[1];
    FILE *fp = fopen(file_name, "r");
    char *buff = (char *)malloc(BUF_SIZE);

    if(!fp)
    {
        fprintf(stderr, "fopen %s failed: %m\n", file_name);
        goto err;
    }
    if(!buff)
    {
        fprintf(stderr, "malloc failed: %m");
        goto err;
    }

    while(!feof(fp))
    {
        memset(buff, 0x0, BUF_SIZE);
        if(!fgets(buff, BUF_SIZE, fp))
        {
            fprintf(stderr, "fgets error: %m\n");
            goto err;
        }

        if(0 != deal_text_line(buff, stdout))
        {
            fprintf(stderr, "quota mark not matched: %s\n", buff);
            goto err;
        }
    }
    fclose(fp);
    free(buff);
    return 0;

err:
    if(fp)
        fclose(fp);
    if(buff)
        free(buff);
    return -1;
}