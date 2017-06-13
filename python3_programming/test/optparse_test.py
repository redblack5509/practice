#!/usr/bin/python3
# optparse模块使用

import optparse

parser = optparse.OptionParser()

parser.add_option("-V", action = "store_true", help = ("show version"))
parser.add_option("-w", "--maxwidth", dest = "maxwidth", default = "100",
        help = ("the max width [default:%default]"))
parser.add_option("-q", dest= "quiet", action= "store_false", default = True)

opts, args = parser.parse_args()
print(opts)
print(args)
