# 🏠 CASAS LOS MOCHIS — Plataforma Inmobiliaria Digital
## Arquitectura, Diseño y Desarrollo — Documento Técnico v4.3

> **Stack:** Vite + JavaScript · Tailwind CSS · Django REST Framework · PostgreSQL · MinIO · Cloudflare R2 · PWA
> **Enfoque:** Agéntico · Seguro · Escalable · Auditable · Multi-tenant · Mobile-first · Costo-eficiente

---

## 0. Descripción del Proyecto (Contexto para el Agente de Desarrollo)

### ¿Qué es Casas Los Mochis?

**Casas Los Mochis** es una plataforma inmobiliaria digital completa para la ciudad de Los Mochis, Sinaloa, México. El proyecto resuelve dos necesidades simultáneas:

1. **Para el público** — Un catálogo web donde cualquier persona puede buscar, filtrar y contactar a un asesor o publicador para comprar o rentar propiedades (casas, departamentos, locales, terrenos, bodegas, oficinas). En Los Mochis (modelo `full_crm`), el contacto es siempre humano y directo: el sistema conecta al interesado con el asesor asignado vía WhatsApp, sin intermediarios. En ciudades externas (modelo `hosting`), el contacto pasa primero por un bot de calificación automática que filtra al prospecto antes de conectarlo con el publicador.

2. **Para la empresa** — Un sistema CRM interno donde los colaboradores (asesores inmobiliarios) gestionan todo su trabajo: publican propiedades, registran prospectos, agendan citas, dan seguimiento al proceso de venta/renta (incluyendo trámite de crédito bancario, INFONAVIT, FOVISSSTE, etc.), controlan la documentación del cliente, registran apartados, cierran ventas y registran entregas. Los administradores supervisan todo, asignan prospectos, configuran comisiones y ven métricas del negocio.

### ¿Por qué existe este proyecto?

Hoy los asesores inmobiliarios de Los Mochis trabajan con hojas de cálculo (Excel), WhatsApp y memoria. Esto genera:
- Prospectos perdidos por falta de seguimiento.
- Información dispersa entre colaboradores.
- Sin visibilidad del estado real del negocio en tiempo real.
- Propiedades publicadas de forma desorganizada en redes sociales sin catálogo centralizado.

**Casas Los Mochis** centraliza todo en una sola plataforma: el portal que el cliente ve y el CRM que el asesor usa son el mismo sistema, conectados en tiempo real.

### ¿Para quién es?

| Usuario | Necesidad principal |
|---------|-------------------|
| **Comprador/Arrendatario** | Encontrar propiedad, filtrar por precio/tipo/crédito, contactar asesor fácilmente |
| **Vendedor particular** | Publicar su propiedad con un asesor que lo represente |
| **Colaborador / Asesor** | Tener todo su trabajo organizado: prospectos, citas, documentos, comisiones |
| **Supervisor** | Ver y gestionar el rendimiento de su equipo |
| **Administrador** | Control total del negocio: usuarios, propiedades, métricas, publicidad |

### ¿Qué hace único a este sistema?

- El portal público y el CRM son el mismo sistema — no hay sincronización ni duplicación de datos.
- **Modelo `full_crm` (Los Mochis):** el contacto es siempre persona a persona (WhatsApp directo al asesor asignado), generando confianza inmediata. El seguimiento riguroso ocurre dentro del CRM.
- **Modelo `hosting` (ciudades externas):** el bot de WhatsApp filtra y califica automáticamente al prospecto antes de conectarlo con el publicador — el diferenciador clave frente a Inmuebles24.
- El sistema es **agéntico**: cuando un visitante contacta a un asesor o el bot captura un prospecto, el lead se crea solo en el CRM, se asigna al asesor correcto y se disparan notificaciones automáticas.
- Integración con redes sociales para publicar propiedades y captar prospectos directamente desde Meta (Facebook/Instagram), Google y TikTok.
- Todo queda auditado: cada acción de cada usuario queda registrada permanentemente.

---

## 1. Arquitectura General del Sistema

### 1.1 Diagrama de Alto Nivel

```
┌─────────────────────────────────────────────────────────────────────┐
│                            USUARIOS                                  │
│  Comprador/Arrendatario  │  Asesor/Colaborador  │  Administrador    │
└──────────┬───────────────┴──────────┬────────────┴──────────┬───────┘
           │                          │                        │
           │ HTTPS                    │ HTTPS + JWT            │
           ▼                          ▼                        ▼
┌──────────────────────────────────────────────────────────────────────┐
│                    Cloudflare (DNS + CDN + WAF)                       │
│  Por qué: Protección DDoS, SSL gratuito, caché de assets estáticos,  │
│  WAF sin costo adicional en plan gratuito. Primera línea de defensa. │
└──────────┬───────────────────────────────────────────────────────────┘
           │
┌──────────▼────────────────────────────────────────────────────────────┐
│              FRONTEND — Vite + JavaScript + Tailwind CSS               │
│                                                                        │
│  casaslosmochis.com/          → Portal público (catálogo)              │
│  casaslosmochis.com/crm/      → CRM interno (auth requerida)           │
│  casaslosmochis.com/crm/admin → Panel admin (rol admin requerido)      │
│                                                                        │
│  Por qué Vite: Build ultra-rápido, tree-shaking nativo, HMR en dev,   │
│  configuración simple. Sin source maps en producción = código          │
│  ofuscado que no se puede inspeccionar ni revertir.                    │
└──────────┬────────────────────────────────────────────────────────────┘
           │ REST API / JSON
┌──────────▼────────────────────────────────────────────────────────────┐
│              BACKEND — Django 5 + Django REST Framework                │
│                                                                        │
│  Por qué Django: Framework maduro, ORM potente, migraciones,          │
│  serializers, permisos, admin incluido, ecosistema Python amplio.      │
│  DRF agrega: ViewSets, throttling, autenticación JWT, paginación       │
│  y documentación automática (Swagger/OpenAPI) con mínimo código.       │
│                                                                        │
│  ┌─────────────┐ ┌──────────────┐ ┌──────────┐ ┌──────────────────┐  │
│  │ Auth / JWT  │ │ API v1       │ │ Celery   │ │ Audit Middleware │  │
│  │ Refresh     │ │ ViewSets     │ │ Workers  │ │ Logs de acciones │  │
│  │ Blacklist   │ │ Permisos RBAC│ │ Tasks    │ │ estructurados    │  │
│  └─────────────┘ └──────────────┘ └──────────┘ └──────────────────┘  │
└───┬────────────────────┬──────────────────────┬───────────────────────┘
    │                    │                      │
┌───▼──────────┐  ┌──────▼──────────┐  ┌───────▼──────────────────────┐
│ PostgreSQL   │  │ Redis 7         │  │ MinIO                         │
│ con RLS      │  │                 │  │                               │
│              │  │ Por qué Redis:  │  │ Por qué MinIO: Almacenamiento │
│ Por qué PG:  │  │ Cache de API,   │  │ de objetos S3-compatible,     │
│ ACID, RLS    │  │ rate limiting,  │  │ self-hosted = costo $0 en     │
│ nativo, JSONB│  │ cola de Celery, │  │ storage. Fotos de propiedades,│
│ índices,     │  │ sesiones JWT    │  │ docs del cliente, contratos,  │
│ robustez     │  │ blacklist       │  │ planos. Acceso por URL firmada │
└──────────────┘  └─────────────────┘  └──────────────────────────────┘
```

---

## 2. Stack Tecnológico — Decisiones Justificadas

### 2.1 Frontend

| Tecnología | Por qué | Para qué |
|-----------|---------|----------|
| **Vite + JavaScript** | Build rápido, sin configuración compleja, amplia adopción. JS en lugar de TS reduce la curva de entrada para colaboradores del proyecto. | Compilar y servir el portal público y el CRM como SPA optimizada |
| **Tailwind CSS** | Utility-first, CSS purgeado en producción (tamaño mínimo), no requiere un archivo de estilos separado que mantener | Dar estilo consistente y responsivo a todos los componentes |
| **React (vía Vite)** | Componentes reutilizables, ecosistema enorme, React Query para cache de servidor | Construir UI reactiva del portal y del CRM |
| **React Query (TanStack)** | Cache automático de peticiones, re-fetch inteligente, estados de loading/error listos | Reducir llamadas repetidas a la API, dar UX fluida sin esperas |
| **Zustand** | Store global ligero, sin boilerplate de Redux | Manejar estado global: usuario autenticado, filtros, carrito de favoritos |
| **React Router v6** | Routing declarativo, lazy loading de páginas por ruta | Separar el portal público del CRM en rutas protegidas por rol |
| **Zod** | Validación de esquemas tipada | Validar formularios en cliente antes de enviar al servidor |

**Configuración de producción (seguridad):**
```js
// vite.config.js
export default defineConfig({
  build: {
    sourcemap: false,        // Sin source maps — el código no es legible por terceros
    minify: 'terser',        // Ofuscación agresiva de variables y funciones
    rollupOptions: {
      output: {
        manualChunks: {      // Code splitting: cada módulo del CRM carga solo cuando se necesita
          'vendor': ['react', 'react-dom'],
          'crm-leads': ['./src/pages/crm/leads'],
          'crm-sales': ['./src/pages/crm/sales'],
        }
      }
    }
  }
})
```

---

### 2.2 Backend

| Tecnología | Por qué | Para qué |
|-----------|---------|----------|
| **Django 5** | Maduro, seguro por defecto, ORM incluido, migraciones, admin | Framework principal del servidor |
| **Django REST Framework** | Estándar de facto para APIs en Django. Serializers, ViewSets, throttling, autenticación | Exponer todos los endpoints de la API |
| **djangorestframework-simplejwt** | JWT estándar con refresh tokens y blacklist sobre Redis | Autenticación stateless escalable entre múltiples instancias |
| **Celery** | Worker asíncrono para tareas que no deben bloquear la petición HTTP | Envío de emails, mensajes WhatsApp, reportes, alertas automáticas |
| **Gunicorn + uvicorn** | WSGI/ASGI production-ready, múltiples workers | Servir Django en producción con concurrencia real |
| **django-prometheus** | Expone métricas en `/metrics` sin dependencia de servicios externos | Alimentar el dashboard de métricas interno del administrador |
| **structlog** | Logs en formato JSON estructurado | Logs legibles por máquina, con correlación de request_id |
| **django-cors-headers** | Control de CORS por dominio | Permitir solo el frontend propio consumir la API |

---

### 2.3 Base de Datos

| Tecnología | Por qué | Para qué |
|-----------|---------|----------|
| **PostgreSQL 16** | ACID, RLS nativo, JSONB para datos flexibles, índices GIN/GiST para búsquedas | Base de datos principal de todo el sistema |
| **RLS (Row Level Security)** | Segunda línea de defensa en la DB: aunque haya un bug en el código, la DB no devuelve datos que no corresponden al usuario | Aislar datos entre colaboradores: cada asesor solo ve sus prospectos y ventas |
| **psycopg3** | Driver PostgreSQL moderno para Python | Conectar Django a PostgreSQL de forma eficiente |

---

### 2.4 Almacenamiento de Archivos — MinIO

**¿Por qué MinIO?**
MinIO es un servidor de almacenamiento de objetos compatible con la API de Amazon S3, pero que se puede alojar en el propio servidor. Esto significa **costo $0 en storage** — se paga solo el disco del servidor, no por GB almacenado como en servicios externos.

**¿Para qué se usa?**

| Tipo de archivo | Bucket | Acceso |
|----------------|--------|--------|
| Fotos de propiedades | `properties-media` | Público (URLs directas servidas por el portal) |
| Planos y renders de proyectos | `properties-plans` | Público |
| INE, CURP, comprobantes del prospecto | `leads-documents` | **Privado** — URL firmada temporal (expira en 1h) |
| Contratos firmados | `contracts` | **Privado** — Solo admin y asesor asignado |
| Escrituras, avalúos | `legal-documents` | **Privado** — Solo admin |
| Facturas y tickets de gastos | `expenses-receipts` | Privado — Colaborador y admin |

**¿Cómo funciona?**
```
Asesor sube foto → Frontend envía al backend → Backend genera URL pre-firmada de MinIO
→ Frontend sube directo a MinIO (no pasa por Django) → Django guarda solo la referencia (path)
→ Portal consulta URL → Backend genera URL de descarga firmada → Imagen se sirve desde MinIO
```

**¿Por qué URL firmadas para documentos privados?**
Un documento privado (INE, contrato) nunca tiene URL pública. Cuando el sistema necesita mostrarlo, genera una URL que expira en 60 minutos y solo funciona para ese archivo. Si alguien copia el link y lo comparte, en una hora deja de funcionar.

**Configuración MinIO:**
```python
# settings/base.py
MINIO_ENDPOINT = env('MINIO_ENDPOINT')          # ej: storage.casaslosmochis.com:9000
MINIO_ACCESS_KEY = env('MINIO_ACCESS_KEY')
MINIO_SECRET_KEY = env('MINIO_SECRET_KEY')
MINIO_USE_HTTPS = True

BUCKETS = {
    'PROPERTIES_MEDIA': 'properties-media',      # Público
    'PROPERTIES_PLANS': 'properties-plans',       # Público
    'LEADS_DOCUMENTS': 'leads-documents',         # Privado
    'CONTRACTS': 'contracts',                     # Privado
    'LEGAL_DOCUMENTS': 'legal-documents',         # Privado
    'EXPENSES': 'expenses-receipts',              # Privado
}
```

---

### 2.5 Caché y Cola — Redis

**¿Por qué Redis?**
Redis es una base de datos en memoria ultrarrápida. Se usa para múltiples propósitos en el sistema, evitando instalar varias herramientas separadas.

| Uso | Por qué | Para qué |
|-----|---------|----------|
| **Caché de API** | Evitar consultas repetidas a PostgreSQL para datos que cambian poco | Catálogo de propiedades, estadísticas del dashboard |
| **Rate limiting** | Redis lleva contadores por IP/usuario que persisten entre workers | Limitar intentos de login, spam de formularios de contacto |
| **Cola de Celery** | Celery necesita un broker de mensajes para encolar tareas | Procesar emails, notificaciones WhatsApp, alertas en background |
| **JWT Blacklist** | Guardar tokens invalidados (logout) que aún no expiraron | Que el logout sea inmediato aunque el token siga siendo válido |

---

### 2.6 Integración con Redes Sociales

Sí, el sistema puede conectarse con redes sociales de dos maneras:

#### A) Captura de prospectos desde anuncios (Meta Lead Ads / TikTok Lead Ads)

**¿Por qué?** Cuando un anuncio de Facebook/Instagram tiene un formulario de contacto nativo ("Lead Ad"), el prospecto llena su nombre y teléfono dentro de la red social sin salir de ella. La tasa de conversión es mucho mayor que llevarlos al sitio. Con la integración, ese prospecto entra automáticamente al CRM.

**¿Para qué?** El administrador configura sus campañas en Meta Ads / TikTok Ads. Cuando alguien llena el formulario del anuncio, el sistema recibe los datos vía webhook y crea el Lead en el CRM automáticamente, asignado al asesor correcto.

```
Usuario ve anuncio en FB/IG → Llena formulario nativo de Meta Lead Ads
→ Meta envía webhook a: POST /api/v1/webhooks/meta/leads/
→ Django crea Lead con source="facebook_ads" → Celery notifica al asesor por WhatsApp
→ El prospecto aparece en el CRM en segundos, sin intervención manual
```

**Plataformas soportadas:**
| Red Social | Tipo de integración | Costo |
|-----------|-------------------|-------|
| **Meta (Facebook + Instagram)** | Meta Lead Ads Webhook + Meta Conversions API | Gratis (API pública) |
| **TikTok** | TikTok Lead Generation Webhook | Gratis (API pública) |
| **Google** | Google Ads Lead Form Extensions vía Zapier o webhook directo | Gratis (Google no tiene webhook nativo, se puede usar Zapier gratuito) |

#### B) Publicación automática en redes sociales

**¿Por qué?** Cuando un asesor publica una propiedad nueva, poder compartirla automáticamente en la página de Facebook/Instagram de Casas Los Mochis ahorra tiempo y aumenta el alcance.

**¿Para qué?** Al activar una propiedad, el administrador puede elegir publicarla en Facebook/Instagram desde el mismo CRM, sin entrar a las redes sociales.

```
Admin activa propiedad → Checkbox "Publicar en redes sociales"
→ Celery task: llama Meta Graph API → Publica en página de FB e IG
→ Adjunta primera foto + descripción + precio + link a la propiedad
→ Se registra el ID del post en la propiedad para poder eliminarlo si se desactiva
```

**Implementación:**
```python
# apps/social/tasks.py (Celery task)
@app.task
def publish_to_meta(property_id):
    prop = Property.objects.get(id=property_id)
    graph = facebook.GraphAPI(access_token=settings.META_PAGE_TOKEN)
    graph.put_photo(
        image=prop.cover_image_url,
        message=f"{prop.title}\n💰 ${prop.price:,.0f} MXN\n🏠 {prop.type} en {prop.operation}\n"
                f"📍 {prop.city}\n🔗 casaslosmochis.com/propiedad/{prop.id}"
    )
```

#### C) Pixel de seguimiento (remarketing)

**¿Por qué?** El Meta Pixel y Google Analytics 4 permiten hacer remarketing: mostrar anuncios solo a personas que ya visitaron el sitio o vieron una propiedad específica. Esto reduce el costo por prospecto.

**¿Para qué?** El administrador ve en el panel cuántos visitantes vinieron de cada red social, qué propiedades generaron más interés y cuánto costó cada lead.

```html
<!-- index.html — Solo en producción -->
<script>
  // Meta Pixel (Facebook/Instagram)
  fbq('init', import.meta.env.VITE_META_PIXEL_ID);
  fbq('track', 'PageView');
  // En detalle de propiedad: fbq('track', 'ViewContent', { value: precio, currency: 'MXN' })
  // Al agendar cita: fbq('track', 'Lead')
</script>
```

---

## 3. Módulos del CRM — Detalle Funcional

Basados en la operación real de una asesoría inmobiliaria en Los Mochis:

### 3.1 Dashboard
**Por qué:** Los asesores y admins necesitan ver el estado del negocio de un vistazo al entrar al sistema, sin navegar entre módulos.
**Para qué:** Tomar decisiones rápidas: ¿cuántos prospectos sin gestionar hoy?, ¿cuántas citas esta semana?, ¿qué vendedor va mejor?

KPIs mostrados:
- Prospectos totales / nuevos esta semana
- Citas agendadas este mes
- Apartados vigentes (con alerta de vencimiento)
- Ventas cerradas / en proceso
- Entregas pendientes
- Gráfica de pipeline: cuántos prospectos hay en cada etapa
- Ranking de asesores por ventas (solo admin/supervisor)

### 3.2 Seguimiento de Prospectos (Pipeline)
**Por qué:** El mayor problema de las inmobiliarias pequeñas es perder prospectos por falta de seguimiento. Un pipeline visual obliga a mantener el estado actualizado.
**Para qué:** Que cada asesor sepa exactamente qué tiene que hacer hoy con cada prospecto.

Estados del pipeline:
`Nuevo → Contactado → Visita Agendada → Visita Realizada → Propuesta Enviada → Apartado → En Trámite → Venta Cerrada / Perdido`

