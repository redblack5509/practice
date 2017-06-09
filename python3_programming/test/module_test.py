#!/usr/bin/python3

"""
Test

>>> add(1,2)
3

>>> add(2,2)
4

>>> add(2,2)
5
"""

def add(a, b):
    return (a+b)

if __name__ == "__main__":
    import doctest
    doctest.testmod()

