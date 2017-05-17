#!/usr/bin/python
#coding=utf-8

# svn st和diff的封装, 
# st 过滤掉一些不需要提交的文件
# diff 会先提醒是否diff
# 2016年4月7日14:41:27

import sys,os,re

def filter(line):
    #返回1表示需要过滤
    ignore = (
        r".*[/ \t]\.config$",
        r".*[/ \t]\.config\.old$",
        r".*autoconf\.h$",
        r".*web_files$",
        r".*\.d$",
        r".*\.log$",
        r".*\.(trx$)|(bin$)|(gz$)|(lz$)|(map$)|(o$)",
        r".*[/ \t]ecos_assemb\.txt$",
        r".*[/ \t]ecos$",
        r".*[/ \t]tendaconfig\.h$",
        r".*[/ \t]defaults\.c$",
        r".*[/ \t]bcmconfig.h$",
        # 11AC 过滤
        r".*macro_config\.js$",
        r"svn_version\.h$",
        r"cbb/service/ddns/88ip/czf\.mk",
        r"cbb/service/vpn/pptp/kernel/driver/modules\.order",
        r"cbb/wifi/bcm47189/wps/src/common/include/wps_version\.h",
        r"infra/infra_tpi/include/FlashLib\.h",
        r"infra/infra_tpi/include/clog\.h",
        r"prod/httpd/dhttpd/dhttpd",
        r"prod/tendaupload/tendaupload",
        r"rootpath\.mk",
        r"etc_ro/fireversion\.cfg",
        r"infra/infra_tpi/include/libCfm\.h",
        r"infra/infra_tpi/include/common\.h",
        r".*[/ \t]cbb/service/minidlna/",
        )
    for rule in ignore:
        if re.search(rule, line):
            return 1
    return 0

def usage():
    print '''
help info:
    pysvn st
    pysvn diff
    '''

# 参数判断
if 2 != len(sys.argv):
    usage()
    sys.exit(-1)
if not sys.argv[1] in ('st', 'diff'):
    usage()
    sys.exit(-1)

fd = os.popen("svn st | grep ^M")
for line in fd.readlines():
    if 0 == filter(line):
        print(line),
        if sys.argv[1] == 'diff':
            if re.search("^M", line):
                confirm = raw_input("diff ?(y/n, default 'n'):")
                if confirm in ('y','yes','Y','YES'):
                    cmd = "svn diff " + re.sub(r"^M[ \t]+", "", line)
                    os.system(cmd)