Campos por prospecto: ID · Fecha registro · Nombre · Teléfono · Correo · Asesor asignado · Desarrollo/Proyecto · Modelo de casa · Precio de interés · Fuente del lead · Estado · Fecha última gestión · Próxima acción · Fecha próxima acción · Notas · Temperatura (caliente/tibio/frío).

### 3.3 Agenda de Citas
**Por qué:** Las citas son el momento de mayor avance en el proceso de venta. Sin control de agenda, se pierden o se duplican.
**Para qué:** Que el asesor nunca olvide una cita y que al agendar desde el portal, el asesor sea notificado de inmediato.

Campos: # Cita · ID Prospecto · Cliente · Fecha · Hora · Asesor · Tipo (visita/llamada/reunión/videollamada) · Estatus · Resultado · Seguimiento post-cita · Reagendada para · Notas · Desarrollo · Modelo de interés.

### 3.4 Control de Apartados
**Por qué:** Un apartado es un compromiso económico temporal. Si vence y nadie lo gestiona, se pierde la venta.
**Para qué:** Controlar vencimientos, saber qué apartados convirtieron en venta y cuáles se cayeron.

Campos: # Apartado · ID Prospecto · Cliente · Teléfono · Fecha apartado · Desarrollo · Manzana/Lote · Modelo · Precio total · Monto apartado · Fecha vencimiento · Asesor · Estatus · ¿Convirtió en venta?

Alerta automática: 3 días antes del vencimiento → notificación al asesor y supervisor.

### 3.5 Ventas Cerradas
**Por qué:** Registro oficial de ingresos y comisiones. Base para calcular el pago a asesores.
**Para qué:** Saber cuánto se ha vendido, a qué precio, con qué tipo de crédito y cuánta comisión generó cada venta.

Campos: # Venta · ID Prospecto · Nombre · Teléfono · Correo · Fecha venta · Desarrollo · Modelo · Precio venta · Tipo crédito · Asesor · Comisión (%) · Comisión ($) calculada automáticamente · Fecha entrega pactada · Observaciones.

Split de comisión: posibilidad de dividir entre dos asesores con porcentajes configurables.

### 3.6 Ventas en Proceso (Trámite de Crédito)
**Por qué:** Entre la venta firmada y la entrega, hay semanas o meses de trámite bancario/INFONAVIT. Este proceso tiene etapas específicas que hay que monitorear.
**Para qué:** Que el asesor y el admin sepan en qué etapa va cada crédito y qué está bloqueando el avance.

Campos: # Folio · ID Prospecto · Cliente · Teléfono · Desarrollo · Lote/Casa · Precio · Tipo crédito · Etapa actual · % Avance · Asesor · Banco/Organismo · Ejecutivo del banco · Documentos entregados · Fecha estimada de cierre · Notas.

Tipos de crédito y sus etapas: Contado · Bancario · INFONAVIT · FOVISSSTE · INFONAVIT Total · Cofinavit · Crédito propio del desarrollador.

### 3.7 Control de Entregas
**Por qué:** La entrega de la propiedad es el momento final de la venta. Una mala entrega arruina la experiencia del cliente y las referencias futuras.
**Para qué:** Asegurarse de que cada entrega ocurra en la fecha pactada, con el acta firmada y las llaves entregadas.

Campos: # Entrega · ID Prospecto · Cliente · Teléfono · Desarrollo · Casa/No. · Fecha pactada · Fecha real · Estatus entrega · Firma acta · Llaves entregadas · Satisfacción del cliente.

### 3.8 Checklist de Documentación
**Por qué:** El trámite de crédito requiere hasta 20 documentos diferentes según el tipo de crédito. Sin control, siempre falta algo y el trámite se retrasa.
**Para qué:** Que el asesor sepa exactamente qué documentos tiene el cliente y cuáles faltan, con % de completitud visible.

Documentos por cliente: INE/IFE · CURP · RFC · Acta de nacimiento · Comprobante de domicilio · Comprobante de ingresos · Constancia IMSS · Estado de cuenta (3 meses) · Declaración fiscal · Carta de trabajo · Acta de matrimonio · Solicitud de crédito · Historial crediticio · Avalúo · Escrituras · Contrato de compra-venta · Firma ante notaría.

Cada documento se puede **cargar directamente** al sistema (guardado en MinIO, bucket privado, acceso con URL firmada).

### 3.9 Gastos Operativos
**Por qué:** El negocio tiene costos: publicidad, notaría, papelería, gasolina. Sin registro, no se sabe la rentabilidad real.
**Para qué:** Llevar control de egresos por proyecto/desarrollo para calcular utilidad real por venta.

Campos: # Gasto · Concepto · Fecha · Proveedor · Categoría · Proyecto/Desarrollo · Monto · IVA · Total · Forma de pago · Factura/Ticket (archivo en MinIO) · Observaciones.

### 3.10 Gestión de Propiedades (portal + CRM)
**Por qué:** Las propiedades son el producto central del negocio. Necesitan estar bien presentadas en el portal y bien organizadas internamente.
**Para qué:** Que los asesores puedan publicar propiedades con toda la información y fotos necesarias, y que el portal las muestre de forma atractiva y filtrable.

Tipos de propiedad: Casa · Departamento · Local comercial · Terreno · Bodega/Nave industrial · Oficina · Rancho/Campo.
Tipos de operación: Venta · Renta.
Financiamiento aceptado: Contado · Bancario · INFONAVIT · FOVISSSTE · INFONAVIT Total · Cofinavit · Crédito del desarrollador.
Características: Recámaras · Baños · Estacionamientos · m² construidos · m² de terreno · Amenidades (alberca, jardín, roof garden, vigilancia, etc.).
Fotos: Hasta 30 imágenes con orden configurable (drag & drop). Cover image destacada. Guardadas en MinIO bucket público.
Estados de la propiedad: Borrador → En revisión → Activa → En proceso → Vendida/Rentada → Inactiva.

---

## 4. Portal Público — Experiencia del Usuario

### 4.1 Flujo del Comprador/Arrendatario

El flujo de contacto varía según el modelo de negocio del tenant:

**Modelo `full_crm` (ej. Los Mochis) — Contacto directo:**
```
1. Llega al sitio (buscador, redes sociales, anuncio, recomendación)
2. Ve el catálogo con propiedades destacadas
3. Aplica filtros: tipo, operación, precio, financiamiento, características, ubicación
4. Abre el detalle de una propiedad
5. Ve galería de fotos, descripción completa, mapa de ubicación, perfil del asesor
6. Toca "Contactar por WhatsApp" → abre WhatsApp con mensaje pre-llenado
   directo al número personal del asesor asignado a esa propiedad
7. El asesor atiende al prospecto en el CRM desde el primer contacto
```

> **¿Por qué sin bot de filtro aquí?** En el modelo `full_crm` los asesores son propios de la empresa y tienen acceso al CRM completo con pipeline Kanban, citas, documentos y seguimiento riguroso desde el primer contacto. El seguimiento interno es lo suficientemente estricto para que no se necesite un filtro automatizado de entrada — el asesor gestiona cada prospecto directamente. Agregar un bot en medio sería poner un intermediario donde no hace falta y rompería la confianza inmediata que genera el contacto persona a persona.

**Modelo `hosting` (ej. Guasave, Navojoa) — Filtro automático:**
```
1. Llega al sitio
2. Ve el catálogo con propiedades del publicador
3. Toca "Contactar"
4. El bot de WhatsApp inicia el flujo de calificación automática
5. Si califica (score ≥ 40): asesor CLM recibe el prospecto y conecta con el publicador
6. Si no califica (score < 40): seguimiento automatizado
```

> **¿Por qué con bot aquí?** En el modelo `hosting` no hay asesores propios gestionando cada propiedad. El bot es la única herramienta de calidad que protege el valor del servicio — el publicador recibe prospectos ya filtrados, que es el diferenciador clave frente a portales nacionales como Inmuebles24.

### 4.2 Flujo del Vendedor Particular

```
1. Llega al sitio y toca "Quiero vender mi propiedad"
2. Llena formulario: tipo, ubicación, precio aproximado, teléfono
3. El sistema crea un Lead con source="vendedor" y notifica al admin
4. Admin asigna a un asesor → asesor contacta para captar la propiedad
```

### 4.3 Contacto Directo — Por Qué WhatsApp (modelo full_crm)

WhatsApp es el canal de comunicación principal en México, especialmente en ciudades como Los Mochis. En el modelo `full_crm`, el contacto es siempre directo entre el interesado y el asesor asignado a esa propiedad — sin chatbots, sin formularios intermedios. Este contacto persona a persona genera más confianza y más conversiones que cualquier intermediario automatizado. El número que recibe el mensaje es el del asesor, no un número genérico de la empresa.

```
https://wa.me/526xxxxxxxxx?text=Hola,%20vi%20la%20propiedad%20{titulo}%20en%20Casas%20Los%20Mochis%20y%20me%20interesa%20más%20información.
```

El asesor atiende el contacto y desde ese momento gestiona el prospecto en el CRM — lo registra, lo agrega al pipeline, agenda citas y da seguimiento completo. El CRM interno hace el trabajo de seguimiento riguroso que en el modelo `hosting` hace el bot.

**En el modelo `hosting`**, el número de WhatsApp en la ficha de la propiedad pertenece al número corporativo de la ciudad (ej. `casasguasave.com`), y el mensaje lo recibe el bot de calificación antes de conectar al interesado con el publicador.

---

## 5. Sistema Agéntico — Automatizaciones

**¿Por qué "agéntico"?** El sistema no solo almacena datos: actúa de forma autónoma cuando ocurren eventos, reduciendo el trabajo manual de los asesores y evitando que prospectos o tareas se pierdan en el olvido.

| Evento disparador | Acción automática del sistema | Por qué es importante |
|------------------|-------------------------------|----------------------|
| Visitante agenda cita en el portal | Crea Lead en CRM + asigna al asesor de la propiedad + envía WhatsApp al asesor con datos del prospecto | El asesor es notificado en segundos, no al día siguiente |
| Lead capturado de Meta/TikTok Ads | Crea Lead en CRM + asigna según reglas + notifica al asesor | Prospectos pagados no se pierden por falta de seguimiento |
| Prospecto "caliente" sin gestión en 48h | Alerta al asesor y al supervisor | Evita perder prospectos por olvido |
| Apartado con 3 días para vencer | Alerta al asesor | Permite renovar o convertir antes de que se caiga |
| Propiedad activada con checkbox "publicar en redes" | Publica en Facebook + Instagram via Meta Graph API | Ahorra tiempo, amplía alcance inmediatamente |
| Venta cerrada | Crea automáticamente registros en: Trámite en proceso + Checklist documentación + Programar entrega | El proceso post-venta empieza sin que el asesor lo configure manualmente |
| Documento faltante a 7 días del cierre estimado | Alerta al asesor: "Faltan 3 documentos para el cierre" | Previene retrasos en el trámite |
| Nuevo lunes | Email/reporte semanal al admin con métricas de la semana | Visibilidad del negocio sin abrir el sistema |

**Implementación técnica — Celery:**
```python
# Ejemplo: alerta de apartado por vencer
@app.task
@shared_task(bind=True, max_retries=3)
def check_expiring_downpayments():
    """Corre diario a las 8am via Celery Beat"""
    expiring = Downpayment.objects.filter(
        expiry_date=date.today() + timedelta(days=3),
        status='vigente'
    ).select_related('collaborator', 'lead')
    for dp in expiring:
        send_whatsapp_alert.delay(
            phone=dp.collaborator.phone,
            message=f"⚠️ El apartado de {dp.lead.name} vence en 3 días ({dp.expiry_date}). Precio: ${dp.total_price:,.0f}"
        )
```

---

## 6. Base de Datos con RLS

### 6.1 Modelo de Datos Principal

```sql
-- USUARIOS
CREATE TABLE users (
    id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email         VARCHAR(255) UNIQUE NOT NULL,
    name          VARCHAR(255) NOT NULL,
    phone         VARCHAR(20),
    role          VARCHAR(20) CHECK (role IN ('admin','supervisor','collaborator')),
    avatar_path   TEXT,                    -- Path en MinIO
    zone          VARCHAR(100),
    is_active     BOOLEAN DEFAULT TRUE,
    created_at    TIMESTAMPTZ DEFAULT NOW()
);

-- PROPIEDADES
CREATE TABLE properties (
    id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title            VARCHAR(255) NOT NULL,
    description      TEXT,
    type             VARCHAR(30),          -- casa, depa, local, terreno, bodega, oficina, rancho
    operation        VARCHAR(10),          -- venta, renta
    price            NUMERIC(14,2),
    currency         VARCHAR(3) DEFAULT 'MXN',
    status           VARCHAR(20) DEFAULT 'draft',
    bedrooms         SMALLINT,
    bathrooms        SMALLINT,
    parking          SMALLINT,
    area_built       NUMERIC(10,2),        -- m² construidos
    area_land        NUMERIC(10,2),        -- m² de terreno
    address          TEXT,
    city             VARCHAR(100),
    state            VARCHAR(100),
    zip              VARCHAR(10),
    lat              NUMERIC(10,7),
    lng              NUMERIC(11,7),
    financing        JSONB DEFAULT '[]',   -- ["infonavit","bancario","contado"]
    amenities        JSONB DEFAULT '[]',   -- ["alberca","jardín","vigilancia"]
    commission_pct   NUMERIC(5,2),
    collaborator_id  UUID REFERENCES users(id),
    social_post_ids  JSONB DEFAULT '{}',   -- {"facebook": "post_id", "instagram": "media_id"}
    created_at       TIMESTAMPTZ DEFAULT NOW(),
    updated_at       TIMESTAMPTZ DEFAULT NOW()
);

-- IMÁGENES DE PROPIEDADES
CREATE TABLE property_images (
    id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    property_id  UUID REFERENCES properties(id) ON DELETE CASCADE,
    minio_path   TEXT NOT NULL,            -- bucket/path dentro de MinIO
    minio_bucket VARCHAR(100) NOT NULL,    -- 'properties-media'
    is_cover     BOOLEAN DEFAULT FALSE,
    display_order SMALLINT DEFAULT 0,
    created_at   TIMESTAMPTZ DEFAULT NOW()
);

-- PROSPECTOS / LEADS
CREATE TABLE leads (
    id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name              VARCHAR(255) NOT NULL,
    phone             VARCHAR(20),
    email             VARCHAR(255),
    source            VARCHAR(50),   -- web, whatsapp, facebook_ads, tiktok_ads, referido, etc.
    development       VARCHAR(255),
    model             VARCHAR(100),
    price_interest    NUMERIC(14,2),
    status            VARCHAR(30) DEFAULT 'nuevo',
    temperature       VARCHAR(10) DEFAULT 'cold',
    assigned_to       UUID REFERENCES users(id),
    next_action       TEXT,
    next_action_date  DATE,
    notes             TEXT,
    last_contact_at   TIMESTAMPTZ,
    registered_at     TIMESTAMPTZ DEFAULT NOW(),
    updated_at        TIMESTAMPTZ DEFAULT NOW()
);

-- DOCUMENTOS DE PROSPECTOS (MinIO privado)
CREATE TABLE lead_documents (
    id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    lead_id      UUID REFERENCES leads(id) ON DELETE CASCADE,
    doc_type     VARCHAR(50),   -- 'ine', 'curp', 'comprobante_ingresos', etc.
    minio_path   TEXT NOT NULL,
    minio_bucket VARCHAR(100) DEFAULT 'leads-documents',
    uploaded_by  UUID REFERENCES users(id),
    uploaded_at  TIMESTAMPTZ DEFAULT NOW()
);

-- CITAS
CREATE TABLE appointments (
    id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    lead_id          UUID REFERENCES leads(id),
    collaborator_id  UUID REFERENCES users(id),
    property_id      UUID REFERENCES properties(id),
    date             DATE NOT NULL,
    time             TIME NOT NULL,
    type             VARCHAR(30),   -- visita, llamada, reunion, videollamada
    status           VARCHAR(20) DEFAULT 'pendiente',
    result           TEXT,
    followup         TEXT,
    rescheduled_to   TIMESTAMPTZ,
    notes            TEXT,
    created_at       TIMESTAMPTZ DEFAULT NOW()
);

-- APARTADOS
CREATE TABLE downpayments (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    lead_id         UUID REFERENCES leads(id),
    property_id     UUID REFERENCES properties(id),
    development     VARCHAR(255),
    block_lot       VARCHAR(100),
    model           VARCHAR(100),
    total_price     NUMERIC(14,2),
    downpayment_amt NUMERIC(14,2),
    expiry_date     DATE,
    collaborator_id UUID REFERENCES users(id),
    status          VARCHAR(30) DEFAULT 'vigente',
    converted       BOOLEAN DEFAULT FALSE,
    created_at      TIMESTAMPTZ DEFAULT NOW()
);

-- VENTAS CERRADAS
CREATE TABLE sales (
    id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    lead_id           UUID REFERENCES leads(id),
    property_id       UUID REFERENCES properties(id),
    development       VARCHAR(255),
    model             VARCHAR(100),
    sale_price        NUMERIC(14,2),
    credit_type       VARCHAR(50),
    collaborator_id   UUID REFERENCES users(id),
    co_collaborator_id UUID REFERENCES users(id),  -- Para split de comisión
    commission_pct    NUMERIC(5,2),
    co_commission_pct NUMERIC(5,2),
    -- Comisión calculada automáticamente por PostgreSQL:
    commission_amt    NUMERIC(14,2) GENERATED ALWAYS AS (sale_price * commission_pct / 100) STORED,
    commission_status VARCHAR(30) DEFAULT 'captacion',
    delivery_date     DATE,
    observations      TEXT,
    sale_date         DATE NOT NULL,
    created_at        TIMESTAMPTZ DEFAULT NOW()
);

-- VENTAS EN PROCESO (TRÁMITE)
CREATE TABLE sale_processes (
    id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    lead_id          UUID REFERENCES leads(id),
    property_id      UUID REFERENCES properties(id),
    development      VARCHAR(255),
    lot_house        VARCHAR(100),
    price            NUMERIC(14,2),
    credit_type      VARCHAR(50),
    current_stage    VARCHAR(100),
    progress_pct     SMALLINT DEFAULT 0,
    collaborator_id  UUID REFERENCES users(id),
    bank_organism    VARCHAR(100),
    bank_executive   VARCHAR(100),
    docs_delivered   JSONB DEFAULT '[]',
    estimated_close  DATE,
    notes            TEXT,
    created_at       TIMESTAMPTZ DEFAULT NOW()
);

-- CONTROL DE ENTREGAS
CREATE TABLE deliveries (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    lead_id         UUID REFERENCES leads(id),
    property_id     UUID REFERENCES properties(id),
    development     VARCHAR(255),
    house_number    VARCHAR(50),
    agreed_date     DATE,
    actual_date     DATE,
    status          VARCHAR(30) DEFAULT 'pendiente',
    deed_signed     BOOLEAN DEFAULT FALSE,
    keys_delivered  BOOLEAN DEFAULT FALSE,
    satisfaction    SMALLINT CHECK (satisfaction BETWEEN 1 AND 5),
    created_at      TIMESTAMPTZ DEFAULT NOW()
);

-- CHECKLIST DOCUMENTACIÓN
CREATE TABLE documentation (
    id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    lead_id      UUID REFERENCES leads(id) UNIQUE,
    collaborator_id UUID REFERENCES users(id),
    credit_type  VARCHAR(50),
    -- Cada campo: NULL=no aplica, FALSE=falta, TRUE=entregado
    ine          BOOLEAN,
    curp         BOOLEAN,
    rfc          BOOLEAN,
    acta_nacimiento BOOLEAN,
    comp_domicilio BOOLEAN,
    comp_ingresos BOOLEAN,
    constancia_imss BOOLEAN,
    estado_cuenta BOOLEAN,
    declaracion_fiscal BOOLEAN,
    carta_trabajo BOOLEAN,
    acta_matrimonio BOOLEAN,
    solicitud_credito BOOLEAN,
    hist_crediticio BOOLEAN,
    avaluo       BOOLEAN,
    escrituras   BOOLEAN,
    contrato_cv  BOOLEAN,
    firma_notaria BOOLEAN,
    observations TEXT,
    updated_at   TIMESTAMPTZ DEFAULT NOW()
);

-- GASTOS OPERATIVOS
CREATE TABLE expenses (
    id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    concept      VARCHAR(255),
    date         DATE,
    provider     VARCHAR(255),
    category     VARCHAR(100),
    project      VARCHAR(255),
    amount       NUMERIC(14,2),
    vat          NUMERIC(14,2),
    total        NUMERIC(14,2) GENERATED ALWAYS AS (amount + COALESCE(vat, 0)) STORED,
    payment_method VARCHAR(50),
    receipt_path TEXT,   -- Path en MinIO bucket 'expenses-receipts'
    observations TEXT,
    created_by   UUID REFERENCES users(id),
    created_at   TIMESTAMPTZ DEFAULT NOW()
);

-- AUDITORÍA (APPEND-ONLY — NUNCA SE MODIFICA NI ELIMINA)
CREATE TABLE audit_logs (
    id          BIGSERIAL PRIMARY KEY,
    user_id     UUID REFERENCES users(id),
    user_name   VARCHAR(255),
    user_role   VARCHAR(20),
    action      VARCHAR(100) NOT NULL,   -- 'lead.created', 'lead.assigned', 'sale.closed'
    model       VARCHAR(100),
    object_id   UUID,
    diff        JSONB,                   -- { before: {...}, after: {...} }
    ip_address  INET,
    user_agent  TEXT,
    request_id  VARCHAR(36),
    created_at  TIMESTAMPTZ DEFAULT NOW()
);
```

