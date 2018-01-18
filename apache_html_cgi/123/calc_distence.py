#!/usr/bin/python3

import os,sys,requests,cgi,json

# https://maps.googleapis.com/maps/api/geocode/json?latlng=22.5865139,113.9472488&key=AIzaSyCgoBHyKuD9foBxQAcsUZJxrpzIgTIG2OM

def get_geocode(Latitude, Longitude):

	key = "AIzaSyCgoBHyKuD9foBxQAcsUZJxrpzIgTIG2OM"
	api = "https://maps.googleapis.com/maps/api/geocode/json"
	url = "{}?latlng={},{}&key={}&language=zh-CN".format(api, Latitude, Longitude, key)
	rq = requests.get(url)
	result = rq.json()
	longaddr = result["results"][0]["formatted_address"]
	
	return longaddr

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

