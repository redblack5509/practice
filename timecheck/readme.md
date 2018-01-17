  
>定时器处理框架    
  
# 需要支持的功能    
1. 支持设置间隔定时器，即多久执行一次    
应用举例：一直间隔运行的联网检查  
  
2. 支持设置特定时间点运行的定时器，即到了某个时间点只运行一次  
应用举例：定时强制重启功能  
  
3. 支持第一次以特定时间点运行，后续以间隔运行  
应用举例：流量检查的定时重启功能  
  
4. 支持外部进程的消息来启动、停止和重启某个定时器，需要支持打开某个定时器的debug开关  
应用举例：页面配置更新后，需要发消息让某个定时器重启  
  
# 外部接口    
## 发送消息接口  
通过本地套接字通信，编写发送客户端(实现上客户端其实也是服务器，只是参数不一样而已)，其他进程直接调用该客户端，指定定时器名字，和消息类型  
命令行举例：  
启动timechck服务：`timecheck &`  
给test定时器发送重启(start/stop/restart)消息：`timecheck test restart`  
设置test定时器的debug级别为debug:`timecheck test debug`  
  
## 定时器接口  
1. 结构体  
```c  
typedef struct timer_l{  
    char name[128];         //定时器名字  
    char first_time[32];    //第一次run的时间，格式"hh:mm:ss"  
    int interval;  //后续运行的间隔，0表示不间隔运行  
    int debug_flag;         //debug标志  
    void (*init)(struct timer_l *t);;   //初始化函数  
    void (*cb)(void);       //回调  
    int auto_start;         //随进程自启动还是通过消息启动  
    int fd;                 //该timer对应的文件描述符  
    int running;            //定时器已启动的标志  
}timer_lt;   
```  
2. 日志接口  
```c  
enum LEVEL  
{  
    LLOG_ERR,  
    LLOG_INFO,  
    LLOG_DEBUG  
};  
llog(LLOG_DEBUG, "%s...\n", s);  
```  
日志级别为主进程设置，默认为LLOG_INFO级别，可以通过`timecheck xxx debug`打开单个定时器的debug  
3. 使用  
在timer_define中定义自己的定时器即可，参照test定时器  
  
  
  
**问题：**    
  
1. 主进程是否等待系统时间更新再启动定时器？    
主进程无法判断系统时间是否更新，所以主进程不做判断。如果需要系统时间更新再处理，可以把自己的定时器设置为不随主进程启动（auto_start=0），放到sntp时间服务更新的事件来触发启动定时器。    
2. stop一个定时器时，如果定时器的回调正在运行会怎么样？    
回调通过子进程的方式运行，stop定时器时不会影响子进程，只是把主进程的监听移除。

