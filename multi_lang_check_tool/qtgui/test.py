# -*- coding: UTF-8 -*- 
import sys,getopt,json,codecs,time,re,unicodedata
from PyQt5 import QtWidgets
import os
import sys
out = sys.stdout
sys.stdout = open("QtWidgets_help.txt", "w")
help(QtWidgets)
sys.stdout.close()
sys.stdout = out