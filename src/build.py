# Builds the prototype (prototype/index.html) and the real app (index.html) from src/tackle.html.
# Run from the repo root: python3 src/build.py
import os
ROOT=os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
src=open(os.path.join(ROOT,'src','tackle.html')).read()
s=src.replace('<meta name="claude:viewport-fit-sides" content="cover">\n','',1)
i=s.index('</style>')+len('</style>')
def page(extra_head, title, body_fix=lambda b:b):
    head='''<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<meta name="apple-mobile-web-app-capable" content="yes">
<meta name="mobile-web-app-capable" content="yes">
<meta name="apple-mobile-web-app-title" content="Tackle">
<meta name="apple-mobile-web-app-status-bar-style" content="default">
<meta name="theme-color" content="#F7F7F4" media="(prefers-color-scheme: light)">
<meta name="theme-color" content="#191917" media="(prefers-color-scheme: dark)">
'''+extra_head
    top=s[:i].replace('<title>Tackle Prototype</title>','<title>'+title+'</title>',1)
    body=body_fix(s[i+1:])
    return head+top+'\n<style>:root{padding-top:env(safe-area-inset-top,0px)}body{margin:0}[hidden]{display:none!important}</style>\n</head>\n<body>\n'+body+'\n</body>\n</html>\n'
open(os.path.join(ROOT,'prototype','index.html'),'w').write(page('','Tackle Prototype'))
import time
BUILD=str(int(time.time()))
app_head='''<meta name="tackle-build" content="'''+BUILD+'''">
<link rel="manifest" href="manifest.webmanifest">
<link rel="icon" type="image/png" href="icons/favicon-32.png">
<link rel="apple-touch-icon" href="icons/apple-touch-icon.png">
'''
def fix(b):
    b=b.replace('<div class="proto" id="proto" aria-label="Prototype controls"></div>','<div class="proto" id="proto" hidden></div>',1)
    b=b.replace('<script>\n(function () {','<script src="config.js"></script>\n<script src="vendor/supabase.js"></script>\n<script src="app.js"></script>\n<script>\n(function () {',1)
    assert 'app.js' in b
    return b
open(os.path.join(ROOT,'index.html'),'w').write(page(app_head,'Tackle',fix))
