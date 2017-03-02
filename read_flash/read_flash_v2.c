/**/

#include <stdio.h>
#include <stdlib.h>
#include <string.h>
    
#ifndef WIN32
#include<sys/stat.h>
#include<unistd.h>
#endif

#define dprintf(format, argv...) printf("%s(%d):" format, __FUNCTION__, __LINE__, ##argv)
#define BUFFSIZE (128*1024*1024)     //128MB
#define READSIZE 2048
#define ENVRAM_OFF 0x400
#define NVRAM_SIZE 0x8000
#define PARAM_MAX 1024
#define MARGIC_NUM "FLSH" 
#define MB (1024*1024)

typedef unsigned int uint32;
struct nvram_header {
    uint32 magic;
    uint32 len;
    uint32 crc_ver_init;    /* 0:7 crc, 8:15 ver, 16:31 sdram_init */
    uint32 config_refresh;  /* 0:15 sdram_config, 16:31 sdram_refresh */
    uint32 config_ncdl;     /* ncdl values for memc */
};

typedef struct flash_info
{
    char path[256];
    unsigned int size;
    char magic[16];
    struct nvram_header *envram_head;
    int nvram_err_flag;
    int envram_err_flag;
    int nparam_cnt;
    struct nvram_header *nvram_head;
    int eparam_cnt;
    char *data;
}flash_info_t;

char *nvram_table[PARAM_MAX] = {0};
char *envram_table[PARAM_MAX] = {0};

/* 判断魔术字类型（主要是大小端引起flash上有差异），返回魔术字 */
#define MAGIC_LEN 4
char *get_magic_type(char *buf, int len)
{
    static char *l_magic = "FLSH";
    static char *b_magic = "HSLF";
    int i = 0;

    for(i = 0; i < len; i++)
    {
        if(!memcmp(buf + i, l_magic, MAGIC_LEN))
            return l_magic;
    }

    return b_magic;
}

/* 通过魔术字FLSH, HSLF查找envram，nvram头偏移 */
char *find_nvram(char *buf, int len, char *magic)
{
    int i = 0;

    for(i = 0; i < len; i++)
    {
        if(!memcmp(buf + i, magic, MAGIC_LEN))
            return buf + i;
    }
    return NULL;
}

void init_nvram_envram_head(flash_info_t *flash)
{
    char *magic = get_magic_type(flash->data, flash->size);
    char *match = find_nvram(flash->data, flash->size, magic);
    int off = 0;

    strncpy(flash->magic, magic, sizeof(flash->magic));
    off = match - flash->data;
    /* 第一次查找 */
    if(off < 0)
    {
        flash->envram_err_flag = 1;
        flash->nvram_err_flag = 1;
        return;
    }
    else if(off < 1*MB/2)   /* 认为是envram */
    {
        flash->envram_head = flash->data + off;
        dprintf("envram offset: 0x%x\n", off);
    }
    else    /* 认为是nvram */
    {
        flash->envram_err_flag = 1;
        flash->nvram_head = flash->data + off;
        dprintf("nvram offset: 0x%x\n", off);
        return;
    }

    /* 第二次查找 */
    match = find_nvram(flash->data + off + MAGIC_LEN, flash->size, magic);
    off = match - flash->data;
    if(off < 0)
    {
        flash->nvram_err_flag = 1;
        return;
    }
    else    /* 认为是nvram */
    {
        flash->nvram_head = flash->data + off;
        dprintf("nvram offset: 0x%x\n", off);
    }

    return;
}

/* for windows, don't use stat functon */
flash_info_t *init_flashinfo(char* path)
{
    flash_info_t *flash = NULL;
    FILE *fp = NULL;
    char *p_data = NULL;
    int len = 0;

    if(!path)
    {
        dprintf("path is null\n");
        goto failed;
    }
    /*init struct*/
    flash = (flash_info_t *)malloc(sizeof(flash_info_t));
    if(!flash)
    {
        dprintf("malloc failed\n");
        goto failed;
    }
    memset(flash, 0x0, sizeof(flash_info_t));
    strncpy(flash->path, path, sizeof(flash->path));

    /*open and read file, for windows, open type:"rb"*/
    fp = fopen(path, "rb");
    if(!fp)
    {
        dprintf("fopen failed\n");
        goto failed;
    }

    /*init data buf*/
    int flash_max_size = 0;
#ifdef WIN32
    flash_max_size = BUFFSIZE;
#else
    struct stat flash_st;
    stat(path, &flash_st);
    flash_max_size = flash_st.st_size;
#endif
    flash->data = (char *)malloc(flash_max_size);
    if(!flash->data)
    {
        dprintf("malloc failed\n");
        goto failed;
    }
    //memset(flash->data, 0x0, BUFFSIZE);

    p_data = flash->data;
    while(!feof(fp))
    {
        len = fread(p_data, 1, READSIZE, fp);
        if(len < 0)
        {
            goto failed;
        }
        p_data += len;
        flash->size += len;
        if(flash->size > flash_max_size)
        {
            dprintf("FLASH is too large!\n");
            goto failed;
        }
    }
    fclose(fp);
    fp = NULL;
    
    init_nvram_envram_head(flash);
    return flash;

failed:
    if(fp)
        fclose(fp);
    if(flash && flash->data)
        free(flash->data);
    if(flash)
        free(flash);
    return NULL;
}

