# 测试makefile

EXEC = test
SRC = hash_table.c test_struct.c
OBJ = $(SRC:%.c=%.o)
OBJ_D = $(SRC:%.c=%.d)

all:$(EXEC)
	./$(EXEC)

$(EXEC):$(OBJ)
	$(CC) -o $(EXEC) $(OBJ)

%.o:%.c
	$(CC) -MMD -c $< -o $@

clean:
	rm -rf *.d *.o $(EXEC)

-include $(OBJ_D)

.PHONY: all clean