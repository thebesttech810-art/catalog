/* Base de la página: configuración, enlaces de WhatsApp, personalización,
   selector de problemas (A), dos tiendas (B), primera semana (H),
   calculadora (I), recorrido guiado y modo presentación. */
(function () {
  "use strict";

  var C = window.CONFIG || {};
  var D = window.VV_DATOS;
  var RUBROS = ["celulares", "accesorios", "electrodomesticos", "videojuegos", "otro"];
  var ACENTOS = ["#3A36E0", "#0B6E63", "#6B2FD6", "#C2185B", "#B84A00"];
  var NOMBRES_ACENTO = ["Azul", "Verde", "Morado", "Fucsia", "Naranja"];
  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  /* En la página publicada no se muestran los textos [POR CONFIRMAR]: se reemplazan por una frase de respaldo.
     Al abrir el archivo en la laptop sí se ven, para que no se te olviden. Para forzar una u otra vista:
     ?vista=publica  o  ?vista=revision */
  var Q0 = new URLSearchParams(window.location.search);
  var publico = window.VV_PUBLICO === true || (/^https?:$/.test(window.location.protocol) ? Q0.get("vista") !== "revision" : Q0.get("vista") === "publica");

  function $(id) { return document.getElementById(id); }
  function el(tag, cls, txt) {
    var n = document.createElement(tag);
    if (cls) n.className = cls;
    if (txt != null) n.textContent = txt;
    return n;
  }
  function dinero(n) {
    var s = (Math.round(n * 100) / 100).toFixed(2).split(".");
    /* Formato de Ecuador: punto para los miles y coma para los centavos. */
    return "$" + s[0].replace(/\B(?=(\d{3})+(?!\d))/g, ".") + (s[1] === "00" ? "" : "," + s[1]);
  }
  function minus(t) { return t.charAt(0).toLowerCase() + t.slice(1); }
  function estadoStock(s) { return s <= 0 ? "agot" : s <= 3 ? "pocas" : "disp"; }
  function textoStock(s) { return s <= 0 ? "Agotado" : s === 1 ? "Queda 1" : s <= 3 ? "Quedan " + s : s + " disponibles"; }
  function tagStock(s) {
    var t = el("span", "stk", textoStock(s));
    t.setAttribute("data-e", estadoStock(s));
    return t;
  }
  function ilus(p) {
    var d = el("div", "il");
    d.style.setProperty("--pc", D.colores[p.k % D.colores.length]);
    d.innerHTML = D.ilustrar(p); /* dibujo propio, sin texto del visitante */
    return d;
  }
  /* Limpia lo que escribe el visitante o llega por la dirección: sin caracteres de control, máximo 40. */
  function limpiarNombre(v) {
    var s = Array.from(String(v == null ? "" : v)).map(function (ch) { var c = ch.codePointAt(0); return (c < 32 || (c >= 127 && c <= 159) || (c >= 8203 && c <= 8207) || (c >= 8232 && c <= 8239) || c === 65279) ? " " : ch; }).join("").replace(/\s+/g, " ").trim();
    return Array.from(s).slice(0, 40).join("").trim();
  }
  function validarRubro(v) {
    v = String(v == null ? "" : v).toLowerCase().trim();
    return RUBROS.indexOf(v) >= 0 ? v : "otro";
  }
  function iniciales(nombre) {
    var partes = nombre.split(" ").filter(function (x) { return /[0-9A-Za-zÀ-ÿ]/.test(x); });
    var a = partes.slice(0, 2).map(function (x) { return Array.from(x.replace(/[^0-9A-Za-zÀ-ÿ]/g, ""))[0] || ""; }).join("");
    return (a || "TT").toUpperCase();
  }

  /* ---------- Estado compartido ---------- */
  var VV = window.VV = {
    estado: { negocio: "", rubro: "celulares", acento: 0, personalizado: false },
    productos: D.copiar("celulares"),
    demos: {},
    util: { $: $, el: el, dinero: dinero, estadoStock: estadoStock, textoStock: textoStock, tagStock: tagStock, ilus: ilus, minus: minus, reduce: reduce },
    nombre: function () { return VV.estado.negocio || "Tu Tienda"; },
    iniciales: function () { return VV.estado.negocio ? iniciales(VV.estado.negocio) : "TT"; },
    etiquetaRubro: function () { return D.rubros[VV.estado.rubro].etiqueta; },
    limpiarNombre: limpiarNombre,
    validarRubro: validarRubro
  };

  /* Demostraciones que el visitante ya tocó: clave, nombre y a dónde lleva. Nada se guarda ni se envía. */
  VV.demosLista = [
    ["real", "el catálogo de una tienda real", "ejemplo-real"], ["venta", "la venta simulada", "venta"], ["pedido", "el pedido armado", "cat"], ["asistente", "el asistente", "asis"],
    ["vitrina", "el modo vitrina", "vitAcc"], ["reporte", "el reporte de ventas", "reporte"],
    ["conteo", "el conteo de inventario", "conteo"], ["calculadora", "la calculadora de tiempo", "calc"]
  ];
  VV.probado = {};
  VV.marcar = function (clave) {
    if (VV.probado[clave]) return;
    VV.probado[clave] = true; pintarWa();
    document.dispatchEvent(new CustomEvent("vv:probado"));
  };

  /* Lo que está debajo de la portada se arma justo después del primer pintado, para que la página aparezca antes. */
  var cola = [];
  VV.alListo = function (fn) { if (VV.listo) fn(); else cola.push(fn); };
  function despuesDePintar(fn) {
    var hecho = false;
    function una() { if (hecho) return; hecho = true; fn(); }
    requestAnimationFrame(function () { setTimeout(una, 0); });
    setTimeout(una, 1200); /* por si la pestaña está en segundo plano */
  }

  VV.aplicar = function (negocio, rubro, acento) {
    VV.estado.negocio = limpiarNombre(negocio);
    VV.estado.rubro = validarRubro(rubro);
    VV.estado.acento = acento >= 0 && acento < ACENTOS.length ? acento : 0;
    VV.estado.personalizado = true;
    VV.productos = D.copiar(VV.estado.rubro);
    document.documentElement.style.setProperty("--acento", ACENTOS[VV.estado.acento]);
    pintarWa();
    document.dispatchEvent(new CustomEvent("vv:cambio"));
  };

  /* ---------- WhatsApp ---------- */
  VV.mensaje = function (clave, texto) {
    var m = texto || (C.mensajes && (C.mensajes[clave] || C.mensajes.general)) || "Hola, quiero saber más del catálogo conectado.";
    if (clave === "cierre") {
      var hechos = VV.demosLista.filter(function (d) { return VV.probado[d[0]]; }).map(function (d) { return d[1]; });
      if (hechos.length) m += " Ya probé: " + (hechos.length > 1 ? hechos.slice(0, -1).join(", ") + " y " + hechos[hechos.length - 1] : hechos[0]) + ".";
    }
    if (VV.estado.personalizado) {
      if (VV.estado.negocio) m += " Mi negocio es " + VV.estado.negocio + " (" + VV.etiquetaRubro().toLowerCase() + ").";
      else if (VV.estado.rubro !== "otro") m += " Vendo " + VV.etiquetaRubro().toLowerCase() + ".";
    }
    return m;
  };
  VV.wa = function (clave, texto) {
    var num = String(C.whatsapp || "").replace(/\D/g, "");
    return "https://wa.me/" + num + "?text=" + encodeURIComponent(VV.mensaje(clave, texto));
  };
  function pintarWa(raiz) {
    (raiz || document).querySelectorAll("[data-wa]").forEach(function (a) {
      a.href = VV.wa(a.getAttribute("data-wa"));
      a.target = "_blank";
      a.rel = "noopener";
    });
  }
  VV.pintarWa = pintarWa;

  /* ---------- Textos de config.js ---------- */
  function leer(ruta) {
    return ruta.split(".").reduce(function (o, k) { return o && o[k]; }, C);
  }
  function ponerCfg(nodo, valor) {
    valor = valor == null ? "" : String(valor);
    var pendiente = valor.indexOf("[POR CONFIRMAR") === 0;
    if (pendiente && publico) {
      var alt = nodo.getAttribute("data-alt");
      if (alt == null) alt = "te lo confirmo por WhatsApp";
      if (!alt) { var fila = nodo.closest("[data-fila]"); (fila || nodo).hidden = true; }
      nodo.textContent = alt; nodo.classList.remove("pc");
      return;
    }
    nodo.textContent = valor;
    nodo.classList.toggle("pc", pendiente);
  }
  function pintarConfig() {
    document.querySelectorAll("[data-cfg]").forEach(function (n) { ponerCfg(n, leer(n.getAttribute("data-cfg"))); });
    document.querySelectorAll("[data-marca]").forEach(function (n) { n.textContent = C.marca || "Catalog"; });

    var paqs = $("paqs");
    (C.paquetes || []).forEach(function (p, i) {
      var art = el("article", "paq" + (p.recomendado ? " rec" : ""));
      if (p.recomendado) art.appendChild(el("span", "paq-rec", "Recomendado"));
      art.appendChild(el("h3", "", p.nombre));
      var pre = el("p", "paq-pre"); var sp = el("span"); sp.setAttribute("data-alt", "Te lo cotizo por WhatsApp"); ponerCfg(sp, p.precio); pre.appendChild(sp); art.appendChild(pre);
      var ul = el("ul", "lista");
      (p.incluye || []).forEach(function (t) { ul.appendChild(el("li", "", t)); });
      art.appendChild(ul);
      var a = el("a", "btn btn-wa"); a.setAttribute("data-wa", "paquete" + (i + 1)); a.href = "#cierre";
      a.innerHTML = '<svg class="ico" aria-hidden="true"><use href="#i-chat"/></svg>';
      a.appendChild(document.createTextNode("Escribir por WhatsApp"));
      art.appendChild(a);
      paqs.appendChild(art);
    });

    /* Número visible en el cierre: 593996966975 -> 099 696 6975 */
    var tel = String(C.whatsapp || "").replace(/\D/g, "");
    if ($("filaTel")) {
      var loc = tel.indexOf("593") === 0 ? "0" + tel.slice(3) : tel;
      $("telVisible").textContent = loc.length === 10 ? loc.slice(0, 3) + " " + loc.slice(3, 6) + " " + loc.slice(6) : loc;
      $("filaTel").hidden = !tel;
    }
    var cr = C.casoReal;
    if (cr && cr.activo === true && /^https:\/\//.test(cr.enlace || "")) {
      $("ejemplo-real").hidden = false; $("verEjemplo").hidden = false;
      $("realTag").textContent = cr.etiqueta || "Ejemplo real";
      $("realT").textContent = cr.titulo || "Así quedó el catálogo de una empresa real";
      $("realDesc").textContent = cr.descripcion || "";
      $("realProbar").textContent = cr.probar || "";
      (cr.puntos || []).forEach(function (t) { $("realPuntos").appendChild(el("li", "", t)); });
      $("realBtnTxt").textContent = cr.boton || "Abrir el catálogo real";
      $("realCierre").textContent = cr.cierre || "";
      $("realEnlace").href = cr.enlace;
      $("realEnlace").addEventListener("click", function () { VV.marcar("real"); });
      VV.alListo(function () { if (VV.pintarQR) VV.pintarQR($("realQr"), cr.enlace); });
    } else {
      VV.demosLista = VV.demosLista.filter(function (d) { return d[0] !== "real"; });
    }
    if (C.testimonios && C.testimonios.length) {
      $("testimonios").hidden = false;
      C.testimonios.forEach(function (t) {
        var b = el("blockquote", "testi");
        b.appendChild(el("p", "", t.texto));
        b.appendChild(el("p", "nota", [t.nombre, t.negocio].filter(Boolean).join(" · ")));
        $("testis").appendChild(b);
      });
    }
  }

  /* ---------- A. Selector de problemas ---------- */
  var ICONOS = [
    '<path d="M8 10h32v22H22l-8 7v-7H8z" fill="#FFD84A" stroke="#16183A" stroke-width="3" stroke-linejoin="round"/><path d="M20 18a4.5 4.5 0 1 1 6 4.2c-1.4.6-2 1.3-2 2.4" fill="none" stroke="#16183A" stroke-width="3" stroke-linecap="round"/><circle cx="24" cy="28.5" r="1.8" fill="#16183A"/>',
    '<path d="M18 12h24v24H18L6 24z" fill="#C92C3D" stroke="#16183A" stroke-width="3" stroke-linejoin="round"/><circle cx="16" cy="24" r="2.5" fill="#fff"/><path d="M25 19l10 10M35 19 25 29" stroke="#fff" stroke-width="3.5" stroke-linecap="round"/>',
    '<path d="M12 6h17l9 9v27H12z" fill="#fff" stroke="#16183A" stroke-width="3" stroke-linejoin="round"/><path d="M29 6v9h9z" fill="#FFD84A" stroke="#16183A" stroke-width="3" stroke-linejoin="round"/><path d="M18 24h14M18 30h14M18 36h8" stroke="#16183A" stroke-width="3" stroke-linecap="round"/>',
    '<path d="M6 8h24v16H18l-6 5v-5H6z" fill="#fff" stroke="#16183A" stroke-width="3" stroke-linejoin="round"/><path d="M18 20h24v16h-6v5l-6-5H18z" fill="#FFD84A" stroke="#16183A" stroke-width="3" stroke-linejoin="round"/>',
    '<path d="M7 41h34" stroke="#16183A" stroke-width="3" stroke-linecap="round"/><rect x="10" y="25" width="8" height="14" fill="#FFD84A" stroke="#16183A" stroke-width="3"/><rect x="20" y="13" width="8" height="26" fill="#3A36E0" stroke="#16183A" stroke-width="3"/><rect x="30" y="20" width="8" height="19" fill="#fff" stroke="#16183A" stroke-width="3"/>',
    '<rect x="10" y="9" width="28" height="33" rx="4" fill="#fff" stroke="#16183A" stroke-width="3"/><rect x="18" y="5" width="12" height="8" rx="2" fill="#FFD84A" stroke="#16183A" stroke-width="3"/><path d="M16 22l3 3 5-6M16 32l3 3 5-6M28 23h5M28 33h5" fill="none" stroke="#16183A" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>'
  ];
  var DOLORES = [
    { t: "Me preguntan si tengo stock y tengo que ir a revisar", b: "Tu cliente lo ve antes de preguntar.", r: "Cada producto muestra si hay, si quedan pocas unidades o si se agotó, leído de tu sistema.", ir: "catalogo", irT: "Ver la demostración del catálogo", mini: "stock" },
    { t: "Vendí algo que ya no tenía", b: "Lo agotado se marca solo.", r: "Cuando la última unidad sale por tu caja, el catálogo la muestra como agotada en la siguiente actualización, que ocurre cada 15 minutos.", ir: "venta", irT: "Simular una venta", mini: "agotado" },
    { t: "Mi catálogo es un PDF que nadie actualiza", b: "Nadie lo actualiza porque no hace falta.", r: "Precios y unidades salen de tu sistema contable. Si cambias un precio ahí, cambia en el catálogo.", ir: "catalogo", irT: "Ver la demostración del catálogo", mini: "pdf" },
    { t: "Quiero vender más por WhatsApp pero no alcanzo a responder", b: "Un asistente responde lo repetido.", r: "Contesta preguntas sobre tus productos y, cuando el cliente se decide, el pedido llega armado a tu WhatsApp.", ir: "asis", irT: "Probar el asistente", mini: "asistente" },
    { t: "No sé qué se vendió ni a qué precio", b: "Un reporte que te lo dice sin buscar.", r: "Qué se vendió, si se vendió al precio de tu sistema y qué mercadería conviene mover. Es un complemento opcional.", ir: "reporte", irT: "Ver el reporte de ejemplo", mini: "reporte" },
    { t: "Contar el inventario me toma días", b: "Todos cuentan a la vez, desde el celular.", r: "Cada persona cuenta su zona y el sistema marca las diferencias contra tu inventario. Es un complemento opcional.", ir: "conteo", irT: "Ver el conteo desde el celular", mini: "conteo" }
  ];
  function miniDemo(tipo) {
    var m = el("div", "mini"); m.setAttribute("aria-hidden", "true");
    function bur(t) { return el("span", "bur", t); }
    function fl() { return el("span", "fl", "→"); }
    if (tipo === "stock") { m.appendChild(bur("¿Tienes stock?")); m.appendChild(fl()); m.appendChild(tagStock(6)); }
    else if (tipo === "agotado") { m.appendChild(el("span", "", "Venta en caja")); m.appendChild(fl()); m.appendChild(tagStock(1)); m.appendChild(fl()); m.appendChild(tagStock(0)); }
    else if (tipo === "pdf") { m.appendChild(el("span", "viejo", "PDF de hace 3 meses")); m.appendChild(fl()); m.appendChild(el("strong", "", "Actualizado hace 6 min")); }
    else if (tipo === "asistente") { m.appendChild(bur("¿Qué me recomiendas?")); m.appendChild(el("span", "bur", "Asistente: mira estas 3 opciones")); m.appendChild(fl()); m.appendChild(el("strong", "", "Pedido en tu WhatsApp")); }
    else if (tipo === "reporte") { m.appendChild(el("span", "", "Vendido a $42")); m.appendChild(el("span", "fl", "contra")); m.appendChild(el("span", "", "sistema $49")); m.appendChild(el("strong", "", "Diferencia: $7")); }
    else { m.appendChild(el("span", "", "3 celulares contando")); var b = el("span", "barrita"); b.appendChild(el("i")); m.appendChild(b); m.appendChild(el("strong", "", "72 %")); }
    return m;
  }
  function pintarDolores() {
    var cont = $("dolores");
    DOLORES.forEach(function (d, i) {
      var caja = el("div", "dolor");
      var b = el("button", "dolor-b"); b.type = "button";
      b.innerHTML = '<svg class="dolor-i" viewBox="0 0 48 48" aria-hidden="true" focusable="false">' + ICONOS[i] + "</svg>"; /* dibujo propio */
      b.appendChild(el("span", "", d.t));
      b.id = "dolorB" + i; b.setAttribute("aria-expanded", "false"); b.setAttribute("aria-controls", "dolorR" + i);
      var r = el("div", "dolor-r"); r.id = "dolorR" + i; r.hidden = true; r.setAttribute("role", "region"); r.setAttribute("aria-labelledby", b.id);
      b.addEventListener("click", function () {
        var abrir = b.getAttribute("aria-expanded") !== "true";
        cont.querySelectorAll(".dolor-b").forEach(function (o) { o.setAttribute("aria-expanded", "false"); });
        cont.querySelectorAll(".dolor-r").forEach(function (o) { o.hidden = true; });
        if (!abrir) return;
        b.setAttribute("aria-expanded", "true");
        if (!r.firstChild) {
          r.appendChild(miniDemo(d.mini));
          var p = el("p"); p.appendChild(el("strong", "", d.b + " ")); p.appendChild(document.createTextNode(d.r)); r.appendChild(p);
          var acc = el("div", "dolor-acc");
          var ir = el("button", "btn btn-pri", d.irT); ir.type = "button";
          ir.addEventListener("click", function () { irA(d.ir); });
          var wa = el("a", "btn btn-wa"); wa.setAttribute("data-wa", "problema" + (i + 1));
          wa.innerHTML = '<svg class="ico" aria-hidden="true"><use href="#i-chat"/></svg>';
          wa.appendChild(document.createTextNode("Escribir por WhatsApp"));
          acc.appendChild(ir); acc.appendChild(wa); r.appendChild(acc);
          pintarWa(r);
        } else {
          var mini = r.querySelector(".mini"); r.replaceChild(miniDemo(d.mini), mini);
        }
        r.hidden = false;
      });
      caja.appendChild(b); caja.appendChild(r); cont.appendChild(caja);
    });
  }
  function irA(id, enfocar) {
    var n = $(id); if (!n) return;
    n.scrollIntoView({ behavior: reduce ? "auto" : "smooth", block: "start" });
    if (enfocar !== false) {
      var h = n.querySelector("h2,h3") || n;
      h.setAttribute("tabindex", "-1"); h.focus({ preventScroll: true });
    }
  }
  VV.irA = irA;

  /* ---------- B. Dos tiendas ---------- */
  var ESC = { i: 0, t: 0, dur: 21000, play: false, raf: 0, previo: 0, hechos: 0, ev: [] };
  function eventos(i) {
    var P = VV.productos;
    var ev = [];
    function sin(t, tipo, txt, min) { ev.push({ t: t, lado: "sin", tipo: tipo, txt: txt, min: min }); }
    function con(t, tipo, txt, prod, s) { ev.push({ t: t, lado: "con", tipo: tipo, txt: txt, prod: prod, s: s }); }
    if (i === 0) {
      var p = P.filter(function (x) { return x.s >= 4; })[0] || P[0];
      var alt = P.filter(function (x) { return x.c === p.c && x.id !== p.id && x.s > 0 && x.p < p.p; })[0];
      sin(0, "cli", "Hola, ¿tienen " + minus(p.n) + "? ¿Cuánto cuesta?");
      sin(2500, "nota", "El dueño está atendiendo a otro cliente en el mostrador.", 3);
      sin(5500, "nota", "Abre el PDF del catálogo. El precio es de hace meses.", 8);
      sin(8500, "due", "Déjame confirmo y te aviso.", 9);
      sin(11500, "nota", "Busca el producto en el Excel del inventario.", 16);
      sin(15000, "cli", "¿Sigues ahí?", 24);
      sin(18000, "nota", "El cliente ya compró en otra tienda.", 40);
      sin(20000, "fin", "Venta perdida.");
      con(0, "nota", "El cliente abre el catálogo desde el enlace.");
      con(1500, "prod", "", p, p.s);
      con(5000, "cli", "¿Tienen algo parecido más barato?");
      if (alt) con(8000, "asi", "Sí. Mira: " + minus(alt.n) + " a " + dinero(alt.p) + ". " + textoStock(alt.s) + ".");
      else con(8000, "asi", "Ese es el más económico de su categoría. Hay " + p.s + " disponibles.");
      con(11500, "nota", "Se decide y toca «Pedir por WhatsApp».");
      con(14000, "wa", "Hola " + VV.nombre() + ", quiero pedir: " + p.n + " (" + dinero(p.p) + "). ¿Puedo pasar hoy?");
      con(17500, "due", "Claro. Te lo separo.");
      con(20000, "fin", "Pedido recibido sin buscar nada.");
    } else {
      var a = P.filter(function (x) { return x.s === 0; })[0] || P[0];
      var b = P.filter(function (x) { return x.c === a.c && x.s > 0; })[0] || P.filter(function (x) { return x.s > 0; })[0];
      sin(0, "cli", "Hola, ¿todavía tienen " + minus(a.n) + "?");
      sin(3000, "nota", "El dueño mira el PDF. Ahí sigue apareciendo.", 2);
      sin(6000, "due", "Sí, claro. Ven a verlo.", 3);
      sin(9500, "nota", "La última unidad se vendió hace una hora. El PDF no lo sabe.", 35);
      sin(13500, "cli", "Fui hasta el local y no había.", 60);
      sin(17000, "due", "Disculpa, se nos acabó.", 61);
      sin(20000, "fin", "Cliente molesto y viaje perdido.");
      con(0, "nota", "El cliente abre el catálogo desde el enlace.");
      con(1500, "prod", "", a, 0);
      con(5500, "cli", "¿Tienen algo parecido que sí haya?");
      con(8500, "asi", "Ese se agotó. Esto sí hay:");
      con(9500, "prod", "", b, b.s);
      con(13000, "nota", "Elige esa opción y toca «Pedir por WhatsApp».");
      con(15500, "wa", "Hola " + VV.nombre() + ", quiero pedir: " + b.n + " (" + dinero(b.p) + ").");
      con(18000, "due", "Listo. Te lo tengo en el local.");
      con(20000, "fin", "Nadie quedó mal y hubo venta.");
    }
    return ev.sort(function (x, y) { return x.t - y.t; });
  }
  function pintarEvento(e) {
    var hilo = $(e.lado === "sin" ? "hiloSin" : "hiloCon");
    if (e.min != null) {
      var r = $("escReloj"); r.textContent = "Espera: " + e.min + " min"; r.classList.toggle("alerta", e.min >= 16);
    }
    if (e.tipo === "fin") {
      var f = $(e.lado === "sin" ? "finSin" : "finCon"); f.textContent = e.txt; f.hidden = false;
      if (e.lado === "sin") {
        var ver = el("button", "btn btn-sec btn-ch", "Ver esta escena con catálogo conectado"); ver.type = "button";
        ver.addEventListener("click", function () { ponerLado("con"); });
        if (window.matchMedia("(max-width:759px)").matches) { f.appendChild(document.createElement("br")); f.appendChild(ver); }
      }
      return;
    }
    var m;
    if (e.tipo === "prod") {
      m = el("div", "msj msj-prod"); m.appendChild(ilus(e.prod));
      var d = el("div"); d.appendChild(el("b", "", e.prod.n));
      var fila = el("div", "fila"); fila.appendChild(el("strong", "", dinero(e.prod.p))); fila.appendChild(tagStock(e.s)); d.appendChild(fila);
      m.appendChild(d);
    } else {
      var cls = { cli: "msj-cli", due: "msj-due", asi: "msj-asi", nota: "msj-nota", wa: "msj-cli" }[e.tipo];
      m = el("div", "msj " + cls);
      var quien = { cli: e.lado === "con" && e.tipo === "cli" ? "Cliente, al asistente" : "Cliente", due: "Dueño", asi: "Asistente", wa: "Llega al WhatsApp del dueño" }[e.tipo];
      if (e.lado === "sin" && e.tipo === "cli") quien = "Cliente";
      if (quien) m.appendChild(el("small", "", quien));
      m.appendChild(document.createTextNode(e.txt));
    }
    hilo.appendChild(m);
  }
  function escVaciar() {
    $("hiloSin").textContent = ""; $("hiloCon").textContent = "";
    $("finSin").hidden = true; $("finCon").hidden = true; $("finSin").textContent = ""; $("finCon").textContent = "";
    $("escReloj").textContent = "Espera: 0 min"; $("escReloj").classList.remove("alerta");
  }
  function escPonerLinea(t) {
    var s = $("escSeek");
    s.value = String(Math.round(t)); s.style.setProperty("--p", Math.min(100, t / ESC.dur * 100) + "%");
    s.setAttribute("aria-valuetext", Math.round(t / 1000) + " de " + Math.round(ESC.dur / 1000) + " segundos");
  }
  function escLimpiar() {
    cancelAnimationFrame(ESC.raf); ESC.play = false; ESC.t = 0; ESC.hechos = 0; ESC.ev = eventos(ESC.i);
    $("tiendas").classList.remove("sin-anim");
    escVaciar(); escPonerLinea(0); escBoton();
  }
  /* Arrastrar la línea de tiempo: la escena se detiene y se muestra en ese punto. */
  function escIrA(t) {
    cancelAnimationFrame(ESC.raf); ESC.play = false;
    ESC.t = Math.max(0, Math.min(ESC.dur, t)); ESC.hechos = 0;
    $("tiendas").classList.add("sin-anim");
    escVaciar(); escAvanzar(); escBoton();
  }
  function escBoton() {
    var fin = ESC.t >= ESC.dur;
    $("escPlayTxt").textContent = ESC.play ? "Pausar" : (ESC.t > 0 && !fin ? "Continuar" : "Ver la escena");
    $("escPlayIco").setAttribute("href", ESC.play ? "#i-pausa" : "#i-play");
    $("escPlay").hidden = fin;
  }
  function escAvanzar() {
    while (ESC.hechos < ESC.ev.length && ESC.ev[ESC.hechos].t <= ESC.t) { pintarEvento(ESC.ev[ESC.hechos]); ESC.hechos++; }
    escPonerLinea(ESC.t);
  }
  function escTick(ahora) {
    if (!ESC.play) return;
    ESC.t += Math.min(100, ahora - ESC.previo); ESC.previo = ahora;
    escAvanzar();
    if (ESC.t >= ESC.dur) { ESC.play = false; escBoton(); return; }
    ESC.raf = requestAnimationFrame(escTick);
  }
  function escPlay() {
    if (ESC.t >= ESC.dur) return;
    if (reduce) { ESC.t = ESC.dur; escAvanzar(); escBoton(); return; }
    $("tiendas").classList.remove("sin-anim");
    ESC.play = true; ESC.previo = performance.now(); escBoton();
    ESC.raf = requestAnimationFrame(escTick);
  }
  function escPausa() { ESC.play = false; cancelAnimationFrame(ESC.raf); escBoton(); }
  function ponerLado(l) {
    $("tiendas").setAttribute("data-lado", l);
    document.querySelectorAll("[data-lado].seg-b").forEach(function (b) { b.setAttribute("aria-pressed", String(b.getAttribute("data-lado") === l)); });
  }
  function iniciarEscena() {
    $("escPlay").addEventListener("click", function () { ESC.play ? escPausa() : escPlay(); });
    $("escRep").addEventListener("click", function () { escLimpiar(); escPlay(); });
    $("escSeek").addEventListener("input", function () { escIrA(Number(this.value)); });
    document.querySelectorAll("[data-escena]").forEach(function (b) {
      b.addEventListener("click", function () {
        ESC.i = Number(b.getAttribute("data-escena"));
        document.querySelectorAll("[data-escena]").forEach(function (o) { o.setAttribute("aria-pressed", String(o === b)); });
        escLimpiar(); ponerLado("sin"); escPlay();
      });
    });
    document.querySelectorAll("[data-lado].seg-b").forEach(function (b) {
      b.addEventListener("click", function () { ponerLado(b.getAttribute("data-lado")); });
    });
    escLimpiar();
    if ("IntersectionObserver" in window) {
      var io = new IntersectionObserver(function (es) {
        if (es[0].isIntersecting && ESC.t === 0 && !ESC.play) { io.disconnect(); escPlay(); }
      }, { threshold: 0.35 });
      io.observe($("tiendas"));
    }
  }
  VV.demos.escena = function () { escLimpiar(); ponerLado("sin"); escPlay(); };

  /* ---------- H. Primera semana ---------- */
  function iniciarLinea() {
    var pasos = document.querySelectorAll("#linea li");
    if (reduce || !("IntersectionObserver" in window)) { pasos.forEach(function (p) { p.classList.add("luz"); }); return; }
    var io = new IntersectionObserver(function (es) {
      es.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add("luz"); io.unobserve(e.target); } });
    }, { rootMargin: "0px 0px -30% 0px" });
    pasos.forEach(function (p) { io.observe(p); });
  }

  /* ---------- I. Calculadora ---------- */
  function calcular() {
    var v = Math.max(0, Math.min(500, Number($("calcVeces").value) || 0));
    var m = Math.max(0, Math.min(60, Number($("calcMin").value) || 0));
    var horas = v * m * 30 / 60;
    var res = $("calcRes"); res.textContent = "";
    if (!horas) { res.textContent = "Escribe tus números para ver el resultado."; return; }
    var txt = horas >= 10 ? String(Math.round(horas)) : String(Math.round(horas * 10) / 10).replace(".", ",");
    res.appendChild(el("b", "", txt + (horas === 1 ? " hora al mes" : " horas al mes")));
    res.appendChild(document.createTextNode("se te van en revisar y responder si hay stock."));
  }

  /* ---------- Barra inferior de WhatsApp ---------- */
  function iniciarBarra() {
    if (!("IntersectionObserver" in window)) return;
    var visibles = { portada: true, cierre: false };
    var io = new IntersectionObserver(function (es) {
      es.forEach(function (e) { visibles[e.target.id] = e.isIntersecting; });
      var mostrar = !visibles.portada && !visibles.cierre;
      $("barraWa").hidden = !mostrar;
      document.body.classList.toggle("con-barra", mostrar);
    });
    io.observe($("portada")); io.observe($("cierre"));
  }

  /* ---------- Recorrido guiado ---------- */
  var TOUR = [
    { id: "reporte", h: "8:30 · Antes de abrir", t: "Revisas el reporte en tu celular: qué se vendió ayer, si se vendió al precio correcto y qué hay que reponer." },
    { id: "dos-tiendas", h: "11:00 · Llega un mensaje", t: "Un cliente pregunta por un producto. Mira la diferencia entre responder a mano y tener el catálogo conectado.", a: function () { VV.demos.escena(); } },
    { id: "venta", h: "13:00 · Vendes en el mostrador", t: "Registras la venta en tu caja, como siempre. En máximo 15 minutos tu catálogo se entera solo.", a: function () { VV.demos.venta && VV.demos.venta(); } },
    { id: "asis", h: "15:30 · Estás ocupado", t: "Alguien escribe mientras atiendes. El asistente le responde con los productos de tu tienda.", a: function () { VV.demos.preguntar && VV.demos.preguntar(0); } },
    { id: "conteo", h: "19:00 · Toca inventario", t: "Tu equipo cuenta desde el celular, todos al mismo tiempo, y el sistema marca las diferencias.", a: function () { VV.demos.conteo && VV.demos.conteo(); } },
    { id: "problemas", h: "Ahora tú", t: "¿Cuál de estos problemas te pasa hoy? Tócalo y mira cómo se resuelve." }
  ];
  var tourI = -1, tourT = 0;
  function tourPaso(i) {
    tourI = i; clearTimeout(tourT);
    var p = TOUR[i];
    $("tour").hidden = false; document.body.classList.add("con-tour");
    $("tourHora").textContent = p.h; $("tourTxt").textContent = p.t;
    $("tourN").textContent = "Paso " + (i + 1) + " de " + TOUR.length;
    $("tourSig").textContent = i === TOUR.length - 1 ? "Terminar" : "Siguiente";
    irA(p.id, false);
    if (p.a) tourT = setTimeout(p.a, reduce ? 0 : 900);
  }
  function tourSalir() {
    clearTimeout(tourT); tourI = -1; $("tour").hidden = true; document.body.classList.remove("con-tour");
  }
  function iniciarTour() {
    $("iniciarTour").addEventListener("click", function () { tourPaso(0); $("tourSig").focus({ preventScroll: true }); });
    $("tourSig").addEventListener("click", function () { tourI >= TOUR.length - 1 ? tourSalir() : tourPaso(tourI + 1); });
    $("tourSalir").addEventListener("click", tourSalir);
    document.addEventListener("keydown", function (e) { if (e.key === "Escape" && tourI >= 0 && !document.querySelector("dialog[open]")) tourSalir(); });
  }

  /* ---------- Modo presentación (tecla P o ?presentar=1) ---------- */
  var pres = false;
  function secciones() { return Array.prototype.filter.call(document.querySelectorAll("[data-sec]"), function (s) { return !s.hidden; }); }
  function secActual() {
    var ss = secciones(), y = window.innerHeight * 0.35, act = 0;
    ss.forEach(function (s, i) { if (s.getBoundingClientRect().top <= y) act = i; });
    return act;
  }
  function presPintar() {
    if (!pres) return;
    var ss = secciones(), i = secActual();
    $("pres").textContent = (i + 1) + " de " + ss.length + " · " + ss[i].getAttribute("data-sec") + " · flechas para avanzar, P para salir";
  }
  function presPoner(v) {
    pres = v; document.documentElement.classList.toggle("presentar", v); $("pres").hidden = !v;
    if (v) { tourSalir(); presPintar(); }
  }
  function iniciarPres() {
    var ocupado = false;
    window.addEventListener("scroll", function () {
      if (!pres || ocupado) return; ocupado = true;
      requestAnimationFrame(function () { ocupado = false; presPintar(); });
    }, { passive: true });
    document.addEventListener("keydown", function (e) {
      var t = e.target, escribe = t && (/^(INPUT|TEXTAREA|SELECT)$/.test(t.tagName) || t.isContentEditable);
      if (e.defaultPrevented || escribe || e.ctrlKey || e.metaKey || e.altKey || document.querySelector("dialog[open]")) return;
      if (e.key === "p" || e.key === "P") { presPoner(!pres); return; }
      if (!pres) return;
      var d = e.key === "ArrowRight" || e.key === "PageDown" ? 1 : e.key === "ArrowLeft" || e.key === "PageUp" ? -1 : 0;
      if (!d) return;
      e.preventDefault();
      var ss = secciones(), i = Math.max(0, Math.min(ss.length - 1, secActual() + d));
      ss[i].scrollIntoView({ behavior: reduce ? "auto" : "smooth", block: "start" });
    });
  }

  /* ---------- Arranque ---------- */
  function arrancar() {
    pintarConfig();
    var q = new URLSearchParams(window.location.search);
    var desdeEnlace = q.has("negocio") || q.has("rubro");
    if (desdeEnlace) {
      VV.estado.negocio = limpiarNombre(q.get("negocio"));
      VV.estado.rubro = validarRubro(q.get("rubro"));
      VV.estado.personalizado = true;
      VV.productos = D.copiar(VV.estado.rubro);
      var s = $("saludo");
      s.textContent = VV.estado.negocio ? "Hola, " + VV.estado.negocio + ". Así se vería tu catálogo." : "Así se vería tu catálogo.";
      s.hidden = false;
    }
    pintarWa();
    if (q.get("presentar") === "1") document.documentElement.classList.add("presentar");
    despuesDePintar(function () {
    pintarDolores();
    iniciarEscena();
    iniciarLinea();
    $("calc").addEventListener("input", calcular);
    $("calc").addEventListener("submit", function (e) { e.preventDefault(); });
    calcular();
    iniciarBarra();
    iniciarTour();
    iniciarPres();
    if (q.get("presentar") === "1") presPoner(true);

    document.addEventListener("vv:cambio", function () {
      escLimpiar();
    });
    VV.listo = true;
    cola.forEach(function (f) { f(); }); cola = [];
    document.dispatchEvent(new CustomEvent("vv:listo"));
    });
  }
  VV.acentos = ACENTOS; VV.nombresAcento = NOMBRES_ACENTO; VV.publico = publico;
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", arrancar); else arrancar();
})();
