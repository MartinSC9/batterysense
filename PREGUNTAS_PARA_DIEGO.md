# Preguntas para Diego - BatterySense

## 1. ROLES (Prioridad Alta)

**¿Qué puede hacer cada rol?**

| Acción | Cliente | Técnico | Admin |
|--------|:-------:|:-------:|:-----:|
| Ver sus bancos | ✅ | ✅ | ✅ |
| Ver TODOS los bancos | ❌ | **?** | ✅ |
| Configurar umbrales | ❌ | **?** | ✅ |
| Gestionar usuarios | ❌ | ❌ | ✅ |
| Gestionar clientes | ❌ | ❌ | ✅ |

**Preguntas:**
- ¿El técnico ve todos los clientes o solo los asignados?
- ¿Los roles son jerárquicos? (Admin > Técnico > Cliente)

---

## 2. SENSORES DE TEMPERATURA

**Hoy:** 1 sensor por banco (no por celda)

**¿Se necesita temperatura por celda individual?**
- Básico: 1 sensor por banco ← *actual*
- Avanzado: 1 sensor por celda

---

## 3. MÚLTIPLES BANCOS

**Hoy:** Pestañas para navegar entre bancos

**¿Está bien así o prefiere otra forma?**
- A) Pestañas (actual)
- B) Dropdown en header
- C) Tarjetas resumen + detalle

---

## 4. ESTRUCTURA DE CLIENTES

**¿Un cliente puede tener múltiples instalaciones/ubicaciones?**

Ejemplo:
- Empresa ABC → Planta Córdoba (3 bancos) + Planta Buenos Aires (2 bancos)

Si es así, ¿cómo se navega entre instalaciones?

---

## 5. HEADER DEL DASHBOARD

**¿Qué mostrar en el header?**
- [ ] Última actualización de datos
- [ ] Próxima actualización (cada 15 min)
- [ ] Selector de cliente/instalación
- [ ] Estado general (verde/amarillo/rojo)

---

## 6. TEXTOS DEL LOGIN (Menor prioridad)

El login muestra features. Algunas no están implementadas.

**¿Dejamos textos aspiracionales o los cambiamos?**
- "Protección Preventiva" → No implementado
- "Alertas Inteligentes" → Solo visuales, no hay push/email

---

## Estado actual del prototipo

- ✅ Login con 3 roles (admin, técnico, cliente)
- ✅ Dashboard con voltaje, temperatura, corriente, humedad
- ✅ Gráficos históricos (Hoy, 7 días, 30 días, 3 meses)
- ✅ Alertas visuales en dashboard
- ✅ Exportación CSV
- ✅ Modo claro/oscuro
- ✅ Gestión de usuarios y clientes (admin)
- ✅ Configuración de umbrales (técnico/admin)
- ⏳ Conexión a datos reales (Ubidots)
- ❌ Notificaciones push/email
- ❌ Análisis predictivo
