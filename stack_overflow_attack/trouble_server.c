/*
    有缓冲区溢出漏洞的服务器端
    gcc trouble_server.c -g -z execstack -fno-stack-protector
*/

#include <sys/types.h>
#include <sys/socket.h>
#include <stdio.h>
#include <netinet/in.h>
#include <arpa/inet.h>
#include <unistd.h>
#include <string.h>
#include <stdlib.h>
#include <fcntl.h>

#define SERVPORT 55555
#define BUFFER_SIZE 1024

void deal_msg(char *msg)
{
    char dup_msg[32] = {0};

    /* 字符串复制，漏洞点 */
    strcpy(dup_msg, msg);
}

int main()
{
    ///定义sockfd
    int server_sockfd = socket(AF_INET,SOCK_STREAM, 0);

    ///定义sockaddr_in
    struct sockaddr_in server_sockaddr;
    server_sockaddr.sin_family = AF_INET;
    server_sockaddr.sin_port = htons(SERVPORT);
    server_sockaddr.sin_addr.s_addr = htonl(INADDR_ANY);

    ///bind，成功返回0，出错返回-1
    if(bind(server_sockfd,(struct sockaddr *)&server_sockaddr,sizeof(server_sockaddr))==-1)
    {
        perror("bind");
        exit(1);
    }

    ///listen，成功返回0，出错返回-1
    if(listen(server_sockfd, 5) == -1)
    {
        perror("listen");
        exit(1);
    }

    struct sockaddr_in client_addr;
    socklen_t length = sizeof(client_addr);
    char buf[BUFFER_SIZE] = {0};

    ///成功返回非负描述字，出错返回-1
    int conn = accept(server_sockfd, (struct sockaddr*)&client_addr, &length);
    if(conn<0)
    {
        perror("connect");
        exit(1);
    }

    recv(conn, buf, BUFFER_SIZE, 0);

    deal_msg(buf);

    close(server_sockfd);
    close(conn);

    return 0;
}