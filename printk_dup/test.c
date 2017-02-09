#include <linux/module.h>
#include <linux/init.h>
#include <linux/fs.h>
#include <linux/uaccess.h>

static char buf[] ="llm";
static char buf1[10];
static int err_open_cnt = 0;
static int err_write_cnt = 0;
static int call_cnt = 0;
extern int llm_test_flag;
int __init hello_init(void)
{
    llm_test_flag = 1;
}
// int __init hello_init(void)
// {
//     struct file *fp;
//     mm_segment_t fs;
//     loff_t pos;
//     printk("hello enter\n");
//     fp =filp_open("/dev/console",O_RDWR | O_CREAT,0644);
//     if (IS_ERR(fp)){
//         printk("create file error\n");
//         return -1;
//     }
//     fs =get_fs();
//     set_fs(KERNEL_DS);
//     pos =0;
//     vfs_write(fp,buf, sizeof(buf), &pos);
//     pos =0;
//     // vfs_read(fp,buf1, sizeof(buf), &pos);
//     // printk("read: %s\n",buf1);
//     filp_close(fp,NULL);
//     set_fs(fs);
//     return 0;
// }

// int dup_printk(char *data, size_t len)
// {
//     struct file *fp = NULL;
//     mm_segment_t fs;
//     loff_t pos = 0;
//     int ret;

//     call_cnt++;
//     fp = filp_open("/dev/console", O_RDWR, 0644);
//     if(IS_ERR(fp))
//     {
//         err_open_cnt++;
//         // printk("filp open /dev/console failed\n");
//         return 0;
//     }
//     fs = get_fs();
//     set_fs(KERNEL_DS);
//     // printk("before write\n");
//     ret = vfs_write(fp, data, len, &pos);
//     if(!ret)
//         err_write_cnt++;
//     // printk("write ago\n");
//     filp_close(fp, NULL);
//     set_fs(fs);
//     return ret;
//     /* llm add end */
// }

// EXPORT_SYMBOL(dup_printk);

void __exit hello_exit(void)
{
    // printk("hello exit, call_cnt = %d, err_open_cnt = %d, err_write_cnt = %d\n",
    //     call_cnt, err_open_cnt, err_write_cnt);
}
 
module_init(hello_init);
module_exit(hello_exit);
 
MODULE_LICENSE("GPL");