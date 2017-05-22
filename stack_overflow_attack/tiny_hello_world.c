char *str = "hello world\n";

void stand_alone_printf()
{
    asm("movl $13, %%edx \n\t"
        "movl %0, %%ecx \n\t"
        "movl $0, %%ebx \n\t"
        "int $0x80      \n\t"
        ::"r"(str):"edx", "ecx", "ebx");
}

void main()
{
    stand_alone_printf();
}
