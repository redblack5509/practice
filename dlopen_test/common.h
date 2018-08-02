#ifndef __COMMON_H__
#define __COMMON_H__

struct own_func{
    char name[32];
    void (*func)(void);
};

extern void register_func(struct own_func *reg);
extern struct own_func all_func[];

#endif