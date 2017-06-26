#!/usr/bin/python3

# ubuntu设置动态壁纸

import requests
import os

base_url = "http://himawari8-dl.nict.go.jp/himawari8/img/D531106/1d/550/" #官网图片地址前半部分
save_path = "/home/leon/pic/wallpaper/earth/last.jpg"

cwd = os.getcwd() #当前目录

def set_desktop(pic_path):
    cmd = "gsettings set org.gnome.desktop.background picture-uri file:" + pic_path

    # 设置居中
    os.system("gsettings set org.gnome.desktop.background picture-options 'centered'")
    # 设置壁纸
    os.system(cmd)          

    
#获取最近一次地球抓拍的url
def getPic_url():
    r = requests.get("http://himawari8-dl.nict.go.jp/himawari8/img/D531106/latest.json");
    last_time = r.json()["date"]
    last_time = last_time.replace("-","/").replace(" ","/").replace(":","")
    pic_url = base_url + last_time + "_0_0.png"
    #print(pic_url)
    return pic_url

#下载图片
def down_pic(pic_url):
    r = requests.get(pic_url)
    file = open(save_path, "wb")
    file.write(r.content)
    file.close()

def main():
    url = getPic_url()
    down_pic(url)
    set_desktop(save_path)

main()