### 6.2 Row Level Security — Aislamiento por Rol

```sql
-- Por qué RLS: aunque haya un bug en el código Django, la DB
-- nunca devolverá datos de un colaborador a otro. Es una segunda
-- línea de defensa independiente del código de la aplicación.

ALTER TABLE leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE sales ENABLE ROW LEVEL SECURITY;
ALTER TABLE appointments ENABLE ROW LEVEL SECURITY;
ALTER TABLE downpayments ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

-- Colaborador solo ve sus propios prospectos
CREATE POLICY leads_by_role ON leads USING (
    current_setting('app.user_role') = 'admin'
    OR current_setting('app.user_role') = 'supervisor'
    OR assigned_to = current_setting('app.user_id')::UUID
);

-- Ventas: colaborador ve las suyas, admin ve todas
CREATE POLICY sales_by_role ON sales USING (
    current_setting('app.user_role') = 'admin'
    OR collaborator_id = current_setting('app.user_id')::UUID
    OR co_collaborator_id = current_setting('app.user_id')::UUID
);

-- Auditoría: solo INSERT (nadie puede editar ni borrar logs)
CREATE POLICY audit_insert ON audit_logs FOR INSERT WITH CHECK (TRUE);
CREATE POLICY audit_select ON audit_logs FOR SELECT
    USING (current_setting('app.user_role') = 'admin');
-- Sin política UPDATE ni DELETE = imposible modificar logs
```

---

## 7. API — Diseño y Estándares

### 7.1 Convenciones

**¿Por qué una API bien diseñada?** Porque si en el futuro se quiere hacer una app móvil, integrar con otro sistema o conectar a un CRM externo, la API es el contrato. Un diseño limpio desde el inicio evita reescrituras costosas.

- Base URL: `https://casaslosmochis.com/api/v1/`
- Autenticación: `Authorization: Bearer <access_token>`
- Formato: JSON en todas las respuestas
- Versionado en URL (`/api/v1/`) — cuando haya cambios incompatibles se crea `/api/v2/` sin romper clientes existentes
- Paginación: cursor-based para listas grandes, offset para listas pequeñas
- Filtros via query params: `?status=activo&city=los_mochis&min_price=500000&ordering=-created_at`

### 7.2 Endpoints Principales

```
# Autenticación
POST   /api/v1/auth/login/
POST   /api/v1/auth/refresh/
POST   /api/v1/auth/logout/

# Propiedades (portal público — sin auth)
GET    /api/v1/properties/                  Catálogo con filtros (cacheado 10min)
GET    /api/v1/properties/{id}/             Detalle (cacheado 30min)
POST   /api/v1/properties/                  [Collab] Alta propiedad
PATCH  /api/v1/properties/{id}/             [Collab/Admin] Editar
POST   /api/v1/properties/{id}/publish/     [Admin] Activar y publicar en redes si se indica
POST   /api/v1/properties/{id}/images/      [Collab] Subir fotos

# Prospectos
GET    /api/v1/leads/                       [Collab: propios | Admin: todos]
POST   /api/v1/leads/                       [Anónimo desde portal o auth desde CRM]
GET    /api/v1/leads/{id}/
PATCH  /api/v1/leads/{id}/
POST   /api/v1/leads/{id}/assign/           [Admin/Supervisor]
POST   /api/v1/leads/{id}/interaction/      Registrar llamada, nota, visita
GET    /api/v1/leads/{id}/documents/        Listar docs del prospecto
POST   /api/v1/leads/{id}/documents/        Subir documento (→ MinIO privado)
GET    /api/v1/leads/{id}/documents/{doc}/download/  URL firmada temporal (60min)

# Citas, Apartados, Ventas, Trámites, Entregas, Docs, Gastos
GET|POST   /api/v1/appointments/
GET|PATCH  /api/v1/appointments/{id}/
GET|POST   /api/v1/downpayments/
GET|POST   /api/v1/sales/
GET|POST   /api/v1/processes/
GET|POST   /api/v1/deliveries/
GET|PATCH  /api/v1/documentation/{lead_id}/
GET|POST   /api/v1/expenses/

# Webhooks (redes sociales)
POST   /api/v1/webhooks/meta/leads/         Meta Lead Ads → crear prospecto
POST   /api/v1/webhooks/tiktok/leads/       TikTok Lead Ads → crear prospecto
GET    /api/v1/webhooks/meta/verify/        Verificación del webhook por Meta

# Dashboard y métricas (autenticado, datos según rol)
GET    /api/v1/dashboard/stats/
GET    /api/v1/dashboard/pipeline/
GET    /api/v1/dashboard/metrics/           Solo admin: métricas del sistema

# Administración
GET|POST   /api/v1/users/
GET|PATCH  /api/v1/users/{id}/

# Auditoría (solo admin)
GET    /api/v1/audit/logs/                  Con filtros por user/action/fecha/model
```

### 7.3 Respuesta Estándar

```json
// Éxito con lista
{ "status": "success", "data": [...], "meta": { "count": 87, "next": "...", "previous": null } }

// Éxito individual
{ "status": "success", "data": { ... } }

// Error de validación
{ "status": "error", "code": "VALIDATION_ERROR", "message": "Datos inválidos", "details": { "price": ["Este campo es requerido."] } }

// Error de permisos
{ "status": "error", "code": "PERMISSION_DENIED", "message": "No tienes permisos para esta acción." }
```

---

## 8. Seguridad

**¿Por qué invertir en seguridad desde el inicio?** La plataforma maneja documentos de identidad (INE, CURP), datos financieros, contratos y comisiones. Un breach no solo compromete datos — destruye la confianza de clientes y colaboradores.

### 8.1 Capa de Red

| Medida | Por qué | Para qué |
|--------|---------|----------|
| **Cloudflare (plan gratuito)** | Protección DDoS sin costo, CDN global, SSL automático | Absorber ataques de volumen antes de que lleguen al servidor |
| **WAF de Cloudflare** | Reglas de firewall pre-configuradas contra OWASP Top 10 | Bloquear SQL injection, XSS, bots maliciosos |
| **HTTPS obligatorio** | HSTS con preload | Todo el tráfico cifrado, el navegador no permite HTTP |

### 8.2 Autenticación

| Medida | Por qué | Para qué |
|--------|---------|----------|
| **JWT (access 15 min + refresh 7 días)** | Stateless, funciona con múltiples instancias del servidor | Autenticar cada petición sin consultar DB |
| **Refresh token rotación** | Cada uso del refresh token genera uno nuevo e invalida el anterior | Si un token es robado, el atacante tiene una sola oportunidad |
| **Blacklist en Redis** | Al hacer logout, el refresh queda registrado como inválido | Logout inmediato, no hay que esperar a que expire el token |
| **Límite de intentos de login** | Rate limiting a 10 intentos/min por IP | Prevenir ataques de fuerza bruta |

### 8.3 Autorización

| Medida | Por qué | Para qué |
|--------|---------|----------|
| **RBAC en DRF** | Permisos por rol en cada ViewSet | Un colaborador no puede ver ventas de otro ni acceder al panel de admin |
| **RLS en PostgreSQL** | Segunda línea de defensa independiente del código | Si el código tiene un bug, la DB nunca devuelve datos ajenos |
| **Object-level permissions** | Un colaborador solo edita sus propias propiedades | Previene modificación cruzada de datos |

### 8.4 Frontend

```js
// vite.config.js — Producción
build: {
  sourcemap: false,    // Sin source maps: el código minificado no se puede revertir
  minify: 'terser',    // Ofuscación de nombres de variables y funciones
}
// Por qué: con source maps, cualquiera puede ver el código fuente completo
// desde las DevTools del navegador. Sin ellos, el código es ilegible.
```

### 8.5 Archivos y Documentos

| Medida | Por qué | Para qué |
|--------|---------|----------|
| **Buckets separados** por tipo de archivo | Políticas de acceso diferentes por bucket | Las fotos públicas de propiedades y los INE privados no comparten bucket |
| **URLs firmadas** para docs privados | La URL expira en 60 min | Un link filtrado deja de funcionar en una hora |
| **Validación de tipo MIME** | Prevenir upload de ejecutables disfrazados de imágenes | Solo imágenes en el bucket de propiedades, solo PDF/imágenes en docs |
| **Tamaño máximo** | Fotos: 10MB. Documentos: 20MB | Prevenir abuso de almacenamiento |

---

## 9. Rate Limiting

**¿Por qué?** Sin límite de peticiones, un bot puede: intentar miles de logins, llenar el formulario de contacto con spam, o hacer scraping del catálogo completo. El rate limiting protege al servidor y a los colaboradores.

```python
# Por qué por rol: los asesores legítimos necesitan más capacidad que visitantes anónimos
REST_FRAMEWORK = {
    'DEFAULT_THROTTLE_CLASSES': [
        'rest_framework.throttling.AnonRateThrottle',
        'rest_framework.throttling.UserRateThrottle',
    ],
    'DEFAULT_THROTTLE_RATES': {
        'anon': '60/min',           # Navegación del catálogo
        'user': '300/min',          # Trabajo normal de un asesor
        'login': '10/min',          # Protección contra fuerza bruta
        'appointments': '20/hour',  # Formulario de citas (anti-spam)
        'contact_form': '10/hour',  # Formulario "quiero vender" (anti-spam)
        'file_upload': '50/hour',   # Subida de fotos y documentos
        'webhooks': '1000/min',     # Webhooks de Meta/TikTok (alto volumen)
    }
}
# Los contadores se guardan en Redis: persisten entre reincios del servidor
# y se comparten entre múltiples instancias del backend
```

---

## 10. Caché

**¿Por qué?** Sin caché, cada visita al catálogo hace una consulta a PostgreSQL. Con caché, 100 visitas simultáneas hacen 1 consulta a la DB y 99 se sirven desde Redis en microsegundos.

```python
CACHES = {
    'default': {
        'BACKEND': 'django_redis.cache.RedisCache',
        'LOCATION': env('REDIS_URL'),
        'TIMEOUT': 300,  # 5 minutos por defecto
    }
}
```

| Dato cacheado | TTL | Cuándo se invalida |
|--------------|-----|-------------------|
| `GET /properties/` (catálogo portal) | 10 min | Cuando se activa, edita o desactiva una propiedad |
| `GET /properties/{id}/` | 30 min | Cuando se edita esa propiedad específica |
| `GET /dashboard/stats/` | 5 min por usuario | Por tiempo (datos cambian frecuentemente) |
| Listas de ciudades/tipos para filtros | 24h | Raramente cambian |
| Tokens JWT blacklist | TTL = vida del token | Nunca (se eliminan solos al expirar) |
| Rate limit counters | TTL = ventana de tiempo | Se resetean automáticamente |

**React Query (frontend):** Además del caché del servidor, el frontend cachea las respuestas de la API. Si el asesor navega de "Prospectos" a "Citas" y vuelve, los datos se muestran instantáneamente mientras React Query re-valida en background.

---

## 11. Escalabilidad

**¿Por qué pensar en escalabilidad desde el inicio?** Porque refactorizar una arquitectura no escalable cuando el negocio crece es mucho más caro que hacerlo bien desde el principio.

### 11.1 Diseño Stateless del Backend
**Por qué:** Django no guarda estado de sesión en memoria. Cada petición es independiente. Esto permite agregar más instancias del backend detrás de un load balancer sin cambiar nada.

### 11.2 Separación de Responsabilidades
```
Servidor Web (Nginx)     → Solo sirve archivos estáticos y hace proxy al backend
Gunicorn Workers (4-8)   → Procesan peticiones HTTP de la API
Celery Workers (2-4)     → Procesan tareas en background (emails, notificaciones)
PostgreSQL               → Base de datos principal
Redis                    → Cache + Cola de Celery + Rate limiting
MinIO                    → Almacenamiento de archivos
```
Cada componente puede escalar independientemente. Si hay muchas tareas de email, se agregan más Celery workers sin tocar el resto.

### 11.3 Índices de Base de Datos
```python
# Por qué: los filtros del catálogo combinan múltiples campos.
# Sin índices, cada búsqueda hace un full scan de toda la tabla.
class Meta:
    indexes = [
        models.Index(fields=['status', 'operation', 'type']),  # Filtros más comunes del catálogo
        models.Index(fields=['city', 'price']),                # Búsqueda por ciudad y rango de precio
        models.Index(fields=['assigned_to', 'status']),        # Pipeline del asesor
        models.Index(fields=['created_at']),                   # Ordenamiento por fecha
        models.Index(fields=['expiry_date', 'status']),        # Alertas de apartados
    ]
```

### 11.4 Read Replicas (Fase futura)
Cuando los reportes y estadísticas sean pesados, se agrega una réplica de lectura de PostgreSQL. Los reportes consultan la réplica; las escrituras van al primario. El negocio no se afecta.

---

## 12. Monitoreo — Sin Costo (Dashboard Interno)

**¿Por qué no Grafana?** Grafana + Prometheus en un servidor dedicado puede costar $20-50/mes. En cambio, se construye un **dashboard de métricas integrado directamente en el CRM**, visible solo para el administrador principal. Costo adicional: $0.

### 12.1 Dashboard de Métricas del Administrador

Endpoint exclusivo: `GET /api/v1/dashboard/metrics/` (solo rol `admin`)

Métricas expuestas:

```python
# apps/metrics/views.py
class MetricsDashboardView(APIView):
    permission_classes = [IsAdmin]

    def get(self, request):
        return Response({
            # Métricas de negocio (tiempo real desde DB)
            "business": {
                "active_properties": Property.objects.filter(status='active').count(),
                "leads_this_month": Lead.objects.filter(registered_at__month=now().month).count(),
                "sales_this_month": Sale.objects.filter(sale_date__month=now().month).count(),
                "revenue_this_month": Sale.objects.filter(...).aggregate(Sum('sale_price')),
                "conversion_rate": ...,  # leads → ventas cerradas
                "top_collaborators": ...,
            },
            # Métricas del sistema (salud técnica)
            "system": {
                "api_requests_today": cache.get('metrics:requests:today', 0),
                "avg_response_time_ms": cache.get('metrics:avg_response_ms', 0),
                "active_users_now": cache.get('metrics:active_sessions', 0),
                "db_connections": get_db_connections(),
                "redis_memory_mb": get_redis_memory(),
                "minio_storage_gb": get_minio_usage(),
                "celery_queue_size": get_celery_queue_length(),
                "error_rate_1h": cache.get('metrics:errors:1h', 0),
            },
            # Health checks
            "health": {
                "database": check_db_health(),
                "redis": check_redis_health(),
                "minio": check_minio_health(),
                "celery": check_celery_health(),
            }
        })
```

**En el frontend CRM** (solo visible para admin):
- Cards con KPIs de negocio y sistema.
- Gráficas con Recharts (ya incluido en el stack de React, sin costo).
- Tabla de últimos errores (registrados en DB, no en servicio externo).
- Indicadores de salud: verde/amarillo/rojo para cada servicio.

### 12.2 Sentry — Errores (Plan Gratuito)

**Por qué Sentry:** El plan gratuito permite 5,000 errores/mes con detalles completos: stack trace, usuario afectado, URL, parámetros. Es suficiente para el volumen inicial.

```python
# backend/config/settings/production.py
import sentry_sdk
sentry_sdk.init(
    dsn=env('SENTRY_DSN'),
    traces_sample_rate=0.05,  # 5% de peticiones trackeadas (gratis)
    send_default_pii=False,   # No enviar datos personales a Sentry
)
```

```js
// frontend/src/main.jsx
import * as Sentry from "@sentry/react";
Sentry.init({ dsn: import.meta.env.VITE_SENTRY_DSN, tracesSampleRate: 0.05 });
```

### 12.3 Logs Internos — Sin Loki

En lugar de Loki (servicio externo con costo), los logs se guardan en:
1. **stdout/stderr** — Capturados por el sistema de contenedores (Railway/Render los retiene 7 días gratis).
2. **Tabla `audit_logs`** — Todas las acciones de usuarios en PostgreSQL, consultables desde el dashboard admin.
3. **Redis contadores** — Métricas de requests por ventanas de tiempo.

```python
# structlog configurado para output JSON (legible por Railway/Render)
import structlog
structlog.configure(processors=[structlog.processors.JSONRenderer()])
log = structlog.get_logger()

# Ejemplo de log en cada petición:
# {"event": "api.request", "method": "POST", "path": "/api/v1/leads/",
#  "user_id": "uuid", "duration_ms": 45, "status_code": 201, "request_id": "abc123"}
```

---

## 13. Auditoría Total

**¿Por qué auditoría completa?** En un negocio con comisiones, prospectos y documentos sensibles, es fundamental saber quién hizo qué y cuándo. Si hay un conflicto entre asesores por un prospecto, el log dice la verdad.

### 13.1 Middleware de Auditoría Automática

