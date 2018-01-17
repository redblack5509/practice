#ifndef _TIMECHECK_L_H_
#define _TIMECHECK_L_H_

enum LEVEL
{
    LLOG_ERR,
    LLOG_INFO,
    LLOG_DEBUG
};

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

extern int log_level;

#define llog(level, format, argv...) do{    \
        if(level <= log_level)  \
            printf("[%s] %s(%d) "format, #level, __FUNCTION__, __LINE__, ##argv);   \
    }while(0)

#define ARRAY_SIZE(a) (sizeof(a)/sizeof((a)[0]))

extern timer_lt all_timer[];
extern int timer_array_size;

#endif /* _TIMECHECK_L_H_ */