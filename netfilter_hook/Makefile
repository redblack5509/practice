PWD := $(shell pwd)

CROSS_COMPILE = /projects/hnd/tools/linux/hndtools-arm-linux-2.6.36-uclibc-4.5.3/bin/arm-brcm-linux-uclibcgnueabi-
CROSS_COMPILE_SYSTEM = arm

obj-m := test.o
#KDIR = /home/work_sdb1/tenda2/F306/BCM_5358U_47186_5.110.27.2205/kernel/linux-2.6
KDIR = /home/work_sdc1/tenda3/AC6_youdao/AC_PRODUCT_SVN5437/bsp/kernel/bcm47189_wl_9.10.178.7_2.6.36 

all:
	make -C $(KDIR) M=$(PWD) modules ARCH=$(CROSS_COMPILE_SYSTEM) CROSS_COMPILE=$(CROSS_COMPILE)

clean:
	-rm *.ko *.o *mod.c *.symvers *.order
	
#编译先会进入内核源码目录$(KDIR)读取Makefile，再回到要编译模块路径$(PWD),ARCH指定处理器平台，CROSS_COMPILE指定编译工具，会自动在后面加上gcc
