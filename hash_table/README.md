> 一个通用的hash表实现  
>　　主要利用void指针和函数指针来实现对任意结构的灵活存取  

* 如何编译？    
make  

* 文件说明  
hash_table.c --- 主要实现的c文件  
hash_table.h --- 结构体定义，函数声明的头文件  
Makefile     --- 编译测试文件的Makefile  
test_int.c   --- 测试文件  
test_struct.c--- 测试文件  

* 使用  
使用时包含hash_table.h头文件，调用里面声明的接口。把hash\_table.c一起编译就行了  



