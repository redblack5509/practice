# -*- coding: utf-8 -*-
import os, sys
import time
import numpy as np
from PIL import Image


# 裁剪比例计算。
# 180,310,80,196这些数据均为码者自己量的数据，考虑到不同分辨率手机问题，转化为比例应该是合理的
h = 1920
w = 1080
cut_y1 = 180 / 1920
cut_y2 = 310 / 1920

num_weith = 80 / 1080

cut_x1 = 196 / 1080 - num_weith
cut_x2 = 1
max_num = int((cut_x2 - cut_x1) / num_weith)

# cnt = 0
# im2 = Image.open('autojump.png')
# # 裁剪
# for i in range(1, max_num):
#     x1 = cut_x1 + num_weith * (i - 1)
#     x2 = cut_x1 + num_weith * i
#     y1 = cut_y1
#     y2 = cut_y2
#     new_im = im2.crop((x1 * w, y1 * h, x2 * w, y2 * h))
#     cnt++
#     new_im.save("{}.png".format(cnt))

# 制作模板
# cnt = 0
# for i in range(1, 9):
#     im2 = Image.open('1 ({}).png'.format(i))
#     # 裁剪
#     for i in range(1, 5):
#         x1 = cut_x1 + num_weith * (i - 1)
#         x2 = cut_x1 + num_weith * i
#         y1 = cut_y1
#         y2 = cut_y2
#         new_im = im2.crop((x1 * w, y1 * h, x2 * w, y2 * h))
#         cnt = cnt + 1
#         new_im.save("0-9/{}.png".format(cnt))

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
    hmstr=np.nonzero(v1-v2)  
    # print(hmstr) # 不为0 的元素的下标  
    hm= np.shape(hmstr[0])[0]   
    return hm 

# 加载模板数据
def load_templets():
    templets = []
    for i in range(0, 11):
        im = Image.open('0-9/{}.png'.format(i))
        templets.append((i, im))
    return templets

def cmp_img(im, templets):
    min_index, min_hm_distence = (0, sys.maxsize)  # 元组（下标，汉明距离）
    for i in templets:
        index, im_index = i
        hm_distence = calc_hm(im, im_index)
        if hm_distence < min_hm_distence:
            min_index, min_hm_distence = (index, hm_distence)
    print((min_index, min_hm_distence))
    return min_index

def calc_score(im, templets):
    score = ""
    # 分割原图，二值化处理后与模板对比
    for i in range(1, max_num):
        x1 = cut_x1 + num_weith * (i - 1)
        x2 = cut_x1 + num_weith * i
        y1 = cut_y1
        y2 = cut_y2
        cut_im = im.crop((x1 * w, y1 * h, x2 * w, y2 * h))
        cut_im = clear_background(cut_im)
        index = cmp_img(cut_im, templets)
        if index == 10:
            break
        score = score + str(index)
    print(int(score))

# 通过已经建好的二值化图像建一个空模板，以应对边界问题
def create_zero_pic():
    im = Image.open('0-9/0.png')
    size_x, size_y = im.size
    for i in range(0, size_x):
        for j in range(0, size_y):
            im.putpixel((i, j), 1)
    im.save("0-9/10.png")        


src_img = Image.open('1 (1).png')
templets = load_templets()
calc_score(src_img, templets)
