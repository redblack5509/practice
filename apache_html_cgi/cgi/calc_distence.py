#!/usr/bin/python3

import os,sys,requests,cgi,json
from math import sin, asin, cos, radians, fabs, sqrt
 
EARTH_RADIUS=6371           # 地球平均半径，6371km
 
def hav(theta):
    s = sin(theta / 2)
    return s * s
 
def get_distance_hav(lat0, lng0, lat1, lng1):
    "用haversine公式计算球面两点间的距离。"
    # 经纬度转换成弧度
    lat0 = radians(lat0)
    lat1 = radians(lat1)
    lng0 = radians(lng0)
    lng1 = radians(lng1)
 
    dlng = fabs(lng0 - lng1)
    dlat = fabs(lat0 - lat1)
    h = hav(dlat) + cos(lat0) * cos(lat1) * hav(dlng)
    distance = 2 * EARTH_RADIUS * asin(sqrt(h))
 
    return distance

def get_geocode(addr):

	key = "AIzaSyCgoBHyKuD9foBxQAcsUZJxrpzIgTIG2OM"
	api = "https://maps.googleapis.com/maps/api/geocode/json"
	url = "{}?address={}&key={}&language=zh-CN".format(api, addr, key)
	rq = requests.get(url)
	result = rq.json()
	longaddr = result["results"][0]["formatted_address"]
	location = (result["results"][0]["geometry"]["location"]["lat"], result["results"][0]["geometry"]["location"]["lng"])
	
	return (longaddr,location)

form = cgi.FieldStorage() 
src = form.getvalue('src')
dst = form.getvalue('dst')

try:
	(rsrc,(lon1,lat1)) = get_geocode(src)
	(rdst,(lon2,lat2)) = get_geocode(dst)

	d2 = get_distance_hav(lon1,lat1,lon2,lat2)

	response = {}
	response["rsrc"] = rsrc
	response["rdst"] = rdst
	response["distence"] = "{:.3f}KM".format(d2)

	print("Content-type: application/json\r\n\r\n")
	print(json.dumps(response))

except:
	print("Content-type: application/json\r\n\r\n")
	print('{}')

