# MODULES — MVP Marketplace de Servicios para el Hogar

> **Arquitectura:** Angular (web responsive, standalone components) + Supabase
> (PostgreSQL/PostGIS, Auth, Storage). Web only. Sin módulo de administrador
> en las primeras iteraciones. Auth naive: correo + contraseña.
>
> Cada módulo indica: propósito, pantallas principales, tablas/colecciones involucradas
> y fase del roadmap (ver ROADMAP.md).

---

## Módulos del MVP (Fases 1–2)

### 1. `landing` — Portadas públicas (doble cara, estilo Booking)

- **Propósito:** adquisición separada de los dos lados del marketplace.
- **Pantallas:**
  - Landing de **clientes**: propuesta de valor, cómo funciona, CTA "Solicita un servicio".
  - Landing de **maestros**: beneficios (gratis, clientes nuevos, reputación digital),
    CTA **"Regístrate como maestro"**.
- **Tablas:** ninguna (contenido estático).
- **Notas:** en la primera iteración se asume que todo maestro registrado es de
  confianza (no hay verificación).
- **Fase:** 1.1

---

### 2. `auth` — Registro e inicio de sesión (naive)

- **Propósito:** alta y acceso de usuarios con rol cliente o profesional.
- **Pantallas:** registro (con selector de rol o según la landing de origen), login.
- **Tablas:** `auth.users` (Supabase Auth), `profiles` (rol, nombre, teléfono).
- **Notas:** deliberadamente ingenuo — correo + contraseña, sin verificación de email,
  confiando en los usuarios. Suficiente para el piloto; reforzar después.
- **Fase:** 0/1.1

---

### 3. `profiles` — Perfiles de cliente y profesional

- **Propósito:** datos visibles y editables de cada rol.
- **Pantallas:** perfil de cliente (datos básicos); perfil de profesional
  (especialidad, experiencia, zona de atención, disponibilidad, foto, portafolio).
- **Tablas:** `profiles`, `professionals` (specialty, experience, zone, availability,
  location), `specialties`.
- **Fase:** 1.1

---

### 4. `service-requests` — Publicación de solicitudes

- **Propósito:** el cliente describe qué necesita.
- **Pantallas:** crear solicitud (tipo de servicio, descripción, ubicación con pin en
  mapa, fotos, urgente/programado + fecha), detalle de solicitud.
- **Tablas:** `service_requests`, `request_photos` (URLs a Supabase Storage).
- **Notas:** **solo fotos** en el MVP; videos en iteraciones finales tras validar.
- **Fase:** 1.2

---

### 5. `matching` — Búsqueda y filtrado de profesionales

- **Propósito:** mostrar al cliente profesionales adecuados para su solicitud.
- **Pantallas:** lista de profesionales (filtros: especialidad, zona, disponibilidad),
  tarjeta de profesional.
- **Tablas:** `professionals`, `specialties`, `reviews` (para ordenar por reputación),
  `service_requests` (contexto).
- **Notas:** consultas SQL/PostGIS (distancia por radio) + `ORDER BY` reputación.
  **Sin ML.** En el piloto puede complementarse con asignación manual del equipo.
- **Fase:** 1.2 (mejoras en Fase 2)

---

### 6. `trust-network` — Red de confianza (simplificada)

- **Propósito:** generar confianza con prueba social.
- **Pantallas:** secciones dentro del perfil/listado del profesional.
- **Tablas:** `services` (agregados), `service_requests` (zona).
- **Notas:** versión MVP = **solo agregados por zona**
  ("3 personas de tu zona contrataron a Pedro", "contratado N veces en tu distrito").
  El grafo personal ("Rosa recomienda a Pedro") queda diferido — requiere red de
  contactos que es cara de construir.
- **Fase:** 2

---

### 7. `quotes` — Cotizaciones

- **Propósito:** el profesional propone precio y alcance; el cliente decide.
- **Pantallas:** formulario de cotización (profesional), vista de cotización con
  aceptar/rechazar (cliente).
- **Tablas:** `quotes` (price, description, notes, status, version, request_id).
- **Reglas clave:** si el precio cambia tras una aceptación, se crea una **nueva
  versión** de la cotización (nunca se sobrescribe). Estados:
  `PENDING / ACCEPTED / REJECTED / SUPERSEDED`.
- **Fase:** 1.3

---

### 8. `services` — Contratación y seguimiento

- **Propósito:** ciclo de vida del servicio contratado.
- **Pantallas:** vista de seguimiento con línea de estados (cliente y profesional).
- **Tablas:** `services` (status, timestamps).
- **Estados:** `REQUESTED → QUOTED → ACCEPTED → COMPLETED`, más `CANCELLED` y
  `DISPUTED`. "En camino" = botón manual del profesional (sin tracking GPS).
