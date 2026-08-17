-- =============================================================================
-- Migración 002 — Ajuste vista v_resumen_estudiante
-- - porcentaje_nivel = 0 cuando no hay pasos (en lugar de null)
-- - Cuenta todos los pasos activos (no solo obligatorio=true)
-- Ejecutar en SQL Editor después de 001
-- =============================================================================

CREATE OR REPLACE VIEW v_resumen_estudiante AS
SELECT
  e.id AS estudiante_id,
  e.nombre,
  e.apellido,
  e.email,
  e.nivel_id,
  n.nombre AS nivel_nombre,
  COUNT(DISTINCT p.id) AS pasos_totales,
  COUNT(DISTINCT pp.paso_id) AS pasos_completados,
  COALESCE(
    ROUND(
      100.0 * COUNT(DISTINCT pp.paso_id)
      / NULLIF(COUNT(DISTINCT p.id), 0),
      1
    ),
    0
  ) AS porcentaje_nivel
FROM estudiantes e
LEFT JOIN niveles n ON n.id = e.nivel_id
LEFT JOIN cursos c ON c.nivel_id = n.id AND COALESCE(c.activo, true)
LEFT JOIN temas t ON t.curso_id = c.id AND COALESCE(t.activo, true)
LEFT JOIN pasos p ON p.tema_id = t.id
LEFT JOIN progreso_pasos pp
  ON pp.estudiante_id = e.id AND pp.paso_id = p.id
WHERE COALESCE(e.activo, true)
GROUP BY e.id, e.nombre, e.apellido, e.email, e.nivel_id, n.nombre;

COMMENT ON VIEW v_resumen_estudiante IS
  'Resumen de avance por estudiante en su nivel actual (pasos del árbol nivel→curso→tema→paso)';
