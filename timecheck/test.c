#include <stdio.h>
#include <string.h>
#include <unistd.h>
#include <time.h>

#include "timecheck_L.h"

void test_timer_cb(timer_lt *t)
{
    int *call_cnt = (int *)(t->priv_data);

    llog(LLOG_DEBUG, "test_timer_cb cb\n");
    system("date");
    //sleep(6);

    llog(LLOG_DEBUG, "cnt = %d\n", *call_cnt);
    (*call_cnt)++;
}

void test_timer_init(timer_lt *t)
{
    time_t now_sec;
    struct tm now;
    char buf[128] = {0};
    int *call_cnt = (int *)(t->priv_data);

    *call_cnt = 0;

    /* 设置第一次延迟30s才开始运行 */
    now_sec = time(NULL) + 30;
    localtime_r(&now_sec, &now);
    snprintf(buf, sizeof(buf), "%02d:%02d:%02d", now.tm_hour, now.tm_min, now.tm_sec);

    /* 可以设置定时器参数 */
    strcpy(t->first_time, buf);
    t->interval = 2;
    // t->cb_pending_type = DUP_RUN_CB;
    
    llog(LLOG_INFO, "set first run time: %s, interval: %ds\n", buf, t->interval);
}