#!/usr/bin/python3.3
#coding=utf-8

# windows上python3.4测试通过，不兼容python2.x
# 自己的ubuntu上测试不过，因为ubuntu上装的xlrd版本是2.x的

import xlrd
import sys,getopt,json,codecs

def usage():
    helpinfo = '''
    -h, --help : print help info
    -i, --input : input file
    -o, --output : output file
    -c, --check : check json format
    '''
    print(helpinfo)

# 打印输出
def log(*args, **kwargs):
    if __name__ == '__main__':
        log_fd = codecs.open("123.txt", "w", encoding='utf-8')
        print("[%s] " %(time.asctime()), end="", file = log_fd)
        print(*args, **kwargs)
    else:
        #输出到gui


# 检查json文件的格式是否正确
def check_json_format(json_file):
    fd = codecs.open(json_file, "r", encoding='utf-8')
    try:
        package = json.load(fd)
    except ValueError as err:
        err_str = str(err)
        index = err_str.find(":")
        log(json_file + "的json格式错误：" + err_str[index + 1:])
        return

    check_percent_symbol_match(package)
    log("json格式正确")

# 检查翻译包的"%s"个数是否匹配
def check_percent_symbol_match(package):
    miss_percent_symbol = {}
    for key in package:
        if key.count("%s") != package.get(key).count("%s"):
            miss_percent_symbol[key] = package.get(key)
            log(key)
            log(package.get(key))

    # 打印输出
    log("【%s不匹配】업그레이드")
    # for key in miss_percent_symbol:
        # print("\"%s\": \"%s\"" %(key, miss_percent_symbol.get(key)))


def load_excel(inputFile):
    translate = {}
    log("input file: %s\n" %(inputFile))

    # 打开文件
    workbook = xlrd.open_workbook(inputFile)

    # 根据sheet索引或者名称获取sheet内容
    sheet1 = workbook.sheet_by_index(0) # sheet索引从0开始

    # sheet的名称，行数，列数
    log("处理的表：%s, 共%d行%d列" %(sheet1.name,sheet1.nrows,sheet1.ncols))

    for row in range(sheet1.nrows):
        name = sheet1.cell_value(row,0)
        value = sheet1.cell_value(row,1)
        translate[name] = value

    return translate
        

def main(argv):
    #重新设置编码
    # reload(sys)                         
    # sys.setdefaultencoding('utf-8')
    # sys.stdout = io.TextIOWrapper(sys.stdout.buffer,encoding='gb18030')
    # sys.stdout = io.TextIOWrapper(sys.stdout.buffer,encoding='utf-8')
    inputFile = ""
    outputFile = "translate.json"
    # 解析参数
    try:
        opts,args = getopt.getopt(argv[1:], "i:o:h:c", ["input=", "output=", "help", "check"])
    except getopt.GetoptError as err:        
        print(str(err))
        usage()
        sys.exit(-1)
    
    for opt, arg in opts:
        if opt in ("-h", "--help"):
            usage()
            sys.exit(0)
        elif opt in ("-i", "--input"):
            inputFile = arg
        elif opt in ("-o", "--output"):
            outputFile = arg
        elif opt in ("-c", "--check"):
            check_json_format(outputFile)
            sys.exit(0)
        else:
            print("unknow option")
            usage()
            exit(-1)

    # 读表格
    if inputFile == "":
        usage()
        sys.exit(-1)
    read_excel(inputFile, outputFile)

    # 保存翻译包字典到json文件
    save_file = codecs.open(outputFile, "w", encoding='utf-8') 
    json.dump(translate, save_file, ensure_ascii=False, indent=1)
    save_file.close()

    #检查格式
    check_json_format(outputFile)

if __name__ == '__main__':

    main(sys.argv)

    # read_excel()


# print("还有一天放假")
# print('別の日の休日') #日语
# print('Another day off') #英语
# print('또 다른 하루 휴가') #韩语
# print('An einem anderen Tag Urlaub')    #德语
# print('Başka bir gün tatil')   #土耳其语
# print('Еще один день праздник') #俄语
# print('Otro día de fiesta') #匈牙利语
# print('Kolejny dzień na wakacje')   #波兰语