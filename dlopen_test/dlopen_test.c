/************************************************************
Copyright (C), 2018, Leon, All Rights Reserved.
FileName: dlopen_test.c
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
#include <dlfcn.h>  /* gcc -ldl  */

#include "common.h"

int main(int argc, char *argv[])
{
    // 动态加载库
    if(!dlopen("./libtest.so", RTLD_LAZY))
        printf("[llm] %s\n", dlerror());

    // 调用注册上来的函数
    all_func[0].func();

    return 0;
}