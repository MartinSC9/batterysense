# Preguntas para Diego - BatterySense

## Estado actual de las funcionalidades en el Login

El panel izquierdo del login muestra 4 funcionalidades. Este es el estado real de cada una en el prototipo:

| Feature | Estado | Lo que hay actualmente |
|---------|--------|------------------------|
| **Monitoreo en Tiempo Real** | Parcial | Muestra métricas pero son datos mock estáticos, no hay conexión a sensores reales |
| **Alertas Inteligentes** | Parcial | Muestra alarmas y hay página de configuración de umbrales, pero no hay notificaciones push/email reales |
| **Históricos y Tendencias** | Mejorado | Gráficos con filtros de fecha (Hoy, 7 días, 30 días, 3 meses) con datos mock |
| **Protección Preventiva** | No implementado | No hay análisis predictivo implementado |

---

## Pregunta para el cliente

**¿Cómo prefiere que se muestren las funcionalidades en la pantalla de login?**

### Opción 1: Dejarlo así (features aspiracionales)
Es común en landing pages mostrar funcionalidades que estarán disponibles en el futuro. Los textos actuales son:
- Monitoreo en Tiempo Real
- Alertas Inteligentes
- Históricos y Tendencias
- Protección Preventiva

### Opción 2: Cambiar los textos para reflejar lo implementado
Textos sugeridos que reflejan mejor el estado actual:
- **"Visualización de Métricas"** en vez de "Monitoreo en Tiempo Real"
- **"Sistema de Alarmas"** en vez de "Alertas Inteligentes"
- **"Gráficos de Estado"** en vez de "Históricos y Tendencias"
- **"Diagnóstico de Bancos"** en vez de "Protección Preventiva"

---

## Pregunta: Cálculo de estadísticas en gráficos históricos

Los gráficos muestran estadísticas (Promedio, Mínimo, Máximo). Cuando el filtro es de varios días, **¿cómo se deberían calcular estos valores?**

| Método | Descripción | Ejemplo (7 días) |
|--------|-------------|------------------|
| **Mín/Máx absoluto** | El valor más bajo/alto de TODAS las mediciones del período | Si hay lecturas cada 15 min = 672 valores, toma el más bajo/alto de todos |
| **Mín/Máx de promedios diarios** | Promedia cada día y luego toma el mín/máx de esos promedios | 7 promedios diarios → mín/máx de esos 7 |
| **Mín/Máx de cierre** | Toma el último valor de cada día y calcula sobre esos | 7 valores de cierre → mín/máx de esos 7 |

### Sugerencia del desarrollador:
- Mostrar el **promedio** por defecto
- O agregar un selector para elegir entre **Promedio / Máximo / Mínimo** cuando el filtro es de días

**¿Cuál prefiere?**

---

## Pregunta: Sensores de temperatura por celda

Actualmente el prototipo muestra:
- **Voltaje**: por celda individual
- **Temperatura**: solo a nivel de banco (un sensor para todo el banco)

| Tipo de sistema | Temperatura | Costo/Complejidad |
|-----------------|-------------|-------------------|
| **Básico** | 1 sensor por banco | Bajo |
| **Intermedio** | 1 sensor por grupo de celdas | Medio |
| **Avanzado** | 1 sensor por celda | Alto |

**¿El sistema va a tener sensores de temperatura por celda o solo por banco?**

Si es por celda, habría que agregar al prototipo:
- Indicador de temperatura en cada celda
- Alertas de temperatura por celda individual
- Histórico de temperatura por celda

---

## Pregunta: Visualización de múltiples bancos

Según la documentación:
- Cada cliente puede tener entre **1 y 15 bancos**
- El usuario con rol "cliente" solo ve **sus propios bancos**
- El admin puede ver **todos los bancos de todos los clientes**

Actualmente el prototipo muestra **1 solo banco** en el dashboard.

**¿Cómo debería verse cuando un cliente tiene muchos bancos?**

| Opción | Descripción | Ideal para |
|--------|-------------|------------|
| **A. Selector dropdown** | Un dropdown en el header para elegir qué banco ver | Pocos bancos (1-5) |
| **B. Grid de tarjetas** | Resumen de todos los bancos en tarjetas pequeñas, click para ver detalle | Muchos bancos (5-15) |
| **C. Dashboard general + detalle** | Vista resumen con estado de todos los bancos + página individual por banco | Máxima escalabilidad |
| **D. Todo en una página con scroll** | Mostrar todos los bancos uno debajo del otro (como está ahora) | Pocos bancos |

### Preguntas relacionadas:

1. **¿Un usuario "cliente" siempre ve todos sus bancos, o el admin le asigna bancos específicos?**
   - Ej: Empresa X tiene 10 bancos, pero el usuario Juan solo puede ver 3 de ellos

2. **¿El admin necesita una vista para ver TODOS los bancos de TODOS los clientes?**
   - Si tiene 5 clientes con 15 bancos cada uno = 75 bancos

3. **¿Se necesitan filtros?**
   - Por estado (crítico, advertencia, normal)
   - Por ubicación
   - Por cliente (solo admin)

---

## Pregunta: Selector de Cliente / Instalación en el Header