void destory_flashinfo(flash_info_t *flash)
{
    if(flash && flash->data)
        free(flash->data);
    if(flash)
        free(flash);
}

/*return 1, big endian;*/
int get_cpu_endian(void)
{
    union {
        int i;
        char c;
    }u;
    u.i = 1;
    return u.c;
}

/*little endian to host*/
unsigned int ltohl(unsigned int x)
{
    unsigned int r = 0;
    if(get_cpu_endian())
        return x;
    else
    {
        r |= (x>>24)&0xFF;
        r |= ((x>>16)&0xFF)<<8;
        r |= ((x>>8)&0xFF)<<16;
        r |= ((x)&0xFF)<<24;
        return r;
    }
}

/*big endian to host*/
unsigned int btohl(unsigned int x)
{
    unsigned int r = 0;
    if(!get_cpu_endian())
        return x;
    else
    {
        r |= (x>>24)&0xFF;
        r |= ((x>>16)&0xFF)<<8;
        r |= ((x>>8)&0xFF)<<16;
        r |= ((x)&0xFF)<<24;
        return r;
    }
}

void print_flash_info(flash_info_t *flash)
{
    char *p = flash->path;

#ifdef WIN32
        p = strrchr(p, '\\');
#else
        p = strrchr(p, '/');
#endif

    printf("\n  flash name: %s\n", p ? ++p : p);
    printf("  flash size: %d (%dMB)\n", flash->size, flash->size/(1024*1024));
}

void print_notice(void)
{
    printf("  *********************************\n"
           "  *        SHOW FLASH TOOL        *\n"
           "  *                               *\n"
           "  *  n: nvram show                *\n"
           "  *  e: envram show               *\n"
           "  *  f: find param                *\n"
           "  *  q: quit                      *\n"
           "  *                               *\n"
           "  *********************************\n"
        );
}

void print_prompt(void)
{
    printf("Flash Tool> ");
}

int cmp_str(const void *a, const void *b)
{
    return (strcmp(*(char**)a,*(char**)b));
}

/*return param count*/
int init_envram_table(flash_info_t *flash)
{
    char *p = NULL;
    int len = 0;
    int i = 0;
    int count = 0;

    if(flash->magic[0] == 'F')
        len = ltohl(flash->envram_head->len);
    else
        len = btohl(flash->envram_head->len);
    dprintf("len = 0x%x, %d\n", len, len);
    p = (char*)flash->envram_head + sizeof(struct nvram_header);
    envram_table[i++] = p;
    count++;
    while(p <= (char*)flash->envram_head + len)
    {
        if(*p == 0)
        {
            envram_table[i++] = p+1;
            count++;
            if(envram_table[i-1][0] == 0 || (unsigned char)envram_table[i-1][0] == 0xff)
            {
                i--;
                count--;
            }
        }
        p++;
    }
    if(envram_table[i-1][0] == 0 || (unsigned char)envram_table[i-1][0] == 0xff)
    {
        i--;
        count--;
    }
    qsort(envram_table, count, 4, &cmp_str);
    flash->eparam_cnt = count;
    return count;
}

int init_nvram_table(flash_info_t *flash)
{
    char *p = NULL;
    int len = 0;
    int i = 0;
    int count = 0;

    if(flash->magic[0] == 'F')
        len = ltohl(flash->nvram_head->len);
    else
        len = btohl(flash->nvram_head->len);

    dprintf("len = 0x%x, %d\n", len, len);
    p = (char*)flash->nvram_head + sizeof(struct nvram_header);
    nvram_table[i++] = p;
    count++;
    while(p <= (char*)flash->nvram_head + len)
    {
        if(*p == 0)
        {
            nvram_table[i++] = p+1;
            count++;
            if(nvram_table[i-1][0] == 0 || (unsigned char)nvram_table[i-1][0] == 0xff)
            {
                i--;
                count--;
            }
        }
        p++;
    }
    if(nvram_table[i-1][0] == 0 || (unsigned char)nvram_table[i-1][0] == 0xff)
    {
        i--;
        count--;
    }
    qsort(nvram_table, count, 4, &cmp_str);
    flash->nparam_cnt = count;
    return count;
}

