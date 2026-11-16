/* =====================================================================
   MOVIMIENTO (los estilos están en assets/css/movimiento.css)

   Capa de animaciones. No cambia lo que dice ni lo que hace la página: añade
   cómo se mueve.
   - Las partes de la página entran al llegar a ellas, una tras otra.
   - Portada: avisos que flotan alrededor del video y se mueven a distinta
     velocidad que la página (con suavizado), como piezas en capas.
   - Cómo funciona: las tarjetas se apilan; la tapada se achica y se oscurece.
   - Primera semana: la línea se dibuja a medida que bajas.
   - Ejemplo real: el sello se estampa y el teléfono flota.
   - Controles con pastilla que se desliza, cabecera de vidrio y una barra
     flotante de escritorio que dice en qué parte estás.

   Todo se apaga con «reducir movimiento» del sistema. Para quitar la capa:
   borra este archivo, movimiento.css y sus dos líneas en index.html.
   ===================================================================== */
(function () {
  "use strict";

  var html = document.documentElement;
  var mqReduce = window.matchMedia("(prefers-reduced-motion: reduce)");
  var mqPila = window.matchMedia("(min-width: 900px) and (min-height: 560px)");
  var hayIO = "IntersectionObserver" in window;

  function $(id) { return document.getElementById(id); }
  function todos(sel) { return [].slice.call(document.querySelectorAll(sel)); }
  function entre(v, a, b) { return Math.min(b, Math.max(a, v)); }
  function reducido() { return mqReduce.matches; }
  function escuchar(mq, fn) {
    if (mq.addEventListener) mq.addEventListener("change", fn);
    else if (mq.addListener) mq.addListener(fn);
  }
  function crear(tag, cls, txt) {
    var n = document.createElement(tag);
    if (cls) n.className = cls;
    if (txt != null) n.textContent = txt;
    return n;
  }
  /* Espera a que app.js haya pintado la página (textos de config.js, tarjetas, etc.). */
  function cuandoEsteListo(fn) {
    if (window.VV && window.VV.alListo) window.VV.alListo(fn);
    else if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", fn);
    else fn();
  }

  var cab = null, cabEsc = false;
  var hero = { fig: null, chips: [] };
  var real = { sec: null, tel: null };
  var pila = { sec: null, lis: [], sucia: false };
  var riel = { ol: null, lis: [] };
  var canal = { hero: { cur: 0, meta: 0 }, real: { cur: 0.5, meta: 0.5 } };
  var lazo = false, t0 = 0, pendiente = false;

  /* ---------------------------------------------------------------
     1. Entradas al llegar a cada parte de la página
     Solo se preparan las piezas que empiezan más abajo de la pantalla,
     así nada de lo que ya se ve parpadea. Al terminar se limpia todo.
     --------------------------------------------------------------- */
  var SEL_REV = ".sec > .cont > *, .real-in > *, .cierre > .cont > *";
  var rev = { io: null };

  function limpiarRev(e) {
    e.classList.remove("rev", "rev-in");
    e.style.transitionDelay = "";
  }
  function iniciarRev() {
    if (!hayIO || reducido()) return;
    var h = window.innerHeight;
    var lista = todos(SEL_REV).filter(function (e) {
      if (e.closest("[hidden]")) return false;
      /* En pantallas grandes la lista de pasos se vuelve una pila de tarjetas fijas: no se toca. */
      if (mqPila.matches && e.classList.contains("pasos3")) return false;
      return e.getBoundingClientRect().top > h;
    });
    rev.io = new IntersectionObserver(function (es) {
      var entran = es.filter(function (x) { return x.isIntersecting; })
        .sort(function (a, b) { return a.boundingClientRect.top - b.boundingClientRect.top; });
      entran.forEach(function (x, i) {
        var e = x.target;
        rev.io.unobserve(e);
        e.style.transitionDelay = Math.min(i, 4) * 70 + "ms";
        e.classList.add("rev-in");
        setTimeout(function () { limpiarRev(e); }, 1700);
      });
    }, { rootMargin: "0px 0px -8% 0px", threshold: 0 });
    lista.forEach(function (e) { e.classList.add("rev"); rev.io.observe(e); });
  }

  /* ---------------------------------------------------------------
     2. Portada: avisos flotantes y capas a distinta velocidad
     --------------------------------------------------------------- */
  function iniciarHero() {
    var fig = $("video");
    if (!fig) return;
    hero.fig = fig;
    var c = crear("div", "vchips");
    c.setAttribute("aria-hidden", "true");
    c.innerHTML =
      '<span class="vchip vchip-a"><i class="vchip-p"></i>Venta en caja</span>' +
      '<span class="vchip vchip-b"><span class="vchip-t">Catálogo</span><span class="vchip-val"><b class="va">Hay 4</b><b class="vb">Quedan 3</b></span></span>' +
      '<span class="vchip vchip-c"><svg class="ico" viewBox="0 0 24 24" focusable="false"><use href="#i-chat"/></svg><span class="vc-l">Pedido a tu WhatsApp</span><span class="vc-s">Pedido</span></span>';
    fig.insertBefore(c, fig.firstChild);
    /* v: cuántos píxeles se mueve cada aviso respecto al video mientras sales de la portada */
    hero.chips = [
      { el: c.querySelector(".vchip-a"), v: -30 },
      { el: c.querySelector(".vchip-b"), v: 16 },
      { el: c.querySelector(".vchip-c"), v: -12 }
    ];
    /* Fuera de la pantalla los avisos se detienen (no gastan batería) */
    var portada = $("portada");
    if (hayIO && portada) {
      new IntersectionObserver(function (es) { c.classList.toggle("pausa", !es[0].isIntersecting); }).observe(portada);
    }
  }

  /* ---------------------------------------------------------------
     3. Cómo funciona: la tarjeta tapada se achica y se oscurece.
     La pila en sí (tarjetas fijas que se tapan) es CSS puro.
     --------------------------------------------------------------- */
  function iniciarPila() {
    pila.sec = $("como-funciona");
    pila.lis = todos("#como-funciona .pasos3 > li");
  }
  function pilaActiva() { return mqPila.matches && !reducido() && !html.classList.contains("presentar"); }
  function limpiarPila() {
    pila.lis.forEach(function (li) { li.style.transform = ""; li.style.removeProperty("--cov"); });
    pila.sucia = false;
  }
  function pulirPila(vh) {
    if (!pila.sec || pila.lis.length < 2) return;
    if (!pilaActiva()) { if (pila.sucia) limpiarPila(); return; }
    var r = pila.sec.getBoundingClientRect();
    if (r.bottom < -300 || r.top > vh + 300) return;
    var arriba = parseFloat(getComputedStyle(pila.lis[0]).top) || 88;
    var rects = pila.lis.map(function (li) { return li.getBoundingClientRect(); });
    pila.sucia = true;
    pila.lis.forEach(function (li, k) {
      if (k === pila.lis.length - 1) return;
      var alto = li.offsetHeight || 1;
      /* 0: la siguiente aún no toca a esta; 1: ya la cubrió por completo */
      var c = entre((arriba + alto - rects[k + 1].top) / alto, 0, 1);
      li.style.transform = c > 0.001 ? "scale(" + (1 - 0.055 * c).toFixed(4) + ")" : "";
      li.style.setProperty("--cov", (0.55 * c).toFixed(3));
    });
  }
  /* El número del tercer paso cuenta hasta 15 al llegar a él */
  function iniciarCuenta() {
    var el = document.querySelector("#como-funciona .p3-15");
    if (!el || reducido() || !hayIO) return;
    var m = /^(.*?)(\d+)(.*)$/.exec(el.textContent);
    if (!m) return;
    var n = parseInt(m[2], 10), num = crear("span", "cuenta", String(n));
    el.textContent = "";
    el.appendChild(document.createTextNode(m[1]));
    el.appendChild(num);
    el.appendChild(document.createTextNode(m[3]));
    if (el.getBoundingClientRect().top < window.innerHeight) return;   /* ya a la vista: se deja el número final */
    num.textContent = "0";
    var io = new IntersectionObserver(function (es) {
      if (!es[0].isIntersecting) return;
      io.disconnect();
      var ini = performance.now(), dur = 1100;
      (function paso(t) {
        var k = entre((t - ini) / dur, 0, 1);
        num.textContent = String(Math.round(n * (1 - Math.pow(1 - k, 4))));
        if (k < 1) requestAnimationFrame(paso);
      })(ini);
    }, { threshold: 0.7 });
    io.observe(el);
  }

  /* ---------------------------------------------------------------
     4. Primera semana: la línea se dibuja mientras bajas
     --------------------------------------------------------------- */
  function iniciarRiel() {
    riel.ol = $("linea");
    riel.lis = todos("#linea > li");
  }
  function pulirRiel(vh) {
    if (!riel.ol || reducido()) return;
    var r0 = riel.ol.getBoundingClientRect();
    if (r0.bottom < -100 || r0.top > vh + 100) return;
    var cabeza = vh * 0.7;
    riel.lis.forEach(function (li, i) {
      if (i === riel.lis.length - 1) return;
      var r = li.getBoundingClientRect();
      var s = entre((cabeza - (r.top + 42)) / Math.max(1, r.height - 44), 0, 1).toFixed(3);
      if (li._f !== s) { li._f = s; li.style.setProperty("--f", s); }
    });
  }

  /* ---------------------------------------------------------------
     5. Ejemplo real: el sello se estampa y el teléfono flota
     --------------------------------------------------------------- */
  function iniciarReal() {
    var sec = $("ejemplo-real");
    if (!sec || sec.hidden) return;
    real.sec = sec;
    real.tel = sec.querySelector(".real-tel");
    if (reducido() || !hayIO) return;
    sec.classList.add("mov-real");
    var io = new IntersectionObserver(function (es) {
      if (es[0].isIntersecting) { sec.classList.add("real-vista"); io.disconnect(); }
    }, { threshold: 0.3 });
    io.observe(sec);
  }

  /* ---------------------------------------------------------------
     6. Controles con pastilla que se desliza de una opción a otra
     --------------------------------------------------------------- */
  function iniciarSegs() {
    if (reducido() || !window.MutationObserver) return;
    todos(".seg").forEach(function (seg) {
      var ind = crear("span", "seg-ind"), listo = false;
      ind.setAttribute("aria-hidden", "true");
      seg.insertBefore(ind, seg.firstChild);
      seg.classList.add("con-ind");
      function mover() {
        var b = seg.querySelector('.seg-b[aria-pressed="true"]');
        if (!b || !b.offsetWidth) return;
        if (!listo) {
          /* la primera vez se coloca sin recorrido */
          listo = true;
          ind.style.transition = "none";
          requestAnimationFrame(function () { requestAnimationFrame(function () { ind.style.transition = ""; }); });
        }
        ind.style.width = b.offsetWidth + "px";
        ind.style.transform = "translateX(" + b.offsetLeft + "px)";
      }
      new MutationObserver(mover).observe(seg, { attributes: true, subtree: true, attributeFilter: ["aria-pressed"] });
      if ("ResizeObserver" in window) new ResizeObserver(mover).observe(seg);
      mover();
    });
  }

  /* ---------------------------------------------------------------
     7. Barra flotante de escritorio: dónde estás y WhatsApp
     --------------------------------------------------------------- */
  var dock = { el: null, etq: null, ver: false, estado: { portada: true, cierre: false } };
  function actualizarDock() {
    if (!dock.el) return;
    var ver = !dock.estado.portada && !dock.estado.cierre &&
      !document.body.classList.contains("con-tour") && !html.classList.contains("presentar");
    if (ver === dock.ver) return;
    dock.ver = ver;
    dock.el.classList.toggle("dock-ver", ver);
    dock.el.inert = !ver;
  }
  function iniciarDock() {
    var d = crear("div", "dock");
    d.id = "dock";
    d.setAttribute("role", "navigation");
    d.setAttribute("aria-label", "Atajos de la página");
    d.innerHTML =
      '<button type="button" class="dock-up" aria-label="Volver al inicio"><svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="M12 5l7 7-1.4 1.4L13 8.8V20h-2V8.8l-4.6 4.6L5 12z" fill="currentColor"/></svg></button>' +
      '<span class="dock-sec" aria-hidden="true"><span class="dock-t">Portada</span></span>' +
      '<a class="btn btn-wa btn-ch dock-wa" data-wa="general" href="#cierre" target="_blank" rel="noopener"><svg class="ico" aria-hidden="true"><use href="#i-chat"/></svg>Escribir por WhatsApp</a>';
    document.body.appendChild(d);
    d.inert = true;
    dock.el = d;
    dock.etq = d.querySelector(".dock-t");

    d.querySelector(".dock-up").addEventListener("click", function () {
      window.scrollTo({ top: 0, behavior: reducido() ? "auto" : "smooth" });
    });

    /* El botón de WhatsApp dice lo mismo que el de la barra de celular, que ya cambia según la sección */
    var origen = document.querySelector("#barraWa a[data-wa]"), wa = d.querySelector(".dock-wa");
    function copiar() {
      if (origen) {
        wa.setAttribute("data-wa", origen.getAttribute("data-wa"));
        wa.setAttribute("href", origen.getAttribute("href"));
      } else if (window.VV && window.VV.wa) {
        wa.setAttribute("href", window.VV.wa("general"));
      }
    }
    copiar();
    if (origen && window.MutationObserver) {
      new MutationObserver(copiar).observe(origen, { attributes: true, attributeFilter: ["href", "data-wa"] });
    }

    if (!hayIO) return;
    /* El nombre de la parte que estás viendo */
    var ioSec = new IntersectionObserver(function (es) {
      es.forEach(function (e) {
        if (!e.isIntersecting) return;
        var t = e.target.getAttribute("data-sec") || "";
        if (!t || t === dock.etq.textContent) return;
        dock.etq.textContent = t;
        dock.etq.classList.remove("dock-cambia");
        void dock.etq.offsetWidth;
        dock.etq.classList.add("dock-cambia");
      });
    }, { rootMargin: "-45% 0px -45% 0px" });
    todos("main > section[data-sec]").forEach(function (s) { ioSec.observe(s); });
    /* Aparece al salir de la portada y se va en el cierre */
    var ioVis = new IntersectionObserver(function (es) {
      es.forEach(function (e) { dock.estado[e.target.id === "portada" ? "portada" : "cierre"] = e.isIntersecting; });
      actualizarDock();
    });
    if ($("portada")) ioVis.observe($("portada"));
    if ($("cierre")) ioVis.observe($("cierre"));
  }

  /* ---------------------------------------------------------------
     Motor: un solo escucha de desplazamiento y un bucle con suavizado
     (la posición de cada capa persigue a la del scroll, no la copia)
     --------------------------------------------------------------- */
  function aplicarCanales() {
    var k = entre(window.innerWidth / 1100, 0.45, 1);   /* en celular el recorrido es menor */
    if (hero.fig) {
      var p = canal.hero.cur;
      hero.fig.style.translate = "0 " + (p * 34 * k).toFixed(2) + "px";
      hero.chips.forEach(function (c) { c.el.style.translate = "0 " + (p * c.v * k).toFixed(2) + "px"; });
    }
    if (real.tel) {
      var q = canal.real.cur - 0.5;
      real.tel.style.translate = "0 " + (-q * 44 * k).toFixed(2) + "px";
      real.tel.style.rotate = (q * 3.2).toFixed(2) + "deg";
    }
  }
  function bucle(ahora) {
    var dt = Math.min((ahora - t0) / 1000, 0.05), a = 1 - Math.exp(-dt / 0.45), quieto = true;
    t0 = ahora;
    ["hero", "real"].forEach(function (nombre) {
      var c = canal[nombre];
      c.cur += (c.meta - c.cur) * a;
      if (Math.abs(c.meta - c.cur) < 0.0008) c.cur = c.meta; else quieto = false;
    });
    aplicarCanales();
    if (quieto) { lazo = false; return; }
    requestAnimationFrame(bucle);
  }
  function despertar() {
    if (lazo) return;
    if (Math.abs(canal.hero.meta - canal.hero.cur) < 0.0008 && Math.abs(canal.real.meta - canal.real.cur) < 0.0008) return;
    lazo = true;
    t0 = performance.now();
    requestAnimationFrame(bucle);
  }
  function actualizar() {
    pendiente = false;
    var y = window.scrollY || window.pageYOffset || 0, vh = window.innerHeight;
    if (cab) {
      var esc = y > 12;
      if (esc !== cabEsc) { cabEsc = esc; cab.classList.toggle("cab-esc", esc); }
    }
    if (reducido()) return;
    if (hero.fig) {
      var portada = $("portada");
      canal.hero.meta = entre(y / ((portada ? portada.offsetHeight : vh) * 0.85), 0, 1);
    }
    if (real.tel && real.sec) {
      var r = real.sec.getBoundingClientRect();
      if (r.bottom > -100 && r.top < vh + 100) canal.real.meta = entre((vh - r.top) / (vh + r.height), 0, 1);
    }
    pulirPila(vh);
    pulirRiel(vh);
    despertar();
  }
  function programar() {
    if (pendiente) return;
    pendiente = true;
    requestAnimationFrame(actualizar);
  }
  function alCambiarReduce() {
    if (reducido()) {
      todos(".rev").forEach(limpiarRev);
      if (hero.fig) { hero.fig.style.translate = ""; hero.chips.forEach(function (c) { c.el.style.translate = ""; }); }
      if (real.tel) { real.tel.style.translate = ""; real.tel.style.rotate = ""; }
      canal.hero.cur = canal.hero.meta = 0;
      canal.real.cur = canal.real.meta = 0.5;
      limpiarPila();
      riel.lis.forEach(function (li) { li.style.removeProperty("--f"); li._f = null; });
    }
    programar();
  }

  function iniciar() {
    cab = document.querySelector(".cab");
    iniciarHero();
    iniciarRev();
    iniciarPila();
    iniciarRiel();
    iniciarCuenta();
    iniciarReal();
    iniciarSegs();
    iniciarDock();
    window.addEventListener("scroll", programar, { passive: true });
    window.addEventListener("resize", programar);
    escuchar(mqReduce, alCambiarReduce);
    escuchar(mqPila, programar);
    if (window.MutationObserver) {
      /* html.presentar (modo presentación) y body.con-tour (recorrido guiado) */
      new MutationObserver(function () { programar(); actualizarDock(); }).observe(html, { attributes: true, attributeFilter: ["class"] });
      new MutationObserver(actualizarDock).observe(document.body, { attributes: true, attributeFilter: ["class"] });
    }
    programar();
    window.MOV = { listo: true };
  }
  cuandoEsteListo(iniciar);
})();
