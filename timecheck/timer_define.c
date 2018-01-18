#include <stdio.h>
#include "timecheck_L.h"

extern void test_timer_cb(timer_lt *t);
extern void test_timer_init(timer_lt *t);

timer_lt all_timer[] = {
    /* own实质不是一个定时器，只做debug使用，动态打开debug开关 */
    {
        .name = "own",
        .first_time = "",
        .interval = 0,
        .debug_flag = 0,
        .init = NULL,
        .cb = NULL,
        .auto_start = 0,    /* 不随进程自启动 */
    },
    {
        .name = "test",
        .first_time = "",
        .interval = 5,
        .debug_flag = 1,
        .init = test_timer_init,
        .cb = test_timer_cb,
        .auto_start = 1,    /* 随进程自启动 */
    },
};


int timer_array_size = ARRAY_SIZE(all_timer);