```python
# core/audit.py — Se ejecuta en CADA petición mutante (POST/PATCH/DELETE)
class AuditMiddleware:
    """
    Intercepta respuestas exitosas de la API y registra la acción.
    El desarrollador no tiene que acordarse de loguear manualmente.
    """
    AUDITED_ACTIONS = {
        ('POST', '/api/v1/leads/'): 'lead.created',
        ('PATCH', '/api/v1/leads/{id}/assign/'): 'lead.assigned',
        ('POST', '/api/v1/sales/'): 'sale.closed',
        ('POST', '/api/v1/auth/login/'): 'user.login',
        ('POST', '/api/v1/auth/logout/'): 'user.logout',
        # ... todas las acciones del sistema
    }
```

### 13.2 Eventos Auditados

| Módulo | Evento registrado |
|--------|-----------------|
| Auth | Login exitoso, login fallido, logout, cambio de contraseña |
| Propiedades | Creada, editada, activada, desactivada, eliminada, publicada en redes |
| Prospectos | Creado, asignado, reasignado, estado cambiado, nota agregada |
| Citas | Creada, confirmada, cancelada, reagendada |
| Apartados | Creado, vencido, convertido a venta |
| Ventas | Cerrada, comisión editada, comisión cobrada |
| Documentos | Cargado, descargado (quién y cuándo descargó un INE privado) |
| Usuarios | Creado, editado, desactivado, rol cambiado |
| Gastos | Creado, editado |

### 13.3 Características de la Tabla de Auditoría

- **Append-only:** RLS prohíbe UPDATE y DELETE en `audit_logs`. Ni el propio admin puede borrar un log.
- **Inmutable:** Los campos `user_name` y `user_role` se copian al momento de la acción (no son FK que puedan cambiar).
- **Diff completo:** Guarda el estado anterior y posterior en JSONB para cambios de estado.
- **Searchable desde el CRM:** El admin puede filtrar por usuario, acción, fecha, entidad.

---

## 14. Control de Versiones y CI/CD

### 14.1 GitFlow

**¿Por qué GitFlow?** Permite tener siempre una rama `main` en estado deployable, desarrollar features de forma aislada y hacer hotfixes sin interrumpir el desarrollo activo.

```
main          ← Producción. Tags: v1.0.0, v1.1.0, v1.2.0
develop       ← Integración. Base para todas las features
feature/*     ← Una rama por funcionalidad: feature/crm-pipeline
fix/*         ← Correcciones durante desarrollo
release/*     ← Preparación de release: testing final, bump de versión
hotfix/*      ← Correcciones urgentes que no pueden esperar al próximo release
```

### 14.2 GitHub Actions — Pipeline CI/CD

**¿Por qué CI/CD?** Sin automatización, el deploy manual es lento y propenso a errores. Con CI/CD, cada push a `main` lleva el código a producción automáticamente, solo si pasa todos los tests.

```yaml
# .github/workflows/deploy.yml
name: CI/CD Pipeline

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main]

jobs:
  # 1. Tests del backend
  test-backend:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-python@v4
        with: { python-version: '3.12' }
      - run: pip install -r backend/requirements/dev.txt
      - run: pytest backend/ --cov=apps --cov-fail-under=80
        # Falla si la cobertura baja del 80%

  # 2. Lint y build del frontend
  build-frontend:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with: { node-version: '20' }
      - run: cd frontend && npm ci
      - run: cd frontend && npm run lint
      - run: cd frontend && npm run build
        # sourcemap:false se aplica aquí (configurado en vite.config.js)
      - uses: actions/upload-artifact@v4
        with: { name: frontend-dist, path: frontend/dist/ }

  # 3. Deploy (solo en push a main, solo si tests pasan)
  deploy:
    needs: [test-backend, build-frontend]
    if: github.ref == 'refs/heads/main'
    steps:
      # Backend: build y push imagen Docker → Railway/Render
      - run: docker build -t casaslosmochis-api ./backend
      - run: railway up  # o render deploy
      # Migraciones: corren automáticamente como release command
      # Frontend: deploy en Vercel
      - run: vercel --prod --token ${{ secrets.VERCEL_TOKEN }}
```

---

## 15. Estructura de Carpetas del Proyecto

```
casas-los-mochis/
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── ui/              # Botones, modales, inputs, tablas base
│   │   │   ├── layout/          # Sidebar CRM, Navbar portal, Footer
│   │   │   ├── portal/          # PropertyCard, FilterBar, MapView, AppointmentForm
│   │   │   └── crm/             # LeadKanban, CommissionBadge, DocChecklist
│   │   ├── pages/
│   │   │   ├── public/          # Home, Catalog, PropertyDetail, Contact
│   │   │   └── crm/             # Dashboard, Leads, Appointments, Sales,
│   │   │                        # Processes, Deliveries, Documentation,
│   │   │                        # Expenses, Properties, Users, Metrics(admin)
│   │   ├── services/            # axios calls por módulo (leadsService, propertiesService...)
│   │   ├── stores/              # Zustand: authStore, filtersStore
│   │   ├── hooks/               # useLeads, useProperties, useAuth...
│   │   ├── utils/               # formatCurrency, formatDate, buildWhatsAppURL...
│   │   └── router/              # Rutas públicas + rutas protegidas por rol
│   ├── vite.config.js           # sourcemap:false, terser, code splitting
│   ├── tailwind.config.js
│   └── .env.example
│
├── backend/
│   ├── config/
│   │   └── settings/
│   │       ├── base.py          # Configuración común
│   │       ├── development.py   # DEBUG=True, DB local, sin HTTPS
│   │       └── production.py    # DEBUG=False, HTTPS, HSTS, Sentry
│   ├── apps/
│   │   ├── accounts/            # Usuarios, JWT, permisos RBAC
│   │   ├── properties/          # Propiedades, imágenes, MinIO upload
│   │   ├── leads/               # Prospectos, interacciones, documentos
│   │   ├── appointments/        # Citas, agenda
│   │   ├── sales/               # Ventas cerradas, comisiones
│   │   ├── processes/           # Trámites en proceso
│   │   ├── deliveries/          # Entregas
│   │   ├── documentation/       # Checklist documental
│   │   ├── expenses/            # Gastos operativos
│   │   ├── social/              # Integración Meta/TikTok, webhooks, publicación
│   │   ├── notifications/       # Celery tasks: email, WhatsApp
│   │   ├── metrics/             # Endpoint de métricas para dashboard admin
│   │   └── audit/               # Middleware + modelo AuditLog
│   ├── core/
│   │   ├── permissions.py       # IsAdmin, IsSupervisor, IsCollaborator
│   │   ├── throttling.py        # Rate limiting por rol/endpoint
│   │   ├── pagination.py
│   │   ├── exceptions.py        # Respuestas de error estandarizadas
│   │   ├── audit.py             # AuditMiddleware automático
│   │   └── storage.py           # Cliente MinIO, generación de URLs firmadas
│   ├── api/v1/urls.py           # Router central de todos los endpoints
│   ├── requirements/
│   │   ├── base.txt             # Django, DRF, psycopg3, celery, redis, minio, structlog
│   │   ├── dev.txt              # pytest, coverage, factory-boy, faker
│   │   └── prod.txt             # gunicorn, sentry-sdk, django-prometheus
│   ├── Dockerfile
│   └── docker-compose.yml       # Para desarrollo local
│
├── .github/
│   └── workflows/
│       ├── deploy.yml           # CI/CD completo
│       └── pr-checks.yml        # Lint y tests en cada PR
│
└── README.md                    # Instrucciones de setup y desarrollo
```

---

## 16. Hosting y Costos Estimados

**Principio:** Empezar con el menor costo posible usando planes gratuitos y servicios self-hosted, y escalar cuando el negocio lo justifique.

| Servicio | Opción inicial | Costo/mes | Alternativa de escala |
|---------|---------------|-----------|----------------------|
| **Frontend** | Vercel (plan gratuito) | $0 | Vercel Pro $20/mes |
| **Backend Django** | Railway Starter | $5-10 | Railway Team $20/mes |
| **PostgreSQL** | Railway (incluido) o Supabase gratuito | $0-5 | Supabase Pro $25/mes |
| **Redis** | Railway (incluido) o Upstash gratuito | $0 | Upstash Pro $10/mes |
| **MinIO** | Self-hosted en el mismo servidor del backend | $0 | Agregar disco |
| **Cloudflare** | Plan gratuito (WAF + CDN + SSL) | $0 | Pro $20/mes si se necesita |
| **Sentry** | Plan gratuito (5k errores/mes) | $0 | Team $26/mes |
| **Dominio** | casaslosmochis.com | ~$15/año | — |
| **Email (Resend)** | Plan gratuito (3k emails/mes) | $0 | Pro $20/mes |
| **Grafana/Loki** | **No se usa** → Dashboard interno | $0 | — |
| **TOTAL estimado** | | **~$15-20/mes** | |

---

## 17. Fases de Desarrollo

### Fase 1 — MVP (8-10 semanas)
**Objetivo:** Sistema funcional que reemplace el Excel y permita el portal público.
- [ ] Setup: repositorio, Docker local, CI/CD básico, dominio, Cloudflare
- [ ] Backend: modelos, migraciones, auth JWT, permisos RBAC, RLS
- [ ] MinIO: buckets, upload de fotos, URLs firmadas para docs privados
- [ ] Portal público: catálogo con filtros, detalle de propiedad, contacto WhatsApp, formulario de cita
- [ ] CRM: Dashboard, Prospectos (tabla + Kanban), Citas, Publicación de propiedades
- [ ] Auditoría: middleware automático, tabla append-only
- [ ] Rate limiting y caché básico
- [ ] Sentry para errores
- [ ] Deploy en Railway + Vercel

### Fase 2 — CRM Completo (6-8 semanas)
**Objetivo:** Paridad funcional con el Excel + automatizaciones.
- [ ] Módulos: Apartados, Ventas Cerradas, Trámites, Entregas, Documentación, Gastos
- [ ] Sistema de comisiones con split entre asesores
- [ ] Celery: alertas automáticas (apartados por vencer, prospectos sin gestión)
- [ ] Notificaciones WhatsApp automáticas al asignar prospecto
- [ ] Dashboard de métricas del administrador (sin Grafana)
- [ ] Integración Meta Lead Ads webhook (prospectos automáticos desde FB/IG)

### Fase 3 — Crecimiento (6-8 semanas)
**Objetivo:** Crecimiento digital y optimización.
- [ ] Publicación automática en Facebook/Instagram al activar propiedad
- [ ] Integración TikTok Lead Ads
- [ ] Meta Conversions API + Google Analytics 4 + Meta Pixel
- [ ] Reportes exportables (PDF/Excel)
- [ ] SEO: sitemap XML, metadata dinámica, Schema.org RealEstateListing
- [ ] Vista de mapa en catálogo (Google Maps)
- [ ] PWA (instalable en móvil sin app store)
- [ ] Portal del cliente: seguimiento de su proceso de compra
- [ ] Read replica PostgreSQL para reportes pesados

---

## 18. Postventa, Satisfacción del Cliente y Protección contra Fuga de Comisiones

### ¿Por qué este módulo existe?

Este módulo responde a dos necesidades distintas pero relacionadas:

1. **Calidad de servicio:** Saber si el cliente quedó satisfecho con la atención, el proceso y el resultado (haya comprado o no), para mejorar continuamente y detectar asesores con mal desempeño.

2. **Protección de la empresa:** Detectar cuando un colaborador usa los recursos y clientes de la empresa (captados a través del portal, las redes, los anuncios o la marca "Casas Los Mochis") para cerrar una venta o renta **fuera del sistema**, quedándose con la comisión completa sin que la empresa lo sepa ni lo registre.

**La clave:** El cliente siempre pertenece a la empresa, no al asesor. Cualquier prospecto que entró por los canales de Casas Los Mochis (portal web, Meta Ads, TikTok, WhatsApp de la empresa, referido, etc.) tiene una trazabilidad permanente. El asesor es el gestor, no el dueño del cliente.

---

### 18.1 Trazabilidad Total del Prospecto

**¿Por qué?** Si un prospecto entra al sistema, queda ligado a la empresa para siempre, independientemente del asesor que lo atienda. Esto significa que si el asesor lo marca como "perdido" y luego resulta que sí compró (pero fuera del sistema), la empresa tiene evidencia de que ese cliente fue captado por ella.

**¿Para qué?** Crear un registro inamovible del origen de cada cliente. El campo `source` + `registered_at` + `assigned_to` forman una cadena de custodia que no puede modificarse retroactivamente (está auditada y protegida por RLS append-only en `audit_logs`).

**Reglas del sistema:**
- Un prospecto **nunca se elimina**, solo se archiva. Su historial es permanente.
- El campo `source` es inmutable después de la creación (solo admin puede corregirlo, y queda auditado).
- Al marcar un prospecto como "Perdido", el sistema obliga al asesor a registrar **el motivo** y **si el cliente planea buscar con otra empresa**.
- El admin puede consultar todos los prospectos marcados como "Perdido" en los últimos 90/180/365 días.

```sql
-- El status 'perdido' requiere un motivo obligatorio
ALTER TABLE leads ADD COLUMN lost_reason VARCHAR(100);
ALTER TABLE leads ADD COLUMN lost_notes TEXT;
ALTER TABLE leads ADD COLUMN lost_at TIMESTAMPTZ;
-- Valores de lost_reason: 'precio', 'no_califica_credito', 'compro_con_otro',
--                         'ya_no_interesa', 'sin_respuesta', 'otro'
-- El valor 'compro_con_otro' dispara una alerta automática al admin
```

---

### 18.2 Módulo de Postventa y Satisfacción

**¿Quién contacta al cliente?** El área de calidad / administrador — nunca el asesor que manejó el caso. Esto es intencional: el asesor no debe saber exactamente qué le preguntamos al cliente, ni tener oportunidad de influir en la respuesta antes de que se mande la encuesta.

**¿Para qué?** Dos objetivos simultáneos:
- Medir la calidad del servicio de cada asesor de forma independiente.
- Detectar si la venta ocurrió fuera del sistema mediante preguntas directas al cliente.

#### Flujo de Postventa Automático

```
[Venta cerrada en sistema]
        │
        ├── Celery Beat: 48h después → Envía encuesta automática al cliente (WhatsApp + Email)
        │
        ├── Celery Beat: 7 días después → Si no respondió → Admin recibe alerta para llamada manual
        │
        └── Celery Beat: 30 días después → Encuesta de satisfacción con el proceso de entrega

[Prospecto marcado como "Perdido"]
        │
        ├── Celery Beat: 72h después → Envía mensaje de seguimiento al cliente
        │   "Hola [nombre], somos Casas Los Mochis. Vimos que no pudimos concretar tu búsqueda.
        │    ¿Lograste encontrar lo que buscabas? ¿Podemos ayudarte en algo más?"
        │
        └── Si el cliente responde que SÍ compró → Sistema registra la respuesta
            → Alerta automática al administrador: "El cliente [nombre] que [asesor] marcó como
              Perdido confirmó que sí compró. Verificar si fue dentro o fuera del sistema."
```

#### Encuesta de Satisfacción — Diseño y Filosofía

**Principio de diseño:** Las preguntas que ve el cliente son siempre cálidas, breves y orientadas a su experiencia. El cliente que acaba de hacer una de las compras más importantes de su vida no debe sentir que lo están interrogando — debe sentir que la empresa se preocupa genuinamente por él.

**Cómo funciona la detección sin preguntas directas:** La información de integridad no se obtiene de preguntas frontales, sino del cruce que hace el backend entre las respuestas del cliente, el historial del CRM y la ausencia o presencia de registros. El cliente nunca sabe que hay una lógica de detección detrás.

---

##### Encuesta Postventa — Cliente que consolidó una compra o renta

El mensaje llega por WhatsApp 48 horas después del cierre, enviado a nombre de **Casas Los Mochis** (no del asesor):

> *"¡Hola [Nombre]! 🏠 Queremos agradecerte tu confianza en Casas Los Mochis. Para nosotros es muy importante saber cómo te fue. ¿Nos regalas 2 minutos para contarnos tu experiencia? Tu opinión nos ayuda a seguir mejorando."*
> *→ [Ver encuesta]*

**Preguntas al cliente (lo que ve):**

| # | Pregunta | Tipo de respuesta |
|---|---------|------------------|
| 1 | ¿Cómo calificarías la atención que recibiste durante todo el proceso? | ⭐⭐⭐⭐⭐ (1 a 5 estrellas) |
| 2 | ¿El proceso fue claro y sencillo para ti? | ⭐⭐⭐⭐⭐ |
| 3 | ¿Sientes que tu asesor te escuchó y entendió lo que buscabas? | ⭐⭐⭐⭐⭐ |
| 4 | En general, ¿qué tan satisfecho estás con tu experiencia en Casas Los Mochis? | ⭐⭐⭐⭐⭐ |
| 5 | ¿Recomendarías Casas Los Mochis a un familiar o amigo? | Sí, sin dudarlo / Sí, probablemente / Tal vez / No |
| 6 | ¿Hay algo que podríamos haber hecho mejor para ti? | Texto libre (opcional) |
| 7 | ¿Quieres dejar algún comentario o mensaje para nuestro equipo? | Texto libre (opcional) |

**Lo que el cliente no ve — campos internos que el sistema registra y analiza:**

```python
# apps/aftersales/models.py
class SatisfactionSurvey(models.Model):
    lead            = models.ForeignKey(Lead, on_delete=models.PROTECT)
    collaborator    = models.ForeignKey(User, on_delete=models.PROTECT)
    survey_type     = models.CharField(choices=[
        ('post_sale',     'Postventa — Venta cerrada'),
        ('post_lost',     'Seguimiento — Prospecto no consolidado'),
        ('post_delivery', 'Satisfacción con entrega'),
    ])
    sent_at         = models.DateTimeField(auto_now_add=True)
    responded_at    = models.DateTimeField(null=True)
    channel         = models.CharField(choices=[('whatsapp','WhatsApp'),('email','Email')])

    # Respuestas visibles (lo que el cliente contestó)
    rating_attention    = models.SmallIntegerField(null=True)  # Pregunta 1
    rating_clarity      = models.SmallIntegerField(null=True)  # Pregunta 2
    rating_listening    = models.SmallIntegerField(null=True)  # Pregunta 3
    rating_overall      = models.SmallIntegerField(null=True)  # Pregunta 4
    would_recommend     = models.CharField(null=True)          # Pregunta 5
    improvement_comment = models.TextField(null=True)          # Pregunta 6
    free_comment        = models.TextField(null=True)          # Pregunta 7

    # Campos internos — generados por el sistema, nunca visibles para el cliente ni el asesor
    # El backend analiza las respuestas libres buscando palabras clave
    sentiment_score     = models.FloatField(null=True)
    # Score calculado por el sistema: promedio ponderado de ratings (1.0 = perfecto, 0.0 = pésimo)

    keywords_detected   = models.JSONField(default=list)
    # El sistema busca en los comentarios libres palabras como:
    # negativas de proceso: "tardó", "no me llamó", "tuve que buscar yo"
    # señales de alerta: "al final lo hicimos diferente", "el trato fue aparte", "me cobró diferente"
    # positivas: "excelente", "muy rápido", "recomendaré"

    alert_triggered     = models.BooleanField(default=False)
    # True si el sistema detectó palabras clave de alerta en comentarios libres
    # o si el rating_overall es <= 2 estrellas (posible experiencia problemática que investigar)

    admin_reviewed      = models.BooleanField(default=False)
    admin_notes         = models.TextField(null=True)
```

