# -*- mode: python -*-

block_cipher = None


a = Analysis(['TPCT_V2.py'],
             pathex=['C:\\python35\\Lib\\site-packages\\PyQt5\\Qt\\bin', 'Z:\\test\\linux\\practice\\multi_lang_check_tool\\qtgui'],
             binaries=[],
             datas=[],
             hiddenimports=[],
             hookspath=[],
             runtime_hooks=[],
             excludes=[],
             win_no_prefer_redirects=False,
             win_private_assemblies=False,
             cipher=block_cipher)
pyz = PYZ(a.pure, a.zipped_data,
             cipher=block_cipher)
exe = EXE(pyz,
          a.scripts,
          exclude_binaries=True,
          name='TPCT_V2',
          debug=False,
          strip=False,
          upx=True,
          console=False , icon='sf.ico')
coll = COLLECT(exe,
               a.binaries,
               a.zipfiles,
               a.datas,
               strip=False,
               upx=True,
               name='TPCT_V2')
