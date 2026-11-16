/* Productos de ejemplo por rubro e ilustraciones dibujadas con código.
   Todo es inventado: nombres sin marca, precios y existencias de ejemplo. */
(function () {
  "use strict";

  var TINTA = "#16183A";
  var COLORES = ["#3A36E0", "#FF7A59", "#0E8577", "#F2B01E", "#8A4FFF", "#E0457B"];

  /* Cada dibujo usa: I = tinta, C = color del producto. Lienzo de 120 × 120. */
  var DIBUJOS = {
    telefono: '<rect x="37" y="12" width="46" height="96" rx="10" fill="I"/><rect x="42" y="19" width="36" height="76" rx="4" fill="C"/><path d="M46 23h15L46 46z" fill="#fff" opacity=".35"/><circle cx="60" cy="101" r="3" fill="#fff"/>',
    tablet: '<rect x="24" y="16" width="72" height="88" rx="9" fill="I"/><rect x="30" y="23" width="60" height="70" rx="3" fill="C"/><path d="M34 27h20L34 54z" fill="#fff" opacity=".35"/><circle cx="60" cy="98" r="2.5" fill="#fff"/>',
    laptop: '<rect x="26" y="26" width="68" height="48" rx="6" fill="I"/><rect x="32" y="32" width="56" height="36" rx="2" fill="C"/><path d="M36 35h18L36 58z" fill="#fff" opacity=".35"/><path d="M14 78h92l-7 12H21z" fill="I"/><rect x="50" y="81" width="20" height="3" rx="1.5" fill="#fff" opacity=".6"/>',
    audifonos: '<path d="M30 70V58a30 30 0 0 1 60 0v12" fill="none" stroke="I" stroke-width="8" stroke-linecap="round"/><rect x="19" y="62" width="22" height="36" rx="10" fill="C" stroke="I" stroke-width="5"/><rect x="79" y="62" width="22" height="36" rx="10" fill="C" stroke="I" stroke-width="5"/>',
    auriculares: '<rect x="26" y="46" width="68" height="54" rx="20" fill="I"/><path d="M26 66h68" stroke="#fff" stroke-width="3" opacity=".5"/><circle cx="60" cy="74" r="4" fill="C"/><circle cx="44" cy="30" r="11" fill="C" stroke="I" stroke-width="5"/><rect x="40" y="34" width="8" height="20" rx="4" fill="I"/><circle cx="76" cy="30" r="11" fill="C" stroke="I" stroke-width="5"/><rect x="72" y="34" width="8" height="20" rx="4" fill="I"/>',
    cargador: '<rect x="46" y="14" width="8" height="24" rx="2" fill="I"/><rect x="66" y="14" width="8" height="24" rx="2" fill="I"/><rect x="32" y="34" width="56" height="62" rx="12" fill="C" stroke="I" stroke-width="5"/><path d="M64 46 50 68h10l-4 16 14-22H60z" fill="I"/>',
    cable: '<path d="M34 40c0 46 52 6 52 50" fill="none" stroke="C" stroke-width="8" stroke-linecap="round"/><rect x="24" y="12" width="20" height="32" rx="5" fill="I"/><rect x="29" y="6" width="10" height="10" rx="2" fill="I"/><rect x="76" y="78" width="20" height="32" rx="5" fill="I"/><rect x="81" y="106" width="10" height="9" rx="2" fill="I"/>',
    funda: '<rect x="34" y="12" width="52" height="96" rx="13" fill="C" stroke="I" stroke-width="5"/><rect x="42" y="20" width="22" height="22" rx="7" fill="I"/><circle cx="49" cy="27" r="3.5" fill="#fff" opacity=".7"/><circle cx="58" cy="36" r="3.5" fill="#fff" opacity=".7"/>',
    reloj: '<rect x="46" y="6" width="28" height="108" rx="7" fill="C" stroke="I" stroke-width="5"/><rect x="33" y="34" width="54" height="52" rx="15" fill="I"/><rect x="40" y="41" width="40" height="38" rx="9" fill="#fff"/><path d="M60 50v11l8 5" fill="none" stroke="I" stroke-width="4" stroke-linecap="round"/>',
    parlante: '<rect x="30" y="14" width="60" height="92" rx="14" fill="I"/><circle cx="60" cy="72" r="20" fill="C"/><circle cx="60" cy="72" r="7" fill="I"/><circle cx="60" cy="34" r="9" fill="C"/>',
    bateria: '<rect x="33" y="16" width="54" height="90" rx="12" fill="C" stroke="I" stroke-width="5"/><rect x="50" y="8" width="20" height="10" rx="3" fill="I"/><path d="M65 38 49 62h11l-5 20 16-25H60z" fill="I"/>',
    mouse: '<rect x="38" y="16" width="44" height="88" rx="22" fill="I"/><path d="M38 52h44" stroke="#fff" stroke-width="3" opacity=".5"/><rect x="56" y="26" width="8" height="18" rx="4" fill="C"/>',
    memoria: '<rect x="44" y="12" width="32" height="24" rx="3" fill="I"/><rect x="50" y="18" width="7" height="8" fill="#fff" opacity=".7"/><rect x="63" y="18" width="7" height="8" fill="#fff" opacity=".7"/><rect x="36" y="34" width="48" height="72" rx="9" fill="C" stroke="I" stroke-width="5"/><circle cx="60" cy="88" r="5" fill="I"/>',
    consola: '<rect x="14" y="42" width="92" height="38" rx="9" fill="I"/><rect x="14" y="56" width="92" height="7" fill="C"/><circle cx="90" cy="50" r="3" fill="#fff"/><rect x="24" y="80" width="12" height="6" rx="2" fill="I"/><rect x="84" y="80" width="12" height="6" rx="2" fill="I"/>',
    control: '<path d="M32 38h56a20 20 0 0 1 20 18l3 24a11 11 0 0 1-20 7l-9-13H38l-9 13a11 11 0 0 1-20-7l3-24a20 20 0 0 1 20-18z" fill="I"/><path d="M28 52h7v-7h8v7h7v8h-7v7h-8v-7h-7z" fill="C"/><circle cx="78" cy="50" r="5.5" fill="C"/><circle cx="90" cy="60" r="5.5" fill="C"/>',
    portatil: '<rect x="8" y="36" width="104" height="50" rx="16" fill="I"/><rect x="36" y="43" width="48" height="36" rx="3" fill="C"/><path d="M40 46h14L40 64z" fill="#fff" opacity=".35"/><circle cx="22" cy="61" r="6" fill="#fff" opacity=".85"/><circle cx="96" cy="54" r="4" fill="#fff" opacity=".85"/><circle cx="100" cy="68" r="4" fill="#fff" opacity=".85"/>',
    juego: '<rect x="28" y="14" width="64" height="92" rx="6" fill="C" stroke="I" stroke-width="5"/><rect x="28" y="14" width="64" height="18" rx="6" fill="I"/><circle cx="60" cy="68" r="17" fill="#fff" opacity=".9"/><path d="M54 59v18l15-9z" fill="I"/>',
    licuadora: '<path d="M38 14h44l-6 56H44z" fill="C" stroke="I" stroke-width="5" stroke-linejoin="round"/><path d="M82 26h10v22H80" fill="none" stroke="I" stroke-width="5"/><rect x="38" y="70" width="44" height="36" rx="8" fill="I"/><circle cx="60" cy="88" r="7" fill="C"/>',
    microondas: '<rect x="10" y="30" width="100" height="60" rx="9" fill="I"/><rect x="18" y="38" width="60" height="44" rx="4" fill="C"/><path d="M22 42h18L22 66z" fill="#fff" opacity=".35"/><circle cx="94" cy="48" r="5" fill="#fff"/><rect x="87" y="62" width="14" height="5" rx="2" fill="#fff" opacity=".7"/><rect x="87" y="72" width="14" height="5" rx="2" fill="#fff" opacity=".7"/>',
    plancha: '<path d="M14 84c3-32 28-46 82-46l8 46z" fill="C" stroke="I" stroke-width="5" stroke-linejoin="round"/><path d="M40 60c8-10 26-12 44-12" fill="none" stroke="I" stroke-width="6" stroke-linecap="round"/><rect x="10" y="84" width="98" height="9" rx="3" fill="I"/>',
    ventilador: '<circle cx="60" cy="46" r="36" fill="#fff" stroke="I" stroke-width="6"/><ellipse cx="60" cy="28" rx="9" ry="16" fill="C"/><ellipse cx="44" cy="55" rx="9" ry="16" fill="C" transform="rotate(-120 44 55)"/><ellipse cx="76" cy="55" rx="9" ry="16" fill="C" transform="rotate(120 76 55)"/><circle cx="60" cy="46" r="7" fill="I"/><rect x="56" y="82" width="8" height="20" fill="I"/><rect x="36" y="100" width="48" height="9" rx="4" fill="I"/>',
    cafetera: '<rect x="26" y="14" width="56" height="92" rx="8" fill="I"/><rect x="36" y="56" width="36" height="36" rx="5" fill="C"/><path d="M72 62h10a8 8 0 0 1 0 22H72" fill="none" stroke="I" stroke-width="5"/><rect x="36" y="24" width="36" height="10" rx="3" fill="#fff" opacity=".7"/><rect x="50" y="42" width="8" height="14" fill="#fff" opacity=".7"/>',
    tv: '<rect x="8" y="22" width="104" height="64" rx="7" fill="I"/><rect x="14" y="28" width="92" height="52" rx="2" fill="C"/><path d="M18 32h30L18 70z" fill="#fff" opacity=".3"/><rect x="54" y="86" width="12" height="10" fill="I"/><rect x="36" y="95" width="48" height="7" rx="3" fill="I"/>',
    freidora: '<rect x="28" y="14" width="64" height="94" rx="18" fill="I"/><circle cx="60" cy="36" r="10" fill="C"/><rect x="38" y="56" width="44" height="40" rx="7" fill="C"/><rect x="53" y="66" width="14" height="22" rx="4" fill="I"/>',
    hervidor: '<path d="M38 30h40l10 70H28z" fill="C" stroke="I" stroke-width="5" stroke-linejoin="round"/><rect x="40" y="18" width="36" height="12" rx="5" fill="I"/><path d="M84 44h12v36H88" fill="none" stroke="I" stroke-width="6" stroke-linecap="round"/><rect x="22" y="98" width="72" height="9" rx="4" fill="I"/>',
    lampara: '<path d="M40 14h40l14 42H26z" fill="C" stroke="I" stroke-width="5" stroke-linejoin="round"/><rect x="56" y="56" width="8" height="42" fill="I"/><rect x="36" y="98" width="48" height="9" rx="4" fill="I"/>',
    mochila: '<path d="M46 24a14 14 0 0 1 28 0" fill="none" stroke="I" stroke-width="6"/><rect x="26" y="24" width="68" height="84" rx="20" fill="C" stroke="I" stroke-width="5"/><rect x="38" y="64" width="44" height="32" rx="7" fill="I"/><rect x="38" y="42" width="44" height="6" rx="3" fill="I"/>',
    termo: '<rect x="42" y="26" width="36" height="84" rx="10" fill="C" stroke="I" stroke-width="5"/><rect x="42" y="10" width="36" height="22" rx="7" fill="I"/><rect x="48" y="56" width="24" height="26" rx="4" fill="#fff" opacity=".6"/>',
    regalo: '<rect x="24" y="48" width="72" height="58" rx="5" fill="C" stroke="I" stroke-width="5"/><rect x="16" y="34" width="88" height="18" rx="4" fill="I"/><rect x="54" y="34" width="12" height="72" fill="#fff"/><path d="M60 34c-12-22-30-10-16 0zM60 34c12-22 30-10 16 0z" fill="C" stroke="I" stroke-width="5" stroke-linejoin="round"/>'
  };

  function ilustrar(tipo, color) {
    var cuerpo = (DIBUJOS[tipo] || DIBUJOS.regalo).replace(/"I"/g, '"' + TINTA + '"').replace(/"C"/g, '"' + color + '"');
    return '<svg viewBox="0 0 120 120" aria-hidden="true" focusable="false">' + cuerpo + "</svg>";
  }

  /* n: nombre · c: categoría · p: precio · e: precio en efectivo (si es menor)
     s: unidades · t: sello · i: dibujo · k: color */
  var RUBROS = {
    celulares: {
      etiqueta: "Celulares y tecnología",
      productos: [
        { n: "Teléfono 128 GB azul", c: "Celulares", p: 219, e: 209, s: 4, t: "Nuevo", i: "telefono", k: 0 },
        { n: "Teléfono 256 GB negro", c: "Celulares", p: 349, s: 2, i: "telefono", k: 4 },
        { n: "Teléfono básico doble chip", c: "Celulares", p: 39.9, s: 9, i: "telefono", k: 2 },
        { n: "Tablet 10 pulgadas 64 GB", c: "Tablets y laptops", p: 169, s: 3, t: "Oferta", i: "tablet", k: 1 },
        { n: "Laptop 14 pulgadas 8 GB", c: "Tablets y laptops", p: 489, e: 469, s: 1, i: "laptop", k: 0 },
        { n: "Audífonos inalámbricos con estuche", c: "Audio", p: 29.9, s: 12, i: "auriculares", k: 3 },
        { n: "Audífonos de diadema con micrófono", c: "Audio", p: 34.9, s: 0, i: "audifonos", k: 5 },
        { n: "Parlante portátil resistente al agua", c: "Audio", p: 44.9, s: 6, t: "Oferta", i: "parlante", k: 1 },
        { n: "Reloj inteligente deportivo", c: "Relojes", p: 59.9, e: 54.9, s: 5, t: "Nuevo", i: "reloj", k: 2 },
        { n: "Reloj inteligente para niños", c: "Relojes", p: 42, s: 2, i: "reloj", k: 5 },
        { n: "Mouse inalámbrico silencioso", c: "Tablets y laptops", p: 14.9, s: 8, i: "mouse", k: 3 },
        { n: "Memoria USB 64 GB", c: "Tablets y laptops", p: 9.9, s: 15, i: "memoria", k: 4 }
      ]
    },
    accesorios: {
      etiqueta: "Accesorios",
      productos: [
        { n: "Cargador rápido 25 W", c: "Carga", p: 14.9, s: 10, i: "cargador", k: 0 },
        { n: "Cable reforzado 2 metros", c: "Carga", p: 6.9, s: 2, i: "cable", k: 1 },
        { n: "Batería portátil 10 000 mAh", c: "Carga", p: 24.9, e: 22.9, s: 6, t: "Oferta", i: "bateria", k: 2 },
        { n: "Batería portátil 20 000 mAh", c: "Carga", p: 34.9, s: 3, i: "bateria", k: 4 },
        { n: "Funda transparente antigolpes", c: "Protección", p: 7.9, s: 14, i: "funda", k: 3 },
        { n: "Funda con tarjetero", c: "Protección", p: 11.9, s: 5, t: "Nuevo", i: "funda", k: 5 },
        { n: "Protector de pantalla de vidrio", c: "Protección", p: 4.9, s: 20, i: "telefono", k: 2 },
        { n: "Audífonos con cable", c: "Audio", p: 8.9, s: 0, i: "audifonos", k: 1 },
        { n: "Audífonos inalámbricos", c: "Audio", p: 27.9, e: 25.9, s: 7, i: "auriculares", k: 0 },
        { n: "Parlante mini", c: "Audio", p: 16.9, s: 4, t: "Nuevo", i: "parlante", k: 3 },
        { n: "Reloj inteligente básico", c: "Varios", p: 32.9, s: 2, i: "reloj", k: 4 },
        { n: "Memoria micro SD 128 GB", c: "Varios", p: 15.9, s: 9, i: "memoria", k: 5 }
      ]
    },
    electrodomesticos: {
      etiqueta: "Electrodomésticos",
      productos: [
        { n: "Licuadora de 5 velocidades", c: "Cocina", p: 49.9, s: 5, i: "licuadora", k: 1 },
        { n: "Freidora de aire 4 litros", c: "Cocina", p: 79.9, e: 74.9, s: 2, t: "Oferta", i: "freidora", k: 0 },
        { n: "Microondas 20 litros", c: "Cocina", p: 109, s: 3, i: "microondas", k: 2 },
        { n: "Cafetera de goteo 12 tazas", c: "Cocina", p: 39.9, s: 6, i: "cafetera", k: 3 },
        { n: "Hervidor eléctrico 1,7 litros", c: "Cocina", p: 24.9, s: 8, t: "Nuevo", i: "hervidor", k: 5 },
        { n: "Plancha a vapor", c: "Hogar", p: 29.9, s: 4, i: "plancha", k: 4 },
        { n: "Ventilador de pedestal 16 pulgadas", c: "Hogar", p: 54.9, s: 7, i: "ventilador", k: 2 },
        { n: "Ventilador de mesa", c: "Hogar", p: 34.9, s: 0, i: "ventilador", k: 1 },
        { n: "Lámpara de escritorio LED", c: "Hogar", p: 19.9, s: 9, i: "lampara", k: 3 },
        { n: "Televisor 43 pulgadas", c: "Entretenimiento", p: 329, e: 315, s: 2, i: "tv", k: 0 },
        { n: "Televisor 55 pulgadas", c: "Entretenimiento", p: 479, s: 1, t: "Nuevo", i: "tv", k: 4 },
        { n: "Parlante con micrófono", c: "Entretenimiento", p: 89.9, s: 3, t: "Oferta", i: "parlante", k: 5 }
      ]
    },
    videojuegos: {
      etiqueta: "Videojuegos",
      productos: [
        { n: "Consola de sobremesa 1 TB", c: "Consolas", p: 599, e: 579, s: 2, i: "consola", k: 0 },
        { n: "Consola portátil retro 64 GB", c: "Consolas", p: 69.9, s: 6, t: "Nuevo", i: "portatil", k: 1 },
        { n: "Consola híbrida", c: "Consolas", p: 449, s: 1, i: "portatil", k: 5 },
        { n: "Control inalámbrico para consola", c: "Controles", p: 64.9, s: 4, i: "control", k: 4 },
        { n: "Control con cable", c: "Controles", p: 24.9, s: 9, t: "Oferta", i: "control", k: 2 },
        { n: "Control retro", c: "Controles", p: 12.9, s: 0, i: "control", k: 3 },
        { n: "Juego de aventuras", c: "Juegos", p: 59.9, s: 5, i: "juego", k: 2 },
        { n: "Juego de carreras", c: "Juegos", p: 49.9, e: 45, s: 3, i: "juego", k: 1 },
        { n: "Juego de fútbol", c: "Juegos", p: 54.9, s: 7, t: "Nuevo", i: "juego", k: 0 },
        { n: "Audífonos para juegos", c: "Accesorios", p: 39.9, s: 2, i: "audifonos", k: 5 },
        { n: "Base de carga para dos controles", c: "Accesorios", p: 22.9, s: 6, i: "cargador", k: 3 },
        { n: "Tarjeta de memoria 256 GB", c: "Accesorios", p: 34.9, s: 8, i: "memoria", k: 4 }
      ]
    },
    otro: {
      etiqueta: "Otro",
      productos: [
        { n: "Mochila urbana", c: "Para llevar", p: 34.9, s: 5, i: "mochila", k: 0 },
        { n: "Mochila para laptop", c: "Para llevar", p: 42.9, e: 39.9, s: 2, t: "Nuevo", i: "mochila", k: 2 },
        { n: "Termo de acero 750 ml", c: "Para llevar", p: 18.9, s: 9, i: "termo", k: 1 },
        { n: "Termo infantil", c: "Para llevar", p: 12.9, s: 0, i: "termo", k: 5 },
        { n: "Lámpara de mesa", c: "Hogar", p: 22.9, s: 4, i: "lampara", k: 3 },
        { n: "Lámpara de noche", c: "Hogar", p: 16.9, s: 7, t: "Oferta", i: "lampara", k: 4 },
        { n: "Ventilador de mesa", c: "Hogar", p: 34.9, s: 3, i: "ventilador", k: 2 },
        { n: "Caja de regalo sorpresa", c: "Regalos", p: 15, s: 12, i: "regalo", k: 5 },
        { n: "Caja de regalo grande", c: "Regalos", p: 24, s: 2, i: "regalo", k: 0 },
        { n: "Reloj de pulsera", c: "Regalos", p: 45, e: 42, s: 6, i: "reloj", k: 1 },
        { n: "Parlante portátil", c: "Regalos", p: 29.9, s: 5, t: "Oferta", i: "parlante", k: 4 },
        { n: "Audífonos inalámbricos", c: "Regalos", p: 27.9, s: 1, i: "auriculares", k: 3 }
      ]
    }
  };

  window.VV_DATOS = {
    rubros: RUBROS,
    colores: COLORES,
    ilustrar: function (prod) { return ilustrar(prod.i, COLORES[prod.k % COLORES.length]); },
    /* Copia nueva de los productos de un rubro, con identificador. */
    copiar: function (rubro) {
      var base = (RUBROS[rubro] || RUBROS.otro).productos;
      return base.map(function (p, idx) {
        return { id: idx, n: p.n, c: p.c, p: p.p, e: p.e || null, s: p.s, t: p.t || "", i: p.i, k: p.k };
      });
    }
  };
})();
