#!/usr/bin/python3

# 保存bing壁纸
# VPS安装PIL库
# sudo apt-get install python-imaging
# pip3 install Pillow


from PIL import Image, ImageDraw, ImageFont
import requests
import os, re, time

save_dir = "/home/root/www/bing/"

    
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
    t = time.localtime(time.time())
    image_name = "{}{:0>2}{:0>2}.jpg".format(t.tm_year, t.tm_mon, t.tm_mday)
    # image_name = re.sub(r'.*/', '', pic_url)
    save_path = save_dir + image_name
    print(save_path)

    r = requests.get(pic_url)
    file = open(save_path, "wb")
    file.write(r.content)
    file.close()

    return save_path


#通过python的PIL库添加水印
def add_watermark_by_PIL(path, text):
    img = Image.open(path)
    mode = img.mode
    img_w, img_h = img.size

    font_size = int(img_h / 35)

    if len(mode) == 1:  # L, 1
        white = (255)
        black = (0)
    if len(mode) == 3:  # RGB
        white = (255, 255, 255)
        black = (0,0,0)
    if len(mode) == 4:  # RGBA, CMYK
        white = (255, 255, 255, 255)
        black = (0,0,0,0)

    # 计算text长度，好让文字居中

    # 字体可能要改
    # linux查看支持的汉字字体 # fc-list :lang=zh
    try:
        ft = ImageFont.truetype("DroidSansFallbackFull.ttf", font_size)
    except:
        ft = ImageFont.truetype("wqy-microhei.ttc", font_size)

    font_w, font_h = ft.getsize(text)
    start_px = int((img_w - font_w) / 2)

    #开始添加水印，同时添加黑白水印，处理深色和浅色背景问题
    draw = ImageDraw.Draw(img)
    draw.text((start_px + 2, img_h - font_size - 18), text, black, font=ft)
    draw.text((start_px, img_h - font_size - 20), text, white, font=ft)

    img.save(path)

def main():
    url, copyright = get_bing_info()
    path = down_pic(url, save_dir)
    add_watermark_by_PIL(path, copyright)

main()
