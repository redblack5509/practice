import pytesseract
from PIL import Image


# 默认英语
image = Image.open('en.png')
text = pytesseract.image_to_string(image)
print(text)

print("====================")

# 识别中文, 巨慢
image = Image.open('cn.png')
text = pytesseract.image_to_string(image, lang='chi_sim')
print(text)

print("====================")

# 设置中文和英语，识别巨慢，而且易错
image = Image.open('en_cn_test.png')
text = pytesseract.image_to_string(image, lang='chi_sim+eng')
print(text)

