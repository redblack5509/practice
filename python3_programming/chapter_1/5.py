#!/usr/bin/python3

def get_a_digits():
    while True:
        num = input("enter a number or Enter to finish: ")
        if num:
            try:
                num = int(num)
                return num
            except ValueError as err:
                print(err)
                continue
        else:
            return None

def find_min(numbers):
    min_num = numbers[0]
    for num in numbers:
        if num < min_num:
            min_num = num
    return min_num

def find_max(numbers):
    max_num = numbers[0]
    for num in numbers:
        if num > max_num:
            max_num = num
    return max_num

def calc_sum(numbers):
    sums = 0;
    for num in numbers:
        sums += num
    return sums

def sort_sum(numbers):
    i = 0
    while i < len(numbers):
        j = i;
        while j < len(numbers) - 1:
            if numbers[j] < numbers[j + 1]:
                tmp = numbers[j]
                numbers[j] = numbers[j + 1]
                numbers[j + 1] = tmp
            j += 1
        i += 1


all_num = []
while True:
    num = get_a_digits()
    if num is not None:
        all_num.append(num)
    else:
        break;

print("numbers:" , all_num)
print("count = ", len(all_num), "sum = ", calc_sum(all_num), "lowest = ", find_min(all_num), "highest = ", find_max(all_num), "mean = ", calc_sum(all_num)/len(all_num))

sort_sum(all_num)
print(all_num)



