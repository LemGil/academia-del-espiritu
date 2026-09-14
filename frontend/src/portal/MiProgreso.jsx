import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { CheckCircle, FileText, File, HelpCircle, Play, Sparkles, Target } from "lucide-react";
import { supabase } from "../lib/supabaseClient";

const COLORS = {
  teal: "#1A3A4A",
  oro: "#C9A24A",
  marfil: "#F5F1E8",
  pergamino: "#D6D0C4",
};

function formatFecha(fecha) {
  if (!fecha) return "";
  try {
    return new Date(fecha).toLocaleDateString("es-ES", {
      year: "numeric", month: "long", day: "numeric",
      hour: "2-digit", minute: "2-digit",
    });
  } catch { return fecha; }
}

function SectionLabel({ children }) {
  return (
    <div style={{
      fontSize: 12, color: COLORS.oro,
      fontFamily: "'Cinzel', serif",
      letterSpacing: "2px", textTransform: "uppercase",
      marginBottom: 14,
    }}>
      {children}
    </div>
  );
}

function MiniBar({ value, height, color }) {
  return (
    <div style={{
      flex: 1, height: height || 4,
      background: COLORS.pergamino, borderRadius: 2, overflow: "hidden",
    }}>
      <motion.div
        initial={{ width: 0 }}
        animate={{ width: `${Math.min(value, 100)}%` }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        style={{
          height: "100%",
          background: color || COLORS.oro,
          borderRadius: 2,
        }}
      />
    </div>
  );
}

function IconoPaso({ tipo, size }) {
  const props = { size: size || 12, color: COLORS.oro, style: { flexShrink: 0 } };
  switch (tipo) {
    case "video": return <Play {...props} />;
    case "texto": return <FileText {...props} />;
    case "pdf": return <File {...props} />;
    case "pregunta": return <HelpCircle {...props} />;
    default: return <CheckCircle {...props} />;
  }
}

export default function MiProgreso({ estudiante }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!estudiante?.id) { setLoading(false); return; }
    let mounted = true;
    async function load() {
      const nivRes = await supabase
        .from("niveles")
        .select("*")
        .order("orden", { ascending: true });
      const nivs = nivRes.data || [];
      const nivelIds = nivs.map((n) => n.id);

      const curRes = nivelIds.length
        ? await supabase
            .from("cursos")
            .select("*, temas(id, pasos(id, obligatorio, titulo, tipo))")
            .in("nivel_id", nivelIds)
            .order("orden", { ascending: true })
        : { data: [] };
      const cursos = curRes.data || [];

      const ppRes = await supabase
        .from("progreso_pasos")
        .select("*")
        .eq("estudiante_id", estudiante.id);
      const ppData = ppRes.data || [];
      const completadosSet = new Set(ppData.map((p) => p.paso_id));

      const pnRes = await supabase
        .from("progreso_niveles")
        .select("nivel_id, completado_at")
        .eq("estudiante_id", estudiante.id);
      const nivelCompletado = {};
      (pnRes.data || []).forEach((p) => { nivelCompletado[p.nivel_id] = p.completado_at; });

      const nivelMap = {};
      nivs.forEach((n) => { nivelMap[n.id] = n; });
      const currentOrden = nivelMap[estudiante.nivel_id]?.orden ?? -1;

      let totalPasos = 0;
      let completados = 0;

      const nivelesMapa = nivs.map((n) => {
        const cs = cursos.filter((c) => c.nivel_id === n.id).sort((a, b) => (a.orden || 0) - (b.orden || 0));
        const cursosData = cs.map((c) => {
          const pasos = c.temas?.flatMap((t) => t.pasos || []) || [];
          const obligatorios = pasos.filter((p) => p.obligatorio !== false);
          const completadosCount = obligatorios.filter((p) => completadosSet.has(p.id)).length;
          totalPasos += obligatorios.length;
          completados += completadosCount;
          const temasData = (c.temas || []).map((t) => {
            const tPasos = (t.pasos || []).filter((p) => p.obligatorio !== false);
            const tCompletados = tPasos.filter((p) => completadosSet.has(p.id));
            const tCompletado = tPasos.length > 0 && tCompletados.length === tPasos.length;
            return {
              id: t.id,
              titulo: t.titulo,
              totalPasos: tPasos.length,
              completadosPasos: tCompletados.length,
              completado: tCompletado,
              pct: tPasos.length > 0 ? Math.round((tCompletados.length / tPasos.length) * 100) : 0,
            };
          });
          return {
            id: c.id,
            titulo: c.titulo,
            totalPasos: obligatorios.length,
            completadosPasos: completadosCount,
            completado: obligatorios.length > 0 && completadosCount === obligatorios.length,
            temas: temasData,
          };
        });
        return {
          id: n.id,
          nombre: n.nombre,
          orden: n.orden,
          cursos: cursosData,
          completado: cursosData.length > 0 && cursosData.every((c) => c.completado),
          esActual: n.id === estudiante.nivel_id,
          bloqueado: n.orden > currentOrden,
          pct: cursosData.length > 0
            ? Math.round((cursosData.filter((c) => c.completado).length / cursosData.length) * 100)
            : 0,
          fechaCompletado: nivelCompletado[n.id] || null,
        };
      });

      // Temas: mastered (completado), in progress (started), not started
      const todosTemas = [];
      const temasDebiles = [];
      cursos.forEach((c) => {
        (c.temas || []).forEach((t) => {
          const tPasos = (t.pasos || []).filter((p) => p.obligatorio !== false);
          const tCompletados = tPasos.filter((p) => completadosSet.has(p.id));
          const completado = tPasos.length > 0 && tCompletados.length === tPasos.length;
          const enProgreso = tCompletados.length > 0 && !completado;
          todosTemas.push({
            id: t.id,
            titulo: t.titulo,
            cursoTitulo: c.titulo,
            cursoId: c.id,
            nivelId: c.nivel_id,
            completado,
            enProgreso,
            totalPasos: tPasos.length,
            completadosPasos: tCompletados.length,
            pct: tPasos.length > 0 ? Math.round((tCompletados.length / tPasos.length) * 100) : 0,
          });
          if (enProgreso) temasDebiles.push(todosTemas[todosTemas.length - 1]);
        });
      });

      const mastered = todosTemas.filter((t) => t.completado).length;
      const enProgresoCount = todosTemas.filter((t) => t.enProgreso).length;
      const noIniciados = todosTemas.filter((t) => !t.completado && !t.enProgreso).length;

      // Activity history — sort by id descending (most recent first)
      const historial = [...ppData]
        .sort((a, b) => (b.id || 0) - (a.id || 0))
        .slice(0, 15)
        .map((p) => {
        const paso = cursos.flatMap((c) => c.temas || []).flatMap((t) => t.pasos || []).find((p2) => p2.id === p.paso_id);
        const tema = cursos.flatMap((c) => c.temas || []).find((t) => t.pasos?.some((p2) => p2.id === p.paso_id));
        const curso = cursos.find((c) => c.temas?.some((t) => t.pasos?.some((p2) => p2.id === p.paso_id)));
        const pasoObj = cursos.flatMap((c) => c.temas || []).flatMap((t) => t.pasos || []).find((p2) => p2.id === p.paso_id);
        return {
          paso: paso?.titulo || "Paso eliminado",
          tema: tema?.titulo || "",
          curso: curso?.titulo || "",
          fecha: p.completado_at,
          tipo: pasoObj?.tipo || "otro",
        };
      });

      // Weekly goal: % of this week's expected progress
      const hoy = new Date();
      const inicioSemana = new Date(hoy);
      inicioSemana.setDate(hoy.getDate() - hoy.getDay());
      inicioSemana.setHours(0, 0, 0, 0);
      const estaSemana = ppData.filter((p) => new Date(p.completado_at) >= inicioSemana).length;
      const metaSemanal = Math.max(3, Math.round(totalPasos * 0.05));

      if (!mounted) return;
      setData({
        nivelesMapa, cursos, totalPasos, completados,
        mastered, enProgresoCount, noIniciados,
        todosTemas,
        temasDebiles: temasDebiles.slice(0, 5),
        historial,
        estaSemana, metaSemanal,
      });
      setLoading(false);
    }
    load();
    return () => { mounted = false; };
  }, [estudiante]);

  if (loading) {
    return (
      <div style={{ padding: 32, flex: 1 }}>
        <p style={{ color: "#666666", fontStyle: "italic" }}>Cargando progreso...</p>
      </div>
    );
  }

  if (!data) return null;

  const { nivelesMapa, totalPasos, completados, mastered, enProgresoCount, noIniciados, todosTemas, historial, estaSemana, metaSemanal } = data;
  const pctGlobal = totalPasos > 0 ? Math.round((completados / totalPasos) * 100) : 0;
  const currentNivel = nivelesMapa.find((n) => n.esActual);
  const nextNivel = nivelesMapa.find((n) => n.orden === (currentNivel?.orden ?? 0) + 1);
  const nivelActualCompleto = currentNivel?.completado;

  return (
    <div style={{ padding: 32, flex: 1, overflowY: "auto" }}>

      {/* Header */}
      <div style={{ marginBottom: 28 }}>
        <h1 style={{
          fontFamily: "'Cinzel', serif", fontSize: 22, color: COLORS.teal,
          fontWeight: 400, letterSpacing: "1px", margin: "0 0 4px",
        }}>
          Mi Progreso
        </h1>
        <p style={{ fontSize: 14, color: "#666666", fontStyle: "italic", margin: 0 }}>
          {estudiante?.niveles?.nombre || "Sin nivel asignado"}
        </p>
      </div>

      {/* 1. MAPA DE NIVELES */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        style={{
          background: "white",
          border: `1px solid ${COLORS.pergamino}`,
          borderRadius: 3, padding: "20px 24px",
          marginBottom: 24, overflowX: "auto",
        }}
      >
        <SectionLabel>Mapa de niveles</SectionLabel>
        <div style={{ display: "flex", alignItems: "center", gap: 0, minWidth: 300 }}>
          {nivelesMapa.map((n, i) => {
            const isCurrent = n.esActual;
            const isCompleted = n.completado;
            return (
              <div key={n.id} style={{
                display: "flex", alignItems: "center", flex: 1,
              }}>
                <div style={{ textAlign: "center", flex: 1 }}>
                  <div style={{
                    width: 40, height: 40, borderRadius: "50%",
                    margin: "0 auto 6px",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    background: isCompleted ? COLORS.teal : isCurrent ? COLORS.oro : COLORS.pergamino,
                    color: isCompleted ? "white" : isCurrent ? COLORS.teal : "#bbb",
                    fontFamily: "'Cinzel', serif",
                    fontSize: 12, fontWeight: 600,
                  }}>
                    {i + 1}
                  </div>
                  <span style={{
                    fontSize: 13, color: isCurrent ? COLORS.teal : "#bbb",
                    fontFamily: "'Cinzel', serif",
                    whiteSpace: "nowrap",
                    fontWeight: isCurrent ? 600 : 400,
                  }}>
                    {n.nombre}
                  </span>
                  {isCurrent && (
                    <span style={{
                      display: "block", fontSize: 10, color: COLORS.oro,
                      fontStyle: "italic", marginTop: 2,
                    }}>
                      Actual
                    </span>
                  )}
                  {n.fechaCompletado && (
                    <span style={{
                      display: "block", fontSize: 10, color: "#666666",
                      fontStyle: "italic", marginTop: 2,
                    }}>
                      {new Date(n.fechaCompletado).toLocaleDateString()}
                    </span>
                  )}
                </div>
                {i < nivelesMapa.length - 1 && (
                  <div style={{
                    flex: 1, height: 2,
                    background: n.completado ? COLORS.teal : COLORS.pergamino,
                    margin: "0 4px 20px",
                    borderRadius: 1,
                  }} />
                )}
              </div>
            );
          })}
        </div>
        {nivelActualCompleto && nextNivel && (
          <p style={{
            margin: "12px 0 0", fontSize: 12, color: COLORS.teal,
            fontStyle: "italic",
            display: "flex", alignItems: "center", gap: 6,
          }}>
            <Sparkles size={14} color={COLORS.oro} />
            ¡Nivel {currentNivel?.nombre} completado! {nextNivel?.nombre} está disponible.
          </p>
        )}
        {!nivelActualCompleto && currentNivel && (
          <p style={{
            margin: "12px 0 0", fontSize: 13, color: "#666666",
            fontStyle: "italic",
          }}>
            Completa todos los cursos de {currentNivel?.nombre} para desbloquear el siguiente nivel.
          </p>
        )}
      </motion.div>

      {/* 2. PROGRESO GLOBAL */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.05 }}
        style={{
          background: "white",
          border: `1px solid ${COLORS.pergamino}`,
          borderRadius: 3, padding: "20px 24px",
          marginBottom: 24,
        }}
      >
        <SectionLabel>Progreso global</SectionLabel>
        <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 12 }}>
          <div style={{
            width: 56, height: 56, borderRadius: "50%",
            background: `conic-gradient(${COLORS.oro} ${pctGlobal}%, ${COLORS.pergamino} ${pctGlobal}%)`,
            display: "flex", alignItems: "center", justifyContent: "center",
            flexShrink: 0,
          }}>
            <div style={{
              width: 44, height: 44, borderRadius: "50%",
              background: "white",
              display: "flex", alignItems: "center", justifyContent: "center",
            }}>
              <span style={{
                fontFamily: "'Cinzel', serif", fontSize: 14,
                color: COLORS.teal, fontWeight: 600,
              }}>
                {pctGlobal}%
              </span>
            </div>
          </div>
          <div style={{ flex: 1, display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12 }}>
          {(() => {
            const totalCursos = nivelesMapa.reduce((a, n) => a + n.cursos.length, 0);
            const cursosCompletados = nivelesMapa.reduce((a, n) => a + n.cursos.filter((c) => c.completado).length, 0);
            return [
              { label: "Pasos", value: `${completados}/${totalPasos}` },
              { label: "Cursos", value: `${cursosCompletados}/${totalCursos}` },
              { label: "Temas", value: `${mastered}/${mastered + enProgresoCount + noIniciados}` },
            ];
          })().map((s) => (
            <div key={s.label} style={{ textAlign: "center" }}>
              <span style={{
                fontFamily: "'Cinzel', serif", fontSize: 16,
                color: COLORS.teal, fontWeight: 600, display: "block",
              }}>
                {s.value}
              </span>
              <span style={{ fontSize: 13, color: "#666666", fontStyle: "italic" }}>
                {s.label}
              </span>
            </div>
          ))}
        </div>
        </div>
      </motion.div>

      {/* 3. PROGRESO POR CURSO */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        style={{ marginBottom: 24 }}
      >
        <SectionLabel>Progreso por curso</SectionLabel>
        <div style={{ background: "white", border: `1px solid ${COLORS.pergamino}`, borderRadius: 3, padding: "16px 20px" }}>
          {nivelesMapa.flatMap((n) =>
            n.cursos.map((c) => (
              <div key={c.id} style={{
                display: "flex", alignItems: "center", gap: 12,
                padding: "8px 0",
                borderBottom: `1px solid ${COLORS.pergamino}`,
              }}>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <span style={{
                    fontFamily: "'Cinzel', serif", fontSize: 12,
                    color: COLORS.teal, letterSpacing: "0.3px",
                  }}>
                    {c.titulo}
                  </span>
                  <span style={{
                    display: "block", fontSize: 13, color: "#666666",
                    fontStyle: "italic",
                  }}>
                    {n.nombre}
                  </span>
                </div>
                <MiniBar
                  value={c.totalPasos > 0 ? Math.round((c.completadosPasos / c.totalPasos) * 100) : 0}
                  height={4}
                  color={COLORS.oro}
                />
                <span style={{
                  fontSize: 13, color: COLORS.teal,
                  fontFamily: "'Cinzel', serif", fontWeight: 600,
                  whiteSpace: "nowrap", width: 40, textAlign: "right",
                }}>
                  {c.totalPasos > 0 ? Math.round((c.completadosPasos / c.totalPasos) * 100) : 0}%
                </span>
                {c.completado && <CheckCircle size={14} color={COLORS.teal} />}
              </div>
            ))
          )}
        </div>
      </motion.div>

      {/* 4. PROGRESO POR TEMAS */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15 }}
        style={{ marginBottom: 24 }}
      >
        <SectionLabel>Progreso por temas</SectionLabel>
        <div style={{
          display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12, marginBottom: 12,
        }}>
          {[
            { label: "Dominados", value: mastered, color: COLORS.teal, bg: "rgba(201,162,74,0.15)" },
            { label: "En progreso", value: enProgresoCount, color: COLORS.teal, bg: "rgba(26,58,74,0.08)" },
            { label: "No iniciados", value: noIniciados, bg: COLORS.marfil },
          ].map((s) => (
            <div key={s.label} style={{
              background: s.bg, borderRadius: 3, padding: "14px 16px", textAlign: "center",
            }}>
              <span style={{
                fontFamily: "'Cinzel', serif", fontSize: 22,
                color: s.color, fontWeight: 600, display: "block",
              }}>
                {s.value}
              </span>
              <span style={{ fontSize: 12, color: "#666666", fontStyle: "italic" }}>
                {s.label}
              </span>
            </div>
          ))}
        </div>
        <div style={{
          background: "white", border: `1px solid ${COLORS.pergamino}`,
          borderRadius: 3, padding: "16px 20px",
        }}>
          {todosTemas.length === 0 ? (
            <p style={{ margin: 0, fontSize: 13, color: "#666666", fontStyle: "italic" }}>
              No hay temas disponibles.
            </p>
          ) : (
            todosTemas.map((t) => {
              const badge = t.completado
                ? { label: "Dominado", bg: "rgba(201,162,74,0.15)", color: COLORS.teal }
                : t.enProgreso
                ? { label: "En progreso", bg: "rgba(26,58,74,0.08)", color: COLORS.teal }
                : { label: "No iniciado", bg: "#f5f5f5", color: "#666666" };
              return (
                <div key={t.id} style={{
                  display: "flex", alignItems: "center", gap: 12,
                  padding: "8px 0",
                  borderBottom: `1px solid ${COLORS.pergamino}`,
                }}>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <span style={{ fontSize: 12, color: COLORS.teal }}>
                      {t.titulo}
                    </span>
                    <span style={{
                      fontSize: 13, color: "#666666", fontStyle: "italic",
                      display: "block",
                    }}>
                      {t.cursoTitulo}
                    </span>
                  </div>
                  <span style={{
                    fontSize: 10, padding: "2px 8px", borderRadius: 2,
                    background: badge.bg, color: badge.color,
                    fontFamily: "'Cinzel', serif", letterSpacing: "0.5px",
                    whiteSpace: "nowrap",
                  }}>
                    {badge.label}
                  </span>
                  <div style={{ width: 80 }}>
                    <MiniBar value={t.pct} height={4} color={COLORS.oro} />
                  </div>
                  <span style={{
                    fontSize: 11, color: COLORS.teal,
                    fontFamily: "'Cinzel', serif", fontWeight: 600,
                    whiteSpace: "nowrap", width: 36, textAlign: "right",
                  }}>
                    {t.pct}%
                  </span>
                </div>
              );
            })
          )}
        </div>
      </motion.div>

      {/* 5. ÁREAS POR FORTALECER */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.18 }}
        style={{ marginBottom: 24 }}
      >
        <SectionLabel>Áreas por fortalecer</SectionLabel>
        <div style={{
          background: "white", border: `1px solid ${COLORS.pergamino}`,
          borderRadius: 3, padding: "16px 20px",
        }}>
          {(() => {
            const nivelActualId = estudiante.nivel_id;
            const debiles = todosTemas.filter((t) => t.pct < 50 && t.nivelId === nivelActualId);
            if (debiles.length === 0) {
              return (
                <p style={{ margin: 0, fontSize: 13, color: COLORS.teal, fontStyle: "italic" }}>
                  ¡Excelente! Estás al día en todos los temas de tu nivel actual.
                </p>
              );
            }
            return debiles.slice(0, 8).map((t) => (
              <div key={t.id} style={{
                display: "flex", alignItems: "center", gap: 12,
                padding: "8px 0",
                borderBottom: `1px solid ${COLORS.pergamino}`,
              }}>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <span style={{ fontSize: 12, color: COLORS.teal }}>
                    {t.titulo}
                  </span>
                  <span style={{
                    fontSize: 12, color: "#666666", fontStyle: "italic",
                    display: "block", marginTop: 1,
                  }}>
                    Continúa avanzando en este tema
                  </span>
                </div>
                <span style={{
                  fontSize: 13, color: COLORS.oro,
                  fontFamily: "'Cinzel', serif", fontWeight: 600,
                }}>
                  {t.pct}%
                </span>
                <a
                  href={`/portal?view=curso&id=${t.cursoId}`}
                  style={{
                    fontSize: 11, color: COLORS.teal,
                    fontFamily: "'Cinzel', serif",
                    letterSpacing: "0.5px",
                    textDecoration: "none",
                    borderBottom: `1px solid ${COLORS.pergamino}`,
                    padding: "2px 0",
                    whiteSpace: "nowrap",
                  }}
                >
                  Ir al tema →
                </a>
              </div>
            ));
          })()}
        </div>
      </motion.div>

      {/* 6. HISTORIAL DE ACTIVIDAD */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        style={{ marginBottom: 24 }}
      >
        <SectionLabel>Historial de actividad</SectionLabel>
        <div style={{
          background: "white", border: `1px solid ${COLORS.pergamino}`,
          borderRadius: 3, padding: "16px 20px",
        }}>
          {historial.length === 0 ? (
            <p style={{ margin: 0, fontSize: 13, color: "#666666", fontStyle: "italic" }}>
              Aún no hay actividad registrada.
            </p>
          ) : (
            historial.map((h, i) => (
              <div key={i} style={{
                display: "flex", alignItems: "center", gap: 10,
                padding: "8px 0",
                borderBottom: i < historial.length - 1 ? `1px solid ${COLORS.pergamino}` : "none",
              }}>
                <IconoPaso tipo={h.tipo} size={12} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <span style={{ fontSize: 12, color: COLORS.teal }}>
                    {h.paso}
                  </span>
                  <span style={{
                    fontSize: 13, color: "#666666", fontStyle: "italic",
                    display: "block",
                  }}>
                    {h.tema} · {h.curso}
                  </span>
                </div>
                 <span style={{
                  fontSize: 13, color: "#666666", whiteSpace: "nowrap", flexShrink: 0,
                }}>
                  {formatFecha(h.fecha)}
                </span>
              </div>
            ))
          )}
        </div>
      </motion.div>

      {/* 7. META DE LA SEMANA */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.25 }}
        style={{
          background: "white",
          border: `1px solid ${COLORS.pergamino}`,
          borderRadius: 3, padding: "20px 24px",
        }}
      >
        <SectionLabel>Meta de la semana</SectionLabel>
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <div style={{
            width: 48, height: 48, borderRadius: "50%",
            background: `${COLORS.oro}18`,
            display: "flex", alignItems: "center", justifyContent: "center",
            flexShrink: 0,
          }}>
            <Target size={20} color={COLORS.oro} />
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
              <span style={{
                fontFamily: "'Cinzel', serif", fontSize: 12,
                color: COLORS.teal, letterSpacing: "0.5px",
              }}>
                {estaSemana >= metaSemanal ? "¡Meta cumplida!" : `${estaSemana} de ${metaSemanal} pasos`}
              </span>
              <span style={{
                fontSize: 12, color: COLORS.oro,
                fontFamily: "'Cinzel', serif", fontWeight: 600,
              }}>
                {Math.min(Math.round((estaSemana / metaSemanal) * 100), 100)}%
              </span>
            </div>
            <MiniBar
              value={Math.min(Math.round((estaSemana / metaSemanal) * 100), 100)}
              height={6}
              color={estaSemana >= metaSemanal ? COLORS.teal : COLORS.oro}
            />
            <p style={{
              margin: "6px 0 0", fontSize: 12, color: "#666666", fontStyle: "italic",
            }}>
              {metaSemanal} pasos sugeridos por semana
            </p>
          </div>
        </div>
      </motion.div>

    </div>
  );
}
