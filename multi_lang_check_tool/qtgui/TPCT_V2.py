# -*- coding: UTF-8 -*- 
from PyQt5 import QtWidgets, QtGui
from form import Ui_Form
from TPCT_v2_gui import TP

import sys,codecs

# 继承TP类，重写一些方法
class TP_gui(TP):
    def __init__(self, window):
        TP.__init__(self)
        self.window = window

    def log(self, msg):
        msg = self.window.msgText.toPlainText() + '\n' + msg
        self.window.msgText.setText(msg)
        # 移动光标到最后面
        cursor = self.window.msgText.textCursor()
        cursor.movePosition(QtGui.QTextCursor.End)
        self.window.msgText.setTextCursor(cursor)

class mywindow(QtWidgets.QWidget,Ui_Form):    
    def __init__(self):    
        super(mywindow,self).__init__()    
        self.setupUi(self)

        self.tp = TP_gui(self)
        self.width_input.setText(str(self.tp.width_threshold))

    #定义槽函数
    def select_execl_file(self):
        fileName, selectFilter = QtWidgets.QFileDialog.getOpenFileName(self, filter = "*.xlsx;;*.xls")
        self.execl_path_input.setText(fileName)  

    def select_cn_file(self):
        fileName, selectFilter = QtWidgets.QFileDialog.getOpenFileName(self, filter = "*.json")
        self.cn_path_input.setText(fileName)

    def execl_path_change(self):
        self.tp.execl_path = self.execl_path_input.text()
        # print(self.tp.execl_path)

    def cn_TP_path_change(self):
        self.tp.cn_TP_path = self.cn_path_input.text()
        # print(self.tp.cn_TP_path)

    def update_path(self):
        self.tp.execl_path = self.execl_path_input.text()
        self.tp.cn_TP_path = self.cn_path_input.text()
        
        if int(self.width_input.text()) < 100:
            self.width_input.setText("150")
        else:
            self.tp.set_width_threshold(int(self.width_input.text()))

    def save_json(self):
        fileName, selectFilter = QtWidgets.QFileDialog.getSaveFileName(self, directory = "translate.json")
        self.tp.TP_save_path = fileName
        self.tp.save_to_json()

    def save_log(self):
        fileName, selectFilter = QtWidgets.QFileDialog.getSaveFileName(self, directory = "log.txt")
        fd = codecs.open(fileName, "w", encoding='utf-8')
        print(self.msgText.toPlainText(), file = fd)
        fd.close()

    def clear_msg(self):
        self.msgText.clear()

    def check_input_valid(self):
        if self.execl_path_input.text() == "":
            self.tp.log("execl翻译包文件路径为空")
            return False
        if self.cn_path_input.text() == "":
            self.tp.log("中文翻译包文件路径为空")
            return False
        if self.width_input.text() == "":
            self.tp.log("宽度阈值为空")
            return False
        return True 

    def check(self):
        if self.check_input_valid():
            self.update_path()
            self.tp.load_excel()
            self.tp.check_newline_character()
            self.tp.check_percent_symbol_match()
            self.tp.check_not_translate_key()
            self.tp.check_miss_key()
            self.tp.check_width()


def main(argv):
    app = QtWidgets.QApplication(sys.argv)
    window = mywindow();
    window.show()
    sys.exit(app.exec_())

if __name__ == '__main__':
    main(sys.argv)


 