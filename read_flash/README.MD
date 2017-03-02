读烧录软件的小工具，方便查看envram，nvram参数  

**缺陷**  
* 为了windows上能使用，没有使用stat函数查看文件大小。固定分配128MB内存（AC18 flash 128MB）  
* 对于11AC产品，nvram分区改变，不能找到nvram分区。只可以查看envram参数  

---
2017-3-2 16:07:09 修改
`read_flash_v2.c`取消固定偏移，通过找魔术字的方法确认envram和nvram偏移。利用宏控，linux使用stat获取文件大小，windows固定分配128MB。  

flash.bin -- realtek flash  
FH456V1.0_FLASH01.BIN -- bcm flash  