- **Fase:** 1.3

---

### 9. `reviews` — Calificación posterior (bilateral)

- **Propósito:** reputación verificada para ambos lados.
- **Pantallas:** formulario de calificación (estrellas + comentario) tras COMPLETED.
- **Tablas:** `reviews` (service_id, reviewer_id, reviewee_id, rating, comment).
- **Reglas clave:** solo se habilita tras un servicio `COMPLETED` real.
- **Fase:** 1.4

---

### 10. `reputation` — Perfil de reputación

- **Propósito:** mostrar el historial consolidado de cada usuario.
- **Pantallas:** sección de reputación en el perfil del profesional (promedio, trabajos
  completados, reseñas, tags) y del cliente (servicios, cancelaciones, calificación).
- **Tablas:** agregados sobre `reviews`, `services`.
- **Notas:** tags predefinidos ("puntual", "cumplido", "precio transparente",
  "buen trato", "trabajo de calidad") — Fase 2.
- **Fase:** 1.4 (tags en Fase 2)

---

### 11. `rebooking` — Recontratación

- **Propósito:** facilitar volver a contratar a un profesional conocido.
- **Pantallas:** historial de servicios con botón **"Volver a contratar"** (precarga
  una nueva solicitud dirigida a ese profesional).
- **Tablas:** `services`, `service_requests`.
- **Fase:** 1.4

---

### 12. `incidents` — Soporte e incidencias

- **Propósito:** registrar problemas con un servicio.
- **Pantallas:** formulario de reporte (asociado a un servicio), lista de incidencias
  del usuario con su estado.
- **Tablas:** `incidents` (service_id, description, status).
- **Estados:** `OPEN / IN_REVIEW / RESOLVED / CLOSED`.
- **Notas:** sin chat de soporte; la gestión la hace el equipo por email/WhatsApp
  (sin módulo admin, se opera desde Supabase Studio en las primeras iteraciones).
- **Fase:** 2

---

### 13. `notifications` — Notificaciones

- **Propósito:** avisar eventos clave del flujo.
- **Pantallas:** bandeja de notificaciones internas.
- **Tablas:** `notifications` (user_id, title, message, read, created_at).
- **Eventos:** nueva cotización, cotización aceptada/rechazada, profesional en camino,
  servicio completado, nueva reseña, actualización de incidencia.
- **Canales:** internas + email (Resend/Brevo). Sin push.
- **Fase:** 1.3

---

### 14. `media` — Almacenamiento de imágenes

- **Propósito:** fotos de solicitudes, perfiles y portafolio.
- **Implementación:** Supabase Storage (buckets por tipo); la BD guarda solo URL,
  tipo y relación.
- **Notas:** solo imágenes en el MVP; videos en iteraciones finales.
- **Fase:** 1.2

---

## Módulos postergados / fuera del MVP

| Módulo | Estado | Motivo |
|---|---|---|
| `payments` (pagos en plataforma) | Postergado (Fase 3) | Validar demanda primero; escrow tiene implicancias regulatorias. Demo posible con Culqi Sandbox. |
| `identity-verification` (Truora) | Postergado (Fase 3) | Primera iteración asume maestros de confianza; onboarding controlado por el equipo. |
| `admin` (panel de administración) | Postergado/descartado | A 10–20 maestros, la operación manual desde Supabase Studio es suficiente. |
| `videos` | Iteraciones finales | 3x el esfuerzo de las fotos; mismo valor de validación. |
| `chat` (tiempo real) | Postergado | Coordinación por WhatsApp/email; realtime de Supabase si aparece la necesidad. |
| `push-notifications` | Postergado | Email + notificaciones internas cubren el MVP. |
| `b2b-plans` | Fase 3 | Planes para empresas/administradores de propiedades. |
| `trust-graph` (red personal) | Postergado | Requiere grafo social; MVP usa solo agregados por zona. |

---

## Diagrama de módulos y dependencias

```text
landing ──► auth ──► profiles
                         │
service-requests ◄────────┤
      │                  │
      ▼                  │
   matching ──► quotes ──► services ──► reviews ──► reputation
      │                        │                       ▲
      │                        ▼                       │
      │                    incidents                   │
      │                                                │
      └──► trust-network (agregados) ──────────────────┘

   rebooking (sobre historial de services)
   notifications (transversal: escucha eventos de quotes/services/reviews/incidents)
   media (transversal: fotos de requests/profiles/reviews)
```
