# -*- coding: utf-8 -*-

# Form implementation generated from reading ui file 'form.ui'
#
# Created by: PyQt5 UI code generator 5.7.1
#
# WARNING! All changes made in this file will be lost!

from PyQt5 import QtCore, QtGui, QtWidgets

class Ui_Form(object):
    def setupUi(self, Form):
        Form.setObjectName("Form")
        Form.resize(1019, 719)
        Form.setWhatsThis("")
        self.execl_path_input = QtWidgets.QLineEdit(Form)
        self.execl_path_input.setGeometry(QtCore.QRect(50, 40, 711, 31))
        self.execl_path_input.setText("")
        self.execl_path_input.setObjectName("execl_path_input")
        self.select_execl_btn = QtWidgets.QPushButton(Form)
        self.select_execl_btn.setGeometry(QtCore.QRect(770, 40, 171, 31))
        self.select_execl_btn.setObjectName("select_execl_btn")
        self.cn_path_input = QtWidgets.QLineEdit(Form)
        self.cn_path_input.setGeometry(QtCore.QRect(50, 90, 711, 31))
        self.cn_path_input.setObjectName("cn_path_input")
        self.select_cn_btn = QtWidgets.QPushButton(Form)
        self.select_cn_btn.setGeometry(QtCore.QRect(770, 90, 171, 31))
        self.select_cn_btn.setObjectName("select_cn_btn")
        self.horizontalLayoutWidget = QtWidgets.QWidget(Form)
        self.horizontalLayoutWidget.setGeometry(QtCore.QRect(50, 660, 891, 41))
        self.horizontalLayoutWidget.setObjectName("horizontalLayoutWidget")
        self.horizontalLayout_2 = QtWidgets.QHBoxLayout(self.horizontalLayoutWidget)
        self.horizontalLayout_2.setContentsMargins(0, 0, 0, 0)
        self.horizontalLayout_2.setObjectName("horizontalLayout_2")
        self.pushButton_7 = QtWidgets.QPushButton(self.horizontalLayoutWidget)
        self.pushButton_7.setObjectName("pushButton_7")
        self.horizontalLayout_2.addWidget(self.pushButton_7)
        self.pushButton_5 = QtWidgets.QPushButton(self.horizontalLayoutWidget)
        self.pushButton_5.setObjectName("pushButton_5")
        self.horizontalLayout_2.addWidget(self.pushButton_5)
        self.pushButton_6 = QtWidgets.QPushButton(self.horizontalLayoutWidget)
        self.pushButton_6.setObjectName("pushButton_6")
        self.horizontalLayout_2.addWidget(self.pushButton_6)
        self.checkBtn = QtWidgets.QPushButton(Form)
        self.checkBtn.setGeometry(QtCore.QRect(400, 140, 171, 31))
        self.checkBtn.setObjectName("checkBtn")
        self.msgText = QtWidgets.QTextEdit(Form)
        self.msgText.setEnabled(True)
        self.msgText.setGeometry(QtCore.QRect(50, 190, 891, 451))
        self.msgText.setObjectName("msgText")
        self.label = QtWidgets.QLabel(Form)
        self.label.setGeometry(QtCore.QRect(50, 140, 141, 31))
        self.label.setObjectName("label")
        self.width_input = QtWidgets.QLineEdit(Form)
        self.width_input.setGeometry(QtCore.QRect(190, 140, 113, 31))
        self.width_input.setObjectName("width_input")

        self.retranslateUi(Form)
        self.select_execl_btn.clicked.connect(Form.select_execl_file)
        self.select_cn_btn.clicked.connect(Form.select_cn_file)
        self.checkBtn.clicked.connect(Form.check)
        self.execl_path_input.textChanged['QString'].connect(Form.execl_path_change)
        self.cn_path_input.textChanged['QString'].connect(Form.cn_TP_path_change)
        self.pushButton_7.clicked.connect(Form.clear_msg)
        self.pushButton_5.clicked.connect(Form.save_json)
        self.pushButton_6.clicked.connect(Form.save_log)
        QtCore.QMetaObject.connectSlotsByName(Form)

    def retranslateUi(self, Form):
        _translate = QtCore.QCoreApplication.translate
        Form.setWindowTitle(_translate("Form", "翻译包检查工具"))
        self.select_execl_btn.setText(_translate("Form", "选择execl翻译包"))
        self.select_cn_btn.setText(_translate("Form", "选择中文翻译包"))
        self.pushButton_7.setText(_translate("Form", "清空日志"))
        self.pushButton_5.setText(_translate("Form", "导出json翻译包"))
        self.pushButton_6.setText(_translate("Form", "导出日志"))
        self.checkBtn.setText(_translate("Form", "开始检查"))
        self.msgText.setHtml(_translate("Form", "<!DOCTYPE HTML PUBLIC \"-//W3C//DTD HTML 4.0//EN\" \"http://www.w3.org/TR/REC-html40/strict.dtd\">\n"
"<html><head><meta name=\"qrichtext\" content=\"1\" /><style type=\"text/css\">\n"
"p, li { white-space: pre-wrap; }\n"
"</style></head><body style=\" font-family:\'SimSun\'; font-size:9pt; font-weight:400; font-style:normal;\">\n"
"<p style=\" margin-top:0px; margin-bottom:0px; margin-left:0px; margin-right:0px; -qt-block-indent:0; text-indent:0px;\">欢迎使用翻译包检查工具V1.0</p>\n"
"<p style=\" margin-top:0px; margin-bottom:0px; margin-left:0px; margin-right:0px; -qt-block-indent:0; text-indent:0px;\">2017-1-15 leon</p></body></html>"))
        self.label.setText(_translate("Form", "翻译长度超标阈值："))