**Lógica de detección en backend — sin preguntar directamente:**

```python
# apps/aftersales/analysis.py
ALERT_KEYWORDS = [
    # Señales de que algo se manejó fuera del sistema
    "aparte", "por fuera", "por su cuenta", "él me cobró", "ella me cobró",
    "directo con", "sin la empresa", "nos pusimos de acuerdo", "fue diferente",
    # Señales de mal servicio que ameritan revisión
    "no me llamó", "nunca me contactó", "tuve que buscar", "tardó mucho",
    "no me hizo caso", "me ignoró", "desapareció",
]

def analyze_survey_response(survey):
    """
    Corre después de que el cliente guarda su respuesta.
    Analiza comentarios libres y decide si disparar una alerta al admin.
    El cliente nunca ve este proceso.
    """
    combined_text = f"{survey.improvement_comment or ''} {survey.free_comment or ''}".lower()
    detected = [kw for kw in ALERT_KEYWORDS if kw in combined_text]

    survey.keywords_detected = detected
    survey.sentiment_score = calculate_sentiment(survey)

    # Disparar alerta si:
    # - Se detectaron palabras clave sospechosas, O
    # - La calificación general es muy baja (1-2 estrellas) en un cliente que cerró venta
    if detected or (survey.rating_overall and survey.rating_overall <= 2):
        survey.alert_triggered = True
        create_integrity_alert(survey, detected)

    survey.save()
```

---

##### Encuesta para Prospectos No Consolidados

**¿Por qué?** Un prospecto que no compró merece atención también — puede ser que no encontró lo que buscaba, que el proceso de crédito no avanzó, o que simplemente necesitaba más tiempo. Contactarlos con calidez puede recuperar ventas y siempre mejora la imagen de la empresa.

El mensaje llega 72 horas después de que el asesor marca el prospecto como "no consolidado":

> *"¡Hola [Nombre]! Somos Casas Los Mochis. Sabemos que estuviste buscando tu próximo hogar y queremos saber cómo estás. Si en algún momento podemos ayudarte nuevamente, aquí estaremos. ¿Nos compartes cómo te fue con tu búsqueda?"*
> *→ [Contarnos tu experiencia]*

**Preguntas al cliente:**

| # | Pregunta | Tipo de respuesta |
|---|---------|------------------|
| 1 | ¿Cómo calificarías la atención que recibiste de nuestro equipo? | ⭐⭐⭐⭐⭐ |
| 2 | ¿Sentiste que te ofrecimos opciones que se ajustaban a lo que buscabas? | ⭐⭐⭐⭐⭐ |
| 3 | ¿Cuál fue el principal motivo por el que tu búsqueda no avanzó? | Opción múltiple: No encontré lo que buscaba / El precio estaba fuera de mi presupuesto / Mi trámite de crédito no avanzó / Decidí esperar / Cambié de planes / Otro |
| 4 | ¿Seguirías contando con Casas Los Mochis cuando retomes tu búsqueda? | Sí / Tal vez / No |
| 5 | ¿Hay algo que podríamos haber hecho diferente para ayudarte mejor? | Texto libre (opcional) |

**Señal de alerta interna:** Si el cliente responde la opción 3 con "Cambié de planes" o "Decidí esperar" pero en el texto libre menciona palabras como "ya encontré", "ya compré", "ya arreglé" — el sistema registra la inconsistencia y notifica al admin discretamente para revisión.

---

### 18.3 Sistema Anti-Fuga de Comisiones

**¿Por qué?** Sin este sistema, un asesor puede captar un cliente usando los anuncios de la empresa, trabajarlo dentro del CRM por semanas, marcarlo como "perdido" y cerrarlo por su cuenta recibiendo el 100% de la comisión. La empresa pierde tanto la comisión como el cliente.

**¿Para qué?** Crear múltiples señales de alerta que, combinadas, le dan al administrador evidencia suficiente para investigar y actuar.

#### Señales de Alerta que Monitorea el Sistema

```python
# apps/aftersales/signals.py

# SEÑAL 1: Prospecto marcado como "perdido" con razón "compro_con_otro"
# → Alerta inmediata al admin
@receiver(post_save, sender=Lead)
def alert_on_lost_with_competitor(sender, instance, **kwargs):
    if instance.lost_reason == 'compro_con_otro':
        notify_admin.delay(
            title="⚠️ Prospecto dice que compró con otro",
            body=f"{instance.name} (manejado por {instance.assigned_to.name}) "
                 f"fue marcado como perdido con razón 'compró con otro'.",
            lead_id=str(instance.id)
        )

# SEÑAL 2: El análisis de la encuesta detecta palabras clave de alerta
# o una calificación muy baja en un cliente que sí tiene venta registrada
@receiver(post_save, sender=SatisfactionSurvey)
def detect_integrity_signal(sender, instance, **kwargs):
    if not instance.alert_triggered:
        return
    sale_exists = Sale.objects.filter(lead=instance.lead).exists()
    evidence_parts = []
    if instance.keywords_detected:
        evidence_parts.append(
            f"Palabras clave detectadas en comentarios del cliente: {', '.join(instance.keywords_detected)}."
        )
    if instance.rating_overall and instance.rating_overall <= 2 and sale_exists:
        evidence_parts.append(
            f"Calificación general de {instance.rating_overall}/5 en cliente con venta cerrada."
        )
    if evidence_parts:
        FraudAlert.objects.create(
            lead=instance.lead,
            collaborator=instance.collaborator,
            alert_type='survey_signal',
            evidence=" ".join(evidence_parts) + f" Encuesta respondida el {instance.responded_at}.",
            status='pending_review'
        )
        notify_admin.delay(
            title="⚠️ Señal en encuesta de satisfacción — revisión recomendada",
            body=f"La encuesta de {instance.lead.name} contiene indicadores que ameritan revisión. "
                 f"Asesor: {instance.collaborator.name}. Ver panel de alertas para detalle."
        )

# SEÑAL 3: Prospecto "perdido" que reaparece como referido de alguien
# (alguien lo menciona como fuente en un nuevo lead)
# → El sistema cruza automáticamente al registrar la fuente "referido" en un nuevo lead
```

#### Tabla de Alertas de Fraude / Irregularidades

```sql
CREATE TABLE fraud_alerts (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    lead_id         UUID REFERENCES leads(id),
    collaborator_id UUID REFERENCES users(id),
    alert_type      VARCHAR(50),
    -- Tipos: 'unregistered_sale', 'lost_but_bought', 'survey_mismatch',
    --        'reappeared_as_referral', 'manual_report'
    evidence        TEXT NOT NULL,       -- Descripción detallada de la evidencia
    status          VARCHAR(30) DEFAULT 'pending_review',
    -- Estados: 'pending_review', 'under_investigation', 'confirmed', 'dismissed'
    admin_notes     TEXT,               -- Notas del admin durante la investigación
    resolved_by     UUID REFERENCES users(id),
    resolved_at     TIMESTAMPTZ,
    action_taken    VARCHAR(100),
    -- Acciones: 'collaborator_deactivated', 'formal_warning', 'commission_deducted', 'dismissed'
    created_at      TIMESTAMPTZ DEFAULT NOW()
);
-- Esta tabla también está protegida por RLS: solo el admin puede verla
-- y los registros nunca se eliminan (evidencia permanente)
```

#### Panel de Alertas para el Administrador

En el CRM, dentro del área exclusiva del administrador, hay una sección **"Alertas de Integridad"** que muestra:

- Lista de alertas activas con prioridad (🚨 urgente / ⚠️ revisar).
- Detalle de cada alerta: prospecto, asesor, evidencia, fecha.
- Historial completo del prospecto (todas las interacciones registradas).
- Respuesta de la encuesta del cliente.
- Acciones disponibles: Iniciar investigación / Descartar / Registrar acción tomada.
- Historial de alertas resueltas con acción tomada (para referencia futura).

**El asesor nunca ve este panel ni sabe que existe una alerta sobre él** hasta que el admin decida comunicárselo.

---

### 18.4 Política de Propiedad del Cliente (Regla de Negocio)

Esta política debe quedar documentada en el sistema y aceptada por cada colaborador al darse de alta:

> *"Todo prospecto captado a través de los canales de Casas Los Mochis (portal web, redes sociales, anuncios, WhatsApp institucional, eventos o cualquier medio de la empresa) es propiedad de Casas Los Mochis. El colaborador actúa como gestor en nombre de la empresa. Cualquier cierre de venta o renta de un prospecto de la empresa, realizado fuera de la plataforma o sin registrar la comisión correspondiente, constituye una violación al acuerdo de colaboración y puede resultar en la terminación inmediata de la relación de trabajo."*

En el sistema:
- Al dar de alta a un colaborador, debe aceptar esta política con checkbox y firma digital (guardada en MinIO).
- La aceptación queda registrada en `audit_logs` con timestamp y IP.
- Esto genera evidencia legal en caso de disputa.

---

### 18.5 Endpoints del Módulo Postventa

```
# Encuestas
GET    /api/v1/aftersales/surveys/              [Admin] Todas las encuestas
GET    /api/v1/aftersales/surveys/{id}/         [Admin] Detalle
POST   /api/v1/aftersales/surveys/{token}/respond/  [Anónimo] Cliente responde encuesta
GET    /api/v1/aftersales/surveys/pending/      [Admin] Encuestas sin respuesta

# Alertas de integridad (solo admin)
GET    /api/v1/aftersales/alerts/               Lista de alertas activas
GET    /api/v1/aftersales/alerts/{id}/          Detalle con historial del prospecto
PATCH  /api/v1/aftersales/alerts/{id}/          Actualizar estado, notas, acción tomada

# Reporte de satisfacción por colaborador (admin y supervisor)
GET    /api/v1/aftersales/reports/collaborator/{id}/
# Retorna: promedio de calificaciones, % de encuestas respondidas,
#          # de alertas generadas, tendencia por mes
```

---

### 18.6 Automatizaciones Postventa (Celery Beat)

```python
# Calendario de tareas automáticas de postventa
CELERY_BEAT_SCHEDULE = {
    # Encuesta 48h después de cerrar una venta
    'send-postsale-survey': {
        'task': 'aftersales.tasks.send_postsale_surveys',
        'schedule': crontab(hour=10, minute=0),  # Diario a las 10am
    },
    # Seguimiento a prospectos perdidos (72h después de marcar como perdido)
    'followup-lost-leads': {
        'task': 'aftersales.tasks.followup_lost_leads',
        'schedule': crontab(hour=11, minute=0),
    },
    # Recordatorio al admin de encuestas sin respuesta después de 7 días
    'remind-unanswered-surveys': {
        'task': 'aftersales.tasks.remind_unanswered',
        'schedule': crontab(hour=9, minute=0, day_of_week=1),  # Lunes
    },
    # Encuesta de satisfacción con entrega (30 días post-entrega)
    'post-delivery-survey': {
        'task': 'aftersales.tasks.send_delivery_surveys',
        'schedule': crontab(hour=10, minute=30),
    },
}
```

---

### 18.7 Impacto en el Dashboard del Administrador

El dashboard del admin incluye una sección **"Calidad y Satisfacción"** con:

- NPS (Net Promoter Score) promedio del mes.
- Calificación promedio por asesor (ranking visible para admin y supervisor).
- % de encuestas respondidas.
- Número de alertas de integridad activas (con badge rojo si hay urgentes).
- Tabla de los últimos 10 prospectos marcados como "perdido" con su estado de encuesta.

Y en el **perfil de cada colaborador** (visible para admin):
- Calificación promedio de atención (basada en encuestas de sus clientes).
- Número de alertas de integridad históricas.
- % de prospectos que convirtieron en venta.

Esto permite al administrador detectar no solo fraude, sino también asesores con bajo desempeño, mala atención o alta tasa de prospectos perdidos antes de que sea un problema mayor.

---

## 19. Checklist de Requerimientos

| Requerimiento | Implementación | Justificación |
|--------------|----------------|--------------|
| Frontend comprimido sin source maps | Vite + Terser, `sourcemap: false` | Código no legible ni reversible por terceros |
| Base de datos con RLS | PostgreSQL + políticas por rol | Segunda línea de defensa independiente del código |
| Control de versiones | Git + GitFlow + GitHub + tags semver | Historial completo, rollback, PRs revisables |
| APIs bien diseñadas | DRF + versionado en URL + respuesta estándar | Contrato estable para futuras integraciones |
| Hosting y deployment | Vercel + Railway + MinIO self-hosted | Costo mínimo, escalable |
| Seguridad | JWT + RBAC + RLS + Cloudflare WAF + URLs firmadas MinIO | Defensa en profundidad: múltiples capas |
| Rate limiting | DRF Throttling + Redis, por rol y endpoint | Protección contra abuso, bots y fuerza bruta |
| Caché / Caching | Redis + django-redis + React Query | Rendimiento y reducción de carga en DB |
| Escalabilidad total | Backend stateless + workers separados + índices | Agregar instancias sin cambiar la arquitectura |
| Monitoreo | Sentry (gratis) + Dashboard admin interno | Sin costo adicional, métricas de negocio y sistema |
| Auditoría total / Logs | Tabla append-only con RLS + structlog JSON | Registro permanente e inalterable de toda acción |
| Sistema agéntico | Celery + Celery Beat + webhooks de redes sociales | Automatizaciones que reducen trabajo manual |
| Almacenamiento de archivos | MinIO self-hosted (S3-compatible) | Costo $0 en storage, control total, buckets separados |
| Redes sociales | Meta Lead Ads + TikTok Lead Ads + Meta Graph API | Captación automática de prospectos + publicación desde CRM |
| Costo mínimo | Planes gratuitos + self-hosted donde sea posible | ~$15-20/mes total en infraestructura |

---

*Casas Los Mochis — Documento Técnico v4.2 | Junio 2026*
*Actualizar al iniciar cada fase. Próxima revisión: inicio de Fase 2.*
| Postventa y satisfacción | Encuestas automáticas WhatsApp/email + seguimiento admin | Medir calidad del servicio de forma independiente al asesor |
| Protección anti-fuga de comisiones | Trazabilidad permanente + alertas de integridad + tabla `fraud_alerts` | Detectar ventas cerradas fuera del sistema con clientes de la empresa |
| Política de propiedad del cliente | Aceptación firmada digitalmente al dar de alta colaboradores | Evidencia legal en caso de disputa por comisiones |

---

## 20. Bot de WhatsApp — Arquitectura y Flujos

### 20.1 Por qué construirlo dentro de Django

**Por qué:** Construir el bot dentro del mismo backend Django elimina toda integración externa, comparte la misma base de datos, los mismos modelos de Lead y SatisfactionSurvey, y no agrega costo mensual adicional. Una plataforma no-code como Respond.io o Landbot costaría $30-80 USD/mes y tendría integración limitada con el CRM propio.

**Para qué:** El bot sirve a tres propósitos distintos según el contexto:

1. **Filtro de prospectos entrantes (modelo `hosting`)** — Cuando alguien contacta desde `casasguasave.com` u otra ciudad externa, el bot califica al prospecto automáticamente por presupuesto, tipo de crédito y urgencia antes de conectarlo con el publicador. En el modelo `full_crm` (Los Mochis) este flujo **no aplica** — el contacto es directo al asesor sin pasar por el bot.

2. **Encuestas de postventa (ambos modelos)** — El bot envía la encuesta de satisfacción automáticamente 48h después del cierre, desde el número corporativo de cada ciudad.

3. **Seguimiento a prospectos no consolidados (ambos modelos)** — El bot contacta al prospecto 72h después de marcarse como perdido, con un mensaje cálido y sin confrontación.

El bot es una app Django más (`apps/whatsapp_bot/`) que recibe webhooks de Meta, procesa la conversación con lógica de flujos en Python, y responde usando la Meta Cloud API. Comparte modelos, Redis y Celery con el resto del sistema.

```
Meta WhatsApp Cloud API
        │
        │ webhook POST (mensaje entrante)
        ▼
/api/v1/webhooks/whatsapp/
        │
        ▼
WhatsAppBotView (Django)
        │
        ├── Identifica tenant por número destino
        ├── Recupera o crea sesión de conversación (Redis)
        ├── Ejecuta máquina de estados del flujo
        ├── Genera respuesta (texto + botones)
        └── Llama Meta Cloud API → envía respuesta al cliente
```

### 20.2 Interfaz — Botones, no números

**Por qué:** Responder con números ("escribe 1 para casa, 2 para depa") es experiencia de bots de 2015. WhatsApp Business API soporta botones interactivos nativos — el cliente toca, no escribe. Es más rápido, más claro y reduce errores.

**Tipos de mensajes interactivos disponibles:**

```
Botones de respuesta rápida (máx. 3 opciones):
┌─────────────────────────────────────┐
│ ¿Qué operación buscas?              │
│  [🏠 Comprar]  [🔑 Rentar]  [📋 Info] │
└─────────────────────────────────────┘

Lista interactiva (hasta 10 opciones):
┌─────────────────────────────────────┐
│ ¿Qué tipo de propiedad buscas?      │
│  ≡ Ver opciones ▼                   │
│  ┌──────────────────────────────┐   │
│  │ 🏠 Casa                      │   │
│  │ 🏢 Departamento              │   │
│  │ 🏪 Local comercial           │   │
│  │ 🌿 Terreno                   │   │
│  │ 🏭 Bodega / Nave industrial  │   │
│  └──────────────────────────────┘   │
└─────────────────────────────────────┘
```

### 20.3 Los Tres Flujos del Bot

#### Flujo 1 — Captación de Prospecto Nuevo (modelo `hosting` solamente)

**Por qué:** En ciudades externas (modelo `hosting`) no hay asesores propios con CRM completo. Cuando alguien escribe al número de la ciudad sin que haya un asesor asignado, el bot captura sus datos, los califica automáticamente y los registra en el CRM. El publicador y el asesor CLM solo atienden prospectos ya registrados y filtrados — esto es el diferenciador frente a portales nacionales.

**En el modelo `full_crm` (Los Mochis) este flujo no existe.** El número de WhatsApp en la ficha pertenece al asesor asignado directamente — el mensaje llega a su teléfono personal y él gestiona el prospecto desde el CRM.

```
Cliente escribe cualquier mensaje
        │
        ▼
"¡Hola! 👋 Bienvenido a Casas Los Mochis.
¿En qué podemos ayudarte hoy?"
[🔍 Buscar propiedad] [🏠 Quiero vender] [📞 Hablar con asesor]
        │
   [Buscar propiedad]
        │
        ▼
"¿Qué operación buscas?"
[🛒 Comprar] [🔑 Rentar]
        │
        ▼
"¿Qué tipo de propiedad?" (lista interactiva)
Casa / Departamento / Local / Terreno / Bodega / Oficina
        │
        ▼
── FILTRO DE CALIFICACIÓN AUTOMÁTICO ──
        │
        ▼
"¿Cuál es tu presupuesto aproximado?" (lista)
Menos de $500k / $500k-$1M / $1M-$2M / Más de $2M / No sé aún
        │
        ▼
"¿Cómo planeas pagar?" (lista)
Contado / Crédito bancario / INFONAVIT / FOVISSSTE / Aún lo defino
        │
        ▼
"¿Ya iniciaste tu trámite de crédito?" (si aplica)
[Sí, ya tengo precalificación] [En proceso] [Todavía no]
        │
        ▼
"¿En qué tiempo piensas tomar una decisión?"
[Este mes] [1 a 3 meses] [3 a 6 meses] [Solo estoy explorando]
        │
        ▼
"¿Cuál es tu nombre?" → respuesta libre
"¿Y tu número de contacto?" → respuesta libre (o usa el mismo)
        │
        ▼
Sistema calcula score → crea Lead en CRM → respuesta según score
```

