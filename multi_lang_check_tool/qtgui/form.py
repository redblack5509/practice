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
        Form.resize(749, 625)
        sizePolicy = QtWidgets.QSizePolicy(QtWidgets.QSizePolicy.Expanding, QtWidgets.QSizePolicy.Expanding)
        sizePolicy.setHorizontalStretch(0)
        sizePolicy.setVerticalStretch(0)
        sizePolicy.setHeightForWidth(Form.sizePolicy().hasHeightForWidth())
        Form.setSizePolicy(sizePolicy)
        Form.setMinimumSize(QtCore.QSize(749, 625))
        Form.setMaximumSize(QtCore.QSize(749, 625))
        font = QtGui.QFont()
        font.setPointSize(10)
        Form.setFont(font)
        icon = QtGui.QIcon()
        icon.addPixmap(QtGui.QPixmap("sf.png"), QtGui.QIcon.Normal, QtGui.QIcon.Off)
        Form.setWindowIcon(icon)
        Form.setWhatsThis("")
        self.execl_path_input = QtWidgets.QLineEdit(Form)
        self.execl_path_input.setGeometry(QtCore.QRect(30, 30, 501, 31))
        self.execl_path_input.setText("")
        self.execl_path_input.setObjectName("execl_path_input")
        self.select_execl_btn = QtWidgets.QPushButton(Form)
        self.select_execl_btn.setGeometry(QtCore.QRect(540, 30, 171, 31))
        self.select_execl_btn.setObjectName("select_execl_btn")
        self.cn_path_input = QtWidgets.QLineEdit(Form)
        self.cn_path_input.setGeometry(QtCore.QRect(30, 80, 501, 31))
        self.cn_path_input.setObjectName("cn_path_input")
        self.select_cn_btn = QtWidgets.QPushButton(Form)
        self.select_cn_btn.setGeometry(QtCore.QRect(540, 80, 171, 31))
        self.select_cn_btn.setObjectName("select_cn_btn")
        self.checkBtn = QtWidgets.QPushButton(Form)
        self.checkBtn.setGeometry(QtCore.QRect(280, 130, 171, 31))
        self.checkBtn.setObjectName("checkBtn")
        self.msgText = QtWidgets.QTextEdit(Form)
        self.msgText.setEnabled(True)
        self.msgText.setGeometry(QtCore.QRect(30, 180, 681, 381))
        font = QtGui.QFont()
        font.setPointSize(10)
        self.msgText.setFont(font)
        self.msgText.setObjectName("msgText")
        self.label = QtWidgets.QLabel(Form)
        self.label.setGeometry(QtCore.QRect(30, 130, 141, 31))
        self.label.setObjectName("label")
        self.width_input = QtWidgets.QLineEdit(Form)
        self.width_input.setGeometry(QtCore.QRect(150, 130, 51, 31))
        self.width_input.setObjectName("width_input")
        self.pushButton_6 = QtWidgets.QPushButton(Form)
        self.pushButton_6.setGeometry(QtCore.QRect(490, 570, 222, 31))
        self.pushButton_6.setObjectName("pushButton_6")
        self.pushButton_5 = QtWidgets.QPushButton(Form)
        self.pushButton_5.setGeometry(QtCore.QRect(280, 570, 201, 31))
        self.pushButton_5.setObjectName("pushButton_5")
        self.pushButton_7 = QtWidgets.QPushButton(Form)
        self.pushButton_7.setGeometry(QtCore.QRect(30, 570, 241, 31))
        self.pushButton_7.setObjectName("pushButton_7")

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
        self.checkBtn.setText(_translate("Form", "开始检查"))
        self.msgText.setHtml(_translate("Form", "<!DOCTYPE HTML PUBLIC \"-//W3C//DTD HTML 4.0//EN\" \"http://www.w3.org/TR/REC-html40/strict.dtd\">\n"
"<html><head><meta name=\"qrichtext\" content=\"1\" /><style type=\"text/css\">\n"
"p, li { white-space: pre-wrap; }\n"
"</style></head><body style=\" font-family:\'SimSun\'; font-size:10pt; font-weight:400; font-style:normal;\">\n"
"<p style=\" margin-top:0px; margin-bottom:0px; margin-left:0px; margin-right:0px; -qt-block-indent:0; text-indent:0px;\">欢迎使用翻译包检查工具V1.1</p>\n"
"<p style=\" margin-top:0px; margin-bottom:0px; margin-left:0px; margin-right:0px; -qt-block-indent:0; text-indent:0px;\">2017-3-7 leon</p></body></html>"))
        self.label.setText(_translate("Form", "翻译长度超标阈值："))
        self.pushButton_6.setText(_translate("Form", "导出日志"))
        self.pushButton_5.setText(_translate("Form", "导出json翻译包"))
        self.pushButton_7.setText(_translate("Form", "清空日志"))

