/************************************************************
Copyright (C), 2018, Leon, All Rights Reserved.
FileName: test_lib.c
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

#include "common.h"

#define _init __attribute__((constructor)) _INIT

void hello(void)
{
    printf("hello world\n");
}

struct own_func test = {
    .name = "leon",
    .func = hello,
};

void _init(void)
{
    printf("-------init----\n");
    register_func(&test);
}