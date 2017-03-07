***

将execl翻译包转为json格式，对比标准翻译包是否有遗漏错误的工具  
环境：pyqt5,python3.5  

本层目录下的为V1版本老代码，现在实际使用qtgui目录下面的代码  
form.ui -- QT界面文件  
form.py -- 界面编译出的python文件  
*.ico *.png -- 图标文件  
TPCT\_v1\_console.py -- console版本，主要实现在这里面  
TPCT_V2.py -- 主要加入QTGUI类，调用TPCT\_v1\_console.py里的TP类  

