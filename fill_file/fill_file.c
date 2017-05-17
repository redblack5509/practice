/************************************************************
Copyright (C), 2015, Leon, All Rights Reserved.
FileName: fill_file.c
Description: 以特定字符填充目标文件到指定大小
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
#include <getopt.h>
#include <errno.h>

#define KB 1024
#define MB (1024*1024)
#define MIN(x, y) ((x) < (y) ? (x) : (y)) 

struct fill_info{
    unsigned char fill_char;
    long target_size;
    char *input_file_name;
    char *output_file_name;
    FILE *input;
    FILE *output;
};

void help(void)
{
    printf(
        "\t ex.: fill_file -i inputfile -o outputfile -s size -c fillchar\n"
        "\t -i : input file, default stdin\n"
        "\t -o : output file, default stdout\n"
        "\t -s : fill to target size\n"
        "\t -c : use char to fill, dafault 0 \n"
        );
}

unsigned char str_to_uint8(char *s)
{
    unsigned char n = 0;

    if(!s)
        return n;
    while(*s && *s > '0' && *s < '9')
    {
        n = n * 10 + *s - '0';
        s++;
    }
    return n;
}

/* 失败返回-1 */
long getsize(char *s)
{
    char *unit;
    long size = 0;

    size = strtol(s, &unit, 10);
    if(*unit != 0)
    { 
        if(*unit == 'k' || *unit == 'K')
            size *= KB;
        else if(*unit == 'm' || *unit == 'M')
            size *= MB;
        else
            size = -1;
    }
    return size;
}

/* 失败返回-1，成功返回0 */
int file_init(struct fill_info *f)
{
    if(!f->input_file_name)
        f->input = stdin;
    else
        f->input = fopen(f->input_file_name, "r");
    if(!f->output_file_name)
        f->output = stdout;
    else
        f->output = fopen(f->output_file_name, "w");

    if(!f->input || !f->output)
        return -1;
    else
        return 0;
}

int fill_file(struct fill_info *f)
{
    char buf[2048] = {0};
    int rbytes = 0, wbytes = 0;
    long sumbytes = 0;

    if(file_init(f) < 0)
    {
        fprintf(stderr, "file init failed\n");
        exit(-1);
    }

    /* 先将输入全部写到输出 */
    while(!feof(f->input))
    {
        rbytes = fread(buf, sizeof(char), sizeof(buf), f->input);
        if(rbytes < 0)
        {
            perror("\n");
            exit(-1);
        }

        sumbytes += rbytes;
        wbytes = 0;
        do
        {
            rbytes -= wbytes;
            wbytes = fwrite(&buf[0] + wbytes, sizeof(char), rbytes, f->output);
            if(wbytes < 0)
            {
                perror("\n");
                exit(-1);
            }
        }while(wbytes < rbytes);
    }

    /* 填充 */
    long fill_size = f->target_size - sumbytes;

    memset(buf, f->fill_char, sizeof(buf));
    while(fill_size > 0)
    {
        wbytes = MIN(fill_size, sizeof(buf));
        wbytes = fwrite(buf, sizeof(char), wbytes, f->output);
        if(wbytes < 0)
        {
            perror("\n");
            exit(-1);
        }
        fill_size -= wbytes;
    }

    fclose(f->input);
    fclose(f->output);
    return 0;
}

int main(int argc, char *argv[])
{

    struct fill_info f;
    int opt;

    memset(&f, 0x0, sizeof(f));

    while((opt = getopt(argc, argv, "c:s:i:o:")) != -1)
    {
        switch(opt)
        {
            case 'c':
                f.fill_char = str_to_uint8(optarg);
                break;
            case 's':
                f.target_size = getsize(optarg);
                break;
            case 'i':
                f.input_file_name = optarg;
                break;
            case 'o':
                f.output_file_name = optarg;
                break;
            default:
                fprintf(stderr, "Unkonw args\n");
                help();
                exit(-1);
        }
    }
    printf("fill char: %d, target_size: %ld\n", f.fill_char, f.target_size);
    fill_file(&f);
    return 0;
}