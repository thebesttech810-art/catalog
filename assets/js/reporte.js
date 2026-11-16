/* F. El reporte: un libro de Excel con cinco hojas, adaptado a la pantalla del celular.
   Los nombres de las hojas y de las columnas son los del reporte real. Las cifras son de ejemplo. */
(function () {
  "use strict";
  var VV = window.VV, U = VV.util, $ = U.$, el = U.el, dinero = U.dinero, reduce = U.reduce;

  var HOJAS = [
    { id: "resumen", t: "Resumen", c: "Resumen" },
    { id: "ventas", t: "Reporte de ventas", c: "Ventas" },
    { id: "precios", t: "Verificación de precios", c: "Precios" },
    { id: "traslados", t: "Traslados sugeridos", c: "Traslados" },
    { id: "comprar", t: "Comprar producto", c: "Comprar" }
  ];
  var st = { per: 0, hoja: "resumen", abierta: -1, vals: [0, 0, 0], raf: 0, loc: "uno" };
  var FACT = [1, 6.5, 27], DIAS = [1, 7, 30], PER = ["ayer", "esta semana", "este mes"];
  var ROJO = "var(--sem-rojo)", AMBAR = "var(--sem-ambar)", VERDE = "var(--sem-verde)", GRIS = "var(--sem-gris)";

  /* Datos de ejemplo armados con los productos del rubro elegido.
     Se vende más de lo barato que de lo caro, y los totales cuadran con las filas. */
  function datos() {
    var P = VV.productos, f = FACT[st.per], dias = DIAS[st.per];
    var conStock = P.filter(function (p) { return p.s > 0; });
    if (!conStock.length) conStock = P.slice();
    var porPrecio = conStock.slice().sort(function (x, y) { return x.p - y.p; });
    var holgados = porPrecio.filter(function (p) { return p.s > 3; }).slice(0, 3);
    var pocos = porPrecio.filter(function (p) { return p.s <= 3; });
    var amarillo = pocos.filter(function (p) { return p.s >= 2; })[0], rojo = pocos.filter(function (p) { return p.s === 1; })[0];
    var enFilas = holgados.concat([amarillo, rojo].filter(Boolean));
    if (!enFilas.length) enFilas = porPrecio.slice(0, 3);
    var PESOS = [6, 4, 3, 2, 0.2];
    var filasVentas = enFilas.map(function (p, i) {
      var h = holgados.indexOf(p), peso = h >= 0 ? PESOS[h] : p === amarillo ? PESOS[3] : PESOS[4];
      var cant = Math.max(1, Math.round(peso * f)), total = cant * p.p;
      return { p: p, bodega: i % 2 ? "Local B" : "Local A", cant: cant, total: total, ganancia: total * 0.27, sem: p.s <= 1 ? ["Rojo", ROJO] : p.s <= 3 ? ["Amarillo", AMBAR] : ["Verde", VERDE] };
    });
    var uniFilas = filasVentas.reduce(function (t, x) { return t + x.cant; }, 0);
    var totFilas = filasVentas.reduce(function (t, x) { return t + x.total; }, 0);
    var ventas = Math.round(totFilas * 1.3); /* los demás productos suman un 30 % más */
    function filaComprar(p, i) {
      var en = filasVentas.filter(function (x) { return x.p.id === p.id; })[0];
      var v = en ? en.cant : Math.max(1, Math.round([2, 1, 1][i] * f)), d = v / dias;
      return { p: p, stock: p.s, vendido: v, dias: Math.max(1, Math.round(p.s / d)), sugerida: Math.max(2, Math.round(d * 15 - p.s)) };
    }
    var rapido = holgados[0] || enFilas[0];
    var comprar = [rapido].concat(pocos.filter(function (p) { return p.id !== rapido.id; }).slice(0, 2)).map(filaComprar);
    var barato = P.filter(function (p) { return p.p >= 30 && p.p <= 120; })[0] || P[0];
    var otros = conStock.filter(function (p) { return p.id !== barato.id; });
    var c1 = otros[0] || barato, c2 = otros[1] || c1, c3 = otros[2] || c1;
    return {
      ventas: ventas, unidades: uniFilas + Math.round(uniFilas * 0.35), ganancia: Math.round(ventas * 0.27),
      barato: barato, vendidoA: Math.round(barato.p * 0.86),
      acaba: pocos[0] || P[1],
      rapido: rapido, vendRap: comprar[0].vendido, diasStock: comprar[0].dias, sugerida: comprar[0].sugerida,
      filasVentas: filasVentas,
      filasPrecios: [
        { p: barato, sis: barato.p, ven: Math.round(barato.p * 0.86), est: ["Más barato", ROJO] },
        { p: c1, sis: c1.p, ven: c1.p, est: ["Igual", VERDE] },
        { p: c2, sis: c2.p, ven: c2.p + 2, est: ["Más caro", AMBAR] },
        { p: c3, sis: null, ven: c3.p, est: ["Sin precio", GRIS] }
      ],
      filasTraslados: [
        { p: pocos[0] || P[1], de: "Local B", a: "Local A", cant: 4, motivo: "Local A se queda sin stock" },
        { p: pocos[1] || P[2], de: "Local A", a: "Local B", cant: 2, motivo: "Local B lo vende más" }
      ],
      filasComprar: comprar
    };
  }

  function chip(par) {
    var s = el("span", "est", par[0]); s.style.setProperty("--c", par[1]);
    if (par[1] === AMBAR) s.setAttribute("data-claro", "");
    return s;
  }
  function tabla(titulo, cab, filas, pie) {
    var frag = document.createDocumentFragment();
    frag.appendChild(el("h3", "hoja-t", titulo));
    var pista = el("p", "hoja-desliza", "Desliza la tabla hacia la izquierda para ver más columnas"); pista.hidden = true;
    frag.appendChild(pista);
    var sc = el("div", "hoja-scroll"); sc.tabIndex = 0; sc.setAttribute("role", "region");
    sc.setAttribute("aria-label", "Hoja " + titulo + ". Desliza hacia los lados para ver todas las columnas.");
    var t = el("table", "hoja-tabla"), th = el("thead"), tr = el("tr");
    cab.forEach(function (c) { var h = el("th", "", c); h.scope = "col"; tr.appendChild(h); });
    th.appendChild(tr); t.appendChild(th);
    var tb = el("tbody");
    filas.forEach(function (f) {
      var r = el("tr");
      f.forEach(function (c, i) {
        var td = el(i === 0 ? "th" : "td"); if (i === 0) td.scope = "row";
        if (c && c.nodeType) td.appendChild(c);
        else {
          td.textContent = String(c);
          if (i > 0 && /^[+−$\d]/.test(String(c))) td.className = "num";
          else if (i > 0 && String(c).length <= 9) td.className = "corto";
        }
        r.appendChild(td);
      });
      tb.appendChild(r);
    });
    t.appendChild(tb); sc.appendChild(t); frag.appendChild(sc);
    frag.appendChild(el("p", "hoja-pie", pie));
    requestAnimationFrame(function () { pista.hidden = !(sc.scrollWidth > sc.clientWidth + 4); });
    return frag;
  }

  function ponerKpis(nodos, v) {
    nodos[0].textContent = "$" + Math.round(v[0]).toLocaleString("es-EC");
    nodos[1].textContent = Math.round(v[1]).toLocaleString("es-EC");
    nodos[2].textContent = "$" + Math.round(v[2]).toLocaleString("es-EC");
  }
  function animarKpis(nodos, nuevos) {
    cancelAnimationFrame(st.raf);
    var desde = st.vals.slice(), ini = performance.now();
    var igual = desde.every(function (x, i) { return Math.round(x) === nuevos[i]; });
    if (reduce || igual) { st.vals = nuevos; ponerKpis(nodos, nuevos); return; }
    (function paso(ahora) {
      var k = Math.min(1, (ahora - ini) / 500), e = 1 - Math.pow(1 - k, 3);
      st.vals = nuevos.map(function (n, i) { return desde[i] + (n - desde[i]) * e; });
      ponerKpis(nodos, st.vals);
      if (k < 1) st.raf = requestAnimationFrame(paso);
    })(ini);
  }

  function alertas(d) {
    return [
      { c: ROJO, t: "Un producto se vendió más barato que el precio del sistema", hoja: "precios", d: function (c) {
          c.appendChild(el("p", "", d.barato.n));
          var g = el("div", "cmp");
          [["Se vendió a", dinero(d.vendidoA), ""], ["Precio del sistema", dinero(d.barato.p), ""], ["Diferencia", "−" + dinero(d.barato.p - d.vendidoA), "dif-neg"]].forEach(function (x) {
            var b = el("div", x[2]); b.appendChild(el("small", "", x[0])); b.appendChild(el("b", "", x[1])); g.appendChild(b);
          });
          c.appendChild(g);
        } },
      st.loc === "uno" ? { c: AMBAR, t: "Un producto se está acabando", hoja: "comprar", d: function (c) {
          c.appendChild(el("p", "", d.acaba.n));
          c.appendChild(el("p", "medidor-t", "Quedan " + d.acaba.s + (d.acaba.s === 1 ? " unidad." : " unidades.")));
          c.appendChild(el("p", "traslado", "Sugerencia: reponerlo antes de que se agote."));
        } } : { c: AMBAR, t: "Se está acabando en un local", hoja: "traslados", d: function (c) {
          c.appendChild(el("p", "", d.acaba.n));
          var l = el("div", "locales");
          [["Local A", 1, ROJO], ["Local B", 9, VERDE]].forEach(function (x) {
            var f = el("div"), s = el("span", "sem"); s.style.setProperty("--c", x[2]);
            f.appendChild(s); f.appendChild(el("span", "", x[0])); f.appendChild(el("b", "", x[1] + " u.")); l.appendChild(f);
          });
          c.appendChild(l);
          c.appendChild(el("p", "traslado", "Sugerencia: mueve 4 unidades del Local B al Local A."));
        } },
      { c: VERDE, t: "Un producto se está vendiendo muy rápido", hoja: "comprar", d: function (c) {
          c.appendChild(el("p", "", d.rapido.n + ": " + d.vendRap + (d.vendRap === 1 ? " vendido " : " vendidos ") + PER[st.per] + "."));
          var m = el("div", "medidor"); m.setAttribute("role", "img");
          m.setAttribute("aria-label", "Quedan " + d.diasStock + " días de stock");
          var i = el("i"); i.style.width = Math.max(6, Math.min(100, d.diasStock / 30 * 100)) + "%"; m.appendChild(i);
          c.appendChild(el("p", "medidor-t", "Días de stock que quedan: " + d.diasStock));
          c.appendChild(m);
          c.appendChild(el("p", "traslado", "Sugerencia: comprar " + d.sugerida + " unidades."));
        } }
    ];
  }

  function resumen(d) {
    var frag = document.createDocumentFragment();
    var k = el("div", "kpis"); k.id = "repKpis";
    ["Ventas", "Unidades vendidas", "Ganancia"].forEach(function (t) {
      var c = el("div", "kpi"); c.appendChild(el("span", "", t)); c.appendChild(el("b", "", "0")); k.appendChild(c);
    });
    frag.appendChild(k);
    frag.appendChild(el("h3", "rep-h", "Alertas"));
    var cont = el("div", "alertas"); cont.id = "repAlertas";
    alertas(d).forEach(function (a, i) {
      var caja = el("div", "alerta"); caja.style.setProperty("--c", a.c);
      var b = el("button", "alerta-b", a.t); b.type = "button"; b.setAttribute("aria-expanded", String(st.abierta === i));
      var det = el("div", "alerta-d"); det.hidden = st.abierta !== i;
      if (st.abierta === i) {
        a.d(det);
        var nombre = HOJAS.filter(function (h) { return h.id === a.hoja; })[0].t;
        var ir = el("button", "btn btn-sec btn-ch alerta-ir", "Abrir la hoja «" + nombre + "»"); ir.type = "button";
        ir.addEventListener("click", function () { irA(a.hoja, true); });
        det.appendChild(ir);
      }
      b.addEventListener("click", function () {
        st.abierta = st.abierta === i ? -1 : i; VV.marcar("reporte"); pintar();
        var n = $("repAlertas").querySelectorAll(".alerta-b")[i]; if (n) n.focus({ preventScroll: true });
      });
      caja.appendChild(b); caja.appendChild(det); cont.appendChild(caja);
    });
    frag.appendChild(cont);
    animarKpis(k.querySelectorAll("b"), [d.ventas, d.unidades, d.ganancia]);
    return frag;
  }

  function vacia(titulo, texto) {
    var frag = document.createDocumentFragment();
    frag.appendChild(el("h3", "hoja-t", titulo));
    frag.appendChild(el("p", "hoja-vacia", texto));
    return frag;
  }
  function difTexto(sis, ven) {
    if (sis == null) return "—";
    var x = Math.round((ven - sis) * 100) / 100;
    return x === 0 ? "$0" : x < 0 ? "−" + dinero(-x) : "+" + dinero(x);
  }
  function hoja(d) {
    /* En el celular, la columna que decide va justo después del producto. */
    if (st.hoja === "ventas") return tabla("Reporte de ventas", ["Producto", "Semáforo", "Cantidad", "Total", "Ganancia"].concat(st.loc === "uno" ? [] : ["Bodega"]),
      d.filasVentas.map(function (f) { return [f.p.n, chip(f.sem), f.cant, dinero(f.total), dinero(Math.round(f.ganancia))].concat(st.loc === "uno" ? [] : [f.bodega]); }),
      "Cada venta con su costo y su ganancia, el stock de cada local y un semáforo de reposición: rojo, amarillo, verde o «revisar».");
    if (st.hoja === "precios") return tabla("Verificación de precios", ["Producto", "Estado", "Sistema", "Vendido", "Diferencia"],
      d.filasPrecios.map(function (f) { return [f.p.n, chip(f.est), f.sis == null ? "—" : dinero(f.sis), dinero(f.ven), difTexto(f.sis, f.ven)]; }),
      "Compara cada venta con el precio de tu sistema. Estado: igual, más barato, más caro o sin precio en el sistema.");
    if (st.hoja === "traslados" && st.loc === "uno") return vacia("Traslados sugeridos", "Con un solo local no hay traslados que sugerir. Esta hoja se usa cuando tienes varios locales.");
    if (st.hoja === "traslados") return tabla("Traslados sugeridos", ["Producto", "Trasladar desde", "Trasladar hacia", "Cantidad", "Motivo"],
      d.filasTraslados.map(function (f) { return [f.p.n, f.de, f.a, f.cant, f.motivo]; }),
      "Aplica cuando tienes más de un local. Con un solo local, esta hoja no trae sugerencias.");
    if (st.hoja === "comprar") return tabla("Comprar producto", ["Producto", "Cantidad sugerida", "Días de stock", "Stock total", "Vendido en el periodo"],
      d.filasComprar.map(function (f) { return [f.p.n, f.sugerida, f.dias, f.stock, f.vendido]; }),
      "Lo que conviene reponer, según lo que se vendió y lo que queda.");
    return resumen(d);
  }

  function pintarTabs() {
    var c = $("repTabs"); c.textContent = "";
    HOJAS.forEach(function (h, i) {
      var b = el("button", "rep-tab", h.c); b.type = "button"; b.id = "repTab-" + h.id; b.setAttribute("aria-label", h.t);
      b.setAttribute("role", "tab"); b.setAttribute("aria-controls", "repHoja");
      b.setAttribute("aria-selected", String(st.hoja === h.id)); b.tabIndex = st.hoja === h.id ? 0 : -1;
      b.addEventListener("click", function () { VV.marcar("reporte"); irA(h.id, true); });
      b.addEventListener("keydown", function (e) {
        var d = e.key === "ArrowRight" ? 1 : e.key === "ArrowLeft" ? -1 : 0; if (!d) return;
        e.preventDefault(); e.stopPropagation();
        irA(HOJAS[(i + d + HOJAS.length) % HOJAS.length].id, true);
      });
      c.appendChild(b);
    });
  }
  function pintar() {
    var h = $("repHoja");
    h.textContent = "";
    h.setAttribute("aria-labelledby", "repTab-" + st.hoja);
    h.appendChild(hoja(datos()));
    pintarTabs();
  }
  function irA(id, foco) {
    st.hoja = id; pintar();
    var t = $("repTab-" + id), c = $("repTabs");
    if (!t) return;
    if (foco) t.focus({ preventScroll: true });
    c.scrollLeft = Math.max(0, t.offsetLeft - (c.clientWidth - t.offsetWidth) / 2);
  }
  VV.demos.hojaReporte = function (id) { irA(id, false); };

  document.querySelectorAll("[data-per]").forEach(function (b) {
    b.addEventListener("click", function () {
      st.per = Number(b.getAttribute("data-per"));
      document.querySelectorAll("[data-per]").forEach(function (o) { o.setAttribute("aria-pressed", String(o === b)); });
      pintar();
    });
  });
  document.querySelectorAll("[data-loc]").forEach(function (b) {
    b.addEventListener("click", function () {
      st.loc = b.getAttribute("data-loc"); st.abierta = -1; VV.marcar("reporte");
      document.querySelectorAll("[data-loc]").forEach(function (o) { o.setAttribute("aria-pressed", String(o === b)); });
      $("repLocalNota").textContent = st.loc === "uno"
        ? "Con un solo local, el reporte te muestra ventas, precios y qué comprar. La hoja de traslados queda vacía."
        : "Con varios locales, el reporte también sugiere qué mover de uno a otro.";
      pintar();
    });
  });
  document.addEventListener("vv:cambio", function () { st.abierta = -1; st.hoja = "resumen"; st.vals = [0, 0, 0]; pintar(); });
  VV.alListo(pintar);
})();
