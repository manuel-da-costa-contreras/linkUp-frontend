<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

# Arquitectura del Frontend

- Framework: `Next.js` con App Router en `src/app/`.
- Lenguaje: `TypeScript`.
- Estilos: `Tailwind CSS` (v4) con configuración mobile-first y responsive (`sm:`, `md:`, `lg:`).
- Sistema de diseño: componentes reutilizables en `src/components/ui/`.
- Firebase: integración en `src/lib/firebase.ts` y `src/lib/firestore.ts` para Auth y Firestore.
- Organización del código:
  - `src/app/` para rutas y layouts.
  - `src/components/` para UI, auth, charts, metrics y users.
  - `src/lib/` para lógica de integración con servicios.
  - `src/utils/` para utilidades compartidas.
- Enfoque: UI, SEO y performance. El backend no es prioridad en esta fase.

# Reglas para el agente

1. Enfoca todas las soluciones en el frontend.
   - Prioriza `src/app/`, `src/components/`, `src/lib/` y `src/utils/`.
   - No propongas cambios significativos en el backend en esta etapa.

2. Mantén la experiencia mobile-first.
   - Usa clases responsive de Tailwind.
   - Asegura diseño adaptable y accesible en móviles, tablets y desktop.

3. Usa el Design System y componentes reutilizables.
   - Crea componentes pequeños, testables y con responsabilidad única.
   - Evita duplicar lógica o estilos.

4. Sigue los principios de clean code.
   - SOLID, DRY, KISS, SRP.
   - Funciones pequeñas, componentes claros y utilidades compartidas.

5. Usa Tailwind como primera opción.
   - Aplica clases utility-first para estilos.
   - Solo usa CSS custom para casos específicos como animaciones complejas o estilos globales necesarios.

6. Usa Firebase desde el frontend con las bibliotecas actuales.
   - La autenticación y Firestore deben centralizarse en `src/lib/`.
   - No intentes reemplazar Firebase con otro servicio.

7. Mantén la coherencia con la estructura del proyecto.
   - Revisa `src/components/ui/` antes de crear nuevos componentes UI.
   - Inserta nuevos módulos en carpetas lógicas existentes.

8. Escribe código claro y legible.
   - Prefiere nombres descriptivos.
   - Documenta componentes y hooks si es necesario.

# Notas de implementación

- La página actual reside en `src/app/page.tsx`.
- El layout base se define en `src/app/layout.tsx`.
- `public/` almacena assets estáticos.
- El archivo `package.json` define dependencias básicas: `next`, `react`, `tailwindcss`, `firebase`, `recharts`.
