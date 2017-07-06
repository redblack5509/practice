#!/usr/bin/python3

# ubuntu设置动态bing壁纸

import requests
import os, re

save_dir = "/home/leon/pic/wallpaper/bing/"

def set_desktop(pic_path):
    cmd = "gsettings set org.gnome.desktop.background picture-uri file:" + pic_path
    # 设置壁纸
    ret = os.system(cmd)          
    if ret != 0:
        print("os.system failed, now exit")
        exit(-1)
    
#获取今天的图片的url和copyright信息
def get_bing_info():
    base_url = "http://cn.bing.com/"
    query_url = "HPImageArchive.aspx?format=js&idx=0&n=1"

    r = requests.get(base_url + query_url)

    image_url = base_url + r.json()["images"][0]["url"]
    copyright = r.json()["images"][0]["copyright"]
    copyright = re.sub(r'\(.*\)', '', copyright);
    print(copyright)

    return (image_url, copyright)

#下载图片
def down_pic(pic_url, save_dir):
    image_name = re.sub(r'.*/', '', pic_url)
    save_path = save_dir + image_name
    print(save_path)

    r = requests.get(pic_url)
    file = open(save_path, "wb")
    file.write(r.content)
    file.close()

    return save_path

#添加水印
def add_watermark(path, text):
    new_path = path + ".watermark"
    cmd = "convert {0} -font 文泉驿微米黑 -pointsize 30 -draw \"gravity south fill black  text 0,72 '{1}'  fill white  text 1,71 '{1}' \" {2}".format(path, text, new_path)

    #print(cmd)
    os.system(cmd)   
    os.system("mv {} {}".format(new_path, path))

def main():
    url, copyright = get_bing_info()
    path = down_pic(url, save_dir)
    add_watermark(path, copyright)
    set_desktop(path)

main()
