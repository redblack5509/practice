
#########下面是编译本目录下所有.c的一个makefile##########

EXEC = a.out
SRC = $(wildcard *.c)
OBJS = $(SRC:%.c=%.o)
CC = gcc

CFLAGS += -MMD

all: $(EXEC)
	@echo compiled!
	./$(EXEC)

$(EXEC): $(OBJS)
	$(CC) -o $@ $(OBJS)

# %.o: %.c
	# $(CC) -MMD -c $< -o $@

clean:
	-rm -rf *.d *.o $(EXEC)

-include $(SRC:%.c=%.d)

##################下面是一些测试########################

# 变量定义测试
AAA_1 = $(BBB_1)
BBB_1 = bbb_1 

AAA_2 := $(BBB_2)
BBB_2 := bbb_2

AAA_3 = aaa_3
AAA_3 ?= aaa_3_2

test1:
	@echo AAA_1=$(AAA_1)

test2:
	@echo AAA_2=$(AAA_2)

test3:
	@echo AAA_3=$(AAA_3)


# 函数测试
TEXT = 1a23,1a23
ftest1:
	@echo $(subst a, A, 123a123a)
$(warning before error)
# $(error what's up)

# 注释符测试
DIR = /home/work  # 工作目录
$(warning $(DIR)/file)

# 自动化变量测试  
atest1 atest2:  $(wildcard *.c)
	@echo $@
	@echo $^

%-only:
	@echo $*
	# meke -C $*

# 伪目标
.PHONY : atest1 atest2 ftest1 clean test1 test2 test3