#include <sys/types.h>
#include <sys/socket.h>
#include <netinet/in.h>
#include <sys/select.h>
#include <sys/time.h>
#include <unistd.h>
#include <stdlib.h>
#include <string.h>
#include <stdio.h>

#define SERVER_PORT 12345

void handle_connect(int s)
{
    int client_sock;
    struct sockaddr_in client_addr;
    socklen_t len = sizeof(client_addr);
    
    struct timeval tv = {30, 0};
    fd_set rdfs;
    int max_fd = s + 1;

    FD_ZERO(&rdfs);
    FD_SET(s, &rdfs);

    int ret = select(max_fd, &rdfs, NULL, NULL, &tv);
    sleep(2);
    if(-1 == ret)
    {
        perror("");
    }
    else if(0 == ret)
    {
        printf("time out\n");
    }
    else
    {
        client_sock = accept(s, (struct sockaddr *)&client_addr, &len);
        if(-1 == client_sock)
        {
            perror("accept");
        }
        else
        {
            printf("accept success\n");
            close(client_sock);
        }
    }

    exit(0);
}

int main(int argc, char *argv[])
{
    int s = socket(AF_INET, SOCK_STREAM, 0);
    struct sockaddr_in local;

    memset(&local, 0x0, sizeof(local));
    local.sin_family = AF_INET;
    local.sin_addr.s_addr = htonl(INADDR_ANY);
    local.sin_port = htons(SERVER_PORT);

    bind(s, (struct sockaddr *)&local, sizeof(local));
    listen(s, 10);

    /* 创建进程池 */
    pid_t pid[5];
    int i = 0;
    for(i = 0; i < sizeof(pid)/sizeof(pid_t); i++)
    {
        pid[i] = fork();
        if(pid[i] == 0)
        {
            handle_connect(s);
        }
        else if(pid[i] < 0)
        {
            perror("fork");
        }
    }
    while(1);

    close(s);

    return 0;
}