#### Flujo 2 — Encuesta de Satisfacción Postventa

**Por qué:** La encuesta llega del número corporativo de la empresa, no del asesor — esto garantiza independencia y respuestas honestas. El opt-in protege el quality rating del número.

```
[Bot inicia — 48h después del cierre de venta]

"¡Hola [Nombre]! 🏠 Somos Casas Los Mochis.
Queremos agradecerte tu confianza.
¿Nos regalas 2 minutos para contarnos
cómo fue tu experiencia?"
[✅ Claro, con gusto] [❌ Ahora no, gracias]
        │
   [Con gusto]
        │
        ▼
"¿Cómo calificarías la atención que recibiste?"
[⭐ Muy mala] [⭐⭐ Mala] [⭐⭐⭐ Regular]
[⭐⭐⭐⭐ Buena] [⭐⭐⭐⭐⭐ Excelente]
        │
        ▼
"¿El proceso fue claro y sencillo para ti?"
[Sí, muy claro ✨] [Regular 🤔] [No mucho 😕]
        │
        ▼
"¿Sentiste que tu asesor te escuchó
y entendió lo que buscabas?"
[Sí, totalmente] [En parte] [No realmente]
        │
        ▼
"¿Recomendarías Casas Los Mochis
a un familiar o amigo?"
[Sí, sin dudarlo 🙌] [Probablemente] [Tal vez no]
        │
        ▼
"¿Quieres dejarnos algún comentario
para mejorar nuestro servicio?"
[Sí, quiero comentar] [No, está bien así]
        │
   [Quiero comentar] → respuesta libre (texto)
        │
        ▼
"¡Muchas gracias [Nombre]! 🙏
Tu opinión nos ayuda a seguir mejorando.
Fue un placer acompañarte en este proceso.
¡Felicidades por tu nuevo hogar! 🏠✨"

[Sistema guarda respuestas en SatisfactionSurvey]
[Analiza texto libre buscando keywords de alerta]
[Si score bajo o keywords detectadas → FraudAlert al admin]
```

#### Flujo 3 — Prospectos No Consolidados (con tacto)

**Por qué:** Un prospecto que no compró no es un fracaso — puede ser alguien que necesita más tiempo, más opciones o apoyo con su trámite de crédito. El mensaje nunca insinúa que no calificó. Solo abre la puerta al futuro.

```
[Bot inicia — 72h después de marcar como no consolidado]

"¡Hola [Nombre]! 👋 Somos Casas Los Mochis.
Sabemos que estuviste buscando tu próximo hogar
y queremos saber cómo estás.
¿Pudimos ayudarte en algo durante tu búsqueda?"
[Sí, gracias 😊] [Me gustaría platicar]
        │
        ▼
"¿Sigues con planes de buscar una propiedad?"
[Sí, sigo buscando] [Por ahora lo pausé] [Ya encontré algo]
        │
   [Sigo buscando] ──────────────────────────────────────►
        │                                                  │
        ▼                                                  ▼
"Perfecto, con gusto te           Sistema reactiva Lead,
seguimos apoyando. ¿Quieres       temperatura sube a tibio,
que te avisemos cuando lleguen     asesor recibe notificación
nuevas propiedades que se
ajusten a lo que buscas?"
[Sí, avísame 🔔] [No por ahora]
        │
   [Por ahora lo pausé]
        │
        ▼
"Entendemos perfectamente,
los planes cambian. Cuando
retomes tu búsqueda, aquí
estaremos. ¿Podemos preguntarte
qué fue lo que más te gustó
de nuestra atención?"
→ Respuesta libre
[Sistema guarda para métricas de calidad]

   [Ya encontré algo]
        │
        ▼
"¡Qué gusto saberlo! 🎉
Esperamos que hayas encontrado
exactamente lo que buscabas.
¿Fue con nosotros o encontraste
otra opción?"
[Con Casas Los Mochis 🏠] [Con otra opción]
        │
   [Con otra opción] → [Sistema registra señal interna,
                        notifica admin discretamente si
                        no hay venta registrada para este lead]
        │
        ▼
"Nos alegra que hayas encontrado
tu hogar. Si en el futuro necesitas
algo, aquí estaremos. 😊"
```

### 20.4 Score de Calificación Automático (modelo `hosting`)

**Por qué:** En ciudades externas el bot filtra prospectos sin intervención humana. El publicador solo recibe en su panel los contactos que ya pasaron el filtro — esto multiplica su percepción de valor y justifica la suscripción mensual. En el modelo `full_crm` (Los Mochis), el score no se aplica al contacto inicial porque el asesor atiende directamente; puede usarse internamente por el asesor para priorizar su pipeline si lo desea, pero no bloquea el contacto.

```python
# apps/whatsapp_bot/qualification.py

def calculate_lead_score(answers, property_price):
    score = 0

    # Tiempo de decisión (0-30 puntos)
    timeline_scores = {
        'this_month': 30, '1_3_months': 20,
        '3_6_months': 10, 'just_looking': 0
    }
    score += timeline_scores.get(answers['timeline'], 0)

    # Tipo de pago (0-40 puntos)
    payment_scores = {
        'contado': 40, 'prequalified': 35,
        'infonavit': 25, 'fovissste': 25,
        'bancario': 20, 'in_process': 15,
        'not_defined': 5
    }
    score += payment_scores.get(answers['payment'], 0)

    # Presupuesto vs precio (0-30 puntos)
    budget = answers.get('budget', 0)
    if budget >= property_price:          score += 30
    elif budget >= property_price * 0.9:  score += 20
    elif budget >= property_price * 0.7:  score += 10
    else:                                 score += 0

    return score  # 0-100


def get_response_by_score(score, lead_name):
    if score >= 70:
        # CALIFICADO — asesor notificado, SLA 2 horas
        return {
            'temperature': 'hot',
            'message': (
                f"¡Perfecto {lead_name}! 🌟 Tienes un excelente perfil "
                f"para esta propiedad. En menos de 2 horas un asesor "
                f"te contactará con todos los detalles. "
                f"¡Estamos muy cerca de encontrarte tu hogar ideal! 🏠"
            ),
            'notify_agent': True,
            'sla_hours': 2
        }
    elif score >= 40:
        # TIBIO — entra a cola normal, SLA 24 horas
        return {
            'temperature': 'warm',
            'message': (
                f"Gracias {lead_name}! 😊 Tenemos opciones que "
                f"podrían ajustarse perfectamente a lo que buscas. "
                f"Un asesor te contactará para explorarlas juntos."
            ),
            'notify_agent': True,
            'sla_hours': 24
        }
    else:
        # FRÍO — seguimiento automatizado, sin notificar asesor
        return {
            'temperature': 'cold',
            'message': (
                f"¡Gracias {lead_name}! 🙏 Queremos asegurarnos de "
                f"encontrarte exactamente lo que necesitas. "
                f"¿Te parece si te avisamos cuando tengamos opciones "
                f"que se ajusten mejor a tu búsqueda?"
            ),
            'notify_agent': False,
            'subscribe_alerts': True
        }
```

### 20.5 Seguridad del Bot y Protección del Número

**Por qué:** Meta puede restringir o banear números que violan sus políticas. El riesgo para Casas Los Mochis es bajo porque el bot responde conversaciones entrantes, nunca hace spam masivo. Pero hay medidas que se implementan desde el primer día.

**Para qué:** Mantener el Quality Rating del número en verde (High) permanentemente, que es el indicador que Meta usa para determinar los límites de la cuenta.

```python
# Medidas de protección implementadas:

# 1. OPT-IN EXPLÍCITO antes de cualquier mensaje iniciado por el negocio
#    El bot pregunta si puede enviar la encuesta antes de mandarla.
#    Si el cliente dice no → se cancela. Protege el quality rating.

# 2. VERIFICACIÓN DE WEBHOOK — todos los webhooks de Meta se verifican
#    con el X-Hub-Signature-256 header antes de procesarse.
#    Previene que actores externos inyecten mensajes falsos.
def verify_meta_webhook(request):
    signature = request.headers.get('X-Hub-Signature-256', '')
    expected = hmac.new(
        settings.META_APP_SECRET.encode(),
        request.body,
        hashlib.sha256
    ).hexdigest()
    return hmac.compare_digest(f'sha256={expected}', signature)

# 3. HORARIO DE ENVÍO — mensajes iniciados por el negocio
#    solo entre 9:00am y 7:00pm hora local.
#    Celery Beat respeta esta ventana para encuestas y notificaciones.

# 4. MONITOREO DEL QUALITY RATING via Meta API
#    Tarea Celery diaria que consulta el rating del número.
#    Si baja a Amarillo → alerta al admin.
#    Si baja a Rojo → pausa envíos iniciados por el negocio automáticamente.

# 5. NÚMERO DE RESPALDO registrado en Meta pero inactivo.
#    Si el número principal tiene problemas, el admin activa
#    el respaldo desde el panel con un switch — sin tocar código.

# 6. RATE LIMITING del bot — máximo 10 mensajes por conversación
#    activa para prevenir loops infinitos o abuso.
```

### 20.6 Números de WhatsApp por Ciudad

**Por qué:** Un número con lada local genera más confianza que un número foráneo. Alguien en Guasave confía más en un número 669 que en uno 668 de Los Mochis.

**Para qué:** Cada tenant tiene su propio número configurado en la tabla `tenants`. El sistema sabe qué número usar según el dominio de origen. Agregar un número nuevo a una ciudad nueva es actualizar un campo en la DB.

```
Etapa 1 (ahora):
casaslosmochis.com → +52 668 XXX XXXX  (número corporativo CLM)

Etapa 2 (al activar cada ciudad):
casasguasave.com   → +52 669 XXX XXXX  (SIM local Guasave)
casasnavojoa.com   → +52 642 XXX XXXX  (SIM local Navojoa)

Costo por número: ~$100 MXN SIM una sola vez
Cada número se conecta a Meta Cloud API de forma independiente.
Si un número tiene problema, los demás no se afectan.
```

---

## 21. Arquitectura Multi-Tenant por Dominio

### 21.1 Por qué y Para qué

**Por qué:** El mismo código base sirve a múltiples ciudades sin duplicar infraestructura, sin múltiples servidores, sin múltiples bases de datos. Un solo VPS, una sola DB, un solo deploy.

**Para qué:** Que agregar una ciudad nueva tome 15 minutos, no semanas. Que el costo marginal de cada ciudad nueva sea prácticamente cero en servidor.

### 21.2 La Tabla que lo Hace Posible

```sql
CREATE TABLE tenants (
    id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    domain           VARCHAR(100) UNIQUE NOT NULL, -- 'casaslosmochis.com'
    city             VARCHAR(100) NOT NULL,         -- 'Los Mochis'
    state            VARCHAR(100) NOT NULL,         -- 'Sinaloa'
    name             VARCHAR(100) NOT NULL,         -- 'Casas Los Mochis'

    -- Identidad visual — todo configurable sin tocar código
    logo_path        TEXT,           -- R2: tenants/losmochis/logo.svg
    favicon_path     TEXT,           -- R2: tenants/losmochis/favicon.ico
    primary_color    VARCHAR(7),     -- '#1B2B4B'
    secondary_color  VARCHAR(7),     -- '#C9A84C'
    font_family      VARCHAR(50),    -- 'Inter' (puede variar por ciudad)

    -- Contacto
    whatsapp_number  VARCHAR(20),    -- '+526681234567'
    email_contact    VARCHAR(100),   -- 'contacto@casaslosmochis.com'
    phone_display    VARCHAR(20),    -- Número visible en el portal

    -- Modelo de negocio
    tenant_type      VARCHAR(20),
    -- 'full_crm'  = Los Mochis (CRM completo, asesores propios, sin cobro por publicar)
    -- 'hosting'   = Ciudades externas (publicadores externos, suscripción de pago)

    -- SEO por ciudad
    meta_title       VARCHAR(100),   -- 'Casas en Venta en Los Mochis | Casas Los Mochis'
    meta_description TEXT,
    meta_keywords    TEXT,

    -- Idiomas habilitados
    languages        JSONB DEFAULT '["es"]', -- ["es", "en"]

    -- Configuración de suscripción (para tenant_type = 'hosting')
    plan_basic_limit    SMALLINT DEFAULT 3,   -- máx propiedades plan básico
    plan_standard_limit SMALLINT DEFAULT 5,
    plan_pro_limit      SMALLINT DEFAULT 10,

    is_active        BOOLEAN DEFAULT TRUE,
    created_at       TIMESTAMPTZ DEFAULT NOW()
);

-- Registro inicial
INSERT INTO tenants (domain, city, state, name, primary_color, secondary_color,
                     tenant_type, whatsapp_number, meta_title, languages)
VALUES ('casaslosmochis.com', 'Los Mochis', 'Sinaloa', 'Casas Los Mochis',
        '#1B2B4B', '#C9A84C', 'full_crm', '+526681234567',
        'Casas en Venta en Los Mochis | Casas Los Mochis', '["es","en"]');
```

### 21.3 El Middleware — Detecta el Tenant en Cada Petición

```python
# core/middleware.py
class TenantMiddleware:
    """
    Se ejecuta en cada petición HTTP.
    Detecta el dominio, carga el tenant desde Redis (cache 24h)
    y lo inyecta en el request. A partir de ahí, toda la app
    sabe en qué ciudad está operando.
    """
    def __call__(self, request):
        domain = request.get_host().replace('www.', '').split(':')[0]
        cache_key = f'tenant:{domain}'

        tenant = cache.get(cache_key)
        if not tenant:
            try:
                tenant = Tenant.objects.get(domain=domain, is_active=True)
                cache.set(cache_key, tenant, 86400)  # Cache 24 horas
            except Tenant.DoesNotExist:
                return HttpResponse('Dominio no configurado', status=404)

        request.tenant = tenant
        return self.get_response(request)
```

### 21.4 Cómo el Frontend Recibe la Identidad Visual

```
GET /api/v1/tenant/config/
Host: casasguasave.com
─────────────────────────────────
{
  "name": "Casas Guasave",
  "city": "Guasave",
  "primary_color": "#2C5F2E",
  "secondary_color": "#97BC62",
  "logo_url": "https://r2.cloudflarestorage.com/tenants/guasave/logo.svg",
  "favicon_url": "https://r2.cloudflarestorage.com/tenants/guasave/favicon.ico",
  "whatsapp_number": "+526891234567",
  "tenant_type": "hosting",
  "languages": ["es", "en"]
}
```

React aplica la identidad visual al cargar:

```js
// src/hooks/useTenant.js
export function useTenant() {
    const { data: tenant } = useQuery('tenant', fetchTenantConfig)

    useEffect(() => {
        if (!tenant) return
        // Aplica colores como CSS variables al root del documento
        document.documentElement.style.setProperty('--color-primary', tenant.primary_color)
        document.documentElement.style.setProperty('--color-secondary', tenant.secondary_color)
        // Swap de logo y favicon
        document.querySelector('#app-logo').src = tenant.logo_url
        document.querySelector('#favicon').href = tenant.favicon_url
        // Título del sitio
        document.title = tenant.meta_title
    }, [tenant])

    return tenant
}
// Resultado: todo el sitio adopta la identidad de la ciudad
// con dos líneas de CSS. Mismo HTML, mismo componente, marca diferente.
```

Tailwind usa esas variables en toda la UI:
```js
// tailwind.config.js
theme: {
    extend: {
        colors: {
            primary: 'var(--color-primary)',
            secondary: 'var(--color-secondary)',
        }
    }
}
```

### 21.5 Aislamiento de Datos por Tenant

Cada tabla con contenido por ciudad lleva `tenant_id`. El manager de Django filtra automáticamente:

```python
# core/managers.py
class TenantManager(models.Manager):
    def get_queryset(self):
        tenant = get_current_tenant()  # Del thread local del request
        return super().get_queryset().filter(tenant=tenant)

# Resultado: Property.objects.all() devuelve SOLO las propiedades
# del tenant activo. Nunca se mezclan datos entre ciudades.
# Un publicador de Guasave nunca ve propiedades de Los Mochis.
```

### 21.6 Diferencia entre tenant_type

```
full_crm (Los Mochis)              hosting (Guasave, Navojoa...)
──────────────────────────         ──────────────────────────────
CRM completo visible               Panel de publicador limitado
Asesores propios con login         Publicadores externos con login
Prospectos internos en pipeline    Contactos pasan por CLM primero
Comisiones y splits                Suscripción mensual de pago
Pipeline Kanban                    Vista de visitas y vencimiento
Documentación de clientes          Sin acceso a documentos internos
Encuestas internas                 Encuesta al comprador final
Bot captación + encuestas          Bot de contacto + filtro
Sin cobro por publicar             Plan Básico / Estándar / Pro
```

El frontend detecta `tenant_type` y muestra módulos diferentes. Un publicador en Guasave que inicia sesión ve solo su panel limitado — el CRM completo no existe en su vista, aunque corra en el mismo código.

### 21.7 Agregar una Ciudad Nueva — 15 Minutos

```
Paso 1 — Dominio (~2 min)
Comprar casasnavojoa.com
Apuntar DNS a Cloudflare
Cloudflare apunta al mismo VPS
SSL automático (gratis, mismo servidor)

Paso 2 — Insertar tenant (~1 min)
INSERT INTO tenants (domain, city, name, primary_color,
                     secondary_color, tenant_type, whatsapp_number...)
VALUES ('casasnavojoa.com', 'Navojoa', 'Casas Navojoa',
        '#8B0000', '#DAA520', 'hosting', '+526731234567');

Paso 3 — Assets visuales (~5 min)
Logo SVG → Cloudflare R2: tenants/navojoa/logo.svg
Favicon  → Cloudflare R2: tenants/navojoa/favicon.ico

Paso 4 — Número WhatsApp (~5 min)
Registrar SIM local en Meta Cloud API
Actualizar whatsapp_number en la DB

Paso 5 — Listo
casasnavojoa.com está vivo con identidad propia,
datos aislados, WhatsApp local, sin afectar a Las Mochis.
Costo en servidor: $0 adicional.
```

### 21.8 Estrategia de Dominios

**Por qué dominios por ciudad:** El SEO local favorece dominios que contienen la ciudad. `casasguasave.com` posiciona mejor en "casas en venta Guasave" que cualquier portal nacional con subsección. Contra Inmuebles24 a nivel nacional no se puede competir hoy — en búsquedas locales sí.

