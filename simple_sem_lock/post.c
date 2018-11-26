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
     /* code */
    int fd = 0;
    printf("weakup.main..\n");
    simple_sem_post("/tmp/111");
    printf("weakup ok.main..\n");
    return 0;
}