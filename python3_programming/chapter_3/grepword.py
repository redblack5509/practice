#!/usr/bin/python3

import sys

if len(sys.argv) < 3:
    sys.exit()

word = sys.argv[1]
for filename in sys.argv[2:]:
    for lino, line in enumerate(open(filename), start=1):
        if word in line:
            print("{}:{}:{:.40}".format(filename, lino, line.rstrip()))
