#!/usr/bin/python
# _*_ coding: utf-8 _*_
import sys
reload(sys)
sys.setdefaultencoding('utf-8')

from weibo import APIClient
import json
import webbrowser
import io

APP_KEY = '1608873933'
APP_SECRET = '9c9d52a9b77408ecace9ac16d05075cd'
CALLBACK_URL = 'https://api.weibo.com/oauth2/default.html'

client = APIClient(app_key=APP_KEY, app_secret=APP_SECRET, redirect_uri=CALLBACK_URL)
url = client.get_authorize_url()
# TODO: redirect to url

# webbrowser.open_new(url)
#print url
# obtain url code:
# code = raw_input("input the code: ").strip()
code='e5167f9eba321fae57c04bc6d9099291'
client = APIClient(app_key=APP_KEY, app_secret=APP_SECRET, redirect_uri=CALLBACK_URL)
r = client.request_access_token(code)
access_token = r.access_token
expires_in = r.expires_in

client.set_access_token(access_token, expires_in)

for i in range(1, 10):
# res = client.statuses.public_timeline.get(count=200)
    res  = client.statuses.user_timeline.get(count=5, page=i, feature=1)
    # print res
    for index in range(5):
        print str(i) + "|" + str(index) + res.statuses[index].text


# a = json.dumps(res, ensure_ascii = False,indent = 2)
# fout = io.open('test','w',encoding='utf-8')
# fout.write(a)