/*
    判断一个时间是否应该开启夏令时
*/

#include <time.h>
#include <stdio.h>
#include <string.h>
#include <stdlib.h>

struct dst_conf
{
    int time_zone;        //该夏令时的时区
    int start_month;      //开始月份
    int start_week_cnt;   //第几周
    int start_weekday;    //0为星期天,1为星期一
    int start_hour;       //这个时间为带了时区计算的当地时间
    int end_month;        
    int end_week_cnt;    
    int end_weekday;         
    int end_hour;              
};

/* 美国东部时区(-5)夏令时，3月的第二个星期天2点开始，11月的第一个星期天2点结束 */
struct dst_conf east_dst = {-5, 3, 2, 0, 2, 11, 1, 0, 2};

#define is_leap_year(y) (((y) % 4  == 0 && (y) % 100 != 0) || (y) % 400 == 0)

/* 计算某个日期是星期几的计算公式，基姆拉尔森公式, 返回0-6, 0为周一，6为周日 */
int calc_weekday(int d,int m, int y)
{
     if(m == 1 || m == 2)
     {
         m += 12;
         y--;
     }

     int iweek = (d+2*m+3*(m+1)/5+y+y/4-y/100+y/400)%7;
     return iweek;
} 

/* 计算某个日期距1970年1月1日0时0分0秒的秒数 */
time_t calc_sec1970(int Y, int M, int D, int h, int m, int s)
{
    int i = 0;
    int sec = 0;
    int days[13] = {0, 31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31};

    /* 年计算 */
    for(i = 1970; i < Y; i++)
    {
        if(is_leap_year(i))
            sec += 366 * 24 * 60 * 60;
        else
            sec += 365 * 24 * 60 * 60;
    }

    /* 月计算 */
    for(i = 1; i < M; i++)
    {
        sec += days[i] * 24 * 60 * 60;
        if(i == 2 && is_leap_year(Y))
        {
            sec += 24 * 60 * 60;
        }
    }

    /* 天计算 */
    sec += (D - 1) * 24 * 60 * 60;

    /* 时分秒计算 */
    sec += h * 60 * 60 + m * 60 + s;

    return sec;
}

/* 输入的时间为当地时间，非UTC+0时间 */
time_t calc_sec1970_zone(int Y, int M, int D, int h, int m, int s, int timezone)
{
    return calc_sec1970(Y, M, D, h, m, s) - timezone * 3600;
}

/* 
    time: UTC时间，距离1970年的秒数
    conf: 夏令时的配置
    返回值：1表示夏令时应该开启，0表示夏令时应该关闭 
*/
int daylight_saving_time(time_t time, struct dst_conf *conf)
{
    struct tm* local_time;
    int start_day = 0;
    int end_day = 0;
    int weekday;
    time_t start_sec, end_sec;

    /* 当地时间计算，后续才能进行时间比较 */
    time += 3600 * conf->time_zone;   

    /* 把秒数转为可读的年月日时间 */
    local_time = localtime(&time);
    local_time->tm_mon++;
    local_time->tm_year += 1900;

    /* 计算开始月份1号是星期几，然后推算夏令时开始时间 */
    weekday = (calc_weekday(1, conf->start_month, local_time->tm_year) + 1)%7;
    start_day = 7 * (conf->start_week_cnt - 1) + (7 + conf->start_weekday - weekday)%7 + 1;

    /* 计算结束时间 */
    weekday = (calc_weekday(1, conf->end_month, local_time->tm_year) + 1)%7;
    end_day = 7 * (conf->end_week_cnt - 1) + (7 + conf->end_weekday - weekday)%7 + 1;

    printf("start_day: %d, end_day: %d\n", start_day, end_day);

    /* 把年月日时间转为1970距今的秒数, 方便时间是否在区间内的比较 */
    start_sec = calc_sec1970(local_time->tm_year, conf->start_month, start_day, 
                            conf->start_hour, 0, 0);
    end_sec = calc_sec1970(local_time->tm_year, conf->end_month, end_day, 
                            conf->end_hour, 0, 0);

    if(time >= start_sec && time <= end_sec)
    {
        printf("DST on\n");
        return 1;
    }

    printf("DST off\n");
    return 0;
}

/* 时间同步服务器返回的是1900年1月1日0时0分0秒至今的秒数 */

/* 输入示例： ./a.out "2017-3-12 12:20" -5 */
int main(int argc, char *argv[])
{
    if(argc < 3)
        return -1;

    int Y, M, D, h, m;
    int time_zone = 0;
    time_t sec;

    if(5 != sscanf(argv[1], "%d-%d-%d %d:%d", &Y, &M, &D, &h, &m))
    {
        printf("usage: %s \"2017-3-12 12:20\" -5 \n", argv[0]);
        return -1;
    }

    time_zone = atoi(argv[2]);

    printf("input date: %d-%d-%d %d:%d, timezone = %d\n", Y, M, D, h, m, time_zone);

    /* 时间差计算，计算出输入时间距1970-1-1 0时0分0秒的秒数 */
    sec = calc_sec1970_zone(Y, M, D, h, m, 0, time_zone);  

    //2208988800后面常数为1900到1970的秒数
    
    // 这个函数传入的时间是1970年距今的秒数, 时间服务器获取到的是1900年距今的秒数
    daylight_saving_time(sec, &east_dst);

    return 0;
}

