#!/usr/bin/python3.3
#coding=utf-8

import unicodedata

def get_chr_width(chr):
    if unicodedata.east_asian_width(chr) in ('F','W'):
        return 2
    else:
        return 1

def calc_unicode_string_width(u_string):
    total_len = 0;
    for chr in u_string:
        total_len += get_chr_width(chr)
    print(str(total_len))
    return total_len

# 测试结果全部宽度全为12
calc_unicode_string_width(u'发法萨芬abcd')
calc_unicode_string_width(u'abw123.#$*`,')
calc_unicode_string_width(u'11111111<><>')
calc_unicode_string_width(u'클"&ab라이언')
calc_unicode_string_width(u'bestätig4444')
calc_unicode_string_width(u'Беспроводная')

# ea ; A ; Ambiguous 不确定
# ea ; F ; Fullwidth 全宽
# ea ; H ; Halfwidth 半宽
# ea ; N ; Neutral 中性
# ea ; Na ; Narrow 窄
# ea ; W ; Wide 宽
#英文字符返回全为Na，俄文返回为A,德文ä返回为N，韩文返回W
s = u'`1234567890-=~!@#$%^&*()_+qerty[]qwertyuiopp[]\QWERTYUIOP{}|asdfghjkl;\'ASDFGHJKL:zxcvbnm,./ZXCVBNM<>?Беспроводная클"&ab라이언ä'
for chr in s:
    print(unicodedata.east_asian_width(chr) + ' ')


import tkinter
from tkinter import *

global s

s='sssss'
def func1():
    s='fucked!'
    outputtext.set(s)

root = Tk()                        #base window
buttonfrm = Frame(root)            #'button frame' is in Root window
buttonfrm.pack()

textframe = Frame(root)       #text frame in Root window
textframe.pack(side=LEFT)

btnfrm=Frame(root)
btnfrm.pack(side=BOTTOM)

inputbutton = Button(buttonfrm, text="Input",command=func1)       #command = helloCallBack
inputbutton.pack()

outputbutton = Button(buttonfrm, text="Output")
outputbutton.pack()




inputtext=StringVar()
inputmsg=Label(textframe,textvariable=inputtext, relief=RAISED)
inputtext.set(s)
inputmsg.pack()

s='changed!'
outputtext=StringVar()
outputmsg=Label(textframe,textvariable=outputtext, relief=RAISED)
outputtext.set(s)
outputmsg.pack()



#run & exit button
runbutton = Button(btnfrm, text="RUN!",fg='red')
runbutton.pack()

exitbutton = Button(btnfrm, text="EXIT!",command=root.quit)
exitbutton.pack()

root.mainloop()