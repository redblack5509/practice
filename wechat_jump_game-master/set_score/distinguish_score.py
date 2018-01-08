# -*- coding: utf-8 -*-
import os, sys
import time
import numpy as np
from PIL import Image


# 裁剪比例计算。
# 180,310,80,196这些数据均为码者自己量的数据，考虑到不同分辨率手机问题，转化为比例是合理的
phone_h = 1920  # 会由传进来的图像尺寸动态修改
phone_w = 1080  # 会由传进来的图像尺寸动态修改
cut_y1 = 180 / 1920  # 分数的上下分割线
cut_y2 = 310 / 1920
num_weith = 80 / 1080   # 一个数字的宽度
cut_x1 = 196 / 1080 - num_weith     # 分数的左右分割线
cut_x2 = 1
max_num = int((cut_x2 - cut_x1) / num_weith)    # 一排最多容纳多少个数字

user_set_max_score = sys.maxsize  # 用户设置的最大分数

# 除去背景，二值化
def clear_background(im):
    # 转为灰度图
    im_L = im.convert('L')
    bg = im_L.getpixel((0, 0))
    size_x, size_y = im_L.size
    for i in range(0, size_x):
        for j in range(0, size_y):
            # 色差小于5，认为是背景
            if abs(im_L.getpixel((i, j)) - bg) < 5:
                im_L.putpixel((i, j), 255)
            else:
                im_L.putpixel((i, j), 0)
    im_1 = im_L.convert("1")
    return im_1

# 计算两幅图像的汉明距离
def calc_hm(im1, im2):
    v1 = np.array(im1)
    v2 = np.array(im2)
    hmstr = np.nonzero(v1 - v2)  
    hm = np.shape(hmstr[0])[0]   
    return hm 

# 加载模板数据
def load_templets():
    templets = []
    for i in range(0, 11):
        im = Image.open('0-9/{}.png'.format(i))
        templets.append((i, im))
    return templets

# 把图像与模板库的图像进行对比，取汉明距离最新的图像为目标图像
def cmp_img(im, templets):
    min_index, min_hm_distence = (0, sys.maxsize)  # 元组（下标，汉明距离）
    for i in templets:
        index, im_index = i
        hm_distence = calc_hm(im, im_index)
        # print(hm_distence)
        if hm_distence < min_hm_distence:
            min_index, min_hm_distence = (index, hm_distence)
    # print((min_index, min_hm_distence))
    return min_index

# 计算传入图像的分数
def calc_score(im, templets):
    global phone_h, phone_w
    phone_w, phone_h = im.size
    
    # 获取模板库图片大小
    idx_tmp, im_tmp = templets[0]
    im_tmp_x, im_tmp_y = im_tmp.size

    score = ""
    # 分割原图，二值化处理后与模板对比
    for i in range(1, max_num):
        x1 = cut_x1 + num_weith * (i - 1)
        x2 = cut_x1 + num_weith * i
        y1 = cut_y1
        y2 = cut_y2
        cut_im = im.crop((x1 * phone_w, y1 * phone_h, x2 * phone_w, y2 * phone_h))
        cut_im = clear_background(cut_im)
        # 因为模板的像素是固定的，所以缩放到和模板一样大小
        cut_im = cut_im.resize((im_tmp_x, im_tmp_y))
        index = cmp_img(cut_im, templets)
        if index == 10:
            break
        score = score + str(index)
    print(score)
    return int(score)
     
# 设置用户想要达到的分数
def init_set_score(max_score = sys.maxsize):
    global user_set_max_score
    user_set_max_score = max_score
    print("set max score: {}".format(user_set_max_score))

# 判断是否超过预定分数想死了
def want_to_die(im):
    templets = load_templets()
    score = calc_score(im, templets)
    if score > user_set_max_score:
        print("die")
        return True
    else:
        print("live")
        return False

if __name__ == '__main__':
    # 测试程序
    init_set_score(200)
    
    im = Image.open("1920x1080.png")
    print(im.size)
    want_to_die(im)

    im = Image.open("1920x1280.png")
    print(im.size)
    want_to_die(im)

    im = Image.open("1080x720.png")
    print(im.size)
    want_to_die(im)