/************************************************************
Copyright (C), 2017, Leon, All Rights Reserved.
FileName: filesizelimit.c
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
#include <sys/types.h>
#include <sys/stat.h>
#include <unistd.h>
#include <time.h>

void cp(FILE *fp1, FILE *fp2)
{
    char buffer[8192] = {0};
    int len = 0;

    while(!feof(fp1))
    {
        len = fread(buffer, sizeof(char), sizeof(buffer), fp1);
        while(len > 0)
        {
            len -= fwrite(buffer, sizeof(char), len, fp2);
        }
    }
}

int write_file_limit_size(const char *path, const char *data, int len, int max_size)
{
    int cur_size = 0;
    struct stat st = {0};
    FILE *log_fp = NULL, *tmp_fp = NULL;
    char tmp_name[256] = "log.XXXXXX";
    int cut_len = 0;
    int write_len = 0;

    if(!path || !data || len < 0 || max_size < 0)
        return -1;

    if(-1 == stat(path, &st))
        cur_size = 0;
    else
        cur_size = st.st_size;

    log_fp = fopen(path, "a+");
    if(!log_fp)
        goto error;

    while(len > write_len)
    {
        write_len += fwrite(data, sizeof(char), len - write_len, log_fp);
    }

    if(st.st_size + len > max_size)
    {
        /* 截断 */
        cut_len = st.st_size + len - max_size;
        tmp_fp = fdopen(mkstemp(tmp_name), "w");
        system("ls /tmp/");
        printf("%s\n", tmp_name);
        if(!tmp_fp)
            goto error;
        fseek(log_fp, 0, SEEK_SET);
        fseek(log_fp, cut_len, SEEK_SET);
        cp(log_fp, tmp_fp);

        fclose(log_fp);
        fclose(tmp_fp);
        rename(tmp_name, path);
    }
    else
    {
        /* 直接写入 */
        fclose(log_fp);
    }

    return len;

error:
    log_fp ? fclose(log_fp) : 0;
    tmp_fp ? fclose(tmp_fp) : 0;
    return -1;
}

int main(int argc, char *argv[])
{
    if(argc < 3)
        return;
    write_file_limit_size("123.txt", argv[1], strlen(argv[1]), atoi(argv[2]));
    return 0;
}