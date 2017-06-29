#!/bin/bash

# 添加到crontab，一个小时执行一次
# 0 */1 * * * /home/leon/github/practice/bing_wallpaper/crontab_set.sh

# 判断今天是否已经更新了壁纸
date=`date +"%Y%m%d"`
TMP_FILE="/tmp/check_wallpaper_${date}"
if [ -f ${TMP_FILE} ];then
    exit 0
fi

# export DBUS_SESSION_BUS_ADDRESS environment variable
PID=$(pgrep gnome-session)
export DBUS_SESSION_BUS_ADDRESS=$(grep -z DBUS_SESSION_BUS_ADDRESS /proc/$PID/environ|cut -d= -f2-)

# 设置壁纸
/home/leon/github/practice/bing_wallpaper/set_bing_wallpaper.py

# 判断上面的脚本是否成功执行了
if [ $? == 0 ];then
    # 标记今天已经更新了壁纸
    touch ${TMP_FILE}
fi
