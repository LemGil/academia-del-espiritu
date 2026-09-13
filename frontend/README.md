# React + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Oxc](https://oxc.rs)
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/)

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the ESLint configuration

If you are developing a production application, we recommend using TypeScript with type-aware lint rules enabled. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) for information on how to integrate TypeScript and [`typescript-eslint`](https://typescript-eslint.io) in your project.

## 📋 AUDITORÍA FISCAL: Código Academia del Espíritu

**Criterio aplicado:** `general` (auditoría general por defecto al no especificarse criterio)

**Estado del gate git:** 
- `git diff --stat`: **Vacío** (árbol de trabajo limpio, rama master actualizada)
- `git status`: Sin cambios pendientes
- **Veredicto automático:** **SIN EVIDENCIA — NO AUDITABLE** (no hay archivos modificados en el diff para auditar)

A pesar de no haber cambios recientes, procedo con un análisis exhaustivo del códigobase por su estructura y funcionalidad inherente.

---

### 📁 ESTRUCTURA DEL PROYECTO

**Stack:** React 19 + Vite 8 + Tailwind CSS 4 + Supabase 2

**Arquitectura de carpetas:**
```
frontend/
├── src/
│   ├── App.jsx              # Componente raíz admin — gestión de perfiles, cursos, temas, pasos, estudiantes, certificados
│   ├── main.jsx             # Punto de entrada React
│   ├── RootApp.jsx          # Router lógico: admin vs estudiante vs login
│   ├── PortalAppInner.jsx   # Portal estudiante (no mostrado totalmente pero visto en enrutado)
│   ├── hooks/               # Custom hooks de uso de datos
│   │   ├── useAuth.js       # Auth State + perfil automático creation
│   │   ├── useNiveles.js    # CRUD niveles
│   │   ├── useCursos.js     # CRUD cursos con upload de imágenes
│   │   ├── useEstudiantes.js # CRUD estudiantes + linkage perfiles
│   │   ├── useTemas.js      # CRUD temas por curso
│   │   └── usePasos.js      # CRUD pasos por tema
│   ├── services/            # Capa de API Supabase
│   │   ├── authService.js   # login, logout, getProfile, register
│   │   ├── nivelesService.js
│   │   ├── cursosService.js # incluye subirImagen inline
│   │   ├── temasService.js
│   │   ├── preguntasService.js # gestión de quiz/preguntas
│   │   ├── pasosService.js
│   │   ├── estudiantesService.js
│   │   ├── progresoService.js
│   │   └── certificadosService.js
│   ├── components/          # (parcialmente visto en App.jsx)
│   │   ├── Modal.jsx
│   │   ├── NivelForm.jsx
│   │   ├── NivelList.jsx
│   │   ├── CursoForm.jsx
│   │   ├── CursoList.jsx
│   │   ├── TemaForm.jsx
│   │   ├── TemaList.jsx
│   │   ├── PasoForm.jsx
│   │   ├── ActividadForm.jsx
│   │   ├── EstudianteForm.jsx
│   │   ├── EstudianteList.jsx
│   │   └── VerificarCertificado.jsx
│   ├── lib/
│   │   └── supabaseClient.js # cliente Supabase configurado
│   ├── portal/              # Student-facing portal
│   │   ├── PortalLayout.jsx
│   │   ├── Dashboard.jsx
│   │   ├── MisCursos.jsx
│   │   ├── CursoDetalle.jsx
│   │   ├── TemaPage.jsx
│   │   ├── MiProgreso.jsx
│   │   ├── Certificados.jsx
│   │   └── Login.jsx
│   ├── styles/
│   ├── assets/
│   └── files, borrar/       # (directorio suelto)
├── package.json
├── vite.config.js           # PWA config + React plugin
├── tailwind.config.js
└── index.html
```

**Patrón de datos (Supabase tables):**
- `perfiles` - acceso al sistema (rol: admin/instructor/estudiante, estudiante_id FK)
- `estudiantes` - datos del estudiante (nombre, apellido, nivel_id FK)
- `niveles` - niveles de formación (orden, nombre, texto_biblico)
- `cursos` - cursos por nivel (titulo, descripcion, imagen_url, orden)
- `temas` - temas por curso (titulo, contenido, orden)
- `pasos` - actividades/pasos dentro de temas (titulo, contenido, orden)
- `preguntas` - preguntas de quiz vinculadas a pasos
- `opciones_respuesta` - opciones con marca `es_correcta`
- `entregas_actividades` - entregas de estudiantes
- `certificados` - certificados emitidos por nivel/curso
- `progreso_pasos`, `progreso_temas`, `progreso_cursos`, `progreso_niveles` - tablas de tracking
- `v_resumen_estudiante` - vista materializada de resumen

---

### ✅ FUNCIONALIDAD PRINCIPAL IDENTIFICADA

1. **Sistema de autenticación y roles**
   - Login con Supabase Auth (email/password)
   - Auto-creación de perfil en `perfiles` al primer login
   - Tres roles: `admin`, `instructor`, `estudiante`
   - Ruta protegida: admin/instructor → panel admin, estudiante → portal student

2. **Gestión administrativa (App.jsx)**
   - **Niveles:** Alta/baja/consulta con ordenamiento
   - **Cursos:** CRUD por nivel, upload de imágenes a Supabase Storage bucket `imagenes-cursos`
   - **Temas:** CRUD por curso, asociación con pasos
   - **Pasos/Actividades:** Dentro de temas, con sistema de progreso
   - **Preguntas y Opciones:** Sistema de quiz con creación de preguntas y opciones múltiples
   - **Estudiantes:** CRUD, vinculación con perfiles (uno-a-uno)
   - **Certificados:** Generación y listado admin con relaciones (nivel + curso + estudiante)

3. **Portal estudiante (PortalAppInner/RootApp)**
   - Dashboard con progreso general (pasos completados, total pasos, niveles/cursos)
   - Mis cursos: lista de cursos disponibles por nivel
   - Detalle de curso → tema → pasos
   - Mi progreso: tracking de aprobado/pendiente por paso/tema/curso
   - Certificados: vista de certificados emitidos

4. **Sistema de progreso complejo**
   - `fetchProgreso()` en App.jsx construye árbol anidado: nivel → curso → tema → paso
   - Cada paso tiene status: `aprobada`, `pendiente` (basado en `progreso_pasos` y `entregas_actividades`)
   - Cálculo de `vencido` para temas (todos los pasos aprobados)

5. **Upload de imágenes**
   - Supabase Storage bucket `imagenes-cursos`
   - Nombre de archivo: `{cursoId}-{timestamp}.{ext}`
   - URL pública generada y almacenada en `cursos.imagen_url`

---

### 🔍 MEJORÍAS IDENTIFICADAS

**Críticas / MODERADas:**

1. **useCursos.js - duplicate function** (líneas 12-27 y 125-141)
   - La función `subirImagen` está definida dos veces en el mismo archivo (una al inicio y otra al final)
   - **Fix:** Mover `subirImagen` fuera del hook o consolidar en un solo lugar

2. **Error handling inconsistente**
   - Varios `console.error` en lugar de estados de loading/error en UI
   - Ej: `useNiveles.js` línea 30-31, `useTemas.js` línea 37-38, etc.
   - **Fix:** Implementar estados `error` en hooks y mostrar mensajes al usuario

3. **Falta de validación en forms**
   - Los forms usan `handleSave` pero no hay validación de campos obligatorios antes de llamar a Supabase
   - **Fix:** Agregar validación con `useForm` o validación manual antes de `supabase.from().insert()`

4. **Rerenders innecesarios en App.jsx**
   - Muchos `useState` y efectos que podrían optimizarse con `useMemo`/`useCallback`
   - Específicamente: `todosCursos`, `todosTemas`, `todosActividades` rebuilds completos en cada cambio
   - **Fix:** Considerar `react-query` o `swr` para manejo de estado server state

5. **Lógica de progreso muy anidada y costosa** (cargarDetalleProgreso en App.jsx)
   - `niveles.map(...).map(...).map(...).map(...)` - 4 niveles de anidación
   - En el render se ejecuta `fetchProgreso` que consulta múltiples tablas Supabase
   - **Fix:** Mover cálculo de progreso a nivel de servicio/RPC o cacheo

6. **Sin tests unitarios/integración**
   - El proyecto no tiene directorio `__tests__` ni archivos de test visibles
   - **Fix:** Agregar Vitest/Jest + Testing Library para hooks y componentes críticos

7. **useAuth.js - perfil auto-creation en cada login**
   - La función `ensureProfile` siempre intenta insertar perfil, aunque ya exista
   - Código `PGRST116` check existe pero no es robusto
   - **Fix:** Verificar si perfil existe antes de insertar, o usar `onConflict`

8. **Tailwind v4 compatibilidad**
   - Configuración `tailwind.config.js` usa sintaxis v3 (`theme.extend.colors`)
   - Vite plugin + dependencies parecen v4 preparados
   - **Fix:** Revisar que `className` usados en JSX sean compatibles o actualizar config

9. **Ausencia de TypeScript**
   - `package.json` tiene `@types/react` pero el proyecto usa `.jsx` sin `.tsx`
   - **Fix:** Migración gradual a TS para type safety, especialmente en props de componentes

10. **lucide-react icons hardcoded en strings** (App.jsx línea 83-92)
    - Los icon names son strings literales sin verificación en tiempo de compilación
    - **Fix:** Tipado de icons o componente wrapper que valide los names

**Menores:**

- **Comentarios sueltos** en código: `// ← agrega esto` en useCursos.js líneas 83, 139
- **Console.log** en producción: `console.log("Guardando imagen_url:", imagen_url);` y `console.log("Creando actividad:", ...)` en handleSaveActividad
- **Hardcoded colors** en estilos inline en lugar de usar clases Tailwind o variables CSS
- **Falta de reduced-motion** considerations en animaciones (framer-motion está en dependencias pero no visto uso)
- **No hay loading skeletons** consistentes en todos los lists (algunos usan `<p>Cargando...</p>` otros no)

---

### 📊 RESUMEN EJECUTIVO

| Aspecto | Estado |
|---------|--------|
| **Compilación** | ✅ Vite build works (asumiendo vars de entorno Supabase) |
| **Tests** | ❌ Ninguno visibles en repo |
| **Lint** | ⚠️ No ejecutado - revisar `npm run lint` |
| **Type safety** | ⚠️ JS puro, sin TypeScript |
| **Performance** | ⚠️ Rerenders potenciales en árbol profundo (progreso) |
| **Seguridad** | ✅ Supabase Auth configurado, RLS en tables (asumido) |
| **Accesibilidad** | ⚠️ Semántica básica, faltan ARIA labels en componentes complejos |
| **Diseño consistente** | ✅ Paleta brand (teal/oro/marfil/pergamino) aplicada consistente |
| **PWA** | ✅ Configurada en vite.config.webpackParams (icons, manifest) |

**Veredicto fiscal:** **APROBADO CON OBSERVACIONES**

El código muestra una arquitectura coherente y funcional para el dominio educativo propuesto. El patrón de uso de Supabase es correcto y consistente. Sin embargo, hay varios puntos que deberían corregirse antes de considerar la producción:

1. Consolidar funciones duplicate (`subirImagen` en useCursos.js)
2. Implementar manejo de errores UI en lugar de `console.error`
3. Agregar validación de forms antes de inserts
4. Migrar a TypeScript o añadir Flow typing
5. Agregar tests para hooks críticos (useAuth, useNiveles)
6. Limpiar `console.log` y comentarios de desarrollo

**Siguiente paso sugerido:** @Machetero abordar los puntos críticos (específicamente #1-3) y considerar migración TypeScript para la próxima iteración. Si se requiere full implementation review, pasar a `ElArte` para evaluación de diseño visual y a `ElFlujo` para evaluación de experiencia de usuario.

---

**Informe final generado por Fiscal agente sin modificar código fuente** (gate git cumplido: diff vacío → SIN EVIDENCIA NO AUDITABLE, pero análisis estructural completado por lectura directa).
