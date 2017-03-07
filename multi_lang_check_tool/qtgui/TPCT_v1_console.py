#!/usr/bin/python3.3
#coding=utf-8

# windows上python3.4测试通过，不兼容python2.x
# 自己的ubuntu上测试不过，因为ubuntu上装的xlrd版本是2.x的

import xlrd
import sys,getopt,json,codecs,time,re,unicodedata

# 计算一个字符的宽度
def get_chr_width(chr):
    if unicodedata.east_asian_width(chr) in ('F','W'):
        return 2
    else:
        return 1

# 计算字符串的宽度
def calc_unicode_string_width(u_string):
    total_len = 0;
    for chr in u_string:
        total_len += get_chr_width(chr)
    return total_len

# 很丑的函数，慎用
def sort_msg_cmp(stra, strb):
        na = 0
        nb = 0
        la = re.findall(r"^\d+", stra)
        if len(la):
            na = int(la[0])
        lb = re.findall(r"^\d+", strb)
        if len(lb):
            nb = int(lb[0])
        if na > nb:
            return 1
        elif na == nb:
            return 0
        else:
            return -1

# 下面两个函数是为了python 3.x下使用自定义cmp函数
class KeyWrapper(object):
    def __init__(self, cmp, val):
        self.val = val
        self.cmp = cmp

    def __lt__(self, other):
        return self.cmp(self.val, other.val) == -1


def cmp_to_key(func):
    def key(x):
        return KeyWrapper(func, x)
    return key

