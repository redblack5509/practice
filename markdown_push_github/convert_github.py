#!/usr/bin/python3
#将马克飞象导出的markdown保存到自己github

import re, sys, os

def line_handle(line):
    line = line.rstrip()
    resource_line = '!\[(.*?)\]\((.*?)\)'

    def replace(matched):
        desc = matched.group(1) # 位置标记
        path = matched.group(2)
        os.system("cp {} {}".format(path, pic_path))
        result = "![{}](pic/{})".format(desc, path)
        # print(result)
        return result

    newline = re.sub(resource_line, replace, line)

    newline = newline + "  \n"
    print(newline, end = "", file = fd_out)

if(len(sys.argv) < 2):
    print("usage: %s input" %(sys.argv[0]))
    exit()

github_path = "/home/work_sdb1/tenda2/github/blog/"
pic_path = "/home/work_sdb1/tenda2/github/blog/pic/"
file_path = sys.argv[1]
file_name = file_path[file_path.rfind('/') + 1:]
save_path = github_path + file_name

print('markdown file_path is {}\nsave path is {}'.format(file_path, save_path))

try:
    fd_in = open(file_path,"r")
    fd_out = open(save_path, "w")
except OSError as err:
    print(err)
    exit()

datas = fd_in.readlines()

for line in datas:
    line_handle(line)

fd_in.close()
fd_out.close()

