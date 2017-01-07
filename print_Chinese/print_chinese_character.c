#include <stdio.h>
#include <string.h>

#define DRAW_CHAR '@'
#define HZK16 "HZK16"
// CC: chinese character

// 计算该汉字在字库中的偏移
int get_CC_offset(char *s)
{
    unsigned char part_code = s[0] - 0xA0;    //区码
    unsigned char site_code = s[1] - 0xA0;    //位码

    return (94 * (part_code - 1) + (site_code - 1)) * 32;
}

int is_set_bit(char *s, int off)
{
    return *(s + off / 8) & (0x80 >> (off % 8));
}

//终端放到最大一行最多打四个汉字，两个显示最好
void print_line_n_CC(char *s, int n)
{
    if(!s || n * 2 > strlen(s) || n > 4)
        return;

    int offset = 0;
    int i = 0, j = 0, k = 0;
    char **code_table = NULL;
    FILE *fp = fopen(HZK16, "rb");

    if(!fp)
    {
        printf("fopen %s error: %m\n", HZK16);
        return;
    }

    code_table = (char **)malloc(n * sizeof(char *));
    for(i = 0; i < n; i++)
        code_table[i] = (char *)malloc(32);

    // 计算偏移，得到该汉字的码表
    for(i = 0; i < n; i++)
    {
        offset = get_CC_offset(s + i * 2);
        fseek(fp, offset, SEEK_SET);
        fread(code_table[i], 32, 1, fp);
    }
    fclose(fp);

    for(i = 0; i < 16; i++)
    {
        for(j = 0; j < n * 16; j++)
        {
            if(j != 0 && j % 16 == 0)
            {
                printf("    ");
            }

            if(is_set_bit(code_table[j / 16], i * 16 + j % 16 - 16))
                printf("%c ", DRAW_CHAR);
            else
                printf("  ");
            
        }
        printf("\n");
    }
    printf("\n");

    for(i = 0; i < n; i++)
        free(code_table[i]);
    free(code_table);
}

void print_CC(char *s, int line_max_char)
{
    if(!s)
        return;

    if(line_max_char > 4)
    {
        printf("line max print 4 chinese charcter\n");
        return; 
    }

    int i = 0;
    int len = strlen(s);
    int max_len = 0;

    for(i = 0; i < len; i = i + 2 * line_max_char)
    {
    	if( i + line_max_char * 2 > len)
    		max_len = (len - i) / 2;
    	else
    		max_len = line_max_char;
    		
        print_line_n_CC(s + i, max_len);
    }
}

int main(int argc, char const *argv[])
{
    print_line_n_CC("步不惊心", 4);
    print_line_n_CC("珠玑", 2);
    print_CC("我的老嘎就住在这个屯", 4);
    return 0;
}
