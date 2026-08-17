import { useEffect, useState, useMemo } from "react";
import { BookOpen, CheckCircle, Lock, Clock, Play } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "../lib/supabaseClient";

const COLORS = {
  teal: "#1A3A4A",
  oro: "#C9A24A",
  marfil: "#F5F1E8",
  pergamino: "#D6D0C4",
};

function badge(curso) {
  if (curso.bloqueado)
    return { label: "Bloqueado", bg: "#f5f5f5", color: "#ccc", icon: Lock };
  if (curso.completado)
    return { label: "Completado", bg: COLORS.teal, color: "white", icon: CheckCircle };
  if (curso.completadosPasos > 0) {
    const pct = curso.totalPasos > 0
      ? Math.round((curso.completadosPasos / curso.totalPasos) * 100) : 0;
    return { label: `En progreso ${pct}%`, bg: COLORS.oro, color: COLORS.teal, icon: Play };
  }
  return { label: "Sin comenzar", bg: COLORS.pergamino, color: "#666666", icon: Clock };
}

function CourseCard({ curso, onClick }) {
  const pct = curso.totalPasos > 0
    ? Math.round((curso.completadosPasos / curso.totalPasos) * 100) : 0;
  const bloq = curso.bloqueado;
  const b = badge(curso);
  const Icon = b.icon;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={bloq ? {} : { y: -2, boxShadow: "0 3px 12px rgba(0,0,0,0.06)" }}
      onClick={() => !bloq && onClick?.(curso)}
      style={{
        background: "white",
        border: `1px solid ${COLORS.pergamino}`,
        borderRadius: 3,
        overflow: "hidden",
        cursor: bloq ? "not-allowed" : "pointer",
        opacity: bloq ? 0.45 : 1,
        transition: "all 0.15s",
        position: "relative",
      }}
    >
      {curso.imagen_url && (
        <div style={{ position: "relative" }}>
          <img src={curso.imagen_url} alt={curso.titulo}
            style={{ width: "100%", height: 60, objectFit: "cover", display: "block" }}
          />
          {bloq && (
            <div style={{
              position: "absolute", inset: 0,
              background: "rgba(26,58,74,0.75)",
              display: "flex", alignItems: "center", justifyContent: "center",
            }}>
              <Lock size={24} color={COLORS.oro} />
            </div>
          )}
        </div>
      )}
      <div style={{ padding: "14px 16px" }}>
        <div style={{
          display: "flex", alignItems: "flex-start", justifyContent: "space-between",
          marginBottom: 10, gap: 8,
        }}>
          <div style={{ flex: 1, minWidth: 0 }}>
            <span style={{
              fontFamily: "'Cinzel', serif",
              fontSize: 13,
              color: COLORS.teal,
              letterSpacing: "0.3px",
              display: "block",
              whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis",
            }}>
              {curso.titulo}
            </span>
            {curso.nivelNombre && (
              <span style={{
                fontSize: 10, color: "#666666", fontStyle: "italic", display: "block",
              }}>
                {curso.nivelNombre}
              </span>
            )}
          </div>
          {curso.completado && (
            <CheckCircle size={16} color={COLORS.teal} style={{ flexShrink: 0 }} />
          )}
        </div>

        {/* Barra de progreso — siempre visible */}
        {curso.totalPasos > 0 && (
          <div style={{ marginBottom: 4 }}>
            <div style={{
              height: 4,
              background: COLORS.pergamino, borderRadius: 2, overflow: "hidden",
            }}>
              <div style={{
                width: `${pct}%`, height: "100%",
                background: COLORS.oro,
                borderRadius: 2, transition: "width 0.5s ease",
              }} />
            </div>
            <span style={{
              fontSize: 12, color: "#666666", fontFamily: "'Cinzel', serif",
              display: "block", textAlign: "right", marginTop: 2,
            }}>
              {pct}%
            </span>
          </div>
        )}

        <span style={{
          fontSize: 9, fontFamily: "'Cinzel', serif", letterSpacing: "0.5px",
          background: b.bg, color: b.color,
          padding: "2px 7px", borderRadius: 6,
          display: "inline-flex", alignItems: "center", gap: 3,
        }}>
          <Icon size={8} /> {b.label}
        </span>
      </div>
    </motion.div>
  );
}