**Dominios a registrar ahora** (aunque no se usen todavía):
```
casaslosmochis.com     ← En producción
casasguasave.com       ← Segunda ciudad objetivo
casasnavojoa.com
casasmazatlan.com
casasculiacan.com
casasfuerte.com
casasahome.com
casassinaloa.com       ← Paraguas regional (futuro)

Costo: ~$180 MXN/año × 8 dominios = $1,440 MXN única inversión
Beneficio: nadie más puede registrarlos, activo digital protegido.
```

---

## 22. Modelo de Negocio para Ciudades Externas

### 22.1 Propuesta de Valor vs Portales Nacionales

**Por qué no compiten directamente con Inmuebles24:** Inmuebles24 tiene millones de visitas, posicionamiento nacional y marca reconocida. Competir frontalmente es imposible hoy. La estrategia es diferente: ganar en nichos locales donde los portales grandes son débiles.

**Lo que Casas Los Mochis ofrece que ningún portal nacional hace:**

| Característica | Inmuebles24 / Lamudi | Casas Los Mochis (hosting) |
|---------------|---------------------|---------------------------|
| Contacto del interesado | Directo al publicador (curiosos incluidos) | Filtrado por bot + asesor CLM antes de llegar |
| Calidad del prospecto | Cualquiera que hizo clic | Calificado por presupuesto, crédito y urgencia |
| Seguimiento post-contacto | Ninguno | Asesor confirma que el contacto fue gestionado |
| Visibilidad de métricas | Visitas básicas | Visitas + contactos gestionados + estado |
| Encuesta al comprador | No existe | Sí, confirma satisfacción y detecta irregularidades |
| Presencia local | Página genérica /ciudad | Dominio dedicado, posicionamiento local |
| Precio | Desde $800 MXN/propiedad/mes | Plan por volumen, más accesible |
| Soporte | Ticket online | WhatsApp directo con equipo CLM |

### 22.2 Planes de Suscripción

**Por qué por volumen y no por propiedad:** Cobrar por propiedad individual es costoso para el publicador y genera fricción — cada nueva publicación requiere una decisión de pago. Un plan mensual con límite de propiedades activas es más predecible y fomenta la lealtad.

```
PLAN BÁSICO       $X MXN/mes    hasta 3 propiedades activas simultáneas
PLAN ESTÁNDAR     $X MXN/mes    hasta 5 propiedades activas simultáneas
PLAN PRO          $X MXN/mes    hasta 10 propiedades activas simultáneas
PLAN ILIMITADO    $X MXN/mes    sin límite de propiedades

También disponible: Paquetes por días
15 días           $X MXN        hasta N propiedades
30 días           $X MXN        hasta N propiedades
60 días           $X MXN        hasta N propiedades (descuento)

El precio exacto lo define el administrador desde el panel.
La estructura ya está lista en el sistema para cualquier valor.
```

**Lógica de límite en el sistema:**
```python
# Al intentar publicar una propiedad nueva
def can_publish_property(publisher):
    active_count = Property.objects.filter(
        publisher=publisher,
        status='active',
        tenant=publisher.tenant
    ).count()
    plan_limit = publisher.subscription.plan.property_limit
    if active_count >= plan_limit:
        raise SubscriptionLimitError(
            f"Tu plan permite máximo {plan_limit} propiedades activas. "
            f"Actualiza tu plan para publicar más."
        )
```

### 22.3 Pasarela de Pagos — Estructura Flexible

**Por qué dejarla flexible:** La decisión entre Mercado Pago, Stripe y Conekta aún no está tomada. El sistema se diseña con una capa de abstracción que permite conectar cualquier pasarela sin cambiar la lógica de negocio.

```python
# apps/payments/gateway.py
class PaymentGateway:
    """Interfaz abstracta — el resto del sistema llama a esta clase,
    no a Stripe o Mercado Pago directamente. Cambiar de pasarela
    es cambiar solo esta implementación."""

    def create_subscription(self, publisher, plan): raise NotImplementedError
    def cancel_subscription(self, subscription): raise NotImplementedError
    def process_one_time_payment(self, publisher, amount): raise NotImplementedError
    def get_payment_status(self, payment_id): raise NotImplementedError

# Implementaciones concretas (una activa según settings)
class MercadoPagoGateway(PaymentGateway): ...   # Popular en México
class StripeGateway(PaymentGateway): ...         # Internacional, mejor API
class ConektaGateway(PaymentGateway): ...        # SPEI + tarjeta México

# settings/base.py
PAYMENT_GATEWAY = env('PAYMENT_GATEWAY', default='mercadopago')
# Cambiar de pasarela = cambiar una variable de entorno
```

### 22.4 Rol del Publicador Externo

**Por qué un rol nuevo:** El publicador no es un asesor (no usa el CRM completo), no es un visitante (tiene acceso autenticado), no es un admin. Es un cliente-publicador con acceso muy limitado y específico.

```python
# En la tabla users, role incluye 'publisher'
# Un publisher siempre pertenece a un tenant de tipo 'hosting'
# Sus permisos son los mínimos necesarios:

PUBLISHER_PERMISSIONS = [
    'properties.add_property',       # Puede crear propiedades (borrador)
    'properties.change_own_property', # Solo las suyas
    'properties.view_own_stats',      # Ve visitas de sus propiedades
    'subscription.view_own',          # Ve su plan y vencimiento
]
# NO puede ver: leads, ventas, CRM, otros publicadores, métricas globales
```

### 22.5 Flujo Completo del Publicador Externo

```
PUBLICADOR                    SISTEMA                      INTERESADO
────────────                  ────────                     ──────────
Registra cuenta
Elige plan y paga ──────────► Crea suscripción
                              Habilita acceso
Sube propiedad ─────────────► Estado: "En revisión"
                              Notifica a asesor CLM
                    ◄──────── Asesor revisa y aprueba/rechaza
                              (con comentarios si rechaza)
Propiedad activa              Estado: "Activa"
                              Aparece en casasguasave.com
                                                           Ve la propiedad
                                                           Toca "Contactar"
                              Bot inicia filtro ──────────►
                              Bot califica ◄──────────────
                              Si calificado:
                              Crea Lead (externo)
                              Asesor CLM recibe notif.
Publicador recibe             Asesor conecta al
notif: "Alguien              interesado con publicador
está interesado"             (presenta y se retira)
                                                           Compra/renta
                              Sistema detecta cierre
                              Manda encuesta ────────────►
                                                          ◄─ Responde encuesta
                              Guarda en SatisfactionSurvey
Publicador ve en              Admin CLM ve métricas
su panel: 1 contacto          del prospecto externo
gestionado
```

### 22.6 Panel del Publicador Externo

**Lo que ve al iniciar sesión:**

```
┌─────────────────────────────────────────────────┐
│ 🏠 Mis Propiedades          Plan: Estándar (5)   │
│                             Vence: 15 Jul 2026   │
├─────────────────────────────────────────────────┤
│ Casa Colonia Centro                    ● Activa  │
│ 👁 234 visitas   📞 3 contactos gestionados      │
│ [Ver detalles] [Editar] [Desactivar]             │
├─────────────────────────────────────────────────┤
│ Local Av. Rosales                  ⏳ En revisión│
│ Subida hace 2 horas — pendiente de aprobación    │
├─────────────────────────────────────────────────┤
│ + Publicar nueva propiedad    (2 de 5 usadas)    │
└─────────────────────────────────────────────────┘
```

**Lo que NO ve:** prospectos de otros, pipeline de ventas, CRM, comisiones, otros publicadores, métricas globales de la plataforma.

**Soporte:** Botón de WhatsApp directo al equipo CLM. No hay chat interno — es más simple y más personal.

---

## 23. Internacionalización (ES / EN)

### 23.1 Por qué desde el inicio

**Por qué:** Agregar i18n después de que el sistema tiene miles de strings en el código es un trabajo enorme y costoso. Hacerlo desde el inicio agrega muy poco tiempo de desarrollo y deja la puerta abierta a compradores extranjeros, mexicanos en EE.UU. buscando invertir en su ciudad natal, o expansión a zonas turísticas.

**Para qué:** Que cualquier visitante pueda cambiar el idioma del portal con un toggle. El contenido de las propiedades (título, descripción) también puede ingresarse en ambos idiomas opcionalmente.

### 23.2 Implementación

**Backend (Django):**
```python
# Django tiene i18n nativo — activar en settings
LANGUAGE_CODE = 'es'
LANGUAGES = [('es', 'Español'), ('en', 'English')]
USE_I18N = True

# En vistas y modelos, strings traducibles:
from django.utils.translation import gettext_lazy as _
verbose_name = _('Propiedad')

# Archivos de traducción generados con:
# python manage.py makemessages -l en
# python manage.py compilemessages
```

**Frontend (React):**
```js
// react-i18next — estándar de la industria
import { useTranslation } from 'react-i18next'

function PropertyCard({ property }) {
    const { t } = useTranslation()
    return (
        <div>
            <span>{t('property.bedrooms', { count: property.bedrooms })}</span>
            // ES: "2 recámaras"  EN: "2 bedrooms"
        </div>
    )
}

// Toggle de idioma en navbar — cambia toda la UI instantáneamente
// La preferencia se guarda en localStorage
```

**Contenido de propiedades bilingüe (opcional para el asesor):**
```sql
-- Los asesores pueden agregar descripción en inglés si quieren
ALTER TABLE properties ADD COLUMN title_en VARCHAR(255);
ALTER TABLE properties ADD COLUMN description_en TEXT;
-- Si no se llena, el sistema muestra el español por defecto
```

---

## 24. Infraestructura VPS — Configuración Definitiva

### 24.1 Un Solo VPS para Todo (Etapa 1)

**Por qué un VPS propio en lugar de servicios separados:** Tener Django en Railway, DB en Supabase, Redis en Upstash y archivos en Cloudinary puede sumar $50-80 USD/mes con límites de uso. Un VPS propio consolida todo por €6-8/mes sin límites artificiales y con control total.

**Para qué:** Que el costo de infraestructura no sea un obstáculo mientras el negocio crece. Cuando los ingresos del modelo de suscripción de ciudades externas lo justifiquen, se escala a dos VPS sin cambiar el código.

```
Hetzner CX32 — €7.49/mes (~$150 MXN)
4 vCPU / 8GB RAM / 160GB SSD NVMe / 20TB transferencia/mes
Datacenter: Nuremberg o Helsinki (latencia a México: 120-180ms — aceptable)
Alternativa México: DigitalOcean NYC (~200ms) o Contabo

Consumo estimado de RAM:
─────────────────────────────────────────────
Nginx                  ~50-100 MB
Django (4 workers)     ~300-600 MB
Celery (2 workers)     ~200-400 MB
Redis                  ~50-200 MB
PostgreSQL             ~300-800 MB
MinIO (docs privados)  ~256-512 MB
Bot WhatsApp           ~100-150 MB
Sistema operativo      ~300 MB
─────────────────────────────────────────────
Total estimado         ~1.5-3.0 GB de 8GB
Margen disponible      ~5-6.5 GB ✅
```

### 24.2 Separación de Almacenamiento

**Por qué dos sistemas de almacenamiento:** Los archivos públicos (fotos de propiedades) generan tráfico de descarga constante. Si se sirven desde el VPS, consumen ancho de banda y CPU. Separar archivos públicos en Cloudflare R2 elimina ese tráfico del servidor completamente.

```
Cloudflare R2 — Archivos PÚBLICOS
──────────────────────────────────
Fotos de propiedades
Videos de propiedades
Renders y planos (versión pública)
Logos e imágenes de tenants

Por qué R2 específicamente:
- Egress (descarga) GRATIS — Cloudflare no cobra salida
- $0 hasta 10GB almacenados
- $0.015/GB/mes después de 10GB
- API compatible con S3 (mismo código que MinIO)
- Integrado con Cloudflare CDN automáticamente
- Para 100GB de fotos/videos: ~$1.35 USD/mes

MinIO self-hosted en el VPS — Archivos PRIVADOS
──────────────────────────────────────────────────
INE, CURP, comprobantes del prospecto
Contratos firmados
Escrituras y avalúos
Facturas y tickets de gastos operativos
Documentos internos del CRM

Por qué MinIO para privados:
- Acceso con URLs firmadas (expiran en 60 min)
- Nunca expuesto al CDN público
- Control total sobre quién accede y cuándo
- Costo $0 (usa el disco del VPS)
- Cada acceso queda en audit_logs
```

### 24.3 Docker Compose — Orquestación de Servicios

**Por qué Docker Compose:** Todos los servicios corren en contenedores aislados. Si un servicio falla, los demás siguen corriendo. Mover un servicio a otro servidor es copiar su bloque del docker-compose y cambiar la IP.

```yaml
# docker-compose.yml
version: '3.9'

services:
  nginx:
    image: nginx:alpine
    ports: ["80:80", "443:443"]
    volumes:
      - ./nginx/conf.d:/etc/nginx/conf.d
      - static_files:/var/www/static
    depends_on: [django]

  django:
    build: ./backend
    command: gunicorn config.wsgi:application --bind 0.0.0.0:8000 --workers 4
    env_file: .env.production
    depends_on: [postgres, redis]
    volumes:
      - static_files:/app/staticfiles

  celery:
    build: ./backend
    command: celery -A config worker -l info --concurrency 2
    env_file: .env.production
    depends_on: [postgres, redis]

  celery_beat:
    build: ./backend
    command: celery -A config beat -l info --scheduler django_celery_beat.schedulers:DatabaseScheduler
    env_file: .env.production
    depends_on: [postgres, redis]

  postgres:
    image: postgres:16-alpine
    env_file: .env.production
    volumes:
      - postgres_data:/var/lib/postgresql/data
    # Solo accesible internamente — nunca expuesto al exterior

  redis:
    image: redis:7-alpine
    volumes:
      - redis_data:/data
    command: redis-server --appendonly yes  # Persistencia en disco

  minio:
    image: minio/minio
    command: server /data --console-address ":9001"
    env_file: .env.production
    volumes:
      - minio_data:/data
    # Puerto 9000 solo accesible internamente vía Nginx

volumes:
  postgres_data:
  redis_data:
  minio_data:
  static_files:
```

### 24.4 Estrategia de Backups 3-2-1

**Por qué 3-2-1:** La regla garantiza que ningún evento único — fallo de disco, error humano, problema del datacenter — pueda eliminar todos los datos.

```
Regla 3-2-1:
3 copias de los datos
2 tipos de almacenamiento diferentes
1 copia fuera del sitio (offsite)

COPIA 1: Datos en producción (VPS)
COPIA 2: Backup en el mismo VPS (otro directorio/volumen)
COPIA 3: Backup offsite en Backblaze B2 (~$0.006/GB/mes)
```

**Script de backup automático (Celery Beat, diario 3:00am):**

```python
# apps/backups/tasks.py
@app.task
def daily_backup():
    timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')

    # 1. Dump de PostgreSQL
    subprocess.run([
        'pg_dump', '-Fc',
        '-f', f'/backups/db/casaslosmochis_{timestamp}.dump',
        env('DATABASE_URL')
    ])

    # 2. Sincronizar MinIO privado a directorio local
    subprocess.run([
        'mc', 'mirror',
        'minio/leads-documents',
        f'/backups/minio/{timestamp}/'
    ])

    # 3. Subir a Backblaze B2 (offsite)
    subprocess.run([
        'rclone', 'copy',
        '/backups/',
        f'b2:casaslosmochis-backups/{timestamp}/',
        '--max-age', '24h'  # Solo archivos nuevos
    ])

    # 4. Limpiar backups locales mayores a 7 días
    cleanup_old_backups(days=7)

    # 5. Limpiar Backblaze B2 mayor a 30 días (retención offsite)
    cleanup_b2_backups(days=30)

    log.info("backup.completed", timestamp=timestamp)
```

**Retención:**
```
Backups locales en VPS:      7 días    (rápida restauración)
Backups en Backblaze B2:     30 días   (offsite, ante fallo del VPS)
Snapshot semanal del VPS:    4 semanas (Hetzner Snapshots, €0.0119/GB)
```

**Costo total de backups:**
```
Backblaze B2:         ~$0.50-2 USD/mes (según volumen de docs privados)
Hetzner Snapshots:    ~€0.50-1/mes
Total:                ~$1-3 USD/mes — prácticamente gratis
```

---


---

## 25. PWA — Aplicación Instalable para Móvil y iPad

### 25.1 Qué es y por qué es la solución correcta

**¿Por qué PWA y no una app nativa?**

Una app nativa (publicada en App Store o Google Play) requiere desarrollo separado para iOS y Android, proceso de aprobación de Apple que puede tomar días o semanas, actualización manual de cada usuario y un costo de cuenta de desarrollador de Apple de $99 USD/año. Para un equipo de 5 asesores que trabajan en campo con iPads e iPhones, esto es innecesariamente complejo y costoso.

Una **PWA (Progressive Web App)** es el mismo sitio web del CRM, configurado para comportarse exactamente como una app nativa:

```
Lo que ve el asesor en su iPad o iPhone:
──────────────────────────────────────────────────────────
✅ Un ícono de "Casas Los Mochis" en su pantalla de inicio
✅ Se abre sin barra de navegador (fullscreen, como una app)
✅ Splash screen con el logo al abrir
✅ Funciona en orientación vertical y horizontal
✅ Funciona con conexión limitada (datos móviles / 3G)
✅ Sin pasar por App Store — se instala desde Safari en 3 toques
✅ Las actualizaciones llegan automáticamente, sin que el asesor haga nada
✅ Notificaciones push aunque la app esté cerrada
```

**¿Para qué sirve en el día a día del asesor?**

Un asesor visita 3-4 propiedades al día, toma notas entre visitas, agenda citas mientras conduce y sube fotos desde el lugar. Con la PWA instalada en su iPad, hace todo desde el ícono de su pantalla de inicio — tan cómodo como cualquier app, sin el costo ni la complejidad de una app nativa.

---

### 25.2 Cómo se instala (experiencia del asesor)

**En iPhone / iPad — Safari:**
```
1. Abre crm.casaslosmochis.com en Safari
2. Toca el botón compartir (□↑) en la barra inferior
3. Selecciona "Añadir a pantalla de inicio"
4. Confirma el nombre "Casas Los Mochis"
5. El ícono aparece en la pantalla de inicio

La próxima vez: toca el ícono → abre directo al dashboard,
sin barra de Safari, pantalla completa, como una app nativa.
```

**En Android — Chrome:**
```
1. Chrome detecta automáticamente que es una PWA instalable
2. Muestra banner "Añadir Casas Los Mochis a inicio"
3. El asesor toca "Instalar"
4. Ícono en pantalla de inicio y en el cajón de apps
```

---

### 25.3 Implementación técnica

**¿Por qué es compatible con el stack actual?** Vite tiene soporte nativo para PWA mediante el plugin `vite-plugin-pwa`. Se configura una sola vez y genera automáticamente todos los archivos necesarios en cada build de producción.

