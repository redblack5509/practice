#!/usr/bin/python3

import sys,requests

if len(sys.argv) < 2:
    print("please input a address")
    sys.exit()

addr = sys.argv[1]

key = "AIzaSyCgoBHyKuD9foBxQAcsUZJxrpzIgTIG2OM"
api = "https://maps.googleapis.com/maps/api/geocode/json"

url = "{}?address={}&key={}".format(api, addr, key)

print(url)

head = {"accept-language":"zh-CN,zh;q=0.8"}
rq = requests.get(url,headers = head)
result = rq.json()

longaddr = result["results"][0]["formatted_address"]
location = (result["results"][0]["geometry"]["location"]["lat"], result["results"][0]["geometry"]["location"]["lng"])

print(longaddr)
print(location)
