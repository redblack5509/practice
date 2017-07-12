1、什么是惊群
简而言之，惊群现象（thundering herd）就是当多个进程和线程在同时阻塞等待同一个事件时，如果这个事件发生，会唤醒所有的进程，但最终只可能有一个进程/线程对该事件进行处理，其他进程/线程会在失败后重新休眠，这种性能浪费就是惊群。

2、linux下是否真的有惊群现象？
2.6.36.4没有出现
3.19.0没有出现
select也没有出现，我觉得这很奇怪，accept不惊群可以理解，select应该惊群才对

奇怪的打印：
678
7092, have data
7093, have data
7094, have data
7095, have data
7096, have data
7096, data:678

788
7095, data:788

7096, have data
time out
time out
time out
time out
time out
111111111111111
7094, data:111111111111111

7095, have data
^C

