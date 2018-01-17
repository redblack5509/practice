EXEC = timecheck_L
SOURCES = timecheck_L.c timer_define.c test.c
CFLAGS += -MMD
# CFLAGS += -I$(DIR_USERS)/tenda/tenda_common -I$(DIR_USERS)/boa/apmib
# LDFLAGS += -L$(DIR_USERS)/boa/apmib -lapmib
# LDFLAGS += -L$(DIR_USERS)/tenda/tenda_common -ltenda_common

OBJS = $(SOURCES:.c=.o)

all:$(EXEC)
	echo "done"

$(EXEC): $(OBJS)
	$(CC) $(LDFLAGS) -o $@ $(OBJS)

romfs:
	$(ROMFSINST) $(EXEC) /bin/$(EXEC)

.c.o:
	$(CC) -c -o $@ -fpic $(CFLAGS)  $<

clean:
	-rm -f  *.elf *.o *.so *.a *.d $(EXEC) $(LIB)

-include $(SOURCES:%.c=%.d)