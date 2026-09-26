# PulseFit — Sistema de Gestión de Gimnasio (completo)

App de gestión de gimnasio en **español**, con **base de datos PostgreSQL real**,
**inicio de sesión**, y pensada para que tú y tu compañero la usen desde
distintos dispositivos (computador y teléfono) viendo los mismos datos.

```
gym-full/
├── frontend/   → React + Vite (lo que ves en el navegador/teléfono)
└── backend/    → Node.js + Express + PostgreSQL (la API y la base de datos)
```

**Usuario para entrar:** `admin`   **Contraseña:** `pulsefit2026`
(lo puedes cambiar después; ver sección al final).

---

## 1. Instalar PostgreSQL

Si no lo tienes:
- **Windows:** descarga el instalador en https://www.postgresql.org/download/windows/
  (durante la instalación te pedirá una contraseña para el usuario `postgres` — anótala).
- Alternativa sin instalar nada: crear una base gratis en https://neon.tech o
  https://supabase.com (te dan un `DATABASE_URL` que pegas en el paso 3).

Crea una base de datos vacía llamada `pulsefit` (con DBeaver, pgAdmin, o el comando `createdb pulsefit`).

## 2. Preparar el backend

```bash
cd backend
npm install
copy .env.example .env      (en Windows)   |   cp .env.example .env   (en Mac/Linux)
```

Abre `.env` y pon tus datos reales de conexión (usuario, contraseña, `DATABASE_URL`, etc.)
y cambia `JWT_SECRET` por cualquier texto largo inventado por ti.

## 3. Crear las tablas y los datos de ejemplo

```bash
npm run migrate
npm run seed
```

Esto crea las tablas y mete los mismos 6 miembros, planes, clases, etc.
de antes — pero ahora los "inscritos" de cada clase y los "miembros activos"
de cada plan salen de datos reales, no de números escritos a mano.

## 4. Levantar el backend

```bash
npm run dev
```

Debe mostrar: `✔ API de PulseFit corriendo en el puerto 4000`. Déjalo abierto.

## 5. Levantar el frontend (en OTRA terminal)

```bash
cd frontend
npm install
npm run dev
```

Te va a mostrar dos direcciones, algo así:
```
Local:   http://localhost:5173/
Network: http://192.168.1.50:5173/
```

- **Local** → ábrelo en el navegador de este mismo computador.
- **Network** → esa es la dirección para el teléfono (ver paso 6).

Inicia sesión con `admin` / `pulsefit2026`.

## 6. Usarla desde el teléfono (o el computador de tu compañero)

Requisito: **el teléfono y el computador deben estar en el mismo WiFi**.

1. En el teléfono, abre el navegador y entra a la dirección "Network" del paso 5
   (ej. `http://192.168.1.50:5173/`).
2. Como el teléfono habla con el backend en otra dirección, edita
   `frontend/.env` y agrega:
   ```
   VITE_API_URL=http://192.168.1.50:4000/api
   ```
   (usa la IP que te mostró Vite, no esta de ejemplo) y reinicia `npm run dev` del frontend.
3. Ambos —tú y tu compañero— van a estar viendo y editando la misma base de
   datos. La app se actualiza sola cada 15 segundos, así que si tu compañero
   agrega un pago, tú lo vas a ver aparecer solo, sin recargar la página.

> Esto funciona mientras ambos estén en la misma red WiFi/local. Si más
> adelante quieres que funcione desde cualquier lugar (no solo en la misma
> red), el siguiente paso es "subir" el backend y la base de datos a un
> servicio como Railway o Render — avísame cuando quieras hacer eso y lo
> armamos juntos.

## Qué se corrigió del proyecto original

- **Conteos inflados/inconsistentes**: antes "inscritos" en una clase o
  "miembros activos" de un plan eran números sueltos, sin relación con los
  miembros que de verdad existían (por eso viste 6 miembros pero 17 en otra
  parte). Ahora existen tablas de relación reales (`class_enrollments`,
  `plan_id`) y esos números se **calculan** contando filas reales — es
  imposible que muestren más de los miembros que realmente hay.
- **No se pueden inventar nombres sueltos**: si intentas registrar un pago,
  una entrada, o una sesión para un "miembro" que no existe, la aplicación
  lo rechaza con un mensaje claro, en vez de crear un registro fantasma.
- **Inicio de sesión**: nadie puede ver ni modificar los datos sin loguearse.
- **Multi-dispositivo real**: los datos ya no viven en el navegador de una
  sola persona (localStorage) — viven en PostgreSQL, así que tú y tu
  compañero ven y editan lo mismo.

## Cambiar la contraseña del admin

Edita `backend/db/seed.js`, cambia `'pulsefit2026'` por la contraseña que
quieras, y vuelve a correr `npm run seed` (o crea un segundo usuario
directamente en la tabla `users` con DBeaver, usando un hash de bcrypt).

## Notas honestas

- Este código no se pudo probar contra un PostgreSQL en vivo desde donde yo
  trabajo (sin acceso a internet), pero sigue patrones estándar y bien
  probados (Express + `pg` + JWT + bcrypt). Si algo no arranca a la primera,
  copia el mensaje de error tal cual y lo resolvemos.
- El botón ↺ (restablecer datos) reinicia la base de datos para **todos**
  los que estén usando la app en ese momento — úsalo con cuidado si tu
  compañero está trabajando al mismo tiempo.
