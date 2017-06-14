/*
 * 控制子进程运行时间
 * ./a.out ls
 * ./a.out cat
 */ 

#include <stdio.h>
#include <stdlib.h>
#include <unistd.h>
#include <signal.h> 
#include <sys/types.h> 
#include <sys/wait.h>

#define WAIT_TIME 5

void child_exit(int sig)
{
    // 清理子进程
    wait(NULL);
}

int main(int argc, char *argv[])
{
    pid_t pid;
    
    signal(SIGCHLD, child_exit);
    pid = fork();
    if(pid < 0)
    {
        perror("fork error");
        exit(-1);
    }
    else if(pid == 0)
    {
        // 执行命令行的参数
        if(-1 == execvp(argv[1], &argv[1]))
        {
            perror("execvp error");
            exit(-1);
        }
        printf("child exec ok!");
    }
    else
    {
        // 如果子进程提前退出，收到信号后sleep会唤醒
        sleep(WAIT_TIME);    
        // kill一次，无关乎失败
        kill(pid, 9);
    }

    return 0;
    
}
