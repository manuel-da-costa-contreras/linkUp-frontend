# SaaS Dashboard Frontend

Frontend con Next.js (App Router), TypeScript y Tailwind CSS v4.

## Stack

- Next.js 16 (App Router)
- React 19
- TypeScript
- Tailwind CSS v4
- Recharts
- Firebase Auth (client SDK)

## Arquitectura

El frontend usa enfoque **feature-first** con principios **hexagonales**.

### Estructura base

- `src/app/`: rutas y composicion de paginas
- `src/components/ui/`: design system y componentes reutilizables
- `src/features/`: modulos por dominio funcional
- `src/lib/`: integraciones transversales (auth, api, query)
- `src/utils/`: utilidades compartidas

### Integracion de datos

El frontend consume API HTTP del backend y usa Firebase Auth para enviar `Authorization: Bearer <idToken>` en las llamadas protegidas.

Config principal:

- `NEXT_PUBLIC_API_BASE_URL`
- `NEXT_PUBLIC_DEFAULT_ORG_ID`
- `NEXT_PUBLIC_AUTH_ENABLED` (`true` por defecto, `false` para desarrollo sin auth)
- `NEXT_PUBLIC_FIREBASE_API_KEY`
- `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN`
- `NEXT_PUBLIC_FIREBASE_PROJECT_ID`
- `NEXT_PUBLIC_FIREBASE_APP_ID`
- `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID`

API base usada por frontend:

- `GET /organizations/{orgId}/dashboard/overview`
- `GET /organizations/{orgId}/clients`
- `GET /organizations/{orgId}/jobs`
- `GET /organizations/{orgId}/notifications`

## Scripts

```bash
npm run dev
npm run build
npm run start
npm run lint
```
