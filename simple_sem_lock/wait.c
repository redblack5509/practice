/************************************************************
Copyright (C), 2018, Leon, All Rights Reserved.
FileName: wait.c
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
#include "sem_lock.h"



int main(int argc, char *argv[])
{
    printf("llm->%s(%d)\n", __FUNCTION__, __LINE__);
    simple_sem_wait("/tmp/111");
    printf("llm->%s(%d)\n", __FUNCTION__, __LINE__);
    return 0;
}