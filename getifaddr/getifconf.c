#include <sys/ioctl.h>
#include <sys/socket.h>
#include <netinet/in.h>
#include <net/if.h>
#include <arpa/inet.h>
#include <unistd.h>
#include <stdio.h>
#include <string.h>
#define MAX_IFS 64

int main(int argc, char **argv) {
    struct ifreq *ifr, *ifend;
    struct ifreq ifreq;
    struct ifconf ifc;
    struct ifreq ifs[MAX_IFS];
    int SockFD;
    SockFD = socket(AF_INET6, SOCK_STREAM, 0);
    char addr_buf[INET6_ADDRSTRLEN] = {0};
    ifc.ifc_len = sizeof(ifs);
    ifc.ifc_req = ifs;
    if (ioctl(SockFD, SIOCGIFCONF, &ifc) < 0) {
        printf("ioctl(SIOCGIFCONF): %m/n");
        return 0;
    }
    ifend = ifs + (ifc.ifc_len / sizeof(struct ifreq));
    for (ifr = ifc.ifc_req; ifr < ifend; ifr++) {
        if (ifr->ifr_addr.sa_family == AF_INET6)
            printf("123123\n");
        if (ifr->ifr_addr.sa_family == AF_INET || ifr->ifr_addr.sa_family == AF_INET6) {
            strncpy(ifreq.ifr_name, ifr->ifr_name,sizeof(ifreq.ifr_name));
            if (ioctl (SockFD, SIOCGIFHWADDR, &ifreq) < 0) {
                printf("SIOCGIFHWADDR(%s): %m/n", ifreq.ifr_name);
                return 0;
            }
            if(ifr->ifr_addr.sa_family == AF_INET)
                inet_ntop(AF_INET, &((struct sockaddr_in *) &ifr->ifr_addr)->sin_addr, 
                        addr_buf, INET_ADDRSTRLEN);
            else
                inet_ntop(AF_INET, &((struct sockaddr_in6 *) &ifr->ifr_addr)->sin6_addr, 
                        addr_buf, INET6_ADDRSTRLEN);

            printf("Ip Address %s\n", addr_buf);

            printf("Device %s -> Ethernet %02x:%02x:%02x:%02x:%02x:%02x\n", ifreq.ifr_name,
                    (int) ((unsigned char *) &ifreq.ifr_hwaddr.sa_data)[0],
                    (int) ((unsigned char *) &ifreq.ifr_hwaddr.sa_data)[1],
                    (int) ((unsigned char *) &ifreq.ifr_hwaddr.sa_data)[2],
                    (int) ((unsigned char *) &ifreq.ifr_hwaddr.sa_data)[3],
                    (int) ((unsigned char *) &ifreq.ifr_hwaddr.sa_data)[4],
                    (int) ((unsigned char *) &ifreq.ifr_hwaddr.sa_data)[5]);
        }
    }
    return 0;
}