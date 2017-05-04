比较两个目录的差异，把有差异的文件放到新的目录，方便保存差异，以及给其他人提供更易读的补丁文件。

1. 需要可以通过配置文件来过滤文件
直接使用的strstr来过滤，不要使用*.so这样的语句，直接.so就好了

比较linux产品代码在只比较文件大小的情况下，用时如下

```
root@leon-virtual-machine:diff# date && /usr/bin/time ./a.out /home/work_sdc1/tenda3/itb_ac6_svn0/AC_PRODUCT_SVN5449/ /home/work_sdc1/tenda3/AC6_ITB01/AC_PRODUCT_SVN5449/ && date
Thu May  4 18:55:46 CST 2017
1.61user 13.55system 1:14.14elapsed 20%CPU (0avgtext+0avgdata 59340maxresident)k
1276888inputs+1260568outputs (0major+189979minor)pagefaults 0swaps
Thu May  4 18:57:00 CST 2017
```

二进制模式比较，用时如下

```
root@leon-virtual-machine:diff# date && /usr/bin/time ./a.out /home/work_sdc1/tenda3/itb_ac6_svn0/AC_PRODUCT_SVN5449/ /home/work_sdc1/tenda3/AC6_ITB01/AC_PRODUCT_SVN5449/ -b && date
Thu May  4 18:58:55 CST 2017
2.49user 42.80system 5:39.33elapsed 13%CPU (0avgtext+0avgdata 476964maxresident)k
7319992inputs+2220632outputs (0major+718875minor)pagefaults 0swaps
Thu May  4 19:04:34 CST 2017
```

修改目录生成的patch目录大下
```
root@leon-virtual-machine:diff# du /home/work_sdc1/tenda3/AC6_ITB01/AC_PRODUCT_SVN5449_patch_l/ -hd1
460K    /home/work_sdc1/tenda3/AC6_ITB01/AC_PRODUCT_SVN5449_patch_l/infra
5.2M    /home/work_sdc1/tenda3/AC6_ITB01/AC_PRODUCT_SVN5449_patch_l/svnstat
6.2M    /home/work_sdc1/tenda3/AC6_ITB01/AC_PRODUCT_SVN5449_patch_l/cbb
14M /home/work_sdc1/tenda3/AC6_ITB01/AC_PRODUCT_SVN5449_patch_l/prod
243M    /home/work_sdc1/tenda3/AC6_ITB01/AC_PRODUCT_SVN5449_patch_l/vendor
558M    /home/work_sdc1/tenda3/AC6_ITB01/AC_PRODUCT_SVN5449_patch_l/bsp
18M /home/work_sdc1/tenda3/AC6_ITB01/AC_PRODUCT_SVN5449_patch_l/targets
849M    /home/work_sdc1/tenda3/AC6_ITB01/AC_PRODUCT_SVN5449_patch_l/
```

其实可以过滤vendor/目录,bsp/kernel/bcm,过滤掉后执行时间
```
root@leon-virtual-machine:diff# date && /usr/bin/time ./a.out /home/work_sdc1/tenda3/itb_ac6_svn0/AC_PRODUCT_SVN5449/ /home/work_sdc1/tenda3/AC6_ITB01/AC_PRODUCT_SVN5449/ -b && date
Thu May  4 19:13:50 CST 2017
2.14user 15.16system 2:51.07elapsed 10%CPU (0avgtext+0avgdata 120688maxresident)k
1959896inputs+113896outputs (0major+214852minor)pagefaults 0swaps
Thu May  4 19:16:41 CST 2017
```
patch目录大小
```
root@leon-virtual-machine:diff# du /home/work_sdc1/tenda3/AC6_ITB01/AC_PRODUCT_SVN5449_patch_l/ -hd1
460K    /home/work_sdc1/tenda3/AC6_ITB01/AC_PRODUCT_SVN5449_patch_l/infra
5.2M    /home/work_sdc1/tenda3/AC6_ITB01/AC_PRODUCT_SVN5449_patch_l/svnstat
6.2M    /home/work_sdc1/tenda3/AC6_ITB01/AC_PRODUCT_SVN5449_patch_l/cbb
14M /home/work_sdc1/tenda3/AC6_ITB01/AC_PRODUCT_SVN5449_patch_l/prod
1.7M    /home/work_sdc1/tenda3/AC6_ITB01/AC_PRODUCT_SVN5449_patch_l/bsp
18M /home/work_sdc1/tenda3/AC6_ITB01/AC_PRODUCT_SVN5449_patch_l/targets
52M /home/work_sdc1/tenda3/AC6_ITB01/AC_PRODUCT_SVN5449_patch_l/
```

还可以优化：
比较文件的时候，文件打开读取了一次。复制文件的时候文件又打开读取了一次。  
使用了两次nftw函数，再查找修改目录的新增加文件时，应该可以通过标记的方式来记录，而不用再循环遍历一次目录。
