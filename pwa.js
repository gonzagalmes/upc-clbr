/* UPC CLBR · puente de la app instalable
   1) Reemplaza google.script.run por llamadas a la API del Apps Script (mismas funciones que la app de Google).
   2) Registra el service worker (la app abre aunque no haya señal y se actualiza sola).
   3) Muestra cómo instalarla si la abren desde el navegador. */
(function(){
  var API = 'https://script.google.com/macros/s/AKfycbywynnHSFUaRSQNl9VVSqfCOhGBVTTkmTvPlAM5lBBw1tivHK6GgY3iGdf4VFyfgL27qA/exec';
  window.UPC_PWA = true;
  if (!(window.google && window.google.script)) {
    var llamar = function(fn, args, ok, mal, u){
      fetch(API, { method:'POST', headers:{'Content-Type':'text/plain;charset=utf-8'}, body: JSON.stringify({ fn: fn, args: args }), redirect:'follow' })
        .then(function(r){ if(!r.ok) throw new Error('El servidor respondió '+r.status); return r.json(); })
        .then(function(j){ if(j.ok) { ok && ok(j.v, u); } else { mal && mal(new Error(j.e), u); } })
        .catch(function(e){ mal && mal(new Error(navigator.onLine===false ? 'Sin conexión a internet' : (e && e.message) || 'No se pudo conectar'), u); });
    };
    var run = function(ok, mal, u){ return new Proxy({}, { get: function(_, k){
      if (k === 'withSuccessHandler') return function(h){ return run(h, mal, u); };
      if (k === 'withFailureHandler') return function(h){ return run(ok, h, u); };
      if (k === 'withUserObject') return function(o){ return run(ok, mal, o); };
      return function(){ llamar(String(k), Array.prototype.slice.call(arguments), ok, mal, u); };
    }}); };
    window.google = { script: {
      run: run(null, null, null),
      url: { getLocation: function(cb){ var p={}; new URLSearchParams(location.search).forEach(function(v,k){ p[k]=v; }); cb({ parameter:p, hash: location.hash.slice(1) }); } },
      history: { replace: function(st, params){ try{ var q=new URLSearchParams(params||{}).toString(); history.replaceState(st, '', location.pathname+(q?'?'+q:'')); }catch(e){} } },
      host: { close: function(){} }
    }};
  }
  // service worker
  if ('serviceWorker' in navigator && location.protocol === 'https:') {
    window.addEventListener('load', function(){ navigator.serviceWorker.register('sw.js').catch(function(){}); });
  }
  // ---- guía para instalar (solo si se abre desde el navegador del celular) ----
  var instalada = function(){ try{ return matchMedia('(display-mode: standalone)').matches || navigator.standalone === true; }catch(e){ return false; } };
  var ua = navigator.userAgent || '', ios = /iPhone|iPad|iPod/.test(ua) || (/Macintosh/.test(ua) && navigator.maxTouchPoints > 1), android = /Android/.test(ua);
  var safari = ios && /Safari/.test(ua) && !/CriOS|FxiOS|EdgiOS|GSA|Instagram|FBAN|FBAV|WhatsApp/.test(ua);
  var promptAndroid = null;
  window.addEventListener('beforeinstallprompt', function(e){ e.preventDefault(); promptAndroid = e; mostrar(); });
  function luego(){ try{ return +localStorage.getItem('upc-inst-luego') > Date.now(); }catch(e){ return false; } }
  function css(){ if (document.getElementById('instCss')) return; var s=document.createElement('style'); s.id='instCss'; s.textContent=
    '#instBar{position:fixed;left:10px;right:10px;bottom:calc(74px + env(safe-area-inset-bottom));z-index:58;background:#fff;color:#151B23;border-radius:16px;box-shadow:0 10px 30px rgba(0,0,0,.35);padding:12px;display:flex;gap:10px;align-items:center;font:14px system-ui,-apple-system,sans-serif}'+
    '#instBar img{width:44px;height:44px;border-radius:11px}#instBar b{display:block;font-size:15px}#instBar .x{margin-left:auto;display:flex;gap:6px}'+
    '#instBar button,#instGuia button{white-space:nowrap;font:inherit;font-weight:700;border:0;border-radius:10px;padding:9px 12px;cursor:pointer}#instBar .si,#instGuia .si{background:#0064B0;color:#fff}#instBar .no{background:#EEF1F4;color:#151B23}'+
    '#instGuia{position:fixed;inset:0;z-index:59;background:rgba(0,0,0,.55);display:flex;align-items:flex-end;justify-content:center}'+
    '#instGuia .c{background:#fff;color:#151B23;width:100%;max-width:480px;border-radius:22px 22px 0 0;padding:20px 20px calc(20px + env(safe-area-inset-bottom));font:15px/1.45 system-ui,-apple-system,sans-serif}'+
    '#instGuia h3{margin:0 0 4px;font-size:19px}#instGuia ol{padding-left:0;list-style:none;margin:14px 0}#instGuia li{display:flex;gap:10px;align-items:flex-start;margin:10px 0}'+
    '#instGuia li i{flex:0 0 26px;height:26px;border-radius:50%;background:#151B23;color:#fff;font-style:normal;font-weight:800;display:grid;place-items:center;font-size:13px}#instGuia .ok{width:100%;margin-top:6px}#instGuia .warn{background:#FFF1B8;color:#7a5a00;border-radius:12px;padding:10px 12px;font-size:14px}';
    document.head.appendChild(s); }
  function guia(){
    css(); var pasos;
    if (ios && !safari) pasos = '<div class="warn">⚠️ Estás en el navegador de otra app. Para instalarla, ábrela en <b>Safari</b>: toca <b>⋯</b> o <b>⬆️</b> y elige <b>"Abrir en Safari"</b>.</div>';
    else if (ios) pasos = '<ol><li><i>1</i><span>Toca <b>Compartir</b> ⬆️ (abajo, en la barra de Safari).</span></li><li><i>2</i><span>Baja un poco y toca <b>"Agregar a pantalla de inicio"</b>.</span></li><li><i>3</i><span>Toca <b>Agregar</b> arriba a la derecha.</span></li><li><i>4</i><span>Abre <b>UPC CLBR</b> desde el ícono nuevo y permite las notificaciones.</span></li></ol>';
    else pasos = '<ol><li><i>1</i><span>En Chrome, toca <b>⋮</b> (arriba a la derecha).</span></li><li><i>2</i><span>Toca <b>"Instalar aplicación"</b> o <b>"Agregar a pantalla principal"</b>.</span></li><li><i>3</i><span>Confirma <b>Instalar</b> y ábrela desde el ícono nuevo.</span></li></ol>';
    var g=document.createElement('div'); g.id='instGuia'; g.innerHTML='<div class="c"><h3>📲 Instala UPC CLBR</h3><div style="color:#5A6573">Queda como una app más en tu celular, recuerda tu sesión y te avisa de turnos nuevos.</div>'+pasos+'<button class="si ok">Entendido</button></div>';
    g.onclick=function(e){ if(e.target===g || e.target.classList.contains('ok')) g.remove(); }; document.body.appendChild(g);
  }
  function mostrar(){
    if (instalada() || luego() || document.getElementById('instBar') || !(ios || android)) return;
    css(); var b=document.createElement('div'); b.id='instBar';
    b.innerHTML='<img src="icons/apple-touch-icon.png" alt=""><div><b>Instala UPC CLBR</b><span style="color:#5A6573">Ábrela como una app y recibe avisos</span></div><div class="x"><button class="no">Ahora no</button><button class="si">'+(promptAndroid?'Instalar':'Cómo')+'</button></div>';
    b.querySelector('.no').onclick=function(){ try{ localStorage.setItem('upc-inst-luego', Date.now()+3*864e5); }catch(e){} b.remove(); };
    b.querySelector('.si').onclick=function(){ if(promptAndroid){ promptAndroid.prompt(); promptAndroid.userChoice.then(function(){ b.remove(); }); promptAndroid=null; } else guia(); };
    document.body.appendChild(b);
  }
  window.upcInstalarGuia = guia;
  window.addEventListener('load', function(){ setTimeout(mostrar, 4000); });
})();
