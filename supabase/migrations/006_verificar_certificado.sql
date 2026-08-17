-- Función pública para verificar certificados (bypass RLS)
-- Solo devuelve datos mínimos necesarios para validación

CREATE OR REPLACE FUNCTION fn_verificar_certificado(p_codigo text)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $func$
DECLARE
  v_id            bigint;
  v_estudiante_id bigint;
  v_nivel_id      bigint;
  v_emitido_at    timestamptz;
  v_codigo        text;
  v_nombre        text;
  v_apellido      text;
  v_nivel_nombre  text;
BEGIN
  select c.id, c.estudiante_id, c.nivel_id, c.emitido_at, c.codigo
  into v_id, v_estudiante_id, v_nivel_id, v_emitido_at, v_codigo
  from certificados c
  where c.codigo = p_codigo;

  if not found then
    return jsonb_build_object('valido', false);
  end if;

  select e.nombre, e.apellido
  into v_nombre, v_apellido
  from estudiantes e
  where e.id = v_estudiante_id;

  select n.nombre into v_nivel_nombre
  from niveles n
  where n.id = v_nivel_id;

  return jsonb_build_object(
    'valido', true,
    'id', v_id,
    'codigo', v_codigo,
    'emitido_at', v_emitido_at,
    'estudiante_nombre', coalesce(v_nombre, ''),
    'estudiante_apellido', coalesce(v_apellido, ''),
    'nivel_id', v_nivel_id,
    'nivel_nombre', v_nivel_nombre
  );
end;
$func$;