void nvram_show(flash_info_t *f)
{
    int i = 0;
    
    if(f->nvram_err_flag)
    {
        printf("nvram error\n");
        return;
    }
    for(i = 0; i < f->nparam_cnt && nvram_table[i]; i++)
    {
        printf("%s\n", nvram_table[i]);
    }
    printf("\ncount: %d\n", f->nparam_cnt);
}

void envram_show(flash_info_t *f)
{
    int i = 0;
    
    if(f->envram_err_flag)
    {
        printf("envram error\n");
        return;
    }
    for(i = 0; i < f->eparam_cnt && envram_table[i]; i++)
    {
        printf("%s\n", envram_table[i]);
    }
    printf("\ncount: %d\n", f->eparam_cnt);
    
}

int check_flash_valid(flash_info_t *f)
{
    if(f->size < 1*1024*1024)
    {
        return -1;
    }
    if(memcmp((char*)f->envram_head, f->magic, 4))
    {
        //fwrite((char*)f->nvram_head, 1, 4, stdout);
        //printf("\n");
        dprintf("not find envram\n");
        f->envram_err_flag = 1;
    }
    if(memcmp((char*)f->nvram_head, f->magic, 4))
    {
        //fwrite((char*)f->nvram_head, 1, 4, stdout);
        //printf("\n");
        dprintf("not find nvram\n");
        f->nvram_err_flag = 1;
    }
    
    if(f->envram_err_flag && f->nvram_err_flag)
        return -1;

    return 1;
}

void find_param(flash_info_t *f, char *target)
{
    int i = 0;
    
    if(!target || !*target)
    {
        printf("paramter miss, such as:f mac \n");
        return;
    }
    
    //find in envram
    if(f->envram_err_flag)
    {
        printf("envram error\n");
    }
    else
    {
        printf("\n*********Find in envram: %s******\n", target);
        for(i = 0; i < f->eparam_cnt; i++)
        {
            if(strstr(envram_table[i], target))
            {
                printf("%s\n", envram_table[i]);
            }
        }
    }
    
    //find in nvram
    if(f->nvram_err_flag)
    {
        printf("nvram error\n");
    }
    else
    {
        printf("\n*********Find in nvram: %s********\n", target);
        for(i = 0; i < f->nparam_cnt; i++)
        {
            if(strstr(nvram_table[i], target))
            {
                printf("%s\n", nvram_table[i]);
            }
        }
    }
}

char *parse_cmd(char *cmd)
{
    char *p = cmd;
    char *ret = NULL;
    while(*p && *p != ' ' && *p != '\t')
    {
        p++;
    }
    ret = ++p;
    while(*p && *p != ' ' && *p != '\t')
    {
        p++;
    }
    *p = 0;
    
    return ret;
}

int main(int argc, char **argv)
{

    char *path = argv[1];
    char c = 0;
    flash_info_t *flash = NULL;
    char cmd_buf[1024] = {0};
        
    if(argc < 2)
    {
        dprintf("parameter miss\n");
        goto error;
    }
    //flash = init_flashinfo("FS_W311RV11.0br_V5.07.53.01_pt_NEX01_NEW.bin");
    flash = init_flashinfo(path);
    
    if(!flash)
        goto error;
    if(0 > check_flash_valid(flash))
    {
        printf("FLASH is not valid!\n");
        goto error;
    }
    
    if(0 == flash->envram_err_flag)
        init_envram_table(flash);
    if(0 == flash->nvram_err_flag)
        init_nvram_table(flash);
    
    print_flash_info(flash);
    print_notice();
    print_prompt();
    while(1)
    {
        gets(cmd_buf);
        switch(cmd_buf[0])
        {
            case 'e':
            case 'E':
                envram_show(flash);
                print_notice();
                print_prompt();
                break;
            case 'n':
            case 'N':
                nvram_show(flash);
                print_notice();
                print_prompt();
                break;
            case 'f':
            case 'F':
                find_param(flash, parse_cmd(cmd_buf));
                print_prompt();
                break;
            case 'h':
            case 'H':
                print_notice();
                print_prompt();
                break;
            case 'q':
            case 'Q':
                destory_flashinfo(flash);
                return 0;
            case '\0':
                print_prompt();
                break;
            default:
                printf("\nPlease input a valid char\n");
                print_prompt();
                break;
        }
    }
error:
    destory_flashinfo(flash);
    printf("Please enter any key to exit the process\n");
    getchar();
    return -1;
}