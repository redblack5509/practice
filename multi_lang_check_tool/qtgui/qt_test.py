# -*- coding: UTF-8 -*- 
from PyQt5 import QtWidgets
from form import Ui_Form
from TPCP_v2_gui import TP

import sys

class mywindow(QtWidgets.QWidget,Ui_Form):    
    def __init__(self):    
        super(mywindow,self).__init__()    
        self.setupUi(self)

    #定义槽函数
    def select_execl_file(self):
        fileName, selectFilter= QtWidgets.QFileDialog.getOpenFileName(self)
        self.execl_path_input.setText(fileName)  

    def select_cn_file(self):
        fileName, selectFilter= QtWidgets.QFileDialog.getOpenFileName(self)
        self.cn_path_input.setText(fileName)

# 继承TP类，重写一些方法
class TP_gui(TP):
    def __init__(self):
        TP.__init__([])
        app = QtWidgets.QApplication(sys.argv)
        self.window = mywindow();
        self.window.show()
        sys.exit(app.exec_())

    def log(self, msg):
        msg = self.window.textBrowser.getText() + msg
        self.window.textBrowser.setText(msg)

    


 