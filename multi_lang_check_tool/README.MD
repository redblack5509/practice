***

将execl翻译包转为json格式，对比标准翻译包是否有遗漏错误的工具  
环境：pyqt5,python3.5  

本层目录下的为V1版本老代码，现在实际使用qtgui目录下面的代码  
form.ui -- QT界面文件  
form.py -- 界面编译出的python文件  
*.ico *.png -- 图标文件  
TPCT\_v1\_console.py -- console版本，主要实现在这里面  
TPCT_V2.py -- 主要加入QTGUI类，调用TPCT\_v1\_console.py里的TP类  

---
编译方法：   
pyuic5 form.ui -o form.py  
pyinstaller --path C:\python35\Lib\site-packages\PyQt5\Qt\bin -F TPCT_V2.py --noconsole  

---
更新日志：
    V1.1 2017年3月7日17:24:23
    1）修复打开两个不同翻译包因缓存引起的问题
    2）对提示显示execl里的行号
