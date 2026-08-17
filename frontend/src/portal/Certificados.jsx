import { useEffect, useState } from "react";
import { Award, FileText, Lock, CheckCircle, ExternalLink } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "../lib/supabaseClient";
import Certificado from "../components/Certificado";

const COLORS = {
  teal: "#1A3A4A",
  oro: "#C9A24A",
  marfil: "#F5F1E8",
  pergamino: "#D6D0C4",
};

function SectionLabel({ children, count }) {
  return (
    <div style={{
      display: "flex", alignItems: "center", gap: 8,
      fontSize: 12, color: COLORS.oro,
      fontFamily: "'Cinzel', serif",
      letterSpacing: "2px", textTransform: "uppercase",
      marginBottom: 14,
    }}>
      {children}
      {count != null && (
        <span style={{
          fontSize: 10, color: COLORS.teal, fontFamily: "'Cinzel', serif",
          background: COLORS.pergamino, padding: "1px 7px", borderRadius: 6,
        }}>
          {count}
        </span>
      )}
    </div>
  );
}

export default function Certificados({ estudiante }) {
  const [certificados, setCertificados] = useState([]);
  const [enProceso, setEnProceso] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null);

  useEffect(() => {
    if (!estudiante?.id) { setLoading(false); return; }
    let mounted = true;
    async function load() {
      // Fetch all niveles and cursos
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

      // Fetch certificates
      const certRes = await supabase
        .from("certificados")
        .select("*, cursos(titulo, texto_biblico), niveles(nombre, texto_biblico)")
        .eq("estudiante_id", estudiante.id)
        .order("emitido_at", { ascending: false });
      const certs = certRes.data || [];

      // Fetch progreso
      const ppRes = await supabase
        .from("progreso_pasos")
        .select("paso_id")
        .eq("estudiante_id", estudiante.id);
      const ppSet = new Set((ppRes.data || []).map((p) => p.paso_id));

      const pcRes = await supabase
        .from("progreso_cursos")
        .select("curso_id")
        .eq("estudiante_id", estudiante.id);
      const pcSet = new Set((pcRes.data || []).map((c) => c.curso_id));

      const pnRes = await supabase
        .from("progreso_niveles")
        .select("nivel_id")
        .eq("estudiante_id", estudiante.id);
      const pnSet = new Set((pnRes.data || []).map((n) => n.nivel_id));

      const certCursoIds = new Set(certs.filter((c) => c.curso_id).map((c) => c.curso_id));
      const certNivelIds = new Set(certs.filter((c) => c.nivel_id).map((c) => c.nivel_id));

      // Compute "en proceso": completed (via progreso) but no certificate yet
      const proces = [];

      for (const curso of cursos) {
        if (pcSet.has(curso.id) && !certCursoIds.has(curso.id)) {
          const pasos = curso.temas?.flatMap((t) => t.pasos || []) || [];
          const obligatorios = pasos.filter((p) => p.obligatorio !== false);
          const completados = obligatorios.filter((p) => ppSet.has(p.id)).length;
          proces.push({
            tipo: "curso",
            id: curso.id,
            nombre: curso.titulo,
            total: obligatorios.length,
            completados,
            pct: obligatorios.length > 0
              ? Math.round((completados / obligatorios.length) * 100) : 0,
          });
        }
      }

      for (const nivel of nivs) {
        if (pnSet.has(nivel.id) && !certNivelIds.has(nivel.id)) {
          const cs = cursos.filter((c) => c.nivel_id === nivel.id);
          const csCompletados = cs.filter((c) => pcSet.has(c.id)).length;
          proces.push({
            tipo: "nivel",
            id: nivel.id,
            nombre: nivel.nombre,
            total: cs.length,
            completados: csCompletados,
            pct: cs.length > 0 ? Math.round((csCompletados / cs.length) * 100) : 0,
          });
        }
      }

      if (!mounted) return;
      setCertificados(certs);
      setEnProceso(proces);
      setLoading(false);
    }
    load();
    return () => { mounted = false; };
  }, [estudiante?.id]);

  function handleVer(cert) {
    const esCurso = !!cert.curso_id;
    setSelected({
      id: cert.id,
      tipo: esCurso ? "curso" : "nivel",
      nombreEstudiante: estudiante
        ? `${estudiante.nombre || ""} ${estudiante.apellido || ""}`.trim() || "Estudiante"
        : "Estudiante",
      nombreCursoONivel: esCurso
        ? (cert.cursos?.titulo || "Curso")
        : (cert.niveles?.nombre || "Nivel"),
      textoBiblico: esCurso
        ? (cert.cursos?.texto_biblico || "")
        : (cert.niveles?.texto_biblico || ""),
      fechaCompletado: cert.emitido_at,
    });
  }

  if (loading) {
    return (
      <div style={{ padding: 32, flex: 1 }}>
        <p style={{ color: "#666666", fontStyle: "italic", fontSize: 13 }}>Cargando certificados...</p>
      </div>
    );
  }

  return (
    <div style={{ padding: 32, flex: 1, overflowY: "auto" }}>
      <div style={{ marginBottom: 28 }}>
        <h1 style={{
          fontFamily: "'Cinzel', serif", fontSize: 22,
          color: COLORS.teal, fontWeight: 400,
          letterSpacing: "1px", margin: "0 0 4px",
        }}>
          Mis Certificados
        </h1>
        <p style={{
          fontSize: 14, color: "#666666",
          fontStyle: "italic", margin: 0,
        }}>
          Logros oficiales de tu formación
        </p>
      </div>

      {/* CERTIFICADOS OBTENIDOS */}
      <div style={{ marginBottom: 32 }}>
        <SectionLabel count={certificados.length}>
          Certificados obtenidos
        </SectionLabel>
        {certificados.length === 0 ? (
          <div style={{
            textAlign: "center", padding: "48px 0", color: "#666666",
            border: `1px solid ${COLORS.pergamino}`,
            borderRadius: 3, background: "white",
          }}>
            <Award size={44} style={{ marginBottom: 12, opacity: 0.3, color: COLORS.oro }} />
            <p style={{ fontStyle: "italic", fontSize: 14, margin: 0 }}>
              Aún no tienes certificados.
            </p>
            <p style={{ fontStyle: "italic", fontSize: 12, color: "#666666", margin: "6px 0 0" }}>
              Completa cursos y niveles para obtenerlos.
            </p>
          </div>
        ) : (
          <div style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(250px, 1fr))",
            gap: 14,
          }}>
            <AnimatePresence mode="popLayout">
              {certificados.map((cert, idx) => {
                const esCurso = !!cert.curso_id;
                const nombre = esCurso
                  ? (cert.cursos?.titulo || "Curso")
                  : (cert.niveles?.nombre || "Nivel");
                const codigo = cert.codigo;
                return (
                  <motion.div
                    key={cert.id}
                    layout
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.04 }}
                    style={{
                      background: "white",
                      border: `1px solid ${COLORS.pergamino}`,
                      borderRadius: 3,
                      padding: "20px 18px",
                      ...(!esCurso ? { border: `3px solid ${COLORS.oro}`, background: "rgba(201,162,74,0.15)" } : {}), // Style for Level Certificates
                    }}
                  >
                    <div style={{
                      width: 48, height: 48, borderRadius: "50%",
                      background: `${COLORS.oro}18`,
                      display: "flex", alignItems: "center", justifyContent: "center",
                      margin: "0 auto 12px",
                    }}>
                      <Award size={22} color={COLORS.oro} />
                    </div>
                  <p style={{
                    margin: "0 0 " + (esCurso ? "2px" : "4px"),
                    fontFamily: "'Cinzel', serif",
                    fontSize: 14, color: COLORS.teal,
                    letterSpacing: "0.3px",
                    textAlign: "center",
                  }}>
                    {nombre}
                  </p>
                    <p style={{
                      margin: "0 0 4px",
                      fontSize: 11, color: COLORS.oro,
                      fontFamily: "'Cinzel', serif", letterSpacing: "0.5px",
                      textAlign: "center",
                    }}>
                      {esCurso ? "CURSO" : "NIVEL"}
                    </p>
                    <p style={{
                      margin: "0 0 14px",
                      fontSize: 11, color: "#666666",
                      fontStyle: "italic", textAlign: "center",
                    }}>
                      {new Date(cert.emitido_at).toLocaleDateString("es-ES", {
                        year: "numeric", month: "long", day: "numeric",
                      })}
                    </p>

                    {/* Verification code */}
                    <div style={{
                      background: COLORS.marfil,
                      borderRadius: 2,
                      padding: "6px 10px",
                      marginBottom: 12,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      gap: 6,
                    }}>
                      <span style={{
                        fontSize: 10, color: "#666666",
                        fontFamily: "'Cinzel', serif", letterSpacing: "0.5px",
                      }}>
                        {codigo}
                      </span>
                      <a
                        href={`${typeof window !== "undefined" ? window.location.origin : ""}/?codigo=${encodeURIComponent(cert.codigo)}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{ color: COLORS.oro, display: "flex", alignItems: "center", gap: 2, fontSize: 10, textDecoration: "none" }}
                      >
                        <ExternalLink size={10} />
                        Verificar
                      </a>
                    </div>

                    <div style={{ display: "flex", gap: 8, justifyContent: "center" }}>
                      <button
                        onClick={() => handleVer(cert)}
                        style={{
                          background: COLORS.oro,
                          border: "none",
                          borderRadius: 2,
                          padding: "7px 16px",
                          fontFamily: "'Cinzel', serif",
                          fontSize: 10, color: COLORS.teal,
                          letterSpacing: "1px",
                          cursor: "pointer",
                          display: "inline-flex",
                          alignItems: "center",
                          gap: 4,
                          fontWeight: 600,
                        }}
                      >
                        <FileText size={12} />
                        Ver Certificado
                      </button>
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        )}
      </div>

      {/* EN PROCESO */}
      {enProceso.length > 0 && (
        <div>
          <SectionLabel count={enProceso.length}>
            Por alcanzar
          </SectionLabel>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            <AnimatePresence>
              {enProceso.map((p, idx) => (
                <motion.div
                  key={`${p.tipo}-${p.id}`}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.03 }}
                  style={{
                    background: "white",
                    border: `1px solid ${COLORS.pergamino}`,
                    borderRadius: 3,
                    padding: "14px 18px",
                    display: "flex",
                    alignItems: "center",
                    gap: 12,
                  }}
                >
                  <div style={{
                    width: 36, height: 36, borderRadius: "50%",
                    background: p.pct >= 100 ? `${COLORS.teal}18` : `${COLORS.oro}18`,
                    display: "flex", alignItems: "center", justifyContent: "center",
                    flexShrink: 0,
                  }}>
                    {p.pct >= 100 ? (
                      <CheckCircle size={16} color={COLORS.teal} />
                    ) : (
                      <Lock size={16} color={COLORS.oro} />
                    )}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <span style={{
                      fontFamily: "'Cinzel', serif",
                      fontSize: 13, color: COLORS.teal,
                    }}>
                      {p.tipo === "curso" ? `Curso: ${p.nombre}` : `Nivel: ${p.nombre}`}
                    </span>
                    <span style={{
                      display: "block", fontSize: 11, color: "#666666",
                      fontStyle: "italic", marginTop: 1,
                    }}>
                      {p.pct >= 100
                        ? "Completado — certificado pendiente de generación"
                        : `${p.completados}/${p.total} ${p.tipo === "curso" ? "pasos" : "cursos"} completados`}
                    </span>
                  </div>
                  {p.pct < 100 && (
                    <div style={{
                      display: "flex", alignItems: "center", gap: 8, flexShrink: 0,
                    }}>
                      <div style={{
                        width: 60, height: 4,
                        background: COLORS.pergamino, borderRadius: 2, overflow: "hidden",
                      }}>
                        <div style={{
                          width: `${p.pct}%`, height: "100%",
                          background: COLORS.oro, borderRadius: 2,
                        }} />
                      </div>
                      <span style={{
                        fontSize: 11, color: COLORS.oro,
                        fontFamily: "'Cinzel', serif", fontWeight: 600,
                      }}>
                        {p.pct}%
                      </span>
                    </div>
                  )}
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </div>
      )}

      {/* Certificado modal */}
      {selected && (
        <Certificado
          tipo={selected.tipo}
          nombreEstudiante={selected.nombreEstudiante}
          nombreCursoONivel={selected.nombreCursoONivel}
          textoBiblico={selected.textoBiblico}
          fechaCompletado={selected.fechaCompletado}
          codigoVerificacion={selected.codigo}
          onClose={() => setSelected(null)}
        />
      )}
    </div>
  );
}
