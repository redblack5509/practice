#!/usr/bin/python3

# 异常使用

# 自定义异常
class CancelError(Exception): pass

def fun():
    print("start")
    raise CancelError("I want exit")
    print("end")

try:
    raise ValueError("test value error")
    print("no except")

except ValueError as err:
    print(err)

try:
    fun()
except CancelError as err:
    print(err)
