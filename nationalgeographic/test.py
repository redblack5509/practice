#!/usr/bin/env python3

from PIL import Image, ImageDraw, ImageFont
import math

text="尽管曾作为皇家猎场而存在，意大利大帕拉迪索国家公园一直保留着其野性的一面。画面里的赤狐静静地匍匐在秋草丛中等待时机，它的身躯与自然融为一体。所有狐狸都是机会主义者，生活在大帕拉迪索的赤狐也不例外；如果有可能，无论是鱼类还是野兔，即便是人类野餐留下的残羹冷炙，它们也不介意吃个一干二净。"


def make_text_image(width, white, text, save_path, mode = "rgb"):
    """
    生成一个文字图形, white=1，表示白底黑字，否则为黑底白字
    """

    # 字体可能要改
    # linux查看支持的汉字字体 # fc-list :lang=zh
    try:
        ft = ImageFont.truetype("DroidSansFallbackFull.ttf", 15)
    except:
        ft = ImageFont.truetype("wqy-microhei.ttc", 15)
    w, h = ft.getsize(text)

    # 计算要几行
    lines = math.ceil(w / width) + 1
    height = h * lines

    # 一个汉字的宽度
    one_zh_width, h = ft.getsize("中")

    if len(mode) == 1:  # L, 1
        background = (255)
        color = (0)
    if len(mode) == 3:  # RGB
        background = (255, 255, 255)
        color = (0,0,0)
    if len(mode) == 4:  # RGBA, CMYK
        background = (255, 255, 255, 255)
        color = (0,0,0,0)

    newImage = Image.new(mode, (width, height), background if white else color)
    draw = ImageDraw.Draw(newImage)

    # 分割行
    text = text + " " #处理最后少一个字问题
    text_list = []
    start = 0
    end = len(text) - 1
    while start < end:
        for n in range(end):
            try_text = text[start:start+n]
            w,h = ft.getsize(try_text)
            if w + 2*one_zh_width > width:
                break
        text_list.append(try_text[0:-1])
        start = start + n - 1;

    # print(text_list)

    i = 0
    for t in text_list: 
        draw.text((one_zh_width, i * h), t, color if white else background, font=ft)
        i = i + 1

    newImage.save(save_path);


def resize_canvas(org_image="aa.jpg", add_image="222.jpg", new_image_path="save2.jpg"):

    org_im = Image.open(org_image)
    org_width, org_height = org_im.size

    mode = org_im.mode

    make_text_image(org_width, 0, text, "222.jpg", mode)

    add_im = Image.open(add_image)
    add_width, add_height = add_im.size

    mode = org_im.mode

    newImage = Image.new(mode, (org_width, org_height + add_height))
    
    newImage.paste(org_im, (0, 0, org_width, org_height))
    newImage.paste(add_im, (0, org_height, add_width, add_height + org_height))
    newImage.save(new_image_path)

resize_canvas()