```js
// vite.config.js — añadir al config existente
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',   // Actualiza silenciosamente en background
      includeAssets: ['favicon.ico', 'apple-touch-icon.png'],
      manifest: {
        name: 'Casas Los Mochis — CRM',
        short_name: 'CLM CRM',
        theme_color: '#1B2B4B',       // Color de barra de estado del sistema
        background_color: '#1B2B4B',  // Color del splash screen
        display: 'standalone',        // Sin barra de navegador
        orientation: 'any',           // Vertical y horizontal
        scope: '/crm/',
        start_url: '/crm/dashboard',  // Abre directo al dashboard
        icons: [
          { src: '/icons/icon-192.png',          sizes: '192x192', type: 'image/png' },
          { src: '/icons/icon-512.png',          sizes: '512x512', type: 'image/png' },
          { src: '/icons/apple-touch-icon.png',  sizes: '180x180', type: 'image/png',
            purpose: 'apple touch icon' },
          { src: '/icons/icon-512-maskable.png', sizes: '512x512', type: 'image/png',
            purpose: 'maskable' },
        ]
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg,woff2}'],
        runtimeCaching: [
          {
            // Datos del CRM: intenta red, cae a caché si la señal es lenta
            urlPattern: /^https:\/\/api\.casaslosmochis\.com\/api\/v1\//,
            handler: 'NetworkFirst',
            options: {
              cacheName: 'api-cache',
              expiration: { maxAgeSeconds: 300 },
              networkTimeoutSeconds: 3,  // Si tarda >3s, usa caché
            }
          },
          {
            // Fotos de propiedades: caché agresivo
            urlPattern: /^https:\/\/.*\.(png|jpg|jpeg|webp)$/,
            handler: 'CacheFirst',
            options: {
              cacheName: 'images-cache',
              expiration: { maxEntries: 200, maxAgeSeconds: 86400 }
            }
          }
        ]
      }
    })
  ]
})
```

**Meta tags en index.html para iOS:**
```html
<meta name="apple-mobile-web-app-capable" content="yes">
<meta name="apple-mobile-web-app-status-bar-style" content="black-translucent">
<meta name="apple-mobile-web-app-title" content="CLM CRM">
<link rel="apple-touch-icon" href="/icons/apple-touch-icon.png">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<!-- viewport-fit=cover es crítico para respetar el notch del iPhone -->
```

---

### 25.4 Diseño responsivo — iPad primero

**¿Por qué "iPad primero" y no "mobile first"?** Los colaboradores usan principalmente iPads en campo. La tablet es el dispositivo de trabajo principal — el iPhone es secundario para consultas rápidas y el desktop es del administrador en oficina.

```
iPad (768-1024px)            iPhone (375-430px)           Desktop (1280px+)
────────────────────         ──────────────────────        ──────────────────
Sidebar colapsable           Bottom navigation bar         Sidebar fijo visible
Kanban 3-4 columnas          Lista vertical de leads       Kanban completo
Toque cómodo en pantalla     Thumb-friendly (alcance       Hover states y tooltips
grande: targets 44px+        de pulgar): targets 48px+     Múltiples paneles
Modo horizontal y vertical   Solo vertical                 Siempre horizontal
```

```jsx
// Navegación adaptativa según dispositivo
function Navigation() {
  return (
    <>
      {/* Desktop: sidebar fijo a la izquierda */}
      <aside className="hidden lg:flex flex-col w-56 h-screen bg-navy fixed left-0">
        <SidebarNav />
      </aside>

      {/* iPad: sidebar como drawer deslizable */}
      <Drawer className="hidden md:flex lg:hidden" />

      {/* iPhone: barra de navegación en la parte inferior */}
      <nav className="md:hidden fixed bottom-0 inset-x-0 bg-navy h-16 pb-safe
                      flex items-center justify-around">
        {/* pb-safe respeta el home indicator del iPhone X en adelante */}
        <BottomNavItem icon={FaHome}          label="Inicio"     to="/crm/dashboard" />
        <BottomNavItem icon={FaUsers}         label="Prospectos" to="/crm/leads" />
        <BottomNavItem icon={FaCalendarAlt}   label="Citas"      to="/crm/appointments" />
        <BottomNavItem icon={FaBuilding}      label="Propiedades" to="/crm/properties" />
        <BottomNavItem icon={FaEllipsisH}     label="Más"        to="/crm/more" />
      </nav>
    </>
  )
}

// Pipeline: Kanban en tablet, lista en móvil
function PipelineView({ leads }) {
  return (
    <>
      <div className="hidden md:flex gap-4 overflow-x-auto pb-4">
        {STAGES.map(stage => <KanbanColumn key={stage} stage={stage} leads={leads} />)}
      </div>
      <div className="md:hidden">
        <LeadsList leads={leads} groupByStatus />
      </div>
    </>
  )
}
```

---

### 25.5 Funcionalidades nativas aprovechadas en campo

**Por qué:** El asesor tiene el iPad en la mano frente a una propiedad. Estas integraciones evitan que tenga que salir de la app para hacer una llamada, abrir WhatsApp o la cámara.

```jsx
// Cámara trasera directa — sube fotos de la propiedad sin salir de la PWA
<input type="file" accept="image/*" capture="environment" multiple
       onChange={handlePhotoUpload} />

// Llamada directa al prospecto desde su ficha — un toque
<a href={`tel:${lead.phone}`}>📞 Llamar a {lead.name}</a>

// WhatsApp con mensaje pre-llenado con contexto de la propiedad
const msg = `Hola ${lead.name}, soy ${user.name} de Casas Los Mochis. ` +
            `Te contacto por la propiedad: ${property.title}.`
<a href={`https://wa.me/${lead.phone}?text=${encodeURIComponent(msg)}`}>
  WhatsApp
</a>

// Check-in de visita con geolocalización — confirma que el asesor fue a la propiedad
async function checkIn(appointmentId) {
  const { coords } = await navigator.geolocation.getCurrentPosition()
  await api.post(`/appointments/${appointmentId}/checkin/`, {
    lat: coords.latitude, lng: coords.longitude
  })
}

// Notificaciones push aunque la PWA esté cerrada
// "Nuevo prospecto asignado: Juan García — presupuesto $1.2M — INFONAVIT"
// El asesor toca la notificación → abre directo a la ficha del prospecto
```

---

### 25.6 Comportamiento sin conexión

**Por qué importa:** Una colonia en expansión de Los Mochis puede tener señal débil. El asesor no puede perder una nota o una foto por mala conectividad.

```
Con WiFi (oficina):
  Service Worker descarga y cachea assets + últimos datos del API
  Carga posterior: ~200ms desde caché

Con 3G (campo, señal normal):
  App carga desde caché instantáneamente
  Datos se actualizan en background silenciosamente

Sin señal (zona sin cobertura):
  App carga desde caché — funcional para consulta
  Banner discreto: "Sin conexión — mostrando datos guardados"
  Al volver la señal: sincroniza automáticamente
  Las fotos tomadas sin conexión se suben al recuperar señal (background sync)
```

---

### 25.7 Alcance — solo el CRM es PWA

**Por qué esta distinción:** El portal público lo visitan compradores desde Google y redes sociales, a menudo por primera y única vez. Ofrecerles "instalar la app" sería intrusivo e innecesario. La PWA es exclusivamente para los colaboradores que usan el CRM a diario.

```
casaslosmochis.com          → Portal público
                               Responsivo, rápido, SEO optimizado
                               NO instalable como PWA

crm.casaslosmochis.com      → CRM interno
                               PWA completa — instalable en iPhone, iPad, Android
                               Ícono en pantalla de inicio
                               Notificaciones push
                               Funciona offline
```

---


---

## 26. Portal Público — Diseño Responsivo

### 26.1 Por qué solo responsivo, sin PWA

**Por qué:** El comprador que visita `casaslosmochis.com` llega desde Google, un anuncio de Facebook, un link de WhatsApp compartido, o escribe el dominio directamente. Puede estar en su celular, en su computadora del trabajo, en la tablet de su casa o en el iPhone de un amigo. No tiene relación previa con la empresa y no va a instalar nada — solo quiere ver propiedades.

**Para qué:** Que la experiencia sea impecable en cualquier pantalla desde el primer segundo, sin fricción, sin banners de instalación, sin nada que distraiga del catálogo. Un sitio responsivo bien hecho es invisible — el usuario simplemente navega sin notar que hay adaptación ocurriendo.

```
Dispositivo                  Comportamiento
──────────────────────────   ────────────────────────────────────────────
iPhone 14 / Android          Catálogo en 1 columna, filtros en modal,
                             botones grandes táctiles, fotos full-width

iPad / tablet                Catálogo en 2 columnas, filtros en sidebar
                             lateral deslizable, navegación cómoda

Laptop / desktop             Catálogo en 3 columnas, filtros en sidebar
                             fijo, mapa de propiedades visible

TV / pantalla grande         Catálogo en 4 columnas, máximo aprovechamiento
                             del espacio sin verse estirado
```

---

### 26.2 Qué significa responsivo bien hecho

**No es solo que "quepa en el celular".** Un sitio verdaderamente responsivo adapta no solo el tamaño sino la estructura, el orden del contenido, el tamaño de los elementos táctiles y la cantidad de información visible según el contexto del dispositivo.

**Reglas de diseño que se aplican en el portal:**

```
Regla 1 — Imágenes siempre optimizadas por tamaño de pantalla
──────────────────────────────────────────────────────────────
Cloudflare R2 + transformaciones automáticas:
- iPhone (375px):   foto servida en 400px de ancho, formato WebP
- iPad (768px):     foto servida en 800px de ancho, formato WebP
- Desktop (1280px): foto servida en 1200px de ancho, formato WebP
Un iPhone no descarga una foto de 3MB pensada para desktop.

Regla 2 — Tipografía fluida
──────────────────────────────────────────────────────────────
Los títulos y precios se ven grandes y legibles en cualquier pantalla.
No hay texto de 10px que haya que pellizcar para leer.
Mínimo 16px para cuerpo de texto (estándar de accesibilidad).

Regla 3 — Botones táctiles siempre alcanzables
──────────────────────────────────────────────────────────────
"Contactar por WhatsApp" y "Agendar visita" son los botones más
importantes del portal. En móvil están fijos en la parte inferior
de la ficha de propiedad para que el pulgar los alcance siempre,
sin necesidad de hacer scroll.

Regla 4 — Filtros sin frustración en móvil
──────────────────────────────────────────────────────────────
En desktop: sidebar con filtros siempre visible al lado del catálogo.
En móvil: botón "Filtros" en la barra superior → modal de pantalla
completa con opciones bien espaciadas → botón "Ver X resultados".
El usuario nunca lucha con checkboxes diminutos.

Regla 5 — El mapa es opcional en móvil
──────────────────────────────────────────────────────────────
En desktop: toggle lista / mapa accesible siempre.
En móvil: primero la lista (lo que la mayoría quiere), el mapa
es un botón secundario. No se fuerza a cargar Google Maps en
una conexión 3G si el usuario solo quiere ver precios.

Regla 6 — Velocidad de carga crítica
──────────────────────────────────────────────────────────────
Objetivo: First Contentful Paint < 1.5 segundos en 3G.
- Lazy loading de imágenes (solo carga las visibles)
- Code splitting por ruta (el catálogo no carga el código del detalle)
- Cloudflare CDN sirve los assets desde el edge más cercano al usuario
- Prefetch de la primera propiedad del listado en background
```

---

### 26.3 Implementación con Tailwind

**Por qué Tailwind para responsividad:** Las clases de Tailwind son mobile-first por defecto. Esto significa que el estilo base aplica a móvil y los breakpoints (`md:`, `lg:`) añaden el comportamiento para pantallas más grandes. El desarrollador piensa primero en el celular, luego en tablet, luego en desktop — exactamente el orden correcto para un portal inmobiliario.

```jsx
// Catálogo — grid que se adapta automáticamente
<div className="
  grid
  grid-cols-1          // Móvil: 1 columna
  sm:grid-cols-2       // iPhone landscape / Android grande: 2 columnas
  lg:grid-cols-3       // Desktop: 3 columnas
  xl:grid-cols-4       // Pantalla grande: 4 columnas
  gap-4 p-4
">
  {properties.map(p => <PropertyCard key={p.id} property={p} />)}
</div>

// Filtros — sidebar en desktop, modal en móvil
<>
  {/* Desktop: sidebar fijo */}
  <aside className="hidden lg:block w-72 shrink-0">
    <FilterPanel />
  </aside>

  {/* Móvil/tablet: modal de pantalla completa */}
  <FilterModal
    isOpen={filtersOpen}
    onClose={() => setFiltersOpen(false)}
    className="lg:hidden"
  />
</>

// Botones de contacto — fijos al fondo en móvil, en sidebar en desktop
<div className="
  fixed bottom-0 inset-x-0 p-4 bg-white border-t  // Móvil: fijos abajo
  lg:static lg:border-0 lg:p-0                     // Desktop: en su lugar normal
  safe-area-inset-bottom                            // Respeta home indicator iPhone
">
  <a href={waUrl} className="btn-whatsapp w-full lg:w-auto">
    WhatsApp
  </a>
  <button className="btn-primary w-full lg:w-auto mt-2 lg:mt-0">
    Agendar visita
  </button>
</div>

// Galería de fotos — swipe en móvil, clicks en desktop
// En móvil usa touch events nativos para deslizar
// En desktop usa botones de navegación laterales
<PropertyGallery
  images={property.images}
  // El componente detecta el dispositivo y adapta la interacción
/>

// Imágenes optimizadas con srcset — el navegador elige el tamaño correcto
<img
  src={property.cover_image_400}
  srcSet={`
    ${property.cover_image_400}  400w,
    ${property.cover_image_800}  800w,
    ${property.cover_image_1200} 1200w
  `}
  sizes="
    (max-width: 640px)  100vw,
    (max-width: 1024px) 50vw,
    33vw
  "
  loading="lazy"
  alt={property.title}
  className="w-full h-48 sm:h-56 lg:h-64 object-cover"
/>
```

---

### 26.4 Métricas de calidad que se deben cumplir

**Por qué definir métricas:** "Que se vea bien en celular" es subjetivo. Estas métricas son objetivas y medibles con Google PageSpeed Insights o Lighthouse — herramientas gratuitas. Un portal que no las cumple pierde posicionamiento en Google y pierde clientes que se van antes de que cargue.

| Métrica | Objetivo | Por qué importa |
|---------|---------|----------------|
| **First Contentful Paint** | < 1.5s en 3G | El usuario ve algo útil en menos de 2 segundos |
| **Largest Contentful Paint** | < 2.5s | La foto principal de la propiedad carga rápido |
| **Cumulative Layout Shift** | < 0.1 | Los elementos no saltan mientras carga — no hay clics accidentales |
| **Lighthouse Mobile Score** | > 90 | Estándar de Google para posicionamiento SEO móvil |
| **Touch target size** | ≥ 44×44px | Ningún botón es demasiado pequeño para tocar con el dedo |
| **Text contrast ratio** | ≥ 4.5:1 | Legible bajo el sol con brillo reducido |

---

### 26.5 Resumen — portal vs CRM

```
casaslosmochis.com (Portal Público)     crm.casaslosmochis.com (CRM Interno)
─────────────────────────────────────   ──────────────────────────────────────
Solo responsivo                         Responsivo + PWA instalable
Sin banner de instalación               Ícono en pantalla de inicio
Sin Service Worker agresivo             Service Worker + caché offline
Carga optimizada para primera visita    Optimizado para uso diario recurrente
SEO prioritario (Google lo indexa)      Sin indexación (login requerido)
Cualquier navegador, cualquier SO       Safari/Chrome en iOS y Android
Comprador que visita 1-3 veces          Asesor que lo usa 8h al día
```

---
## 27. Checklist Final de Requerimientos

| Requerimiento | Implementación | Justificación |
|--------------|----------------|--------------|
| Frontend sin source maps | Vite + Terser, `sourcemap: false` | Código no legible ni reversible por terceros |
| Base de datos con RLS | PostgreSQL + políticas por rol y tenant | Aislamiento entre ciudades y entre colaboradores |
| Control de versiones | Git + GitFlow + GitHub + tags semver | Historial completo, rollback, PRs revisables |
| APIs bien diseñadas | DRF + versionado + respuesta estándar + i18n | Contrato estable para futuras integraciones |
| Hosting unificado | VPS Hetzner CX32 + Docker Compose | €7.49/mes todo incluido, escalable |
| Almacenamiento público | Cloudflare R2 (fotos/videos de propiedades) | Egress gratis, CDN global, $0 hasta 10GB |
| Almacenamiento privado | MinIO self-hosted (docs de clientes) | URLs firmadas 60min, costo $0, audit completo |
| Seguridad | JWT + RBAC + RLS + Cloudflare WAF + verificación Meta webhook | Defensa en profundidad: múltiples capas independientes |
| Rate limiting | DRF Throttling + Redis por rol/endpoint/tenant | Protección contra abuso en todas las ciudades |
| Caché | Redis + django-redis + React Query | Rendimiento sin sobrecargar la DB |
| Escalabilidad | Backend stateless + Docker + tenant isolation | Agregar ciudad nueva en 15 min, escalar VPS sin reescribir |
| Monitoreo | Sentry (gratis) + dashboard admin interno | Sin costo adicional, métricas de negocio y sistema |
| Auditoría total | Tabla append-only + RLS + structlog JSON | Registro permanente e inalterable de toda acción |
| Sistema agéntico | Celery + Celery Beat + webhooks Meta/TikTok | Automatizaciones que eliminan trabajo manual repetitivo |
| Bot WhatsApp | Django webhook + Meta Cloud API + botones interactivos | Costo ~$0, sin plataformas externas, integrado al CRM |
| Filtro automático de prospectos | Score 0-100 por presupuesto + crédito + urgencia | Asesor solo atiende prospectos calificados |
| Multi-tenant por dominio | Tabla tenants + middleware + TenantManager | Una ciudad nueva en 15 minutos, $0 en servidor |
| Multi-idioma ES/EN | Django i18n + react-i18next desde el inicio | Sin refactorización futura costosa |
| Redes sociales | Meta Lead Ads + TikTok + Meta Graph API | Captación automática + publicación desde CRM |
| Postventa y satisfacción | Encuestas con botones, opt-in explícito, análisis de keywords | Calidad de servicio medida de forma independiente al asesor |
| Anti-fuga de comisiones | Trazabilidad permanente + FraudAlert + análisis silencioso | Detección sin confrontar al cliente |
| Backups 3-2-1 | Local 7 días + Backblaze B2 30 días + Snapshot semanal | Ningún evento único puede eliminar todos los datos |
| Seguridad del bot WhatsApp | Opt-in + verificación HMAC + horarios + quality rating monitor | Quality Rating en verde permanente, sin riesgo de baneo |
| Modelo de suscripción | Planes por volumen de propiedades activas + pasarela flexible | Ingresos recurrentes predecibles, fácil upgrade |
| Dominios por ciudad | Un dominio por ciudad, registrar portfolio completo ya | SEO local superior a portales nacionales en búsquedas de ciudad |
| PWA — App instalable | vite-plugin-pwa + Service Worker + manifest.json | Ícono en pantalla de inicio de iPhone/iPad sin App Store, funciona offline |
| Portal público responsivo | Tailwind mobile-first + imágenes srcset + lazy loading | Perfecto en cualquier dispositivo sin fricción ni instalación |
| Propuesta de valor hosting | Prospectos filtrados entregados al publicador | Diferenciador claro vs Inmuebles24: calidad sobre cantidad |
| Costo total | ~€8-10/mes infraestructura completa | Sin servicios externos innecesarios |

---

*Casas Los Mochis — Documento Técnico v4.3 | Junio 2026*
*Documento completo y cerrado. Próxima revisión: inicio de Fase 2.*
