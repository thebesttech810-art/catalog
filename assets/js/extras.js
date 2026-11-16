/* Detalles de interacción: comparación compacta, calculadora con deslizadores,
   accesos a las preguntas, barra de avance y barra de WhatsApp según la sección. */
(function () {
  "use strict";
  var VV = window.VV;
  VV.alListo(function () {
  var U = VV.util, $ = U.$, el = U.el, reduce = U.reduce;

  /* ---------- Comparación: en celular se compara contra una opción a la vez ---------- */
  var botonesVs = document.querySelectorAll(".seg-vs [data-vs]");
  botonesVs.forEach(function (b) {
    b.addEventListener("click", function () {
      $("comp").setAttribute("data-vs", b.getAttribute("data-vs"));
      botonesVs.forEach(function (o) { o.setAttribute("aria-pressed", String(o === b)); });
    });
  });

  /* ---------- Calculadora: valores visibles y equivalencia en jornadas ---------- */
  function calc() {
    var v = Number($("calcVeces").value) || 0, m = Number($("calcMin").value) || 0;
    $("calcVecesO").textContent = String(v); $("calcMinO").textContent = String(m);
    var j = v * m * 30 / 60 / 8, caja = $("calcJor");
    caja.textContent = "";
    var n = Math.min(24, Math.ceil(j));
    for (var i = 0; i < n; i++) {
      var b = el("i");
      if (i === n - 1 && j < n) b.style.setProperty("--lleno", Math.round((j - (n - 1)) * 100) + "%");
      caja.appendChild(b);
    }
    var r = Math.round(j * 10) / 10;
    $("calcEq").textContent = !j ? "" : j < 1 ? "Es menos de una jornada de 8 horas."
      : "Equivale a " + String(r).replace(".", ",") + (r === 1 ? " jornada" : " jornadas") + " de 8 horas de trabajo.";
  }
  $("calc").addEventListener("input", function () { calc(); VV.marcar("calculadora"); });
  calc();

  /* ---------- Preguntas: de la preocupación a la respuesta ---------- */
  var faqs = document.querySelectorAll("#preguntas .faq details");
  document.querySelectorAll("#miedos [data-faq]").forEach(function (b) {
    b.addEventListener("click", function () {
      var d = faqs[Number(b.getAttribute("data-faq")) - 1];
      if (!d) return;
      faqs.forEach(function (o) { o.classList.remove("dest"); });
      d.open = true; d.classList.add("dest");
      d.scrollIntoView({ behavior: reduce ? "auto" : "smooth", block: "center" });
      d.querySelector("summary").focus({ preventScroll: true });
    });
  });

  /* ---------- Cierre: lo que el visitante ya probó y lo que le falta ---------- */
  function recorrido() {
    var L = VV.demosLista, hechos = L.filter(function (d) { return VV.probado[d[0]]; });
    $("recorrido").hidden = !hechos.length;
    if (!hechos.length) return;
    $("recT").textContent = hechos.length === L.length ? "Probaste las " + L.length + " demostraciones." : "Probaste " + hechos.length + " de " + L.length + " demostraciones.";
    var ul = $("recL"); ul.textContent = "";
    L.forEach(function (d) {
      var li = el("li");
      if (VV.probado[d[0]]) { li.className = "hecho"; li.textContent = d[1].charAt(0).toUpperCase() + d[1].slice(1); }
      else {
        var b = el("button", "rec-ir", "Probar " + d[1]); b.type = "button";
        b.addEventListener("click", function () { VV.irA(d[2]); });
        li.appendChild(b);
      }
      ul.appendChild(li);
    });
  }
  document.addEventListener("vv:probado", recorrido);

  /* ---------- Barra de avance de lectura ---------- */
  var barra = $("progreso"), pendiente = false;
  function avance() {
    pendiente = false;
    var max = document.documentElement.scrollHeight - window.innerHeight;
    barra.style.width = (max > 0 ? Math.min(100, window.scrollY / max * 100) : 0) + "%";
  }
  window.addEventListener("scroll", function () { if (!pendiente) { pendiente = true; requestAnimationFrame(avance); } }, { passive: true });
  requestAnimationFrame(avance);

  /* ---------- La barra de WhatsApp del celular habla de lo que estás viendo ---------- */
  var CLAVES = { "ejemplo-real": "casoReal", "dos-tiendas": "dosTiendas", catalogo: "catalogo", reporte: "reporte", conteo: "conteo", "primera-semana": "semana" };
  var enlace = document.querySelector("#barraWa [data-wa]");
  if (enlace && "IntersectionObserver" in window) {
    var io = new IntersectionObserver(function (es) {
      es.forEach(function (e) {
        if (!e.isIntersecting) return;
        enlace.setAttribute("data-wa", CLAVES[e.target.id] || "general");
        enlace.href = VV.wa(enlace.getAttribute("data-wa"));
      });
    }, { rootMargin: "-45% 0px -45% 0px" });
    document.querySelectorAll("main > section[id]").forEach(function (s) { io.observe(s); });
  }
  });
})();
