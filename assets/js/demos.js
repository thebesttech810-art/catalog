/* Demostraciones: catálogo (C), personalización (D), modo vitrina (E),
   reporte (F) y conteo (G). Todo funciona sin conexión y con datos de ejemplo. */
(function () {
  "use strict";
  var VV = window.VV, D = window.VV_DATOS, C = window.CONFIG || {};
  var U = VV.util, $ = U.$, el = U.el, dinero = U.dinero, tagStock = U.tagStock, ilus = U.ilus, reduce = U.reduce;
  var chico = window.matchMedia("(max-width:759px)");

  function waBtn(clave, texto) {
    var a = el("a", "btn btn-wa"); a.setAttribute("data-wa", clave);
    a.innerHTML = '<svg class="ico" aria-hidden="true"><use href="#i-chat"/></svg>';
    a.appendChild(document.createTextNode(texto || "Escribir por WhatsApp"));
    a.href = VV.wa(clave); a.target = "_blank"; a.rel = "noopener";
    return a;
  }
  function norm(s) { return Array.from(String(s).toLowerCase().normalize("NFD")).filter(function (c) { var n = c.charCodeAt(0); return n < 768 || n > 879; }).join(""); }

  /* =====================================================
     C. CATÁLOGO
     ===================================================== */
  var F = { q: "", cat: "Todo", precio: 0, disp: false, todos: false };
  var minutos = 14, recien = -1;

  function pintarCabeceras() {
    var n = VV.nombre(), ini = VV.iniciales();
    $("catNombre").textContent = n; $("catLogo").textContent = ini;
    $("vitNombre").textContent = n; $("vitLogo").textContent = ini;
    $("repArch").textContent = "Reporte de ventas · " + n;
    $("asisQuien").textContent = "Responde con los productos de " + n + ".";
    var t = minutos === 0 ? "Actualizado ahora" : "Actualizado hace " + minutos + " min";
    $("catAl").textContent = t;
    $("dUlt").textContent = minutos === 0 ? "Última lectura de tu sistema: ahora" : "Última lectura de tu sistema: hace " + minutos + " min";
    $("dProx").textContent = "Próxima: en " + (15 - minutos) + " min";
  }

  function pintarChips() {
    var cont = $("cChips"), antes = cont.scrollLeft; cont.textContent = "";
    var cats = ["Todo"];
    VV.productos.forEach(function (p) { if (cats.indexOf(p.c) < 0) cats.push(p.c); });
    cats.forEach(function (c) {
      var b = el("button", "chip", c); b.type = "button"; b.setAttribute("aria-pressed", String(F.cat === c));
      b.addEventListener("click", function () { F.cat = c; pintarChips(); pintarGrid(); });
      cont.appendChild(b);
    });
    cont.scrollLeft = antes; /* al elegir una categoría la fila no vuelve al principio */
    function borde() { cont.toggleAttribute("data-fin", cont.scrollWidth - cont.clientWidth - cont.scrollLeft < 4); }
    cont.onscroll = borde; borde();
  }

  function filtrados() {
    var q = norm(F.q).trim();
    return VV.productos.filter(function (p) {
      if (F.cat !== "Todo" && p.c !== F.cat) return false;
      if (F.precio && p.p > F.precio) return false;
      if (F.disp && p.s <= 0) return false;
      if (q && norm(p.n + " " + p.c).indexOf(q) < 0) return false;
      return true;
    });
  }

  function tarjeta(p) {
    var c = el("div", "prod" + (p.s <= 0 ? " agot" : "") + (p.id === recien ? " recien" : ""));
    c.setAttribute("data-id", p.id);
    var b = el("button", "prod-ver"); b.type = "button";
    if (p.t) { var s = el("span", "sello", p.t); s.setAttribute("data-t", p.t); b.appendChild(s); }
    b.appendChild(ilus(p));
    b.appendChild(el("span", "nom", p.n));
    b.appendChild(el("span", "pre", dinero(p.p)));
    if (p.e) b.appendChild(el("span", "ef", "En efectivo: " + dinero(p.e)));
    b.appendChild(tagStock(p.s));
    b.addEventListener("click", function () { abrirDetalle(p, b); });
    c.appendChild(b);
    var n = pedido[p.id] || 0;
    var m = el("button", "prod-mas" + (n ? " con" : ""), n ? String(n) : "+"); m.type = "button";
    m.setAttribute("aria-label", n ? p.n + ": " + n + " en el pedido. Agregar otro" : "Agregar " + p.n + " al pedido");
    m.disabled = p.s <= 0 || n >= p.s;
    m.addEventListener("click", function () { agregar(p, true); });
    c.appendChild(m);
    return c;
  }

  function pintarGrid() {
    var g = $("cGrid"), lista = filtrados();
    var hayFiltro = F.q || F.cat !== "Todo" || F.precio || F.disp;
    var recorte = chico.matches && !F.todos && !hayFiltro && lista.length > 6;
    g.textContent = "";
    (recorte ? lista.slice(0, 6) : lista).forEach(function (p) { g.appendChild(tarjeta(p)); });
    if (!lista.length) g.appendChild(el("p", "vacio", "No hay productos con esos filtros. Prueba con otra búsqueda."));
    $("cMas").hidden = !recorte;
    $("cN").textContent = lista.length === 1 ? "1 producto" : lista.length + " productos";
  }

  function pintarDueno() {
    var t = $("dTabla"); t.textContent = "";
    VV.productos.forEach(function (p) {
      var tr = el("tr", p.id === recien ? "recien" : "");
      tr.appendChild(el("td", "", p.n));
      tr.appendChild(el("td", "", dinero(p.p)));
      tr.appendChild(el("td", "", String(p.s)));
      t.appendChild(tr);
    });
  }

  function ponerVista(v) {
    $("vistaCliente").hidden = v !== "cliente"; $("vistaDueno").hidden = v !== "dueno";
    document.querySelectorAll("[data-vista]").forEach(function (b) { b.setAttribute("aria-pressed", String(b.getAttribute("data-vista") === v)); });
  }

  /* ---------- Pedido armado: lo que le llega al dueño por WhatsApp ---------- */
  var pedido = {}, pedAbierto = false;
  function pedItems() { return VV.productos.filter(function (p) { return pedido[p.id] > 0; }); }
  function agregar(p, devolverFoco) {
    var n = pedido[p.id] || 0;
    if (p.s <= 0 || n >= p.s) return false;
    pedido[p.id] = n + 1; VV.marcar("pedido");
    pintarGrid(); pintarPedido();
    if (devolverFoco) {
      var b = $("cGrid").querySelector('[data-id="' + p.id + '"] .prod-mas');
      if (b && !b.disabled) b.focus({ preventScroll: true }); else $("pedVer").focus({ preventScroll: true });
    }
    return true;
  }
  function pintarPedido() {
    VV.productos.forEach(function (p) { if (pedido[p.id] > p.s) pedido[p.id] = Math.max(0, p.s); });
    var items = pedItems(), caja = $("pedido");
    caja.hidden = !items.length;
    if (!items.length) { pedAbierto = false; $("pedDet").hidden = true; return; }
    var unidades = 0, total = 0, lineas = [];
    var ul = $("pedLista"); ul.textContent = "";
    items.forEach(function (p, i) {
      var n = pedido[p.id]; unidades += n; total += n * p.p;
      var li = el("li"); li.appendChild(el("span", "ped-n", p.n));
      var ctl = el("span", "ped-ctl");
      function boton(txt, d, etiqueta) {
        var b = el("button", "ped-b", txt); b.type = "button"; b.setAttribute("aria-label", etiqueta + p.n);
        b.addEventListener("click", function () {
          pedido[p.id] = n + d; pintarGrid(); pintarPedido();
          var fila = $("pedLista").children[i], destino = fila && pedido[p.id] > 0 ? fila.querySelectorAll(".ped-b")[d < 0 ? 0 : 1] : null;
          if (destino && !destino.disabled) destino.focus({ preventScroll: true });
          else if (!$("pedido").hidden) $("pedVer").focus({ preventScroll: true });
        });
        return b;
      }
      var mas = boton("+", 1, "Agregar uno de "); mas.disabled = n >= p.s;
      ctl.appendChild(boton("−", -1, "Quitar uno de ")); ctl.appendChild(el("b", "", String(n))); ctl.appendChild(mas);
      li.appendChild(ctl); li.appendChild(el("span", "ped-s", dinero(n * p.p)));
      ul.appendChild(li);
      lineas.push("• " + n + " × " + p.n + ": " + dinero(n * p.p));
    });
    $("pedN").textContent = unidades === 1 ? "1 producto en el pedido" : unidades + " productos en el pedido";
    $("pedT").textContent = dinero(total);
    $("pedVer").textContent = pedAbierto ? "Ocultar el pedido" : "Ver cómo te llega";
    $("pedVer").setAttribute("aria-expanded", String(pedAbierto));
    $("pedDet").hidden = !pedAbierto;
    $("pedMsg").textContent = "Hola " + VV.nombre() + ", quiero hacer este pedido:\n" + lineas.join("\n") + "\nTotal: " + dinero(total) + "\n¿Me confirmas si está disponible?";
  }

  /* ---------- Detalle con vista 3D ---------- */
  var giro = { rx: -12, ry: -28, x: 0, y: 0, activo: false }, detProd = null, detOrigen = null;
  function ponerGiro() {
    var c = $("caja3d"); c.style.setProperty("--rx", giro.rx + "deg"); c.style.setProperty("--ry", giro.ry + "deg");
  }
  function abrirDetalle(p, origen) {
    detProd = p; detOrigen = origen || null;
    var color = D.colores[p.k % D.colores.length];
    $("caja3d").style.setProperty("--pc", color);
    $("c3f").innerHTML = D.ilustrar(p);
    $("c3b").textContent = VV.nombre();
    $("detC").textContent = p.c;
    $("detN").textContent = p.n;
    $("detD").textContent = p.n + ". En tu catálogo, esta descripción se arma sola a partir del nombre que el producto tiene en tu sistema.";
    $("detP").textContent = dinero(p.p);
    var s = $("detS"); s.textContent = U.textoStock(p.s); s.setAttribute("data-e", U.estadoStock(p.s));
    var e = $("detE"); e.hidden = !p.e; if (p.e) e.textContent = "Pagando en efectivo: " + dinero(p.e) + ". Ahorro de " + dinero(p.p - p.e) + ".";
    $("globo").textContent = "Toca el precio o la disponibilidad para ver cómo te sirve.";
    $("detMsg").hidden = true;
    $("detAdd").disabled = p.s <= 0;
    giro.rx = -12; giro.ry = -28; ponerGiro();
    var d = $("det");
    if (d.showModal) d.showModal(); else d.setAttribute("open", "");
  }
  function cerrarDetalle() {
    var d = $("det"); if (d.close) d.close(); else d.removeAttribute("open");
  }
  function iniciarDetalle() {
    var z = $("det3d");
    if (!(window.CSS && CSS.supports && CSS.supports("transform-style", "preserve-3d"))) { $("caja3d").classList.add("plano"); $("det3d").querySelector(".det-gira").hidden = true; }
    z.addEventListener("pointerdown", function (e) { giro.activo = true; giro.x = e.clientX; giro.y = e.clientY; try { z.setPointerCapture(e.pointerId); } catch (err) {} });
    z.addEventListener("pointermove", function (e) {
      if (!giro.activo) return;
      giro.ry += (e.clientX - giro.x) * 0.7; giro.rx = Math.max(-55, Math.min(55, giro.rx - (e.clientY - giro.y) * 0.5));
      giro.x = e.clientX; giro.y = e.clientY; ponerGiro();
    });
    ["pointerup", "pointercancel"].forEach(function (n) { z.addEventListener(n, function () { giro.activo = false; }); });
    z.addEventListener("keydown", function (e) {
      var k = { ArrowLeft: [0, -15], ArrowRight: [0, 15], ArrowUp: [10, 0], ArrowDown: [-10, 0] }[e.key];
      if (!k) return; e.preventDefault();
      giro.rx = Math.max(-55, Math.min(55, giro.rx + k[0])); giro.ry += k[1]; ponerGiro();
    });
    $("detX").addEventListener("click", cerrarDetalle);
    $("det").addEventListener("click", function (e) { if (e.target === $("det")) cerrarDetalle(); });
    $("det").addEventListener("close", function () {
      var n = detOrigen && document.contains(detOrigen) ? detOrigen : (detProd && $("cGrid").querySelector('[data-id="' + detProd.id + '"] .prod-ver'));
      if (n) n.focus();
    });
    $("detAdd").addEventListener("click", function () {
      if (!detProd) return;
      $("globo").textContent = agregar(detProd, false)
        ? "Agregado al pedido. Tu cliente junta varios productos y te manda un solo mensaje."
        : (detProd.s <= 0 ? "Está agotado: no se puede agregar al pedido." : "Ya están en el pedido todas las unidades disponibles.");
    });
    $("detP").addEventListener("click", function () { $("globo").textContent = "Siempre el precio de tu sistema. Si lo cambias ahí, cambia aquí sin que hagas nada más."; });
    $("detS").addEventListener("click", function () { $("globo").textContent = "Tus clientes ya no te preguntan si hay: lo ven aquí antes de escribirte."; });
    $("detW").addEventListener("click", function () {
      $("detMsgB").textContent = "Hola " + VV.nombre() + ", quiero pedir: " + detProd.n + " (" + dinero(detProd.p) + "). ¿Está disponible?";
      $("detMsg").hidden = false;
      $("globo").textContent = "El pedido te llega directo a ti, con el producto y el precio ya escritos.";
    });
  }

  /* ---------- El momento central: un cambio en tu sistema llega solo al catálogo ---------- */
  var venta = { prod: null, ocupado: false, t: [], hubo: false }, precioAntes = {};
  function elegirVenta() {
    var P = VV.productos;
    venta.prod = P.filter(function (p) { return p.s === 2; })[0] || P.filter(function (p) { return p.s > 0 && p.s <= 3; })[0] || P.filter(function (p) { return p.s > 0; })[0] || null;
  }
  function pintarVentaProd(cambio, precioAntes) {
    var c = $("vfProd"); c.textContent = "";
    if (!venta.prod) return;
    c.appendChild(ilus(venta.prod));
    var d = el("div"); d.appendChild(el("b", "", venta.prod.n));
    var f = el("div", "fila");
    if (precioAntes != null) f.appendChild(el("s", "", dinero(precioAntes)));
    var pr = el("strong", "vf-pre", dinero(venta.prod.p));
    if (cambio === "precio" && !reduce) pr.classList.add("cambio");
    f.appendChild(pr);
    var t = tagStock(venta.prod.s); if (cambio === "stock" && !reduce) t.classList.add("cambio");
    f.appendChild(t); d.appendChild(f); c.appendChild(d);
  }
  function ventaReposo() {
    venta.t.forEach(clearTimeout); venta.t = []; venta.ocupado = false;
    ["vfCaja", "vfReloj", "vfCat"].forEach(function (id) { $(id).classList.remove("activo"); });
    if (!venta.hubo) { $("vfArco").style.strokeDashoffset = "100.5"; $("vfMin").textContent = "0 min"; }
    var b = $("btnVenta"); b.disabled = false; $("btnPrecio").disabled = !venta.prod;
    b.textContent = venta.prod && venta.prod.s > 0 ? (venta.hubo ? "Simular otra venta" : "Simular una venta") : "Volver a empezar";
  }
  function reiniciarVenta() {
    recien = -1; minutos = 14; venta.hubo = false; precioAntes = {};
    elegirVenta(); pintarVentaProd();
    $("vfCajaV").textContent = "Sin cambios todavía";
    $("ventaMsg").textContent = "";
    ventaReposo();
  }
  /* Los tres pasos: tu sistema, la espera de hasta 15 minutos y el catálogo. */
  function correrCambio(textoSistema, aviso, aplicar, avisoFinal) {
    venta.ocupado = true; venta.hubo = true; $("btnVenta").disabled = true; $("btnPrecio").disabled = true;
    function paso1() {
      $("vfCaja").classList.add("activo"); $("vfArco").style.strokeDashoffset = "100.5"; $("vfMin").textContent = "0 min";
      $("vfCajaV").textContent = textoSistema;
      $("ventaMsg").textContent = aviso;
    }
    function paso2() {
      $("vfCaja").classList.remove("activo"); $("vfReloj").classList.add("activo");
      $("ventaMsg").textContent = "El catálogo vuelve a leer tu sistema cada 15 minutos…";
      var ini = performance.now(), dur = 2200;
      (function arco(ahora) {
        var k = Math.min(1, (ahora - ini) / dur);
        $("vfArco").style.strokeDashoffset = String(100.5 * (1 - k));
        $("vfMin").textContent = Math.round(k * 15) + " min";
        if (k < 1 && venta.ocupado) requestAnimationFrame(arco);
      })(ini);
    }
    function paso3() {
      minutos = 0;
      $("vfArco").style.strokeDashoffset = "0"; $("vfMin").textContent = "Pasaron 15 min";
      $("vfReloj").classList.remove("activo"); $("vfCat").classList.add("activo");
      aplicar(); VV.marcar("venta");
      pintarCabeceras(); pintarGrid(); pintarDueno(); pintarPedido();
      if (!reduce) { var tarj = $("cGrid").querySelector(".prod.recien .stk"); if (tarj) tarj.classList.add("cambio"); }
      $("ventaMsg").textContent = avisoFinal();
      if (navigator.vibrate && !reduce) { try { navigator.vibrate(12); } catch (e) {} }
    }
    function fin() { $("vfCat").classList.remove("activo"); ventaReposo(); }
    if (reduce) { paso1(); paso3(); $("vfCaja").classList.remove("activo"); fin(); return; }
    paso1();
    venta.t.push(setTimeout(paso2, 1100));
    venta.t.push(setTimeout(paso3, 3400));
    venta.t.push(setTimeout(fin, 5200));
  }
  function simularVenta() {
    if (venta.ocupado) return;
    if (!venta.prod || venta.prod.s <= 0) {
      VV.productos = D.copiar(VV.estado.rubro); pedido = {};
      reiniciarVenta(); pintarCabeceras(); pintarGrid(); pintarDueno(); pintarPedido();
      $("ventaMsg").textContent = "Listo. Las unidades y los precios volvieron al inicio.";
      return;
    }
    var p = venta.prod;
    correrCambio("Venta registrada: 1 × " + p.n, "Vendiste 1 unidad en tu local. No tocas el catálogo.",
      function () { p.s -= 1; recien = p.id; pintarVentaProd("stock"); },
      function () {
        return p.s > 0 ? "El catálogo cambió solo: ahora dice «" + U.textoStock(p.s) + "». Nadie lo editó."
          : "El catálogo cambió solo: ahora dice «Agotado». Nadie lo va a ofrecer por error.";
      });
  }
  function cambiarPrecio() {
    if (venta.ocupado || !venta.prod) return;
    var p = venta.prod, antes = p.p;
    var baja = antes >= 200 ? 20 : antes >= 60 ? 10 : antes >= 20 ? 5 : 1;
    var nuevo = Math.max(1, Math.round((antes - baja) * 100) / 100);
    correrCambio("Precio cambiado: " + dinero(antes) + " → " + dinero(nuevo), "Cambiaste el precio en tu sistema. No tocas el catálogo.",
      function () {
        if (precioAntes[p.id] == null) precioAntes[p.id] = antes;
        p.p = nuevo;
        if (p.e) { p.e = Math.round((p.e - baja) * 100) / 100; if (p.e >= p.p || p.e < 1) p.e = null; }
        recien = p.id; pintarVentaProd("precio", antes);
      },
      function () { return "El catálogo ya muestra " + dinero(nuevo) + ", igual que la pantalla de tu local. Nadie lo editó."; });
  }
  VV.demos.venta = function () { if (!venta.ocupado && venta.prod && venta.prod.s > 0) simularVenta(); };
  VV.demos.precio = function () { cambiarPrecio(); };

  /* ---------- Asistente de demostración ---------- */
  var asisUsado = false;
  function burbuja(tipo, texto) {
    var m = el("div", "msj " + (tipo === "yo" ? "msj-due" : "msj-asi asis-r"));
    m.appendChild(el("small", "", tipo === "yo" ? "Cliente" : "Asistente"));
    m.appendChild(document.createTextNode(texto));
    $("asisHilo").appendChild(m);
    return m;
  }
  function tarjetasChat(lista, efectivo) {
    var caja = el("div", "asis-prods");
    lista.forEach(function (p) {
      var b = el("button", "msj msj-prod"); b.type = "button";
      b.appendChild(ilus(p));
      var d = el("div"); d.appendChild(el("b", "", p.n));
      var f = el("div", "fila");
      f.appendChild(el("strong", "", efectivo && p.e ? dinero(p.e) + " en efectivo" : dinero(p.p)));
      f.appendChild(tagStock(p.s)); d.appendChild(f); b.appendChild(d);
      b.addEventListener("click", function () { abrirDetalle(p, b); });
      caja.appendChild(b);
    });
    $("asisHilo").appendChild(caja);
  }
  function sugerencias() {
    var P = VV.productos;
    var a = P.filter(function (p) { return p.s > 3; })[0] || P[0];
    return [
      { q: "¿Tienes en stock " + U.minus(a.n) + "?", r: function () {
          burbuja("as", a.s > 0 ? "Sí. De " + U.minus(a.n) + " hay " + a.s + (a.s === 1 ? " unidad." : " unidades.") : "Por ahora está agotado.");
          tarjetasChat([a]);
        } },
      { q: "¿Qué me recomiendas para regalar hasta $50?", r: function () {
          var l = P.filter(function (p) { return p.p <= 50 && p.s > 0; }).sort(function (x, y) { return y.p - x.p; }).slice(0, 3);
          if (l.length) { burbuja("as", "Hasta $50 te recomiendo estos, que sí hay:"); tarjetasChat(l); }
          else { l = P.filter(function (p) { return p.s > 0; }).sort(function (x, y) { return x.p - y.p; }).slice(0, 3); burbuja("as", "Hasta $50 no tengo. Estos son los más económicos:"); tarjetasChat(l); }
        } },
      { q: "¿Cuál sale más barato en efectivo?", r: function () {
          var l = P.filter(function (p) { return p.e && p.s > 0; }).slice(0, 3);
          if (l.length) { burbuja("as", "Estos tienen mejor precio si pagas en efectivo:"); tarjetasChat(l, true); }
          else burbuja("as", "En este catálogo todos cuestan lo mismo en efectivo y con tarjeta.");
        } }
    ];
  }
  function cerrarRespuesta() {
    if (!asisUsado) {
      asisUsado = true;
      var w = waBtn("asistente", "Quiero un asistente así");
      w.classList.add("btn-ch"); $("asis").appendChild(w);
    }
    var h = $("asisHilo"); h.scrollTop = h.scrollHeight;
  }
  var PARO = ["tienes", "tienen", "tiene", "hay", "que", "para", "por", "con", "los", "las", "una", "uno", "del", "stock", "algo", "cual", "cuanto", "cuesta", "precio", "quiero", "busco", "hasta", "mas", "menos", "hola", "favor", "puedes", "recomiendas", "barato", "barata", "efectivo", "disponible", "disponibles"];
  function responderLibre(texto) {
    var t = norm(texto), P = VV.productos;
    var tope = (t.match(/(?:hasta|menos de|maximo|por)\s*\$?\s*(\d{1,4})/) || t.match(/\$\s*(\d{1,4})/) || [])[1];
    var palabras = t.split(/[^a-z0-9ñ]+/).filter(function (w) { return w.length >= 3 && PARO.indexOf(w) < 0 && !/^\d+$/.test(w); });
    var lista = P.map(function (p) {
      var n = norm(p.n + " " + p.c), pts = 0;
      palabras.forEach(function (w) { if (n.indexOf(w.length > 5 ? w.slice(0, 5) : w) >= 0) pts++; });
      return { p: p, pts: pts };
    }).filter(function (x) { return (palabras.length ? x.pts > 0 : !!tope) && (!tope || x.p.p <= Number(tope)); })
      .sort(function (x, y) { return y.pts - x.pts || (y.p.s > 0) - (x.p.s > 0); }).slice(0, 3).map(function (x) { return x.p; });
    if (lista.length) {
      burbuja("as", "Esto encontré en " + VV.nombre() + (tope ? " hasta $" + tope : "") + ":");
      tarjetasChat(lista);
    } else {
      burbuja("as", "En esta demostración solo conozco los productos de ejemplo. El asistente real responde con los productos de tu tienda. Si quieres verlo con los tuyos, escríbeme por WhatsApp.");
    }
  }
  var asisPend = null, asisT = 0;
  function preguntar(q, fn) {
    if (asisPend) asisPend(); /* termina la respuesta anterior antes de seguir */
    burbuja("yo", q); VV.marcar("asistente");
    var escribe = null;
    function responder() {
      asisPend = null; clearTimeout(asisT);
      if (escribe && escribe.parentNode) escribe.parentNode.removeChild(escribe);
      if (fn) fn(); else responderLibre(q);
      cerrarRespuesta();
    }
    if (reduce) { responder(); return; }
    escribe = burbuja("as", "Escribiendo…"); escribe.classList.add("escribe");
    var h = $("asisHilo"); h.scrollTop = h.scrollHeight;
    asisPend = responder; asisT = setTimeout(responder, 520);
  }
  function pintarAsistente() {
    clearTimeout(asisT); asisPend = null;
    $("asisHilo").textContent = "";
    burbuja("as", "Hola, soy el asistente de " + VV.nombre() + ". Pregúntame por un producto.");
    var s = $("asisSug"); s.textContent = "";
    sugerencias().forEach(function (x) {
      var b = el("button", "sug", x.q); b.type = "button";
      b.addEventListener("click", function () { preguntar(x.q, x.r); });
      s.appendChild(b);
    });
  }
  VV.demos.preguntar = function (i) { var x = sugerencias()[i || 0]; pintarAsistente(); preguntar(x.q, x.r); };

  /* =====================================================
     E. MODO VITRINA
     ===================================================== */
  var vit = { i: 0, t: 0, lista: [], qr: false };
  function vitUrl() {
    if (/^https?:\/\//i.test(C.paginaUrl || "")) return C.paginaUrl;
    if (/^https?:$/.test(window.location.protocol)) return window.location.origin + window.location.pathname;
    return "";
  }
  function pintarQR(dest, url) {
    dest.textContent = "";
    var caja = dest.parentNode;
    /* En la página publicada, sin dirección no se muestra un QR vacío: se oculta todo el bloque. */
    if (caja && caja.classList.contains("vit-qr")) caja.hidden = !url && VV.publico;
    if (!url) { dest.textContent = "Aquí irá tu código QR. [POR CONFIRMAR: dirección pública]"; return; }
    function dibujar() {
      try {
        var q = window.qrcode(0, "M"); q.addData(url); q.make();
        dest.innerHTML = q.createSvgTag({ cellSize: 4, margin: 0, scalable: true });
        var svg = dest.querySelector("svg"); if (svg) { svg.setAttribute("role", "img"); svg.setAttribute("aria-label", "Código QR de la página"); }
      } catch (e) { dest.textContent = "No se pudo crear el código QR."; }
    }
    if (window.qrcode) return dibujar();
    var s = document.createElement("script"); s.src = "assets/js/qrcode.js"; s.onload = dibujar;
    s.onerror = function () { dest.textContent = "No se pudo cargar el código QR."; };
    document.head.appendChild(s);
  }
  VV.pintarQR = pintarQR; VV.urlPublica = vitUrl;
  function vitPintar() {
    var p = vit.lista[vit.i % vit.lista.length], c = $("vitProd");
    c.textContent = ""; c.classList.remove("entra");
    c.appendChild(ilus(p));
    var d = el("div");
    var cambiado = precioAntes[p.id] != null;
    if (cambiado) d.appendChild(el("span", "vit-of vit-nuevo", "Precio recién actualizado"));
    else if (p.t) d.appendChild(el("span", "vit-of", p.t));
    d.appendChild(el("h3", "", p.n));
    d.appendChild(el("span", "vit-pre", dinero(p.p)));
    if (cambiado) d.appendChild(el("p", "vit-ef", "Antes: " + dinero(precioAntes[p.id]) + ". Cambió solo, desde tu sistema."));
    if (p.e) d.appendChild(el("p", "vit-ef", "En efectivo: " + dinero(p.e)));
    c.appendChild(d);
    if (!reduce) { void c.offsetWidth; c.classList.add("entra"); }
  }
  function abrirVitrina() {
    var P = VV.productos.filter(function (p) { return p.s > 0; });
    function cambio(p) { return precioAntes[p.id] != null; }
    vit.lista = P.filter(cambio)
      .concat(P.filter(function (p) { return !cambio(p) && p.t === "Oferta"; }))
      .concat(P.filter(function (p) { return !cambio(p) && p.t !== "Oferta"; }));
    vit.i = 0; vitPintar(); VV.marcar("vitrina");
    pintarQR($("vitQr"), vitUrl());
    var d = $("vit"); if (d.showModal) d.showModal(); else d.setAttribute("open", "");
    if (d.requestFullscreen) d.requestFullscreen().catch(function () {});
    clearInterval(vit.t); vit.t = setInterval(function () { vit.i++; vitPintar(); }, 3800);
    $("vitX").focus();
  }
  function cerrarVitrina() {
    clearInterval(vit.t);
    if (document.fullscreenElement && document.exitFullscreen) document.exitFullscreen().catch(function () {});
    var d = $("vit"); if (d.open && d.close) d.close(); else d.removeAttribute("open");
    $("btnVitrina").focus();
  }

  /* =====================================================
     G. CONTEO
     ===================================================== */
  var cnt = { items: [], t: 0, antesT: [], visto: false, fin: false };
  var ZONAS = [["Zona 1: vitrina", "Tú"], ["Zona 2: bodega", "Persona 2"], ["Zona 3: mostrador", "Persona 3"]];
  function cntArmar() {
    clearInterval(cnt.t); cnt.fin = false;
    cnt.items = VV.productos.slice(0, 9).map(function (p, i) {
      var sis = Math.max(2, Math.min(4, p.s || 2));
      var real = i === 4 ? sis - 1 : i === 7 ? sis + 1 : sis;
      return { p: p, zona: Math.floor(i / 3), sis: sis, real: real, n: 0 };
    });
    $("cntDif").hidden = true; $("cntFin").hidden = false;
    cntPintar();
  }
  function cntAvance() {
    var tot = 0, hecho = 0;
    cnt.items.forEach(function (x) { tot += x.real; hecho += Math.min(x.n, x.real); });
    var pct = Math.round(hecho / tot * 100);
    $("cntPct").textContent = pct + " %";
    $("cntBarra").setAttribute("aria-valuenow", pct); $("cntBarra").firstElementChild.style.width = pct + "%";
  }
  function cntPintar() {
    var cont = $("cntCelus"); cont.textContent = "";
    ZONAS.forEach(function (z, zi) {
      var c = el("div", "celu" + (zi === 0 ? " tu" : ""));
      var cab = el("div", "celu-cab"); cab.appendChild(el("span", "", z[0])); cab.appendChild(el("small", "", z[1])); c.appendChild(cab);
      var ul = el("ul");
      cnt.items.filter(function (x) { return x.zona === zi; }).forEach(function (x) {
        var li = el("li"), nom = el("span", "", x.p.n);
        if (zi === 0) { nom.appendChild(document.createElement("br")); nom.appendChild(el("small", "", "En la percha ves " + x.real)); }
        var n = el("b", "", String(x.n)); x.nodo = n;
        li.appendChild(nom); li.appendChild(n);
        if (zi === 0) {
          var b = el("button", "mas", "+1"); b.type = "button"; b.setAttribute("aria-label", "Sumar 1 a " + x.p.n);
          b.addEventListener("click", function () { if (cnt.fin) return; x.n = Math.min(9, x.n + 1); n.textContent = String(x.n); cntAvance(); VV.marcar("conteo"); });
          li.appendChild(b);
        } else li.appendChild(el("span", "auto", "otra persona"));
        ul.appendChild(li);
      });
      c.appendChild(ul); cont.appendChild(c);
    });
    cntAvance();
  }
  function cntAuto() {
    clearInterval(cnt.t);
    if (reduce) { cnt.items.forEach(function (x) { if (x.zona > 0) { x.n = x.real; x.nodo.textContent = String(x.n); } }); cntAvance(); return; }
    cnt.t = setInterval(function () {
      var pend = cnt.items.filter(function (x) { return x.zona > 0 && x.n < x.real; });
      if (!pend.length) { clearInterval(cnt.t); return; }
      var x = pend[Math.floor(Math.random() * pend.length)]; x.n++; x.nodo.textContent = String(x.n); cntAvance();
    }, 650);
  }
  function cntTerminar() {
    clearInterval(cnt.t); cnt.fin = true;
    cnt.items.forEach(function (x) { if (x.zona > 0) { x.n = x.real; x.nodo.textContent = String(x.n); } });
    cntAvance();
    var t = $("cntDifT"); t.textContent = "";
    cnt.items.forEach(function (x) {
      var dif = x.n - x.sis, tr = el("tr");
      tr.appendChild(el("td", "", x.p.n)); tr.appendChild(el("td", "", String(x.sis))); tr.appendChild(el("td", "", String(x.n)));
      var td = el("td"), r = el("span", "res", dif === 0 ? "Igual" : dif < 0 ? "Falta " + (-dif) : "Sobra " + dif);
      r.setAttribute("data-r", dif === 0 ? "igual" : dif < 0 ? "falta" : "sobra");
      r.style.setProperty("--c", dif === 0 ? "var(--sem-verde)" : dif < 0 ? "var(--sem-rojo)" : "var(--sem-ambar)");
      td.appendChild(r); tr.appendChild(td); t.appendChild(tr);
    });
    $("cntDif").hidden = false; $("cntFin").hidden = true;
    $("cntDif").scrollIntoView({ behavior: reduce ? "auto" : "smooth", block: "nearest" });
  }
  function cntVista(v) {
    $("cntAntes").hidden = v !== "antes"; $("cntDespues").hidden = v !== "despues";
    document.querySelectorAll("[data-conteo]").forEach(function (b) { b.setAttribute("aria-pressed", String(b.getAttribute("data-conteo") === v)); });
    if (v === "despues") { if (cnt.fin) cntArmar(); cntAuto(); } else clearInterval(cnt.t);
  }
  function antesAnimar() {
    cnt.antesT.forEach(clearTimeout); cnt.antesT = [];
    var pasos = $("antesPasos").children, horas = ["09:00", "10:30", "12:45", "15:20", "18:00"];
    function poner(i) { pasos[i].classList.add("ya"); $("antesHora").textContent = horas[i]; $("antesBarra").style.width = ((i + 1) / 5 * 100) + "%"; }
    if (reduce) { for (var i = 0; i < 5; i++) poner(i); return; }
    $("antesBarra").style.transition = "width 1s linear";
    for (var j = 0; j < 5; j++) (function (k) { cnt.antesT.push(setTimeout(function () { poner(k); }, 300 + k * 1100)); })(j);
  }
  VV.demos.conteo = function () { cntVista("despues"); };

  /* =====================================================
     D. PRUÉBALO CON TU NEGOCIO
     ===================================================== */
  function iniciarProbar() {
    var cont = $("pColores");
    VV.acentos.forEach(function (c, i) {
      var l = el("label", "color"); l.style.setProperty("--c", c);
      var r = document.createElement("input"); r.type = "radio"; r.name = "acento"; r.value = String(i); r.checked = i === VV.estado.acento;
      r.setAttribute("aria-label", VV.nombresAcento[i]);
      l.appendChild(r); l.appendChild(el("span")); cont.appendChild(l);
    });
    $("pNegocio").value = VV.estado.negocio; $("pRubro").value = VV.estado.rubro;
    var aviso = document.querySelector(".probar-n"), tVivo = 0;
    function aplicarForm() {
      var ac = Number((document.querySelector('input[name="acento"]:checked') || {}).value || 0);
      VV.aplicar($("pNegocio").value, $("pRubro").value, ac);
      aviso.textContent = "Listo: las demostraciones ahora usan " + VV.nombre() + " y productos de " + VV.etiquetaRubro().toLowerCase() + ". Nada se guardó ni se envió.";
      aviso.setAttribute("role", "status");
    }
    /* En vivo: el catálogo cambia mientras escribes, sin tocar el botón. */
    function enVivo() { clearTimeout(tVivo); tVivo = setTimeout(aplicarForm, 250); }
    $("probar").addEventListener("input", enVivo);
    $("probar").addEventListener("change", enVivo);
    $("probar").addEventListener("submit", function (e) {
      e.preventDefault();
      clearTimeout(tVivo); aplicarForm();
      $("pNegocio").value = VV.estado.negocio;
      if (document.activeElement && document.activeElement.blur) document.activeElement.blur();
      VV.irA("cat", false);
    });
  }

  /* =====================================================
     ARRANQUE
     ===================================================== */
  function todo() {
    F = { q: "", cat: "Todo", precio: 0, disp: false, todos: false };
    $("cBuscar").value = ""; $("cPrecio").value = "0"; $("cDisp").checked = false;
    pedido = {}; pedAbierto = false;
    reiniciarVenta(); pintarCabeceras(); pintarChips(); pintarGrid(); pintarDueno(); pintarPedido();
    asisUsado = !!$("asis").querySelector(".btn-wa"); pintarAsistente();
    cntArmar(); if (!$("cntDespues").hidden) cntAuto();
  }
  function iniciar() {
    iniciarProbar(); iniciarDetalle();
    $("cBuscar").addEventListener("input", function () { F.q = this.value; pintarGrid(); });
    $("cPrecio").addEventListener("change", function () { F.precio = Number(this.value); pintarGrid(); });
    $("cDisp").addEventListener("change", function () { F.disp = this.checked; pintarGrid(); });
    $("cMas").addEventListener("click", function () { F.todos = true; pintarGrid(); });
    document.querySelectorAll("[data-vista]").forEach(function (b) { b.addEventListener("click", function () { ponerVista(b.getAttribute("data-vista")); }); });
    $("btnVenta").addEventListener("click", simularVenta);
    $("btnPrecio").addEventListener("click", cambiarPrecio);
    $("pedVer").addEventListener("click", function () { pedAbierto = !pedAbierto; pintarPedido(); });
    $("pedVaciar").addEventListener("click", function () {
      pedido = {}; pintarGrid(); pintarPedido();
      var c = $("cGrid").querySelector(".prod-ver"); if (c) c.focus({ preventScroll: true });
    });
    $("asisForm").addEventListener("submit", function (e) {
      e.preventDefault(); var v = VV.limpiarNombre($("asisIn").value); if (!v) return;
      $("asisIn").value = ""; preguntar(v);
    });
    $("btnVitrina").addEventListener("click", abrirVitrina);
    $("vitX").addEventListener("click", cerrarVitrina);
    $("vit").addEventListener("cancel", function (e) { e.preventDefault(); cerrarVitrina(); });
    document.addEventListener("fullscreenchange", function () { if (!document.fullscreenElement && $("vit").open) cerrarVitrina(); });
    document.querySelectorAll("[data-conteo]").forEach(function (b) { b.addEventListener("click", function () { cntVista(b.getAttribute("data-conteo")); }); });
    $("cntIr").addEventListener("click", function () { cntVista("despues"); document.querySelector('[data-conteo="despues"]').focus(); });
    $("cntFin").addEventListener("click", cntTerminar);
    $("cntRep").addEventListener("click", function () { cntArmar(); cntAuto(); });
    if ("IntersectionObserver" in window && !reduce) {
      var io = new IntersectionObserver(function (es) { if (es[0].isIntersecting) { antesAnimar(); io.disconnect(); } }, { threshold: 0.4 });
      io.observe($("cntAntes"));
    } else antesAnimar();
    document.addEventListener("vv:cambio", todo);
    todo();
  }
  VV.alListo(iniciar);
})();
