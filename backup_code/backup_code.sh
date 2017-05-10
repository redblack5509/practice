#!/bin/bash
set -x

# backup svn code diff

svn_path=$1
save_path=$2

if [ "$svn_path" = "" ] || [ "$save_path" = "" ]; then
    echo "help:"
    echo "  $0 [svn path] [save path]"
    exit -1
fi

mkdir -p $save_path

# get init version , like r6206
init_version=`svn log $svn_path -q --search Zengguangshun | egrep -o "^r[0-9]+"`
if [ "$init_version" = "" ]; then
    echo "svn log error, exit"
    exit -1
fi

# download code
svn export -q $svn_path -$init_version $save_path/old_code
svn export -q $svn_path $save_path/new_code

# compare
cmp_dir $save_path/old_code $save_path/new_code -i "/home/work_sdb1/tenda2/own_soft/ignore.conf"

rm -r $save_path/old_code $save_path/new_code

echo "backup ok"
