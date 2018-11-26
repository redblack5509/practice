#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#include <fcntl.h>
#include <sys/stat.h>
#include <unistd.h>
#include <sys/time.h>

/* 
 *风险
 * 1. 如果其他进程没有通知到位，那么simple_sem_wait会一直等着
 * 2. 如果进程在simple_sem_wait的时候挂了（例如ctrl+c），那么另一个进程的simple_sem_post会一直卡住
 **/

/* 成功返回0，失败返回-1 */
static int _simple_sem_init(char *path)
{
    if(!path)
        return -1;
    return mkfifo(path, 0666);
}

/* 成功返回打开的文件描述符，失败返回-1 */
static int _simple_sem_wait(char *path)
{
    if(!path)
        return -1;
    return open(path, O_RDONLY);
}

/* 成功返回打开的文件描述符，失败返回-1 */
static int _simple_sem_post(char *path)
{
    if(!path)
        return -1;
    return open(path, O_WRONLY);
}

/* 成功返回0，失败返回-1 */
static int _simple_sem_close(char *path, int fd)
{
    if(fd >= 0)
        close(fd);
    if(path)
        unlink(path);
}

void simple_sem_wait(char *path)
{
    int fd = 0;
    struct timeval tv;

    if(0 == _simple_sem_init(path))
    {
        gettimeofday(&tv, NULL);
        printf("[%ld s %ld us] wait...\n", tv.tv_sec, tv.tv_usec);

        fd = _simple_sem_wait(path);
        _simple_sem_close(path, fd);

        gettimeofday(&tv, NULL);
        printf("[%ld s %ld us] wait ok...\n", tv.tv_sec, tv.tv_usec);
    }
    else
    {
        usleep(500*1000);
    }  
}

void simple_sem_post(char *path)
{
    int fd = 0;

    printf("weakup...\n");
    fd = _simple_sem_post(path);
    _simple_sem_close(path, fd);
    printf("weakup ok...\n");
}