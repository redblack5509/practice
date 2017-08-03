#!/bin/sh

rmmod fastnat
iptables -I FORWARD -p tcp -i br0 -j NFLOG --nflog-group 1
arm_website_stat &

