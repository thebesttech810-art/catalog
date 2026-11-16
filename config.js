/* ============================================================
   CONFIGURACIÓN DE LA PÁGINA
   Todo lo que puedes cambiar está aquí. Abre este archivo con el
   Bloc de notas, cambia lo que está entre comillas y guarda.
   No borres las comillas ni las comas del final de cada línea.
   Lo que dice [POR CONFIRMAR: …] es un dato que solo tú puedes dar.
   ============================================================ */

window.CONFIG = {

  /* --- MARCA ------------------------------------------------ */
  // Nombre comercial del paquete. Se usa en toda la página.
  // (El título y la vista previa de WhatsApp se cambian aparte: mira LEEME.md.)
  marca: "Catalog",

  /* --- WHATSAPP --------------------------------------------- */
  // Tu número en formato internacional, SIN el signo +, sin espacios ni guiones.
  // Para Ecuador empieza con 593 y sigue tu celular sin el 0 inicial.
  // Mientras esté vacío, los botones abren WhatsApp para que la persona elija el contacto.
  // Tu número 099 696 6975 se escribe así:
  whatsapp: "593996966975",

  /* --- DIRECCIÓN PÚBLICA ------------------------------------- */
  // La dirección de esta página cuando la publiques, por ejemplo la que te dé GitHub Pages.
  // Se usa en el código QR del modo vitrina, en la hoja imprimible y en el generador de enlaces.
  // [POR CONFIRMAR: dirección pública de la página]
  paginaUrl: "https://thebesttech810-art.github.io/catalog/",

  /* --- TUS DATOS (aparecen en el cierre) --------------------- */
  contacto: {
    nombre: "Edu",
    presentacion: "[POR CONFIRMAR: una línea sobre quién eres, por ejemplo tu cargo]",
    ciudad: "[POR CONFIRMAR: ciudad desde la que atiendes]",
    horario: "[POR CONFIRMAR: horario en el que respondes]"
  },

  /* --- MENSAJES DE CADA BOTÓN DE WHATSAPP -------------------- */
  // Es el texto que ya sale escrito cuando alguien toca el botón.
  // Si el visitante escribió el nombre de su negocio, la página lo agrega sola al final.
  mensajes: {
    general:   "Hola, vi la página del catálogo conectado y quiero saber cómo sería para mi negocio.",
    portada:   "Hola, vi la página del catálogo conectado y quiero saber cómo sería para mi negocio.",
    problema1: "Hola, a mí me pasa que me preguntan si tengo stock y tengo que ir a revisar. ¿Cómo me ayudaría el catálogo conectado?",
    problema2: "Hola, me ha pasado que vendí algo que ya no tenía. ¿Cómo lo evita el catálogo conectado?",
    problema3: "Hola, mi catálogo es un PDF que nadie actualiza. Quiero uno que se actualice solo.",
    problema4: "Hola, quiero vender más por WhatsApp pero no alcanzo a responder. ¿Cómo funciona el asistente?",
    problema5: "Hola, no tengo claro qué se vendió ni a qué precio. Quiero saber más de los reportes de ventas.",
    problema6: "Hola, contar el inventario me toma días. Quiero saber más del conteo desde el celular.",
    dosTiendas:"Hola, vi la comparación de las dos tiendas y quiero ser la del catálogo conectado. ¿Cómo empezamos?",
    catalogo:  "Hola, probé la demostración del catálogo y quiero uno así con mis productos.",
    venta:     "Hola, vi cómo el stock baja solo después de una venta. Quiero eso para mi negocio.",
    asistente: "Hola, probé el asistente de la demostración. ¿Cómo sería con los productos de mi tienda?",
    vitrina:   "Hola, quiero el catálogo en la pantalla de mi local. ¿Qué necesito?",
    reporte:   "Hola, me interesan los reportes de ventas. ¿Qué necesito para tenerlos?",
    conteo:    "Hola, me interesa el conteo de inventario desde el celular. ¿Cómo funciona?",
    semana:    "Hola, quiero empezar. Te cuento qué vendo y qué sistema uso.",
    calculadora:"Hola, hice la cuenta del tiempo que se me va respondiendo si tengo stock. Quiero el catálogo conectado.",
    paquete1:  "Hola, me interesa el catálogo conectado solo. ¿Cuánto cuesta y qué necesito?",
    paquete2:  "Hola, me interesa el catálogo con un complemento. ¿Cuánto cuesta y qué necesito?",
    paquete3:  "Hola, me interesa el paquete completo: catálogo, reportes y conteo. ¿Cuánto cuesta y qué necesito?",
    casoReal:  "Hola, vi el catálogo de Electronic Games y quiero uno así para mi negocio.",
    video:     "Hola, vi el video de Catalog y quiero saber cómo sería para mi negocio.",
    cierre:    "Hola, quiero mi propio catálogo conectado. Te cuento qué vendo y qué sistema uso."
  },

  /* --- PAQUETES Y PRECIOS ------------------------------------ */
  // Cambia solo el texto de "precio" y "pago" cuando los definas.
  paquetes: [
    {
      nombre: "Catálogo conectado",
      precio: "[POR CONFIRMAR: precio]",
      incluye: [
        "Tu catálogo con precios y stock de tu sistema",
        "Asistente que responde sobre tus productos",
        "Pedidos que llegan a tu WhatsApp",
        "Modo vitrina para la pantalla del local"
      ],
      recomendado: false
    },
    {
      nombre: "Catálogo con un complemento",
      precio: "[POR CONFIRMAR: precio]",
      incluye: [
        "Todo lo del catálogo conectado",
        "Eliges uno: reportes de ventas o conteo de inventario"
      ],
      recomendado: false
    },
    {
      nombre: "Paquete completo",
      precio: "[POR CONFIRMAR: precio]",
      incluye: [
        "Todo lo del catálogo conectado",
        "Reportes de ventas",
        "Conteo de inventario desde el celular"
      ],
      recomendado: true
    }
  ],
  formaDePago: "[POR CONFIRMAR: forma de pago]",

  /* --- PLAZOS ------------------------------------------------ */
  plazos: {
    primeraSemana: "[POR CONFIRMAR: cuánto demora cada paso]",
    entrega: "[POR CONFIRMAR: tiempo para tenerlo listo]"
  },

  /* --- RESPUESTAS QUE SOLO TÚ PUEDES DAR (preguntas frecuentes) --- */
  respuestas: {
    cuantoDemora:  "[POR CONFIRMAR: tiempo para tenerlo listo]",
    cambiosDiseno: "[POR CONFIRMAR: qué cambios de diseño se pueden pedir]",
    costo:         "[POR CONFIRMAR: precio y forma de pago]",
    cancelar:      "[POR CONFIRMAR: condiciones para cancelar]",
    clave:         "[POR CONFIRMAR: dónde se guarda la clave de conexión con el sistema del cliente]"
  },

  /* --- EJEMPLO REAL (ENCENDIDO) ------------------------------- */
  // Es la sección amarilla que aparece justo debajo de la portada: muestra un catálogo
  // real ya hecho, con un botón para abrirlo y un código QR.
  // Se encendió el 16 de noviembre de 2026, cuando Edu confirmó que puede usar el nombre
  // y mostrar ese catálogo. Para apagarla, cambia "activo: true" por "activo: false".
  casoReal: {
    activo: true,
    nombre: "Electronic Games",
    resumen: "Tienda de videojuegos con tres locales",
    etiqueta: "Ejemplo real, funcionando hoy",
    titulo: "Así quedó el catálogo de una empresa real",
    descripcion: "Electronic Games es una tienda de videojuegos con tres locales en centros comerciales de Quito y el valle. Yo armé su catálogo digital y hoy funciona así. Ábrelo y mira cómo se podría hacer el tuyo.",
    probar: "Ábrelo y pruébalo como lo haría tu cliente:",
    puntos: [
      "Busca un producto y filtra por local: cada uno muestra cuántas unidades hay.",
      "Arma un pedido: queda listo para enviarlo por WhatsApp.",
      "Pregúntale al asistente por un producto.",
      "Fíjate en la hora de actualización: el catálogo se renueva solo cada 15 minutos."
    ],
    boton: "Abrir el catálogo real",
    cierre: "El tuyo se arma con tu nombre, tus colores y tus productos.",
    enlace: "https://electronicgamesec.com/"
  },

  /* --- TESTIMONIOS (VACÍO) ----------------------------------- */
  // Cuando tengas testimonios reales y con permiso, agrégalos así:
  // { texto: "Lo que dijo", nombre: "Nombre", negocio: "Su negocio" },
  testimonios: []
};
