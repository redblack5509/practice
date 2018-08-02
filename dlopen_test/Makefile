
all: libtest.so libcommon.so dlopen_test
	@echo done

libtest.so: test_lib.c
	gcc -fPIC -shared -o libtest.so test_lib.c

dlopen_test: dlopen_test.c
	gcc -o dlopen_test dlopen_test.c -ldl -L. -lcommon 

libcommon.so: libcommon.c
	gcc -fPIC -shared -o libcommon.so libcommon.c

clean:
	-rm -f *.so *.o dlopen_test