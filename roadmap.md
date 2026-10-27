# ROADMAP — MVP Marketplace de Servicios para el Hogar

> **Objetivo del MVP:** validar el negocio lo más rápido posible — que hogares soliciten
> servicios, que los profesionales ("maestros") coticen y que se complete el flujo
> solicitud → cotización → aceptación → servicio → calificación.
>
> **Decisiones base (ya tomadas por el equipo):**
> - Stack: **Angular + Supabase** (PostgreSQL + Auth + Storage). NestJS descartado.
> - Web only (responsive). Sin app móvil.
> - Auth **naive**: solo correo + contraseña, confiando en los usuarios.
> - **Sin pagos** ni **verificación de identidad** en la primera iteración.
> - **Sin módulo de administrador** (postergado). En su lugar, landing propia para
>   maestros con "Regístrate como maestro" (estilo Booking: una cara para clientes,
>   otra para profesionales).
> - Fotos sí, **videos después**.
> - Red de confianza simplificada: solo agregados por zona.
> - Mapas: Leaflet + OpenStreetMap. Notificaciones: internas + email.

---

## Fase 0 — Setup y fundaciones (Semana 1)

**Objetivo:** dejar el andamiaje listo para que todo el equipo programe en paralelo.

- [ ] Repo GitHub (monorepo o repo único de Angular) con ramas `main` / `develop`.
- [ ] Proyecto Angular (standalone components) + Angular Material + Tailwind (opcional).
- [ ] Proyecto Supabase Cloud creado; PostgreSQL + PostGIS habilitado.
- [ ] Esquema inicial de BD (ver MODULES.md): users, profiles, professionals,
      specialties, service_requests, quotes, services, reviews, incidents,
      notifications.
- [ ] Prisma (o migraciones SQL de Supabase) para versionar el esquema.
- [ ] Auth email+password funcionando (Supabase Auth, sin verificación de correo).
- [ ] Deploy continuo: Vercel (frontend) conectado a `develop`.
- [ ] Mockups en Figma de las pantallas mínimas (landing clientes, landing maestros,
      registro, crear solicitud, lista de profesionales, cotización, seguimiento,
      calificación, historial).

**Criterio de salida:** cualquier integrante puede hacer `git push` y ver el cambio
desplegado; login funciona end-to-end.

---

## Fase 1 — Primer MVP transaccional (Semanas 2–5)

**Objetivo:** el flujo completo funciona de punta a punta, aunque sea simple.

### Iteración 1.1 — Adquisición y perfiles (Semana 2)
- [ ] Landing pública para **clientes** (qué es, cómo funciona, CTA "Solicita un servicio").
- [ ] Landing propia para **maestros** (beneficios: gratis, nuevos clientes, reputación
      digital) con botón **"Regístrate como maestro"**.
- [ ] Registro/login naive (correo + contraseña) para ambos roles.
- [ ] Perfil de profesional: especialidad, experiencia, zona de atención, disponibilidad,
      foto.
- [ ] Perfil de cliente: datos básicos.

### Iteración 1.2 — Solicitudes y matching (Semana 3)
- [ ] Crear solicitud: tipo de servicio, descripción, ubicación (pin en mapa Leaflet),
      **fotos** (Supabase Storage), flag urgente/programado + fecha.
- [ ] Lista de profesionales filtrada por especialidad, zona y disponibilidad
      (consultas SQL/PostGIS, ordenada por reputación — sin ML).
- [ ] Vista de solicitud para el profesional (bandeja de solicitudes recibidas).

### Iteración 1.3 — Cotización y contratación (Semana 4)
- [ ] El profesional envía cotización (precio, descripción, observaciones).
- [ ] El cliente acepta o rechaza; si el precio cambia, nueva versión de cotización
      (estados: PENDING / ACCEPTED / REJECTED / SUPERSEDED).
- [ ] Máquina de estados del servicio: REQUESTED → QUOTED → ACCEPTED → COMPLETED,
      con CANCELLED / DISPUTED. "En camino" como botón manual del profesional.
- [ ] Notificaciones internas + email (Resend/Brevo) en cada cambio de estado clave.

### Iteración 1.4 — Cierre del ciclo (Semana 5)
- [ ] Calificación bilateral habilitada solo tras COMPLETED (cliente↔profesional).
- [ ] Perfil de reputación del profesional: promedio, trabajos completados, reseñas.
- [ ] Historial de servicios y botón **"Volver a contratar"**.

**Criterio de salida (MVP v1):** un cliente real puede registrarse, publicar una
solicitud con fotos, recibir una cotización, aceptarla, marcar el servicio como
completado y calificar. Todo desplegado y usable desde el celular (web responsive).

**Piloto:** operar con 10–20 maestros reclutados manualmente (contactos directos,
institutos) y un grupo pequeño de hogares. El equipo monitorea todo a mano
(no hace falta panel admin para 20 usuarios: se gestiona directo en Supabase Studio).

---

## Fase 2 — Confianza y retención (Semanas 6–8)

**Objetivo:** reforzar la propuesta de valor diferencial tras el primer feedback real.

- [ ] Tags de reputación ("puntual", "cumplido", "precio transparente", etc.).
- [ ] Red de confianza simplificada: agregados por zona
      ("3 personas de tu zona contrataron a Pedro", "contratado N veces en tu distrito").
- [ ] Reputación del cliente visible para el profesional (servicios completados,
      cancelaciones, calificación recibida).
- [ ] Incidencias: reportar problema asociado a un servicio, con estados
      OPEN / IN_REVIEW / RESOLVED / CLOSED (sin chat; seguimiento por email/WhatsApp).
- [ ] Mejoras de matching según lo aprendido en el piloto (disponibilidad por horarios,
      prioridad de urgentes).
- [ ] Reseñas con fotos del trabajo realizado (portafolio del profesional).

**Criterio de salida:** métricas del piloto revisadas (n.º de solicitudes, tasa de
cotización, tasa de aceptación, servicios completados, recontrataciones) y decisión
documentada de seguir/pivotar.

---

## Fase 3 — Post-validación (solo si Fase 2 confirma tracción)

Orden sugerido según lo que duela más en el piloto:

- [ ] **Pagos**: primero Culqi/Mercado Pago en Sandbox (demo), luego dinero real;
      custodia/liberación de fondos al final (revisar implicancias regulatorias).
- [ ] **Verificación de identidad** con Truora (primero manual sistematizada).
- [ ] **Módulo de administrador** formal (gestión de usuarios, validación, incidencias).
- [ ] Videos en solicitudes y perfiles.
- [ ] PWA instalable, push notifications, chat en tiempo real (realtime de Supabase).
- [ ] Planes B2B para administradores de propiedades.
- [ ] Red de confianza personal completa ("Rosa recomienda a Pedro").

---

## Riesgos y vigilancia durante el roadmap

1. **Conseguir maestros es el cuello de botella, no el código.** La landing de maestros
   y el reclutamiento manual arrancan en Fase 1, en paralelo al desarrollo.
2. **Auth naive = riesgo asumido.** Sin verificación de correo ni identidad, cualquiera
   puede registrarse. Aceptable a 20 usuarios; inaceptable a 2,000. Agregar
   verificación de email en cuanto haya spam o suplantación.
3. **Sin panel admin, el equipo opera desde Supabase Studio.** Consciente y correcto a
   esta escala; si las incidencias superan ~2 por semana, adelantar el módulo admin.
4. **No construir nada de la Fase 3 antes de tiempo.** Cada ítem de Fase 3 se activa
   solo con evidencia del piloto.
