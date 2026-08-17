-- =============================================================================
-- Diagnóstico: contenido y pasos por nivel
-- Ejecutar en Supabase SQL Editor para verificar que cada nivel tiene pasos
-- =============================================================================

-- 1) Pasos por nivel (debería ser > 0 en I, II y III)
SELECT
  n.id AS nivel_id,
  n.nombre AS nivel,
  COUNT(DISTINCT c.id) AS cursos,
  COUNT(DISTINCT t.id) AS temas,
  COUNT(DISTINCT p.id) AS pasos
FROM niveles n
LEFT JOIN cursos c ON c.nivel_id = n.id AND COALESCE(c.activo, true)
LEFT JOIN temas t ON t.curso_id = c.id AND COALESCE(t.activo, true)
LEFT JOIN pasos p ON p.tema_id = t.id
GROUP BY n.id, n.nombre
ORDER BY n.orden NULLS LAST, n.id;

-- 2) Cursos huérfanos o con nivel_id incorrecto
SELECT c.id, c.titulo, c.nivel_id, n.nombre AS nivel_nombre
FROM cursos c
LEFT JOIN niveles n ON n.id = c.nivel_id
ORDER BY c.nivel_id, c.orden;

-- 3) Temas sin pasos
SELECT t.id, t.titulo, c.titulo AS curso, n.nombre AS nivel
FROM temas t
JOIN cursos c ON c.id = t.curso_id
JOIN niveles n ON n.id = c.nivel_id
WHERE NOT EXISTS (SELECT 1 FROM pasos p WHERE p.tema_id = t.id)
ORDER BY n.id, c.id;

-- 4) Vista resumen (igual que en el panel Progreso futuro)
SELECT * FROM v_resumen_estudiante ORDER BY nivel_id, apellido;
