# LinkUP Dashboard Frontend

Frontend SaaS orientado a operaciones (dashboard, clientes, jobs y notificaciones) construido con enfoque **feature-first** y principios **hexagonales**.

## Objetivo técnico

- Escalar por dominio funcional sin acoplar UI, casos de uso e infraestructura.
- Mantener una base preparada para roles, multi-organización y tiempo real (SSE).
- Asegurar calidad con testing automatizado (unit + e2e) y CI/CD.

## Stack tecnológico

- **Framework:** Next.js 16 (App Router)
- **UI:** React 19 + Tailwind CSS v4
- **Lenguaje:** TypeScript
- **Datos y estado remoto:** TanStack Query
- **Auth:** Firebase Auth (client SDK)
- **Gráficas:** Recharts
- **Testing unitario:** Jest
- **Testing E2E:** Cypress (ejecución local y en Docker)
- **CI/CD:** GitHub Actions + Vercel

## Arquitectura aplicada

### 1) Feature-first

Cada dominio vive aislado en `src/features/*` (ej: `clients`, `jobs`, `dashboard`, `notifications`), con su propio flujo:

- `domain/`: entidades y contratos (repositorios)
- `application/`: casos de uso y query keys
- `infrastructure/`: adaptadores HTTP/mappers
- `ui/`: hooks y componentes del feature

### 2) Hexagonal en frontend

- La UI nunca consume infraestructura directamente.
- Los casos de uso dependen de interfaces (`Repository`), no de implementaciones concretas.
- Los adaptadores de infraestructura (backend API) quedan encapsulados en `infrastructure/repositories`.

### 3) Shared UI / Design System

`src/components/ui` concentra componentes reutilizables (table, overlay, feedback, layout, forms, dashboard), con SRP y consistencia visual.

### 4) Integración de seguridad

- El frontend envía `Authorization: Bearer <idToken>` en endpoints protegidos.
- Soporte para contexto de organización (`orgId`) en la capa de datos.
- Preparado para backend con control de roles y SSE con token corto.

## Metodologías y principios

- **SOLID** (especialmente SRP y DIP)
- **DRY / KISS**
- **Separación de responsabilidades por capas**
- **Mobile-first responsive UI**
- **I18n modular por feature**
- **Errores por código + mapeo de mensajes en frontend**

## Estructura del proyecto

- `src/app/`: routing y composición global
- `src/features/`: módulos de dominio (arquitectura principal)
- `src/components/`: UI compartida y auth shell
- `src/lib/`: auth, cliente HTTP, query provider
- `src/i18n/`: traducciones separadas por feature
- `src/utils/`: utilidades comunes

## Calidad y entrega

- **Unit tests** para funciones/mappers/hooks de datos.
- **E2E tests** para flujos reales (auth, clients, jobs, estados, cleanup).
- **CI** ejecuta lint + unit + build en cada push/PR.
- **E2E pipeline** con Docker para validación aislada.
- **Deploy gate** recomendado: proteger `main` con checks requeridos antes de Vercel.

## Variables públicas de entorno

- `NEXT_PUBLIC_API_BASE_URL`
- `NEXT_PUBLIC_DEFAULT_ORG_ID`
- `NEXT_PUBLIC_AUTH_ENABLED`
- `NEXT_PUBLIC_FIREBASE_API_KEY`
- `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN`
- `NEXT_PUBLIC_FIREBASE_PROJECT_ID`
- `NEXT_PUBLIC_FIREBASE_APP_ID`
- `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID`

