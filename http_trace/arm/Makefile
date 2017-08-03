# 编译arm版本的程序，放路由器使用

# 交叉编译
# 1.先配置编译libnfnetlink
# ./configure --prefix=`pwd`/llm --exec-prefix=`pwd`/llm_bin CC=/projects/hnd/tools/linux/hndtools-arm-linux-2.6.36-uclibc-4.5.3/bin/arm-brcm-linux-uclibcgnueabi-gcc --host=arm-linux
# make
# make install

# 2.配置编译libnetfilter_log
# ./configure --prefix=`pwd`/llm --exec-prefix=`pwd`/llm_bin CC=/projects/hnd/tools/linux/hndtools-arm-linux-2.6.36-uclibc-4.5.3/bin/arm-brcm-linux-uclibcgnueabi-gcc --host=arm-linux CFLAGS=-I`pwd`/../libnfnetlink-1.0.1/llm/include LDFLAGS=-L`pwd`/../libnfnetlink-1.0.1/llm_bin/lib
# make
# make install

ARM_EXEC = arm_website_stat

CC = /projects/hnd/tools/linux/hndtools-arm-linux-2.6.36-uclibc-4.5.3/bin/arm-brcm-linux-uclibcgnueabi-gcc

CFLAGS += -I$(shell pwd)/libnetfilter_log-1.0.1/llm/include -I../
CFLAGS += -I$(shell pwd)/libnfnetlink-1.0.1/llm/include -I../
CFLAGS += -MMD
LDFLAGS += -L$(shell pwd)/libnfnetlink-1.0.1/llm_bin/lib/ -L$(shell pwd)/libnetfilter_log-1.0.1/llm_bin/lib/ -lnetfilter_log -lnfnetlink

OBJS = ../http_trace.o

$(ARM_EXEC): $(OBJS)
	$(CC)  $(LDFLAGS)  -o $(ARM_EXEC) $(OBJS)

clean:
	rm ../*.o ../*.d $(ARM_EXEC)

-include $(OBJS:%.o:%.d)