export default function MisCursos({ estudiante, onSelectCurso }) {
  const [niveles, setNiveles] = useState([]);
  const [todosCursos, setTodosCursos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filtroNivel, setFiltroNivel] = useState("todas");

  useEffect(() => {
    let mounted = true;
    async function fetchData() {
      const nivRes = await supabase
        .from("niveles")
        .select("*")
        .order("orden", { ascending: true });
      const nivs = nivRes.data || [];
      const nivelIds = nivs.map((n) => n.id);

      const curRes = nivelIds.length
        ? await supabase
            .from("cursos")
            .select("*, temas(id, pasos(id, obligatorio))")
            .in("nivel_id", nivelIds)
            .order("orden", { ascending: true })
        : { data: [] };
      const cursos = curRes.data || [];

      const ppRes = estudiante?.id
        ? await supabase
            .from("progreso_pasos")
            .select("paso_id")
            .eq("estudiante_id", estudiante.id)
        : { data: [] };
      const completados = new Set((ppRes.data || []).map((p) => p.paso_id));

      const nivelMap = {};
      nivs.forEach((n) => { nivelMap[n.id] = n; });

      const currentOrden = nivelMap[estudiante?.nivel_id]?.orden ?? -1;

      const todos = [];
      nivs.forEach((n) => {
        const nivelCursos = cursos
          .filter((c) => c.nivel_id === n.id)
          .sort((a, b) => (a.orden || 0) - (b.orden || 0));
        nivelCursos.forEach((c) => {
          const pasos = c.temas?.flatMap((t) => t.pasos || []) || [];
          const obligatorios = pasos.filter((p) => p.obligatorio !== false);
          const completadosCount = obligatorios.filter((p) =>
            completados.has(p.id)
          ).length;
          todos.push({
            ...c,
            totalPasos: obligatorios.length,
            completadosPasos: completadosCount,
            completado: obligatorios.length > 0 && completadosCount === obligatorios.length,
            bloqueado: n.orden > currentOrden,
            nivelNombre: n.nombre,
            nivelOrden: n.orden,
          });
        });
      });

      if (!mounted) return;
      setNiveles(nivs);
      setTodosCursos(todos);
      setLoading(false);
    }
    fetchData();
    return () => { mounted = false; };
  }, [estudiante?.id]);

  const filtered = useMemo(() => {
    if (filtroNivel === "todas") return todosCursos;
    return todosCursos.filter((c) => c.nivel_id === filtroNivel);
  }, [filtroNivel, todosCursos]);

  if (loading) {
    return (
      <div style={{ padding: 32, flex: 1 }}>
        <p style={{ color: "#666666", fontStyle: "italic" }}>Cargando...</p>
      </div>
    );
  }

  return (
    <div style={{ padding: 32, flex: 1, overflowY: "auto" }}>
      <div style={{ marginBottom: 20 }}>
        <h1 style={{
          fontFamily: "'Cinzel', serif", fontSize: 22, color: COLORS.teal,
          fontWeight: 400, letterSpacing: "1px", margin: "0 0 4px",
        }}>
          Mis Cursos
        </h1>
        <p style={{ fontSize: 14, color: "#666666", fontStyle: "italic", margin: 0 }}>
          {estudiante?.niveles?.nombre || "Sin nivel asignado"}
        </p>
      </div>

      <div style={{
        display: "flex", gap: 6, marginBottom: 24,
        overflowX: "auto", paddingBottom: 4,
      }}>
        {["todas", ...niveles.map((n) => n.id)].map((id) => {
          const nivel = niveles.find((n) => n.id === id);
          const label = id === "todas" ? "Todos" : nivel?.nombre || "";
          const active = filtroNivel === id;
          return (
            <button
              key={id}
              onClick={() => setFiltroNivel(id)}
              style={{
                fontFamily: "'Cinzel', serif",
                fontSize: 10, letterSpacing: "1px",
                padding: "6px 14px",
                border: `1px solid ${active ? COLORS.oro : COLORS.pergamino}`,
                borderRadius: 2,
                background: active ? COLORS.oro : "white",
                color: active ? COLORS.teal : "#666666",
                cursor: "pointer",
                whiteSpace: "nowrap",
                transition: "all 0.12s",
              }}
            >
              {label}
            </button>
          );
        })}
      </div>

      {todosCursos.length === 0 ? (
        <div style={{ textAlign: "center", padding: "64px 0", color: "#666666" }}>
          <BookOpen size={40} style={{ marginBottom: 16, opacity: 0.3, color: COLORS.teal }} />
          <p style={{ fontStyle: "italic", fontSize: 15 }}>No hay cursos disponibles.</p>
        </div>
      ) : (
        <>
          {/* RECOMENDADO PARA TI */}
          {(() => {
            const disponibles = todosCursos.filter((c) => !c.bloqueado);
            const noCompletados = disponibles.filter((c) => !c.completado);
            const candidato = noCompletados.length > 0
              ? noCompletados.reduce((best, c) => {
                  const bp = best.totalPasos > 0 ? (best.completadosPasos / best.totalPasos) : 0;
                  const cp = c.totalPasos > 0 ? (c.completadosPasos / c.totalPasos) : 0;
                  return cp > bp ? c : best;
                })
              : disponibles.length > 0
                ? disponibles[0]
                : null;
            if (!candidato) return null;
            const rPct = candidato.totalPasos > 0
              ? Math.round((candidato.completadosPasos / candidato.totalPasos) * 100) : 0;
            const noEmpezado = candidato.completadosPasos === 0;
            return (
              <div style={{ marginBottom: 24 }}>
                <div style={{
                  fontSize: 10, color: COLORS.oro,
                  fontFamily: "'Cinzel', serif",
                  letterSpacing: "2px", textTransform: "uppercase",
                  marginBottom: 10,
                }}>
                  Recomendado para ti
                </div>
                <div
                  onClick={() => onSelectCurso?.(candidato)}
                  style={{
                    background: "white",
                    border: `1px solid ${COLORS.pergamino}`,
                    borderLeft: `3px solid ${COLORS.oro}`,
                    borderRadius: 3,
                    display: "flex",
                    alignItems: "center",
                    gap: 14,
                    padding: "14px 18px",
                    cursor: "pointer",
                  }}
                >
                  {candidato.imagen_url && (
                    <img src={candidato.imagen_url} alt={candidato.titulo}
                      style={{ width: 60, height: 60, objectFit: "cover", borderRadius: 2, flexShrink: 0 }}
                    />
                  )}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <span style={{
                      fontFamily: "'Cinzel', serif", fontSize: 14,
                      color: COLORS.teal, letterSpacing: "0.3px", display: "block",
                    }}>
                      {candidato.titulo}
                    </span>
                    {candidato.descripcion && (
                      <span style={{
                        fontSize: 12, color: "#666666", fontStyle: "italic",
                        display: "block", marginTop: 2,
                        whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis",
                      }}>
                        {candidato.descripcion}
                      </span>
                    )}
                    <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 6 }}>
                      <div style={{ flex: 1, maxWidth: 120 }}>
                        <div style={{
                          height: 4, background: COLORS.pergamino,
                          borderRadius: 2, overflow: "hidden",
                        }}>
                          <div style={{
                            width: `${rPct}%`, height: "100%",
                            background: COLORS.oro, borderRadius: 2,
                          }} />
                        </div>
                      </div>
                      <span style={{
                        fontSize: 11, color: "#666666",
                        fontFamily: "'Cinzel', serif",
                      }}>
                        {rPct}%
                      </span>
                    </div>
                  </div>
                  <span style={{
                    fontSize: 11, color: COLORS.teal,
                    fontFamily: "'Cinzel', serif",
                    letterSpacing: "0.5px",
                    borderBottom: `1px solid ${COLORS.pergamino}`,
                    padding: "2px 0",
                    whiteSpace: "nowrap", flexShrink: 0,
                  }}>
                    {noEmpezado ? "Comenzar →" : "Continuar →"}
                  </span>
                </div>
              </div>
            );
          })()}

          <div style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))",
            gap: 10,
          }}>
            <AnimatePresence mode="popLayout">
              {filtered.map((curso) => (
                <CourseCard key={curso.id} curso={curso} onClick={onSelectCurso} />
              ))}
            </AnimatePresence>
          </div>
        </>
      )}
    </div>
  );
}
