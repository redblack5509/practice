#!/usr/bin/python3

from urllib import request, parse
url = "http://www.doyouhike.net/s/"
data = {"key": "武功山", "from": "top_search", "pid":"33122"}

data = parse.urlencode(data).encode('utf-8')
req = request.Request(url, data=data)
page = request.urlopen(req).read()
page = page.decode('utf-8')
print(page)
