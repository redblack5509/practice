#!/usr/bin/python3

# 定时查询考勤签卡，如有异常，发送邮件通知

# 配置文件/etc/check_late.conf
# {
#     "username": "123",
#     "password": "123",
#     "mail_user": "xxxxx@qq.com",
#     "mail_pass": "xxx",
#     "mail_receiver": "123@qq.com",
#     "log_path": "/var/log/check_late.log"
# }


import requests, time
from pyquery import PyQuery as pyq
import json, sys

#######################################################

import smtplib
from email.mime.text import MIMEText
from email.header import Header

def send_email(msg=""):
    # 第三方 SMTP 服务
    #mail_host="smtp.tenda.cn"  #设置服务器,使用外网时可以用这个发邮件
    mail_host="172.16.105.207"  #内网服务器
    mail_user=config["mail_user"]    #用户名
    mail_pass=config["mail_pass"]  #口令 

    receivers = []
    receivers.append(config["mail_receiver"])     
    mail_msg = "Hi:<br/>&nbsp;&nbsp;{}".format(msg)
    message = MIMEText(mail_msg, 'html', 'utf-8')
    message['From'] = Header(config["mail_user"], 'utf-8')
    message['To'] =  Header(config["mail_receiver"], 'utf-8')
     
    subject = '考勤异常'
    message['Subject'] = Header(subject, 'utf-8')
 
    try:
        smtpObj = smtplib.SMTP()
        smtpObj.connect(mail_host, 25)    # 25 为 SMTP 端口号
        smtpObj.login(mail_user,mail_pass) 
        smtpObj.sendmail(mail_user, receivers, message.as_string())
        print("send email success", file=open(log_path, mode="a"))
    except:
        print("Error: send email failed",file=open(log_path, mode="a"))
        time.sleep(3*60)
        print("sleep 3*60s", file=open(log_path, mode="a"))
        send_email()

############################################################################

# 解析配置文件
try:
    config = json.load(open("/etc/check_late.conf"))
except:
    print("parse /etc/check_late.conf faild")
    sys.exit(0)

if config.get("log_path"):
    log_path = config["log_path"]
else:
    log_path = "/var/log/check_late.log"

s=requests.Session()
login_data={
    "txtUserNo": "123", 
    "txtPassword": "123",
    "ddListLanguage": "0",
    "btnLogin": "登录",
    # 这个字段是变化的，在请求的default.aspx页面里面可以获取这个值
    "__VIEWSTATE": "/wEPDwUKLTUzNTE4NDY3OA8WBB4JTG9naW5UeXBlAv////8PHgxIYXJkd2FyZVR5cGUFAjAxFgICAw9kFgQCAQ8PFgIeBFRleHRlZGQCCA8PFgIeB1Zpc2libGVoZGRkQAmCfQQ5/eRk0UlDVuTpbtI/kGpiMNP4H/dO4qwS0I8="
}

# 获取__VIEWSTATE动态字段
jq = pyq("http://172.16.100.5:1808/Default.aspx")
login_data["__VIEWSTATE"] = jq("#__VIEWSTATE").val()

login_data["txtUserNo"] = config["username"]
login_data["txtPassword"] = config["password"]

# 登录
s.post("http://172.16.100.5:1808/Default.aspx", login_data)

# 查询
check_data={
    "queryid": "23",
    "sqlwhere": "\" YYMMDD >= '2017/06/01' AND YYMMDD <= '2017/06/07' AND EmpNo = '0005521'\"",
    "modulename": "日考勤"
}

# 时间计算，垮月的情况计算
now = time.localtime()
if now.tm_mday < 6:
    start = "{}/{:02d}/{:02d}".format(now.tm_year, now.tm_mon - 1, 25 + now.tm_mday)
else:
    start = "{}/{:02d}/{:02d}".format(now.tm_year, now.tm_mon, now.tm_mday - 5)
end = "{}/{:02d}/{:02d}".format(now.tm_year, now.tm_mon, now.tm_mday - 2)   # 跳过今天和昨天

print("查询:[{}] {} - {}".format(config["username"], start, end), file=open(log_path, mode="a"))

check_data["sqlwhere"] = "\" YYMMDD >= '{}' AND YYMMDD <= '{}' AND EmpNo = '{}'\"".format(start,
    end, config["username"])

r=s.post("http://172.16.100.5:1808/queryReport.aspx", check_data)

# 获取查询的页面表格
jq = pyq(r.text)
table = jq("#ctl00_ContentPlaceHolder1_GridView1")

# 重新初始化pyq，避免其他tr标签干扰
jq = pyq(table)
tr = jq("tr")

# 打印出查询信息
for i in tr:
    # print(pyq(i).text())
    result = pyq(i).text()
    if result.find(config["username"]) != -1 and result.find("异常") != -1:
        # 异常，通知
        print("异常", result, file=open(log_path, mode="a"))
        send_email(result)

