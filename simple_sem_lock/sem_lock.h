#ifndef __SEM_LOCK_H__
#define __SEM_LOCK_H__

void simple_sem_wait(char *path);
void simple_sem_post(char *path);

#endif /* __SEM_LOCK_H__ */