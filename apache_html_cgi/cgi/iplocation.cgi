#!/usr/bin/python3

import os, json, requests

try:
    remote_ip = os.environ['REMOTE_ADDR']
except:
    remote_ip = "112.95.16.94"

response = {}
response["ip"] = remote_ip

output = os.popen("geoiplookup {remote_ip} -f /usr/share/GeoIP/GeoIPASNum.dat | awk -F ':' '{{print $2}}'".format(**locals()))
response["isp"] = " ".join(output.read().strip().split(" ")[1:])

output = os.popen("geoiplookup {remote_ip} -f /usr/share/GeoIP/GeoIP.dat | awk -F ':' '{{print $2}}'".format(**locals()))
response["country"] = output.read().strip()

output = os.popen("geoiplookup {remote_ip} -f /usr/share/GeoIP/GeoLiteCity.dat | awk -F ':' '{{print $2}}'".format(**locals()))
response["addr"] = "".join(output.read().strip().split(",")[2:4])


print("Content-type: application/json\r\n\r\n")
print(json.dumps(response))