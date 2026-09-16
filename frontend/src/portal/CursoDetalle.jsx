import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, BookOpen } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { getTemas } from "../services/temasService";
import { getPasosPorTemas } from "../services/pasosService";

const COLORS = {
  teal: "#1A3A4A",
  oro: "#C9A24A",
  marfil: "#F5F1E8",
  pergamino: "#D6D0C4",
};

export default function CursoDetalle({ curso, readOnly = false, onBack }) {
  const navigate = useNavigate();
  const [temas, setTemas] = useState([]);
  const [pasosPorTema, setPasosPorTema] = useState({});
  const [loading, setLoading] = useState(true);
  const [temaAbierto, setTemaAbierto] = useState(null);

  useEffect(() => {
    async function fetch() {
      if (!curso?.id) return;
      setLoading(true);
      const { data: temasData } = await getTemas(curso.id);
      setTemas(temasData || []);
      if (temasData?.length > 0) {
        const ids = temasData.map((t) => t.id);
        const { data: pasosData } = await getPasosPorTemas(ids);
        const agrupados = (pasosData || []).reduce((acc, p) => {
          if (!acc[p.tema_id]) acc[p.tema_id] = [];
          acc[p.tema_id].push(p);
          return acc;
        }, {});
        setPasosPorTema(agrupados);
      }
      setLoading(false);
    }
    fetch();
  }, [curso?.id]);

  function toggleTema(id) {
    setTemaAbierto((prev) => (prev === id ? null : id));
  }



  return (
    <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>
      {/* Topbar */}
      <div style={{
        background: COLORS.teal,
        padding: "14px 28px",
        display: "flex",
        alignItems: "center",
        gap: 16,
        borderBottom: `2px solid ${COLORS.oro}`,
        flexShrink: 0,
      }}>
        <button
          onClick={onBack}
          style={{
            background: "rgba(255,255,255,0.08)",
            border: "none",
            cursor: "pointer",
            color: COLORS.pergamino,
            borderRadius: 2,
            padding: "8px 12px",
            display: "flex",
            alignItems: "center",
            gap: 6,
            fontSize: 11,
            fontFamily: "'Cinzel', serif",
            letterSpacing: "1px",
          }}
          onMouseEnter={(e) => e.currentTarget.style.background = "rgba(255,255,255,0.16)"}
          onMouseLeave={(e) => e.currentTarget.style.background = "rgba(255,255,255,0.08)"}
        >
          <ArrowLeft size={15} />
          Volver
        </button>
        <div style={{ flex: 1 }}>
          <div style={{
            fontSize: 10,
            color: COLORS.oro,
            fontFamily: "'Cinzel', serif",
            letterSpacing: "2px",
            textTransform: "uppercase",
          }}>
            Serie
          </div>
          <div style={{
            fontSize: 15,
            color: COLORS.marfil,
            fontFamily: "'Cinzel', serif",
            letterSpacing: "0.5px",
            marginTop: 2,
          }}>
            {curso.titulo}
          </div>
        </div>
      </div>

      {readOnly && (
        <div style={{
          background: "#fdf8ed",
          padding: "8px 28px",
          fontSize: 11,
          fontFamily: "'Cinzel', serif",
          letterSpacing: "0.5px",
          color: COLORS.oro,
          borderBottom: `1px solid ${COLORS.pergamino}`,
          flexShrink: 0,
        }}>
          Modo solo lectura — puedes revisar el contenido pero no marcar progreso
        </div>
      )}

      {/* Content */}
      <div style={{ padding: 28, flex: 1, overflowY: "auto" }}>
        {loading ? (
          <p style={{ color: "#666666", fontStyle: "italic" }}>Cargando academias...</p>
        ) : temas.length === 0 ? (
          <div style={{ textAlign: "center", padding: "64px 0", color: "#666666" }}>
            <BookOpen size={40} style={{ marginBottom: 16, opacity: 0.3, color: COLORS.teal }} />
            <p style={{ fontStyle: "italic", fontSize: 15 }}>
              Este curso aún no tiene temas.
            </p>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            <AnimatePresence mode="popLayout">
              {temas.map((tema, idx) => {
                const pasos = pasosPorTema[tema.id] || [];
                const abierto = temaAbierto === tema.id;
                return (
                  <motion.div
                    key={tema.id}
                    layout
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.18, delay: idx * 0.03 }}
                    style={{
                      background: "white",
                      border: `1px solid ${COLORS.pergamino}`,
                      borderLeft: `3px solid ${abierto ? COLORS.oro : COLORS.pergamino}`,
                      borderRadius: "0 4px 4px 0",
                      transition: "border-color 0.2s",
                    }}
                  >
                    {/* Tema header */}
                    <div
                      onClick={() => toggleTema(tema.id)}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        padding: "16px 20px",
                        cursor: "pointer",
                      }}
                    >
                      <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
                        <div style={{
                          width: 32,
                          height: 32,
                          borderRadius: "50%",
                          background: "rgba(26,58,74,0.08)",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          fontFamily: "'Cinzel', serif",
                          fontSize: 13,
                          color: COLORS.teal,
                          fontWeight: 600,
                          flexShrink: 0,
                        }}>
                          {String(idx + 1).padStart(2, "0")}
                        </div>
                          <div>
                          <p style={{
                            margin: 0,
                            fontFamily: "'Cinzel', serif",
                            fontSize: 15,
                            color: COLORS.teal,
                            letterSpacing: "0.5px",
                          }}>
                            {tema.titulo}
                          </p>
                          {tema.descripcion && (
                            <p style={{
                              margin: "4px 0 0",
                              fontSize: 13,
                              color: "#666666",
                              fontFamily: "'EB Garamond', Georgia, serif",
                            }}>
                              {tema.descripcion}
                            </p>
                          )}
                          <p style={{
                            margin: "3px 0 0",
                            fontSize: 12,
                            color: "#666666",
                            fontStyle: "italic",
                          }}>
                            {pasos.length} {pasos.length === 1 ? "paso" : "pasos"}
                          </p>
                        </div>
                      </div>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          navigate(`/tema/${tema.id}`);
                        }}
                        style={{
                          background: COLORS.marfil,
                          border: `1px solid ${COLORS.pergamino}`,
                          borderRadius: 2,
                          padding: "7px 14px",
                          cursor: "pointer",
                          fontSize: 11,
                          fontFamily: "'Cinzel', serif",
                          color: COLORS.teal,
                          letterSpacing: "0.5px",
                          transition: "all 0.15s",
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.borderColor = COLORS.oro;
                          e.currentTarget.style.background = "rgba(201,162,74,0.08)";
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.borderColor = COLORS.pergamino;
                          e.currentTarget.style.background = COLORS.marfil;
                        }}
                      >
                        Ver contenido
                      </button>
                    </div>

                    {/* Expanded: paso list */}
                    <AnimatePresence>
                      {abierto && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: "auto" }}
                          exit={{ opacity: 0, height: 0 }}
                          transition={{ duration: 0.2 }}
                          style={{ overflow: "hidden" }}
                        >
                          <div style={{
                            padding: "0 20px 16px",
                            borderTop: `1px solid ${COLORS.pergamino}`,
                            paddingTop: 14,
                          }}>
                            {pasos.length === 0 ? (
                              <p style={{ fontSize: 13, color: "#666666", fontStyle: "italic" }}>
                                No hay pasos en este tema.
                              </p>
                            ) : (
                              pasos.map((paso) => (
                                <div
                                  key={paso.id}
                                  style={{
                                    display: "flex",
                                    alignItems: "center",
                                    gap: 10,
                                    padding: "8px 12px",
                                    background: COLORS.marfil,
                                    border: `1px solid ${COLORS.pergamino}`,
                                    borderRadius: 2,
                                    marginBottom: 6,
                                  }}
                                >
                                  <span style={{
                                    fontSize: 9,
                                    fontFamily: "'Cinzel', serif",
                                    letterSpacing: "1px",
                                    padding: "2px 7px",
                                    borderRadius: 2,
                                    background: {
                                      video: "#c05621",
                                      texto: "#2b6cb0",
                                      pdf: "#c05621",
                                      pregunta: "#6b46c1",
                                      otro: "#276749",
                                    }[paso.tipo] || "#888",
                                    color: "white",
                                    flexShrink: 0,
                                  }}>
                                    {{
                                      video: "Video",
                                      texto: "Texto",
                                      pdf: "PDF",
                                      pregunta: "Pregunta",
                                      otro: "Actividad",
                                    }[paso.tipo] || "Actividad"}
                                  </span>
                                  <span style={{
                                    fontSize: 13,
                                    color: COLORS.teal,
                                    fontFamily: "'Cinzel', serif",
                                  }}>
                                    {paso.titulo || "Sin título"}
                                  </span>
                                </div>
                              ))
                            )}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        )}
      </div>
    </div>
  );
}
