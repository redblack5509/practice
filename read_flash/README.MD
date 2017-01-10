读烧录软件的小工具，方便查看envram，nvram参数  

**缺陷**  
* 为了windows上能使用，没有使用stat函数查看文件大小。固定分配128MB内存（AC18 flash 128MB）  
* 对于11AC产品，nvram分区改变，不能找到nvram分区。只可以查看envram参数  

