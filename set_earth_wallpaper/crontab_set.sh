#!/bin/bash


# 下面这几行代码在crontab中无法正常设置壁纸，只是不报错而已
# Weird, but necessary thing to run with cron.
#sessionfile=`find "${HOME}/.dbus/session-bus/" -type f`
#export `grep "DBUS_SESSION_BUS_ADDRESS" "${sessionfile}" | sed '/^#/d'`

# 这种方法是可行的
# export DBUS_SESSION_BUS_ADDRESS environment variable
PID=$(pgrep gnome-session)
export DBUS_SESSION_BUS_ADDRESS=$(grep -z DBUS_SESSION_BUS_ADDRESS /proc/$PID/environ|cut -d= -f2-)

# 设置壁纸
/home/leon/github/practice/set_earth_wallpaper/set_earth_wallpaper.py
