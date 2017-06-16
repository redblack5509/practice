#!/usr/bin/python3

# 发现重复文件

import sys, os, collections

path = sys.argv[1]

data = collections.defaultdict(list)

for root, dir, files in os.walk(path):
    for filename in files:
        fullname = os.path.join(root, filename)
        # 对根目录遍历时，某些文件可能没有权限，加个try
        try:
            key = (os.path.getsize(fullname), filename)
            data[key].append(fullname)
        except:
            pass

for size, filename in sorted(data):
    names = data[size, filename]
    if len(names) > 1:
        print("{filename} ({size} bytes) my be duplicated ({0} files)".format(len(names), **locals()))
        for name in names:
            print("\t{0}".format(name))