Según la documentación, el header debería mostrar:
> "Cliente / instalación seleccionada"

Actualmente el prototipo NO tiene este selector.

**Preguntas:**

1. **¿Qué usuarios ven este selector?**
   - ¿Solo el Admin? (para cambiar entre clientes)
   - ¿También el Técnico?
   - ¿El Cliente también? (si tiene múltiples instalaciones)

2. **¿Qué se selecciona?**
   - Opción A: Solo el **cliente** (empresa) → y se ven todos sus bancos
   - Opción B: **Cliente + Instalación** (ubicación específica) → y se ven los bancos de esa instalación
   - Opción C: **Cliente + Banco específico** → se ve solo ese banco

3. **¿Un cliente puede tener múltiples "instalaciones"?**
   - Ej: Empresa X tiene instalación en "Planta Córdoba" y "Planta Buenos Aires"
   - Cada instalación tiene sus propios bancos

**Ejemplo visual del selector:**
```
┌─────────────────────────────────────────┐
│ BatterySense    [Empresa X ▼] [Planta Córdoba ▼]    Usuario │
└─────────────────────────────────────────┘
```

---

## Pregunta: Definición clara de roles (Admin, Técnico, Cliente)

La documentación dice:
- **Cliente**: visualiza sus datos
- **Técnico**: configuración (limitada)
- **Admin**: gestión general

Pero no queda claro qué hace exactamente cada uno. Necesitamos definir esto bien.

### Propuesta de roles (para validar):

| Acción | Cliente | Técnico | Admin |
|--------|---------|---------|-------|
| Ver dashboard de sus bancos | ✅ | ✅ | ✅ |
| Ver dashboard de TODOS los bancos | ❌ | ❓ | ✅ |
| Exportar CSV | ✅ | ✅ | ✅ |
| Configurar umbrales de alarmas | ❌ | ✅ | ✅ |
| Gestionar usuarios (crear/editar/eliminar) | ❌ | ❌ | ✅ |
| Gestionar clientes (crear/editar/eliminar) | ❌ | ❌ | ✅ |
| Silenciar/reconocer alarmas | ❌ | ❓ | ✅ |

### Preguntas específicas:

1. **¿El Admin monitorea bancos o solo gestiona?**
   - Opción A: Admin solo gestiona usuarios/clientes, NO ve dashboards de monitoreo
   - Opción B: Admin puede hacer TODO (gestión + monitoreo + configuración)

2. **¿El Técnico a qué bancos tiene acceso?**
   - Opción A: Ve TODOS los bancos de todos los clientes (como soporte técnico general)
   - Opción B: Se le asignan clientes específicos (técnico dedicado)

3. **¿Los roles son jerárquicos?**
   - Es decir: Admin > Técnico > Cliente (el admin puede hacer todo lo del técnico, etc.)

4. **¿Quién configura los umbrales de alarmas?**
   - ¿Solo técnico?
   - ¿Técnico y admin?
   - ¿Cada cliente puede configurar los suyos?

5. **¿El técnico puede crear/eliminar usuarios?**
   - Por ejemplo, crear usuarios cliente para sus clientes asignados

### Lo implementado actualmente:

| Rol | Página inicial | Accesos |
|-----|----------------|---------|
| **Admin** | `/usuarios` | Usuarios, Clientes, Configuración, Dashboard |
| **Técnico** | `/dashboard-v4` | Dashboard, Configuración |
| **Cliente** | `/dashboard-v4` | Dashboard (solo sus bancos) |

---

## Pregunta: Layout del Header del Dashboard

Actualmente el header del dashboard muestra:
- Logo y nombre "BatterySense V4"
- Botón de alertas (campana)
- Toggle modo claro/oscuro
- Menú hamburguesa

**¿Qué información adicional debería mostrar el header?**

| Opción | Contenido del Header | Ejemplo |
|--------|---------------------|---------|
| **A. Minimalista** | Solo logo, alertas y usuario | Como está ahora |
| **B. Con selector** | Logo + Selector de cliente/banco + alertas + usuario | Para navegar entre bancos |
| **C. Con estado general** | Logo + Estado general del sistema (OK/Warning/Critical) + alertas | Vista rápida del estado |
| **D. Con última actualización** | Logo + "Última actualización: 12:45" + alertas | Para saber qué tan recientes son los datos |

**Preguntas relacionadas:**

1. **¿Se necesita mostrar cuándo fue la última actualización de datos?**
   - Si el sistema se actualiza cada X minutos, ¿el usuario necesita saber cuándo?

2. **¿Se necesita mostrar cuándo será la próxima actualización?**
   - Ej: "Próxima actualización en 8 min"

3. **¿El header debería mostrar el estado general del sistema?**
   - Un indicador verde/amarillo/rojo que resuma si todo está bien o hay problemas

4. **¿Qué prioridad tiene cada elemento?**
   - En móvil el espacio es limitado, ¿qué se debe mostrar siempre vs qué se puede ocultar?

---

## Notas adicionales

- El prototipo funciona 100% sin backend (datos mock)
- Hay 3 usuarios de prueba con diferentes roles (admin, técnico, cliente)
- Los dashboards tienen modo claro/oscuro
- Se puede exportar datos a CSV
