#ifndef _TIMECHECK_L_H_
#define _TIMECHECK_L_H_

enum LEVEL
{
    LLOG_ERR,
    LLOG_INFO,
    LLOG_DEBUG
};

enum CB_PENDING_TYPE{
    DUP_RUN_CB = 100,   /* 直接重复运行 */
    WAIT_RUN,           /* 等待上次回调结束立即进行这次回调 */
    NEXT_RUN            /* 等待上次回调结束后不立即回调，而是等到下次超时（默认以这种方式） */
};

#define PIPE_BUF_SIZE 1024

typedef struct timer_l{
    char name[128];         //定时器名字
    char first_time[32];    //第一次run的时间，格式"hh:mm:ss"
    int interval;  //后续运行的间隔，0表示不间隔运行
    int debug_flag;         //debug标志
    void (*init)(struct timer_l *t);;   //初始化函数
    void (*cb)(struct timer_l *t);       //回调
    int auto_start;         //随进程自启动还是通过消息启动
    int fd;                 //该timer对应的文件描述符
    int running;            //定时器已启动的标志
    int child_pid;          //子进程pid
    int cb_pending_type;    //当回调还在运行的情况下，下一次超时又来了的处理类型
    char priv_data[PIPE_BUF_SIZE];   //子进程保存的私有数据
    //int priv_data_len;      //私有数据长度
    int pipe_read_fd;       //与子进程建立的读管道
}timer_lt; 

extern int log_level;

#define llog(level, format, argv...) do{    \
        if(level <= log_level)  \
            printf("[%s] %s(%d) "format, #level, __FUNCTION__, __LINE__, ##argv);   \
    }while(0)

#define ARRAY_SIZE(a) (sizeof(a)/sizeof((a)[0]))

extern timer_lt all_timer[];
extern int timer_array_size;

#endif /* _TIMECHECK_L_H_ */