#!/bin/bash

# web资源文件链接替换脚本，leon
# 2016年10月22日15:24:27

path=$1 #输入的页面代码路径

if [ "$1" = "" ]; then
    echo "args err"
    echo "help: ./no_cache [web_path]"
    echo "example: ./no_cache ./web"
    exit -1
fi

path=${path/%\//} #去掉末尾的'/'
web_floder=${path##*/}  
save_floder=${web_floder}_nocache
save_path=${path/$web_floder/$save_floder}
mkdir -p $save_path

cp -rf $path/* $save_path
savepath_list=`find $save_path -type f ! -path "*.svn*"`

# 生成需要替换的uri对列表
for filepath in $savepath_list
do
    case $filepath in 
        *.js|*.css|*.png|*.jpg|*.gif|*.ico)
            # 遍历文件html,css,js文件替换文件名
            name=${filepath##*/}
            md5=`md5sum $filepath | awk '{print $1}'`
            newname=$name?$md5
            echo "$name $newname" 
            # replace $name $newname
            ;;
    esac
done > key.txt

echo "#####################################"

# 生成需要替换的文件列表
find $save_path -type f ! -path "*.svn*" | grep -E ".*\.((css)|(js)|(html))$" > file.txt

# 替换
./replace_uri key.txt file.txt