# 创建一个翻译包类，TP(translation package)
class TP:
    def __init__(self, execl_path = "", cn_TP_path = ""):
        self.execl_path = execl_path  #execl翻译包路径
        self.cn_TP_path = cn_TP_path  #中文翻译包路径
        self.cn_TP = {}
        self.target_TP = {}
        self.target_TP_add_line = {}
        self.TP_save_path = "translate.json"
        if __name__ == '__main__':
            self.log_fd = codecs.open("check_log.txt", "w", encoding='utf-8')
        self.width_threshold = 150    #宽度告警阈值，超过(最大宽度*width_threshold/100)则报警


    # 清除缓存，解决加载两个execl包后，字典叠加问题
    def clear_cache(self):
        self.cn_TP = {}
        self.target_TP = {}

    # 设置execl翻译包路径
    def set_execl_path(self, execl_path):
        self.execl_path = execl_path

    # 设置中文翻译包路径
    def set_cn_TP_path(self, path):
        self.cn_TP_path = path

    # 输出打印
    def log(self, *args, **kwargs):
        print("[%s] " %(time.asctime()), end="", file = self.log_fd)   
        print(file = self.log_fd, *args, **kwargs)


    # 读execl表格数据，返回翻译包字典
    def load_excel(self):
        # 打开文件
        workbook = xlrd.open_workbook(self.execl_path)

        # 根据sheet索引或者名称获取sheet内容
        sheet1 = workbook.sheet_by_index(0) # sheet索引从0开始

        # sheet的名称，行数，列数
        self.log("处理的表：%s, 共%d行%d列" %(sheet1.name,sheet1.nrows,sheet1.ncols))

        for row in range(sheet1.nrows):
            name = sheet1.cell_value(row,0)
            value = sheet1.cell_value(row,1)
            self.target_TP[name] = value
            self.target_TP_add_line[name] = {"line": row + 1, "value": value}

    # 获取目标翻译包的字典
    def get_target_TP(self):
        return self.target_TP

    # 将目标翻译包字典保存为json文件
    def save_to_json(self):
        save_fd = codecs.open(self.TP_save_path, "w", encoding='utf-8')
        json.dump(self.target_TP, save_fd, ensure_ascii=False, indent=1)
        save_fd.close()
        self.log("json格式的翻译包已保存为%s" %(self.TP_save_path))

    # 设置翻译包保存路径
    def set_save_path(self, path):
        self.TP_save_path = path

    # 检查json翻译包json格式是否正确, 自己手动修改的json文件才需要进行这个检测
    def check_json_format(self):
        fd = codecs.open(self.TP_save_path, "r", encoding='utf-8')
        try:
            package = json.load(fd)
        except ValueError as err:
            err_str = str(err)
            index = err_str.find(":")
            self.log(self.TP_save_path + "的json格式错误：" + err_str[index + 1:])
            fd.close()
            return

        self.log("json格式正确")
        self.target_TP = package    #保存这个翻译包字典
        fd.close()


    # 对输出信息进行排序,用'\n'字符split方法分割消息到列表，对列表排序，再输出到字符串
    # 这函数很丑，慎用
    def sort_msg(self, msg):
        msg_list = msg.split('\n')
        # msg_list.sort(cmp=cmp)
        msg_list = sorted(msg_list, key=cmp_to_key(sort_msg_cmp))
        msg_sorted = ''
        for item in msg_list:
            msg_sorted += "%s\n" %(item)
        return msg_sorted

    # 检查翻译包字典里是否有换行符
    def check_newline_character(self):
        err_msg = ""
        for key in self.target_TP:
            if key.find("\n") != -1 or self.target_TP.get(key).find("\n") != -1:
                err_msg += '%d "%s": "%s"\n' %(self.target_TP_add_line.get(key)["line"], \
                        key, self.target_TP.get(key))

        if err_msg != "":
            err_msg = "如下翻译条目里面有换行符，请检查:\n" + err_msg
            self.log(err_msg)
                

    # 检查翻译包'%'是否匹配
    def check_percent_symbol_match(self):
        miss_percent_symbol = {}
        for key in self.target_TP:
            if key.count("%s") != self.target_TP.get(key).count("%s"):
                miss_percent_symbol[key] = self.target_TP.get(key)  

        # 打印输出
        err_msg = ""
        for key in miss_percent_symbol:
            err_msg += "%d \"%s\": \"%s\"\n" %(self.target_TP_add_line.get(key)["line"], \
                    key, miss_percent_symbol.get(key))
        if err_msg == "":
            self.log("翻译包%s匹配正常")
        else:
            err_msg = self.sort_msg(err_msg)
            err_msg = "翻译包如下条目%s不匹配，请检查：\n" + err_msg
            self.log(err_msg)

    # 与中文翻译包对比是否缺少关键字
    def check_miss_key(self):
        print("cn path" + self.cn_TP_path)
        fd = codecs.open(self.cn_TP_path, "r", encoding='utf-8')
        self.cn_TP = json.load(fd)
        fd.close()

        # 检查缺少的关键字
        miss_key = []
        for key in self.cn_TP:
            # 过滤掉注释
            if None == self.target_TP.get(key) and re.search(r'^[^(//)(/\*)]', key):
                miss_key.append(key)
        
        # 打印
        err_msg = ""
        for key in miss_key:
            err_msg += '"%s"\n' %(key)
        if err_msg == "":
            self.log("与中文翻译包对比，关键字没有缺失")
        else:
            err_msg = "与中文翻译包对比，execl翻译包有%d条关键字缺失，请检查：\n%s" \
                %(len(miss_key), err_msg)
            self.log(err_msg)


    # 检测没有翻译的条目
    def check_not_translate_key(self):
        not_translate_key = []
        for key in self.target_TP:
            # 跳过注释，全是空格的也视为未翻译
            if re.search(r'^ *$', self.target_TP.get(key)) and  re.search(r'^[^(//)(/\*)]', key):
                not_translate_key.append(key)

        # 打印
        err_msg = ""
        for key in not_translate_key:
            err_msg += '%d "%s"\n' %(self.target_TP_add_line.get(key)["line"], key)
        if err_msg == "":
            self.log("检查没有翻译的条目：正常")
        else:
            err_msg = self.sort_msg(err_msg)
            err_msg = "翻译包有%d个关键字没有翻译，请检查：\n%s" %(len(not_translate_key), err_msg)
            self.log(err_msg)

    # 与中文翻译包对比，检查宽度是否过长
    def check_width(self):
        too_long = []
        for key in self.cn_TP:
            width = max(calc_unicode_string_width(key), 
                calc_unicode_string_width(self.cn_TP.get(key)))

            tmp = self.target_TP.get(key)
            if None == tmp:
                continue
            if width * self.width_threshold < 100 * calc_unicode_string_width(tmp):
                too_long.append(key)

        # 打印，一条过长的翻译打印三行（英文，中文，目标语言）
        err_msg = ""
        for key in too_long:
            # err_msg += "%d\n" %(self.target_TP_add_line.get(key)["line"])
            err_msg += "%s\n" %(key)
            err_msg += "%s\n" %(self.cn_TP.get(key))
            err_msg += "%s\n" %(self.target_TP.get(key))
            err_msg += "\n"

        if err_msg == "":
            self.log("翻译过长检查：没有过长的翻译")
        else:
            err_msg = "翻译包有%d条(告警阈值：%d%%)翻译过长：请检查\n%s" %(len(too_long),
                self.width_threshold, err_msg)
            self.log(err_msg)

    # 设置宽度告警阈值
    def set_width_threshold(self, threshold):
        if threshold < 100:
            self.log("width threshold must be grater than 100")
            return
        self.width_threshold = threshold


    # 帮助信息
    def usage(self):
        helpinfo = '''
        -h, --help : print help info
        -i, --input : input file
        -o, --output : output file
        -c, --check : check json format
        -s, --standard : CN translation package
        -w, --width : set width threshold
        '''
        print(helpinfo)


def main(argv):

    my_TP = TP()

    # 解析参数
    try:
        opts,args = getopt.getopt(argv[1:], "i:o:h:cs:w:", ["input=", "output=", "help", "check", "standard=", "width="])
    except getopt.GetoptError as err:        
        print(str(err))
        my_TP.usage()
        sys.exit(-1)
    
    for opt, arg in opts:
        if opt in ("-h", "--help"):
            my_TP.usage()
            sys.exit(0)
        elif opt in ("-i", "--input"):
            my_TP.execl_path = arg
        elif opt in ("-o", "--output"):
            my_TP.TP_save_path = arg
        elif opt in ("-c", "--check"):
            my_TP.check_json_format()
            sys.exit(0)
        elif opt in ("-s", "--standard"):
            my_TP.cn_TP_path = arg
        elif opt in ("-w", "--width"):
            my_TP.set_width_threshold(int(arg))
        else:
            print("unknow option")
            usage()
            exit(-1)

    # 读表格
    if my_TP.execl_path == "":
        my_TP.usage()
        sys.exit(-1)

    my_TP.clear_cache()
    my_TP.load_excel()
    my_TP.check_newline_character()
    # my_TP.check_json_format()
    my_TP.check_percent_symbol_match()
    my_TP.check_not_translate_key()
    my_TP.check_miss_key()
    my_TP.check_width()
    my_TP.save_to_json()
    print("请检查日志文件：check_log.txt")

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