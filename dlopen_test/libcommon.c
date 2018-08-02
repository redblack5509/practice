#include <stdio.h>
#include <stdlib.h>
#include <string.h>

#include "common.h"

struct own_func all_func[16] = {0};

void register_func(struct own_func *reg_func)
{
    memcpy(&all_func[0], reg_func, sizeof(all_func[0]));
}