#!/usr/bin/env python3
"""Arma index.html de UPC CLBR a partir del Index.html legible de la app de Google (misma app, mismo código).
Uso: python3 build_pwa.py /ruta/a/turnos-upc/Index.html"""
import sys, re
src = open(sys.argv[1], encoding='utf-8').read()
head = '''<meta name="theme-color" content="#151B23">
<meta name="apple-mobile-web-app-capable" content="yes">
<meta name="mobile-web-app-capable" content="yes">
<meta name="apple-mobile-web-app-status-bar-style" content="black-translucent">
<meta name="apple-mobile-web-app-title" content="UPC CLBR">
<link rel="manifest" href="manifest.webmanifest">
<link rel="apple-touch-icon" href="icons/apple-touch-icon.png">
<link rel="icon" type="image/png" href="icons/favicon-32.png">
<script src="firebase-config.js"></script>
<script src="pwa.js"></script>
<style>/* iPhone con la app instalada: la banda oscura llega hasta arriba, detrás de la hora y la batería */
html{background:#151B23} body{min-height:100vh; background-color:#151B23!important; background-image:linear-gradient(var(--bg),var(--bg)); background-repeat:no-repeat; background-position:0 240px; background-size:100% 100%} .band{padding-top:calc(env(safe-area-inset-top) + 18px)} .band.tband .tgar{top:calc(env(safe-area-inset-top) + 16px)} .tscene,.tcruza{margin-top:calc(env(safe-area-inset-top) + 18px)}</style>
'''
assert src.count('<title>Turnos UPC</title>') == 1
out = src.replace('<title>Turnos UPC</title>', '<title>UPC CLBR</title>\n' + head, 1)
out = out.replace('content="width=device-width, initial-scale=1.0"', 'content="width=device-width, initial-scale=1.0, viewport-fit=cover"', 1)
for a, b in [('<div><h1>Turnos UPC</h1><p>Clínica Bupa Reñaca</p></div>', '<div><h1>UPC CLBR</h1><p>Turnos · Clínica Bupa Reñaca</p></div>'),
             ("`Turnos UPC · versión ${APP_V}`", "`UPC CLBR · versión ${APP_V}`"),
             ("'¡Bienvenido a Turnos UPC!'", "'¡Bienvenido a UPC CLBR!'")]:
    assert out.count(a) == 1, a
    out = out.replace(a, b)
open('index.html', 'w', encoding='utf-8').write(out)
print('index.html', len(out))
