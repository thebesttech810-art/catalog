/* =====================================================================
   VIDEO EXPLICATIVO DE CATALOG
   Se dibuja en un <canvas>: pesa poco, se ve nítido en cualquier pantalla y
   puede mostrar el nombre del negocio. La misma animación se graba como MP4
   con herramientas/grabar-video.js para compartirla por WhatsApp o en redes.
   Todo lo que se ve (negocio, productos, precios) es de ejemplo.
   ===================================================================== */
(function () {
  "use strict";

  var COL = {
    tinta: "#16183A", vidrio: "#EEF2F7", blanco: "#FFFFFF", rotulo: "#3A36E0", etiqueta: "#FFD84A",
    aviso: "#C92C3D", wa: "#25D366", waTxt: "#06301A", waBur: "#DCF8C6", verde: "#0B7669",
    ambar: "#F2B01E", naranja: "#FFB55A", suave: "#5B6078", linea: "#CBD3E1", gris: "#E3E6EC", celeste: "#DCEBFF"
  };
  var FT = '"Bricolage", "Trebuchet MS", system-ui, sans-serif';
  var FX = '"Hanken", "Segoe UI", system-ui, sans-serif';
  var PROD = ["#3A36E0", "#FF7A59", "#0E8577", "#F2B01E", "#8A4FFF", "#E0457B"];
  var TRANS = 0.45;

  function clamp(v, a, b) { return v < a ? a : v > b ? b : v; }
  function sale(k) { k = clamp(k, 0, 1); return 1 - Math.pow(1 - k, 3); }
  function rebote(k) { k = clamp(k, 0, 1); var c = 1.70158; return 1 + (c + 1) * Math.pow(k - 1, 3) + c * Math.pow(k - 1, 2); }
  function tramo(s, a, d) { return clamp((s - a) / (d || 0.5), 0, 1); }
  function claro(hex, f) {
    var n = parseInt(hex.slice(1), 16), r = n >> 16 & 255, g = n >> 8 & 255, b = n & 255;
    return "rgb(" + Math.round(r + (255 - r) * f) + "," + Math.round(g + (255 - g) * f) + "," + Math.round(b + (255 - b) * f) + ")";
  }
  function minus(t) { t = String(t || ""); return t.charAt(0).toLowerCase() + t.slice(1); }
  /* 593996966975 -> 099 696 6975 */
  function telLocal(n) {
    n = String(n || "").replace(/\D/g, "");
    if (n.indexOf("593") === 0) n = "0" + n.slice(3);
    return n.length === 10 ? n.slice(0, 3) + " " + n.slice(3, 6) + " " + n.slice(6) : n;
  }
  function dominio(u) { return String(u || "").replace(/^https?:\/\//, "").replace(/\/$/, ""); }
  function dineroLocal(n) {
    var s = (Math.round(n * 100) / 100).toFixed(2).split(".");
    return "$" + s[0].replace(/\B(?=(\d{3})+(?!\d))/g, ".") + (s[1] === "00" ? "" : "," + s[1]);
  }
  function inicialesLocal(nombre) {
    var p = String(nombre || "").split(" ").filter(function (x) { return /[0-9A-Za-zÀ-ÿ]/.test(x); });
    var a = p.slice(0, 2).map(function (x) { return Array.from(x.replace(/[^0-9A-Za-zÀ-ÿ]/g, ""))[0] || ""; }).join("");
    return (a || "TT").toUpperCase();
  }

  function crear(canvas, op) {
    op = op || {};
    var ctx = canvas.getContext("2d");
    var imgs = {};
    var ESC = [], TOTAL = 0, DAT = null;
    var dinero = op.dinero || dineroLocal;

    /* ---------------- dibujo básico ---------------- */
    function rr(x, y, w, h, r) {
      r = Math.min(r, w / 2, h / 2);
      ctx.beginPath(); ctx.moveTo(x + r, y);
      ctx.arcTo(x + w, y, x + w, y + h, r); ctx.arcTo(x + w, y + h, x, y + h, r);
      ctx.arcTo(x, y + h, x, y, r); ctx.arcTo(x, y, x + w, y, r); ctx.closePath();
    }
    function caja(x, y, w, h, r, fondo, linea, lw) {
      rr(x, y, w, h, r);
      if (fondo) { ctx.fillStyle = fondo; ctx.fill(); }
      if (linea) { ctx.strokeStyle = linea; ctx.lineWidth = lw || 4; ctx.stroke(); }
    }
    function sombra(x, y, w, h, r, d) { caja(x + (d || 10), y + (d || 10) + 2, w, h, r, COL.tinta); }
    function fuente(size, peso, fam) { ctx.font = (peso || 400) + " " + Math.round(size) + "px " + (fam || FX); }
    function lineas(t, max) {
      var out = [];
      String(t).split("\n").forEach(function (par) {
        var pal = par.split(" "), l = "";
        pal.forEach(function (w) {
          var prueba = l ? l + " " + w : w;
          if (max && ctx.measureText(prueba).width > max && l) { out.push(l); l = w; } else l = prueba;
        });
        out.push(l);
      });
      return out;
    }
    function texto(t, x, y, o) {
      o = o || {};
      var size = o.size || 40;
      fuente(size, o.peso, o.fam);
      ctx.fillStyle = o.color || COL.tinta; ctx.textAlign = o.align || "left"; ctx.textBaseline = "alphabetic";
      var ls = lineas(t, o.max), lh = o.lh || size * 1.2;
      ls.forEach(function (l, i) { ctx.fillText(l, x, y + i * lh); });
      return ls.length * lh;
    }
    function corto(t, max, size, peso, fam) {
      fuente(size, peso, fam);
      t = String(t);
      if (ctx.measureText(t).width <= max) return t;
      while (t.length > 1 && ctx.measureText(t + "…").width > max) t = t.slice(0, -1);
      return t.replace(/\s+$/, "") + "…";
    }
    function alfa(a, fn) { if (a <= 0) return; ctx.save(); ctx.globalAlpha *= Math.min(1, a); fn(); ctx.restore(); }
    function mover(dx, dy, fn) { ctx.save(); ctx.translate(dx, dy); fn(); ctx.restore(); }
    /* Aparece con un desvanecido y un pequeño desplazamiento (dy hacia abajo o dx de lado). */
    function entrar(s, a, d, fn, dy, dx) {
      var k = tramo(s, a, d || 0.45); if (k <= 0) return;
      var e = sale(k);
      alfa(e, function () { mover((1 - e) * (dx || 0), (1 - e) * (dy == null ? 24 : dy), fn); });
    }

    function imagen(p) {
      var clave = p.i + "-" + p.k;
      if (imgs[clave]) return imgs[clave];
      var im = new Image();
      if (op.ilustrar) {
        var svg = String(op.ilustrar(p)).replace("<svg ", '<svg xmlns="http://www.w3.org/2000/svg" width="240" height="240" ');
        im.onload = function () { if (op.alCargar) op.alCargar(); };
        im.src = "data:image/svg+xml;charset=utf-8," + encodeURIComponent(svg);
      }
      imgs[clave] = im;
      return im;
    }
    function producto(p, x, y, s) {
      caja(x, y, s, s, s * 0.14, claro(PROD[p.k % PROD.length], 0.84));
      var im = imagen(p);
      if (im.complete && im.naturalWidth) ctx.drawImage(im, x + s * 0.1, y + s * 0.1, s * 0.8, s * 0.8);
    }
    /* Etiqueta colgante (la forma de la marca): precio o stock. */
    function etiqueta(x, y, t, o) {
      o = o || {};
      var size = o.size || 32;
      fuente(size, 700, FT);
      var pad = size * 0.5, notch = size * 0.6, h = size * 1.55;
      var w = ctx.measureText(t).width + pad * 1.6 + notch;
      ctx.beginPath();
      ctx.moveTo(x + notch, y); ctx.lineTo(x + w, y); ctx.lineTo(x + w, y + h); ctx.lineTo(x + notch, y + h); ctx.lineTo(x, y + h / 2); ctx.closePath();
      ctx.fillStyle = o.fondo || COL.etiqueta; ctx.fill();
      ctx.beginPath(); ctx.arc(x + notch * 0.85, y + h / 2, size * 0.13, 0, Math.PI * 2); ctx.fillStyle = o.hueco || "#fff"; ctx.fill();
      ctx.fillStyle = o.color || COL.tinta; ctx.textAlign = "left"; ctx.textBaseline = "alphabetic";
      ctx.fillText(t, x + notch + pad * 0.55, y + h * 0.69);
      return w;
    }
    function stock(x, y, n, size) {
      var t = n <= 0 ? "Agotado" : n === 1 ? "Queda 1" : n <= 3 ? "Quedan " + n : "Hay " + n;
      return etiqueta(x, y, t, { size: size, fondo: n <= 0 ? COL.aviso : n <= 3 ? COL.naranja : COL.etiqueta, color: n <= 0 ? "#fff" : COL.tinta });
    }
    /* Teléfono: devuelve el área de la pantalla. */
    function telefono(x, y, w, h) {
      sombra(x, y, w, h, 46, 12);
      caja(x, y, w, h, 46, "#fff", COL.tinta, 6);
      caja(x + w / 2 - 54, y + 16, 108, 14, 7, COL.tinta);
      return { x: x + 24, y: y + 50, w: w - 48, h: h - 74 };
    }
    function altoBurbuja(t, max, size, quien) {
      fuente(size, 500, FX);
      return lineas(t, max - 36).length * size * 1.25 + 26 + (quien ? size * 0.85 : 0);
    }
    function burbuja(t, x, y, max, o) {
      o = o || {};
      var size = o.size || 30;
      fuente(size, o.peso || 500, FX);
      var ls = lineas(t, max - 36), lh = size * 1.25;
      var ancho = 0; ls.forEach(function (l) { ancho = Math.max(ancho, ctx.measureText(l).width); });
      if (o.quien) { fuente(size * 0.66, 700, FX); ancho = Math.max(ancho, ctx.measureText(o.quien).width); }
      var w = Math.min(max, ancho + 36), h = altoBurbuja(t, max, size, o.quien);
      var bx = o.der ? x - w : x;
      caja(bx, y, w, h, 22, o.fondo || "#fff", o.linea || COL.linea, 2);
      var ty = y + 13;
      if (o.quien) { texto(o.quien, bx + 18, ty + size * 0.62, { size: size * 0.66, peso: 700, color: o.colorQuien || COL.suave }); ty += size * 0.85; }
      fuente(size, o.peso || 500, FX); ctx.fillStyle = o.color || COL.tinta; ctx.textAlign = "left";
      ls.forEach(function (l, i) { ctx.fillText(l, bx + 18, ty + size * 0.95 + i * lh); });
      return h;
    }
    function chip(t, x, y) {
      fuente(30, 700, FT);
      var w = ctx.measureText(t).width + 46;
      caja(x, y, w, 54, 27, COL.tinta);
      ctx.fillStyle = "#fff"; ctx.textAlign = "left"; ctx.fillText(t, x + 23, y + 37);
      return w;
    }
    function check(x, y, r) {
      ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI * 2); ctx.fillStyle = COL.tinta; ctx.fill();
      ctx.strokeStyle = "#fff"; ctx.lineWidth = r * 0.24; ctx.lineCap = "round"; ctx.lineJoin = "round";
      ctx.beginPath(); ctx.moveTo(x - r * 0.42, y + r * 0.02); ctx.lineTo(x - r * 0.1, y + r * 0.34); ctx.lineTo(x + r * 0.45, y - r * 0.3); ctx.stroke();
      ctx.lineCap = "butt"; ctx.lineJoin = "miter";
    }
    function iconoChat(x, y, r, color) {
      ctx.fillStyle = color;
      ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI * 2); ctx.fill();
      ctx.beginPath(); ctx.moveTo(x - r * 0.7, y + r * 0.55); ctx.lineTo(x - r * 1.05, y + r * 1.05); ctx.lineTo(x - r * 0.15, y + r * 0.9); ctx.closePath(); ctx.fill();
    }
    /* Marca: etiqueta amarilla + "Catalog". */
    function marca(x, y, size, centro) {
      fuente(size, 800, FT);
      var tw = ctx.measureText("Catalog").width, iw = size * 0.9, gap = size * 0.28;
      var x0 = centro ? x - (iw + gap + tw) / 2 : x;
      var h = size * 0.62, top = y - size * 0.62;
      ctx.beginPath(); ctx.moveTo(x0 + iw * 0.32, top); ctx.lineTo(x0 + iw, top); ctx.lineTo(x0 + iw, top + h); ctx.lineTo(x0 + iw * 0.32, top + h); ctx.lineTo(x0, top + h / 2); ctx.closePath();
      ctx.fillStyle = COL.etiqueta; ctx.fill();
      ctx.fillStyle = COL.tinta; ctx.fillRect(x0 + iw - size * 0.2, top, size * 0.2, h);
      ctx.textAlign = "left"; ctx.fillStyle = COL.tinta; ctx.fillText("Catalog", x0 + iw + gap, y);
    }

    /* ---------------- fondo, cabecera y pie ---------------- */
    function fondo() {
      ctx.fillStyle = COL.vidrio; ctx.fillRect(0, 0, 1000, 1000);
      ctx.save(); ctx.globalAlpha = 0.6; ctx.fillStyle = "#fff";
      ctx.beginPath(); ctx.moveTo(660, 0); ctx.lineTo(760, 0); ctx.lineTo(420, 1000); ctx.lineTo(320, 1000); ctx.closePath(); ctx.fill();
      ctx.globalAlpha = 0.4;
      ctx.beginPath(); ctx.moveTo(800, 0); ctx.lineTo(830, 0); ctx.lineTo(490, 1000); ctx.lineTo(460, 1000); ctx.closePath(); ctx.fill();
      ctx.restore();
    }
    function cabecera(e, s, fijo) {
      if (fijo) { chip(e.chip, 60, 54); texto(e.titulo, 60, 182, { size: 62, peso: 800, fam: FT, max: 880, lh: 68 }); return; }
      entrar(s, 0, 0.45, function () { chip(e.chip, 60, 54); }, 14);
      entrar(s, 0.12, 0.55, function () { texto(e.titulo, 60, 182, { size: 62, peso: 800, fam: FT, max: 880, lh: 68 }); }, 20);
    }
    function pie() {
      marca(60, 962, 30);
      texto("Ejemplo ilustrativo", 940, 960, { size: 22, peso: 600, color: COL.suave, align: "right" });
    }

    /* ---------------- escenas ---------------- */
    var BASE = [
      {
        id: "dia", chip: "Tu día hoy", titulo: "Te preguntan todo el día: «¿tienes stock?»", dur: 6.5,
        dibujar: function (s, d) {
          var f = telefono(300, 316, 400, 610);
          caja(f.x, f.y, f.w, 74, 18, COL.gris);
          texto("Mensajes", f.x + 22, f.y + 48, { size: 32, peso: 800, fam: FT });
          var n = Math.min(12, 2 + Math.floor(Math.max(0, s - 0.3) * 2.4));
          ctx.beginPath(); ctx.arc(f.x + f.w - 42, f.y + 37, 25, 0, Math.PI * 2); ctx.fillStyle = COL.aviso; ctx.fill();
          texto(String(n), f.x + f.w - 42, f.y + 47, { size: 27, peso: 800, fam: FT, color: "#fff", align: "center" });
          var y = f.y + 96;
          d.preguntas.forEach(function (m, i) {
            var h = altoBurbuja(m, f.w - 60, 29);
            entrar(s, 0.5 + i * 0.9, 0.35, function () { burbuja(m, f.x + 6, y, f.w - 60, { size: 29 }); }, 16);
            y += h + 14;
          });
          [[160, 520, 1.1], [850, 450, 2.0], [840, 790, 2.9], [160, 820, 3.7]].forEach(function (q) {
            var k = tramo(s, q[2], 0.45); if (k <= 0) return;
            var r = 46 * rebote(k);
            ctx.beginPath(); ctx.arc(q[0], q[1], r, 0, Math.PI * 2); ctx.fillStyle = COL.etiqueta; ctx.fill();
            ctx.lineWidth = 5; ctx.strokeStyle = COL.tinta; ctx.stroke();
            texto("?", q[0], q[1] + r * 0.42, { size: r * 1.2, peso: 800, fam: FT, align: "center" });
          });
        }
      },
      {
        id: "problema", chip: "El problema", titulo: "Respondes tarde, o vendes algo que ya no tenías.", dur: 7,
        dibujar: function (s, d) {
          var x = 120, y = 316, w = 760, h = 470;
          entrar(s, 0.3, 0.5, function () {
            sombra(x, y, w, h, 24);
            caja(x, y, w, h, 24, "#fff", COL.tinta, 5);
            caja(x + 8, y + 8, w - 16, 64, 18, COL.gris);
            texto("catalogo.pdf", x + 32, y + 51, { size: 30, peso: 800, fam: FT });
            texto("Actualizado hace 3 meses", x + w - 32, y + 51, { size: 25, color: COL.suave, align: "right" });
            d.pdf.forEach(function (p, i) {
              var ry = y + 96 + i * 122;
              producto(p, x + 30, ry, 100);
              texto(corto(p.n, 360, 30, 600), x + 152, ry + 40, { size: 30, peso: 600 });
              texto(dinero(p.p), x + 152, ry + 88, { size: 34, peso: 800, fam: FT });
              etiqueta(x + w - 170, ry + 28, "Hay", { size: 30 });
              if (i === 1) {
                var k = tramo(s, 2.2, 0.35);
                if (k > 0) alfa(k, function () {
                  ctx.strokeStyle = COL.aviso; ctx.lineWidth = 8; ctx.lineCap = "round";
                  ctx.beginPath(); ctx.moveTo(x + w - 180, ry + 72); ctx.lineTo(x + w - 64, ry + 30); ctx.stroke(); ctx.lineCap = "butt";
                });
                entrar(s, 2.7, 0.35, function () { etiqueta(x + w - 270, ry + 74, "Ya se vendió", { size: 26, fondo: COL.aviso, color: "#fff" }); }, 8);
              }
            });
          });
          var k2 = tramo(s, 4.2, 0.45);
          if (k2 > 0) {
            ctx.save(); ctx.translate(500, 842); ctx.rotate(-0.05);
            var e = 0.7 + 0.3 * rebote(k2); ctx.scale(e, e); ctx.globalAlpha *= sale(k2);
            caja(-330, -50, 660, 100, 16, COL.aviso, COL.tinta, 5);
            texto("Cliente molesto y venta perdida", 0, 14, { size: 40, peso: 800, fam: FT, color: "#fff", align: "center" });
            ctx.restore();
          }
        }
      },
      {
        id: "solucion", chip: "La solución", titulo: "Catalog conecta tu catálogo con tu sistema contable.", dur: 8,
        extra: ["Precios y stock se actualizan solos, cada 15 minutos."],
        dibujar: function (s, d, e) {
          entrar(s, 0.5, 0.5, function () { texto(e.extra[0], 60, 322, { size: 34, peso: 600, color: COL.suave, max: 880 }); }, 10);
          entrar(s, 0.8, 0.5, function () {
            sombra(60, 470, 300, 240, 20);
            caja(60, 470, 300, 240, 20, "#fff", COL.tinta, 5);
            for (var i = 0; i < 3; i++) caja(88, 498 + i * 20, 70 - i * 14, 10, 5, i ? COL.linea : COL.rotulo);
            texto("Tu sistema contable", 88, 590, { size: 32, peso: 800, fam: FT, max: 250, lh: 36 });
            texto("Hoy funciona con Contífico", 88, 666, { size: 22, color: COL.suave, max: 250, lh: 26 });
          });
          var k = tramo(s, 1.4, 0.6);
          if (k > 0) {
            ctx.save(); ctx.setLineDash([18, 14]); ctx.lineDashOffset = -s * 60;
            ctx.strokeStyle = COL.rotulo; ctx.lineWidth = 7;
            ctx.beginPath(); ctx.moveTo(360, 590); ctx.lineTo(360 + 196 * sale(k), 590); ctx.stroke(); ctx.restore();
            entrar(s, 1.9, 0.4, function () {
              caja(376, 616, 168, 54, 27, COL.tinta);
              texto("cada 15 min", 460, 652, { size: 26, peso: 700, fam: FT, color: "#fff", align: "center" });
            }, 8);
          }
          entrar(s, 1.1, 0.55, function () {
            var f = telefono(560, 356, 380, 566);
            caja(f.x, f.y, 58, 58, 14, COL.rotulo);
            texto(d.ini, f.x + 29, f.y + 39, { size: 24, peso: 800, fam: FT, color: "#fff", align: "center" });
            texto(corto(d.nombre, f.w - 76, 28, 800, FT), f.x + 72, f.y + 26, { size: 28, peso: 800, fam: FT });
            texto(s > 6 ? "Actualizado ahora" : "Actualizado hace 1 min", f.x + 72, f.y + 54, { size: 21, color: COL.suave });
            var tw = (f.w - 14) / 2;
            d.tiles.forEach(function (p, i) {
              var tx = f.x + (i % 2) * (tw + 14), ty = f.y + 78 + Math.floor(i / 2) * 210;
              entrar(s, 2.0 + i * 0.25, 0.4, function () {
                caja(tx, ty, tw, 198, 14, "#fff", COL.linea, 2);
                producto(p, tx + (tw - 104) / 2, ty + 10, 104);
                texto(dinero(p.p), tx + 12, ty + 150, { size: 26, peso: 800, fam: FT });
                stock(tx + 10, ty + 162, p.s, 18);
              }, 12);
            });
          });
        }
      },
      {
        id: "funciona", chip: "Así funciona", titulo: "Vendes en tu caja y el catálogo se entera solo.", dur: 10,
        dibujar: function (s, d) {
          var p = d.foco;
          entrar(s, 0.2, 0.45, function () {
            sombra(60, 316, 420, 150, 18);
            caja(60, 316, 420, 150, 18, "#fff", COL.tinta, 5);
            var flash = Math.max(tramo(s, 0.9, 0.25) * (1 - tramo(s, 1.3, 0.5)), tramo(s, 5.3, 0.25) * (1 - tramo(s, 5.7, 0.5)));
            if (flash > 0) alfa(flash, function () { caja(64, 320, 412, 142, 15, COL.etiqueta); });
            texto("Caja de tu local", 88, 372, { size: 32, peso: 800, fam: FT });
            var v = s >= 0.9;
            texto(v ? "Vendiste 1 unidad" : "Sin ventas todavía", 88, 428, { size: 30, peso: v ? 700 : 400, color: v ? COL.tinta : COL.suave });
          });
          var k = s >= 5.9 ? tramo(s, 5.9, 2.0) : tramo(s, 1.4, 2.0);
          entrar(s, 0.6, 0.45, function () {
            var cx = 270, cy = 640, r = 92;
            ctx.lineWidth = 18; ctx.strokeStyle = COL.gris;
            ctx.beginPath(); ctx.arc(cx, cy, r, 0, Math.PI * 2); ctx.stroke();
            if (k > 0) {
              ctx.strokeStyle = COL.rotulo; ctx.lineCap = "round";
              ctx.beginPath(); ctx.arc(cx, cy, r, -Math.PI / 2, -Math.PI / 2 + Math.PI * 2 * k); ctx.stroke(); ctx.lineCap = "butt";
            }
            texto(Math.round(k * 15) + " min", cx, cy + 14, { size: 40, peso: 800, fam: FT, align: "center" });
            texto("Cada 15 minutos lee tu sistema", cx, cy + r + 58, { size: 25, color: COL.suave, align: "center" });
          });
          entrar(s, 0.4, 0.5, function () {
            var x = 540, y = 316, w = 400, h = 520;
            sombra(x, y, w, h, 22);
            caja(x, y, w, h, 22, "#fff", COL.tinta, 5);
            texto("Tu catálogo", x + 28, y + 50, { size: 26, peso: 800, fam: FT, color: COL.suave });
            producto(p, x + 100, y + 72, 200);
            texto(corto(p.n, w - 56, 32, 700), x + 28, y + 330, { size: 32, peso: 700 });
            texto(dinero(p.p), x + 28, y + 384, { size: 40, peso: 800, fam: FT });
            var n = s >= 8.0 ? 0 : s >= 3.5 ? 1 : 2;
            var fl = s >= 7.7 && s < 8.3 ? tramo(s, 7.7, 0.6) : s >= 3.2 && s < 3.8 ? tramo(s, 3.2, 0.6) : 1;
            var sy = fl < 1 ? Math.max(0.06, Math.abs(Math.cos(Math.PI * fl))) : 1;
            var tx = x + 28, ty = y + 410, th = 34 * 1.55;
            ctx.save(); ctx.translate(0, ty + th / 2); ctx.scale(1, sy); ctx.translate(0, -(ty + th / 2));
            stock(tx, ty, n, 34);
            ctx.restore();
          });
          entrar(s, 8.4, 0.5, function () { texto("Nadie editó nada.", 740, 900, { size: 42, peso: 800, fam: FT, align: "center" }); }, 10);
        }
      },
      {
        id: "pedido", chip: "El pedido", titulo: "Tu cliente pregunta y te pide por WhatsApp.", dur: 9.5,
        extra: ["Tú confirmas y cobras como siempre. Sin pagos en línea."],
        dibujar: function (s, d, e) {
          var f = telefono(60, 316, 430, 590);
          var y = f.y + 6;
          var q = "¿Algo para regalar hasta $50?";
          var h1 = altoBurbuja(q, f.w - 60, 28);
          entrar(s, 0.4, 0.35, function () { burbuja(q, f.x + f.w - 4, y, f.w - 60, { size: 28, der: true, fondo: COL.celeste, linea: COL.celeste }); }, 14);
          y += h1 + 12;
          var a = "Mira, estos sí hay:";
          var h2 = altoBurbuja(a, f.w - 60, 28, "Asistente");
          entrar(s, 1.5, 0.35, function () { burbuja(a, f.x + 4, y, f.w - 60, { size: 28, fondo: COL.etiqueta, linea: COL.etiqueta, quien: "Asistente", colorQuien: COL.tinta }); }, 14);
          y += h2 + 12;
          d.regalo.forEach(function (p, i) {
            var cy = y + i * 108;
            entrar(s, 2.0 + i * 0.4, 0.35, function () {
              caja(f.x + 4, cy, f.w - 8, 96, 14, "#fff", COL.tinta, 2);
              producto(p, f.x + 14, cy + 10, 76);
              texto(corto(p.n, f.w - 120, 25, 700), f.x + 104, cy + 40, { size: 25, peso: 700 });
              texto(dinero(p.p), f.x + 104, cy + 80, { size: 27, peso: 800, fam: FT });
              stock(f.x + f.w - 132, cy + 54, p.s, 17);
            }, 12);
          });
          var by = f.y + f.h - 78, bx = f.x + f.w / 2;
          entrar(s, 3.0, 0.35, function () {
            caja(f.x + 4, by, f.w - 8, 70, 16, COL.wa);
            texto("Pedir por WhatsApp", bx, by + 46, { size: 30, peso: 800, fam: FT, color: COL.waTxt, align: "center" });
          }, 10);
          var kt = tramo(s, 3.9, 0.7);
          if (kt > 0 && kt < 1) alfa(1 - kt, function () {
            ctx.beginPath(); ctx.arc(bx, by + 35, 20 + 110 * kt, 0, Math.PI * 2); ctx.fillStyle = "rgba(22,24,58,.22)"; ctx.fill();
          });
          var p0 = d.regalo[0];
          var msg = "Hola " + d.nombre + ", quiero hacer este pedido:\n1 × " + p0.n + ": " + dinero(p0.p) + "\nTotal: " + dinero(p0.p) + "\n¿Me confirmas si está disponible?";
          entrar(s, 4.5, 0.4, function () { texto("Te llega a ti:", 540, 396, { size: 34, peso: 800, fam: FT }); }, 10);
          entrar(s, 4.8, 0.5, function () { burbuja(msg, 540, 424, 400, { size: 27, fondo: COL.waBur, linea: COL.waBur }); }, 0, -40);
          entrar(s, 6.3, 0.45, function () { texto(e.extra[0], 540, 820, { size: 28, peso: 600, color: COL.suave, max: 400, lh: 36 }); }, 10);
        }
      },
      {
        id: "reportes", chip: "Extra 1: reportes", titulo: "Tus ventas y alertas, en tu celular.", dur: 7.5,
        extra: ["Llega como archivo de Excel. Lo abres en el celular y sabes qué se vendió, a qué precio y qué reponer."],
        dibujar: function (s, d, e) {
          var f = telefono(60, 316, 430, 590);
          caja(f.x, f.y, 46, 46, 10, COL.verde);
          texto("X", f.x + 23, f.y + 33, { size: 26, peso: 800, fam: FT, color: "#fff", align: "center" });
          texto("Reporte de ventas", f.x + 60, f.y + 33, { size: 28, peso: 800, fam: FT });
          caja(f.x, f.y + 62, f.w, 150, 16, COL.tinta);
          texto("Ventas de la semana", f.x + 20, f.y + 98, { size: 24, peso: 700, color: "#fff" });
          [0.45, 0.6, 0.5, 0.75, 0.68, 0.9, 1].forEach(function (v, i) {
            var k = sale(tramo(s, 0.6 + i * 0.08, 0.55));
            var bw = (f.w - 40 - 6 * 10) / 7, bx = f.x + 20 + i * (bw + 10), bh = 74 * v * k;
            if (bh > 0) caja(bx, f.y + 198 - bh, bw, bh, 5, COL.etiqueta);
          });
          [["Se vendió más barato que tu sistema", COL.aviso], ["Se está acabando: reponer", COL.ambar], ["Se vende rápido: comprar más", COL.verde]].forEach(function (a, i) {
            var ay = f.y + 230 + i * 90;
            entrar(s, 1.6 + i * 0.7, 0.4, function () {
              caja(f.x, ay, f.w, 78, 14, "#fff", COL.linea, 2);
              caja(f.x, ay, 14, 78, 7, a[1]);
              fuente(24, 700, FX);
              var ls = lineas(a[0], f.w - 48);
              texto(a[0], f.x + 30, ay + 39 - (ls.length - 1) * 14 + 9, { size: 24, peso: 700, max: f.w - 48, lh: 28 });
            }, 0, 40);
          });
          entrar(s, 3.8, 0.5, function () { texto(e.extra[0], 540, 420, { size: 34, peso: 600, max: 400, lh: 44 }); }, 12);
        }
      },
      {
        id: "conteo", chip: "Extra 2: conteo", titulo: "Cuenta tu inventario desde el celular.", dur: 8,
        extra: ["Varias personas cuentan a la vez y el sistema marca las diferencias."],
        dibujar: function (s, d, e) {
          entrar(s, 0.3, 0.45, function () { texto(e.extra[0], 60, 322, { size: 32, peso: 600, color: COL.suave, max: 880 }); }, 10);
          var metas = [[4, 2, 4], [3, 1, 4], [2, 5, 4]];
          [60, 370, 680].forEach(function (x, zi) {
            entrar(s, 0.5 + zi * 0.2, 0.45, function () {
              var y = 380, w = 260, h = 330;
              sombra(x, y, w, h, 26, 8);
              caja(x, y, w, h, 26, "#fff", COL.tinta, 5);
              texto("Zona " + (zi + 1), x + 22, y + 46, { size: 28, peso: 800, fam: FT });
              for (var r = 0; r < 3; r++) {
                var ry = y + 66 + r * 84, meta = metas[zi][r];
                var n = Math.min(meta, Math.floor(tramo(s, 1.0 + r * 0.3 + zi * 0.2, 3.0) * (meta + 0.999)));
                caja(x + 14, ry, w - 28, 72, 12, COL.vidrio);
                producto(d.conteo[zi * 3 + r], x + 22, ry + 8, 56);
                texto(String(n), x + w - 104, ry + 48, { size: 34, peso: 800, fam: FT, align: "right" });
                caja(x + w - 90, ry + 12, 62, 48, 10, COL.etiqueta, COL.tinta, 3);
                texto("+1", x + w - 59, ry + 45, { size: 26, peso: 800, fam: FT, align: "center" });
              }
            });
          });
          var kp = tramo(s, 1.0, 4.4);
          entrar(s, 0.9, 0.4, function () {
            texto("Avance compartido", 60, 760, { size: 28, peso: 700 });
            texto(Math.round(100 * kp) + " %", 940, 760, { size: 32, peso: 800, fam: FT, align: "right" });
            caja(60, 778, 880, 32, 16, "#fff", COL.tinta, 3);
            if (kp > 0) caja(64, 782, Math.max(24, 872 * kp), 24, 12, COL.verde);
          });
          var x = 60;
          [["Igual", COL.verde, "#fff"], ["Falta 1", COL.aviso, "#fff"], ["Sobra 1", COL.ambar, COL.tinta]].forEach(function (c, i) {
            fuente(28, 800, FT);
            var w = ctx.measureText(c[0]).width + 48, cx = x;
            entrar(s, 5.6 + i * 0.25, 0.35, function () {
              caja(cx, 840, w, 54, 27, c[1]);
              texto(c[0], cx + w / 2, 877, { size: 28, peso: 800, fam: FT, color: c[2], align: "center" });
            }, 10);
            x += w + 16;
          });
        }
      },
      {
        id: "real", soloReal: true, chip: "Ejemplo real", titulo: "Ya funciona en una tienda real.", dur: 6.5,
        dibujar: function (s, d) {
          var r = d.real;
          entrar(s, 0.3, 0.5, function () {
            var x = 60, y = 300, w = 880, h = 560;
            sombra(x, y, w, h, 28, 12);
            caja(x, y, w, h, 28, COL.etiqueta, COL.tinta, 5);
            ctx.save(); rr(x, y, w, h, 28); ctx.clip();
            ctx.strokeStyle = "rgba(22,24,58,.06)"; ctx.lineWidth = 14;
            for (var i = -h; i < w; i += 28) { ctx.beginPath(); ctx.moveTo(x + i, y + h); ctx.lineTo(x + i + h, y); ctx.stroke(); }
            ctx.restore();
            caja(x + 40, y + 40, 270, 56, 28, COL.tinta);
            ctx.beginPath(); ctx.arc(x + 70, y + 68, 9, 0, Math.PI * 2); ctx.fillStyle = "#5DE3A5"; ctx.fill();
            texto("Ejemplo real", x + 90, y + 78, { size: 28, peso: 700, fam: FT, color: "#fff" });
            texto(r.nombre, x + 40, y + 182, { size: 72, peso: 800, fam: FT, max: w - 80 });
            if (r.resumen) texto(r.resumen, x + 40, y + 236, { size: 34, peso: 600 });
            fuente(28, 700, FX);
            var dw = ctx.measureText(r.dominio).width + 44;
            caja(x + 40, y + 264, dw, 56, 28, "#fff", COL.tinta, 3);
            texto(r.dominio, x + 62, y + 301, { size: 28, peso: 700 });
            ["Precios y stock de cada local", "Pedidos listos por WhatsApp", "Se actualiza solo cada 15 minutos"].forEach(function (t, i) {
              entrar(s, 1.2 + i * 0.35, 0.35, function () {
                check(x + 62, y + 382 + i * 58, 20);
                texto(t, x + 96, y + 393 + i * 58, { size: 32, peso: 600 });
              }, 10);
            });
          });
        }
      },
      {
        id: "cierre", chip: "Empieza hoy", titulo: "Tú sigues vendiendo. Yo lo armo y lo mantengo.", dur: 6.5,
        dibujar: function (s, d) {
          entrar(s, 0.3, 0.5, function () { marca(500, 470, 120, true); }, 20);
          entrar(s, 1.0, 0.45, function () {
            fuente(40, 800, FT);
            var t = "Escríbeme por WhatsApp", w = ctx.measureText(t).width + 130;
            caja(500 - w / 2, 540, w, 96, 48, COL.wa);
            iconoChat(500 - w / 2 + 52, 584, 20, COL.waTxt);
            texto(t, 500 - w / 2 + 88, 602, { size: 40, peso: 800, fam: FT, color: COL.waTxt });
          }, 16);
          if (d.tel) entrar(s, 1.6, 0.45, function () { texto(d.tel, 500, 740, { size: 68, peso: 800, fam: FT, align: "center" }); }, 14);
          entrar(s, 2.2, 0.45, function () { texto("Hoy funciona con Contífico. ¿Usas otro sistema? Lo revisamos.", 500, 830, { size: 28, peso: 600, color: COL.suave, align: "center", max: 840 }); }, 10);
        }
      }
    ];
    var INTRO = {
      id: "intro", fijo: true, chip: "Video · 1 minuto", titulo: "Mira en un minuto cómo funciona Catalog.", dur: 1.8,
      dibujar: function (s, d) { BASE[2].dibujar(99, d, BASE[2]); }
    };

    /* ---------------- datos de la escena ---------------- */
    function datos() {
      var P = (op.productos ? op.productos() : []) || [];
      P = P.slice();
      var con = P.filter(function (p) { return p.s > 0; });
      if (!con.length) con = P.slice();
      var p4 = con.filter(function (p) { return p.s >= 4; })[0] || P[0];
      var baratos = con.filter(function (p) { return p.p <= 50; }).sort(function (a, b) { return b.p - a.p; });
      var regalo = baratos.length >= 2 ? baratos.slice(0, 2) : con.slice(0, 2);
      var conteo = []; for (var i = 0; i < 9; i++) conteo.push(P[i % P.length]);
      var nombre = (op.nombre && op.nombre()) || "Tu Tienda";
      var cfg = op.config || {}, cr = cfg.casoReal;
      return {
        P: P, nombre: nombre, ini: op.iniciales ? op.iniciales() : inicialesLocal(nombre),
        preguntas: ["¿Tienes " + minus(p4.n) + "?", "¿Cuánto cuesta?", "¿Sigue disponible?", "¿Me lo separas?"],
        pdf: P.slice(0, 3), tiles: P.slice(0, 4), regalo: regalo, conteo: conteo,
        foco: con.filter(function (p) { return p.s >= 2; })[0] || P[0],
        tel: telLocal(cfg.whatsapp),
        real: cr && cr.activo === true && /^https:\/\//.test(cr.enlace || "") ? { nombre: cr.nombre || "", resumen: cr.resumen || "", dominio: dominio(cr.enlace) } : null
      };
    }
    function construir() {
      DAT = datos();
      ESC = (op.intro ? [INTRO] : []).concat(BASE.filter(function (e) { return !e.soloReal || DAT.real; }));
      var t = 0;
      ESC.forEach(function (e) { e.inicio = t; t += e.dur; });
      TOTAL = t;
    }
    function escenaEn(t) { for (var i = ESC.length - 1; i >= 0; i--) if (t >= ESC[i].inicio) return i; return 0; }
    function pintarEscena(i, s) {
      var e = ESC[i];
      fondo();
      cabecera(e, s, e.fijo);
      e.dibujar(e.fijo ? 99 : s, DAT, e);
      pie();
    }
    function portada() {
      fondo();
      cabecera(INTRO, 0, true);
      BASE[2].dibujar(99, DAT, BASE[2]);
      pie();
    }
    function dibujar(t) {
      if (!DAT) construir();
      ctx.setTransform(canvas.width / 1000, 0, 0, canvas.height / 1000, 0, 0);
      ctx.globalAlpha = 1;
      if (t == null || t < 0) { portada(); return; }
      t = clamp(t, 0, TOTAL - 0.001);
      var i = escenaEn(t), e = ESC[i], s = t - e.inicio;
      if (op.reduce) { pintarEscena(i, e.dur); return; }
      if (i > 0 && s < TRANS) {
        pintarEscena(i - 1, ESC[i - 1].dur);
        alfa(s / TRANS, function () { pintarEscena(i, s); });
      } else pintarEscena(i, s);
    }
    function precargar() {
      if (!DAT) construir();
      return Promise.all(DAT.P.map(function (p) {
        var im = imagen(p);
        if (im.complete && im.naturalWidth) return Promise.resolve();
        return new Promise(function (res) { im.addEventListener("load", res); im.addEventListener("error", res); setTimeout(res, 3000); });
      }));
    }

    construir();
    return {
      dibujar: dibujar, precargar: precargar,
      reconstruir: function () { construir(); },
      duracion: function () { return TOTAL; },
      escenaEn: escenaEn,
      escenas: function () { return ESC.map(function (e) { return { id: e.id, chip: e.chip, titulo: e.titulo, extra: e.extra || [], inicio: e.inicio, dur: e.dur }; }); }
    };
  }

  window.VV_VIDEO = { crear: crear, telLocal: telLocal, dinero: dineroLocal };

  /* =====================================================================
     REPRODUCTOR EN LA PÁGINA
     ===================================================================== */
  var VV = window.VV, D = window.VV_DATOS;
  if (!VV || !D || !VV.alListo) return;
  VV.alListo(function () {
    var U = VV.util, $ = U.$, C = window.CONFIG || {};
    var cv = $("vidCanvas"), marco = $("vidMarco");
    if (!cv || !marco) return;
    var reduce = U.reduce;
    var st = { t: 0, play: false, previo: 0, ultimo: 0, raf: 0, auto: false, tocado: false, empezado: false, esc: -1, reanudar: false };
    var motor = crear(cv, {
      nombre: VV.nombre, iniciales: VV.iniciales, productos: function () { return VV.productos; },
      ilustrar: D.ilustrar, dinero: U.dinero, config: C, reduce: reduce,
      alCargar: function () { if (!st.play) pintar(); }
    });

    function tamano() {
      var r = cv.getBoundingClientRect();
      var dpr = Math.min(2, window.devicePixelRatio || 1);
      var px = Math.max(320, Math.min(1400, Math.round((r.width || 400) * dpr)));
      if (cv.width !== px) { cv.width = px; cv.height = px; }
    }
    function fmt(seg) { seg = Math.max(0, Math.floor(seg)); return Math.floor(seg / 60) + ":" + String(seg % 60).padStart(2, "0"); }
    function terminado() { return st.empezado && st.t >= motor.duracion() - 0.02; }
    function ui() {
      var dur = motor.duracion(), seek = $("vidSeek");
      seek.max = String(Math.round(dur * 10));
      seek.value = String(Math.round(st.t * 10));
      seek.style.setProperty("--p", Math.min(100, st.t / dur * 100) + "%");
      seek.setAttribute("aria-valuetext", fmt(st.t) + " de " + fmt(dur));
      $("vidT").textContent = fmt(st.t) + " / " + fmt(dur);
      var b = $("vidBtn");
      b.setAttribute("aria-label", st.play ? "Pausar el video" : "Reproducir el video");
      b.classList.toggle("en-curso", st.play);
      b.querySelector("use").setAttribute("href", st.play ? "#i-pausa" : "#i-play");
      var fin = terminado() && !st.play;
      $("vidFin").hidden = !fin;
      $("vidGrande").hidden = st.play || fin;
      $("vidGrandeTxt").textContent = st.t > 0.05 ? "Seguir viendo" : "Ver el video (1 min)";
    }
    function pintar() { tamano(); motor.dibujar(st.empezado ? st.t : -1); ui(); }
    function anunciar() {
      var i = motor.escenaEn(st.t);
      if (i !== st.esc) { st.esc = i; if (st.tocado) $("vidVivo").textContent = motor.escenas()[i].titulo; }
    }
    function tick(now) {
      if (!st.play) return;
      st.t += Math.min(100, Math.max(0, now - st.previo)) / 1000; st.previo = now;
      if (st.t >= motor.duracion()) { st.t = motor.duracion(); st.play = false; }
      if (now - st.ultimo >= 32 || !st.play) { st.ultimo = now; motor.dibujar(st.t); ui(); anunciar(); }
      if (st.play) st.raf = requestAnimationFrame(tick);
    }
    function play(auto) {
      if (st.play) return;
      if (terminado()) st.t = 0;
      st.empezado = true; st.play = true; st.auto = !!auto;
      st.previo = performance.now(); st.ultimo = 0;
      tamano();
      st.raf = requestAnimationFrame(tick);
      ui();
    }
    function pausa() { st.play = false; cancelAnimationFrame(st.raf); motor.dibujar(st.t); ui(); }
    function tocar() { st.tocado = true; }
    function alternar() { tocar(); if (st.play) pausa(); else play(false); }

    $("vidGrande").addEventListener("click", function () { tocar(); play(false); });
    $("vidBtn").addEventListener("click", alternar);
    cv.addEventListener("click", alternar);
    $("vidSeek").addEventListener("input", function () {
      tocar(); st.empezado = true;
      st.t = clamp(Number(this.value) / 10, 0, motor.duracion());
      motor.dibujar(st.t); ui(); anunciar();
    });
    $("vidOtra").addEventListener("click", function () { tocar(); st.t = 0; play(false); });

    var full = $("vidFull");
    if (marco.requestFullscreen && document.fullscreenEnabled) {
      full.hidden = false;
      full.addEventListener("click", function () {
        if (document.fullscreenElement) document.exitFullscreen().catch(function () {});
        else marco.requestFullscreen().catch(function () {});
      });
      document.addEventListener("fullscreenchange", function () { setTimeout(function () { tamano(); motor.dibujar(st.empezado ? st.t : -1); }, 80); });
    }

    /* Arranca solo cuando se ve (sin sonido; no hay audio) y se detiene si sale de la pantalla.
       Con movimiento reducido no arranca solo. Si la persona lo toca, manda ella. */
    if ("IntersectionObserver" in window) {
      var io = new IntersectionObserver(function (es) {
        es.forEach(function (e) {
          if (st.tocado) return;
          if (e.intersectionRatio >= 0.6 && !reduce && !st.play && !terminado()) play(true);
          else if (e.intersectionRatio < 0.25 && st.play && st.auto) pausa();
        });
      }, { threshold: [0, 0.25, 0.6] });
      io.observe(marco);
    }
    document.addEventListener("visibilitychange", function () {
      if (document.hidden && st.play) { st.reanudar = true; var a = st.auto; pausa(); st.auto = a; }
      else if (!document.hidden && st.reanudar) { st.reanudar = false; play(st.auto); }
    });
    var tRes = 0;
    window.addEventListener("resize", function () { clearTimeout(tRes); tRes = setTimeout(function () { tamano(); motor.dibujar(st.empezado ? st.t : -1); }, 120); });

    function llenarTexto() {
      var ol = $("vidTexto"); ol.textContent = "";
      motor.escenas().forEach(function (e) {
        var li = U.el("li");
        li.appendChild(U.el("strong", "", e.chip + ". "));
        li.appendChild(document.createTextNode(e.titulo + (e.extra.length ? " " + e.extra.join(" ") : "")));
        ol.appendChild(li);
      });
    }
    document.addEventListener("vv:cambio", function () { motor.reconstruir(); llenarTexto(); if (st.t > motor.duracion()) st.t = motor.duracion(); pintar(); });
    if (document.fonts && document.fonts.load) {
      Promise.all([document.fonts.load('800 60px "Bricolage"'), document.fonts.load('700 30px "Bricolage"'), document.fonts.load('400 30px "Hanken"'), document.fonts.load('700 30px "Hanken"')])
        .then(function () { if (!st.play) pintar(); }).catch(function () {});
    }
    llenarTexto();
    pintar();

    VV.video = {
      estado: function () { return { t: st.t, play: st.play, auto: st.auto, empezado: st.empezado, dur: motor.duracion() }; },
      play: function () { tocar(); play(false); }, pausa: function () { tocar(); pausa(); },
      ir: function (t) { tocar(); st.empezado = true; st.t = clamp(t, 0, motor.duracion()); motor.dibujar(st.t); ui(); },
      escenas: function () { return motor.escenas(); }
    };
  });
})();
