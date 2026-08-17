import { useState, useEffect } from "react";
import { X, FileText, CheckSquare, Square, ChevronRight } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const COLORS = {
  teal: "#1A3A4A",
  oro: "#C9A24A",
  marfil: "#F5F1E8",
  pergamino: "#D6D0C4",
};

const TIPO_LABELS = {
  video: "Video",
  texto: "Leer texto",
  pdf: "PDF",
  pregunta: "Pregunta",
  otro: "Actividad",
};

const TIPO_COLORS = {
  video: "#c05621",
  texto: "#2b6cb0",
  pdf: "#c05621",
  pregunta: "#6b46c1",
  otro: "#276749",
};

function getEmbedUrl(url) {
  if (!url) return "";
  const ytMatch = url.match(
    /(?:youtube\.com\/(?:watch\?v=|embed\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/
  );
  if (ytMatch) return `https://www.youtube.com/embed/${ytMatch[1]}`;
  const vimeoMatch = url.match(/vimeo\.com\/(\d+)/);
  if (vimeoMatch) return `https://player.vimeo.com/video/${vimeoMatch[1]}`;
  return url;
}

export default function TemaDetalle({ tema, pasos = [], open, onClose }) {
  const [completados, setCompletados] = useState({});

  useEffect(() => {
    setCompletados({});
  }, [tema?.id]);

  useEffect(() => {
    if (!open) return;
    function handleEsc(e) {
      if (e.key === "Escape") onClose();
    }
    document.addEventListener("keydown", handleEsc);
    return () => document.removeEventListener("keydown", handleEsc);
  }, [open, onClose]);

  if (!open || !tema) return null;

  const totalPasos = pasos.length;
  const completadosCount = Object.values(completados).filter(Boolean).length;
  const progreso = totalPasos > 0 ? Math.round((completadosCount / totalPasos) * 100) : 0;

  function togglePaso(id) {
    setCompletados((prev) => ({ ...prev, [id]: !prev[id] }));
  }

  const SectionTitle = ({ children }) => (
    <div style={{
      fontSize: 10, color: COLORS.oro,
      fontFamily: "'Cinzel', serif",
      letterSpacing: "2px", textTransform: "uppercase",
      marginBottom: 12, paddingBottom: 8,
      borderBottom: `1px solid ${COLORS.pergamino}`,
    }}>
      {children}
    </div>
  );

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          onClick={onClose}
          style={{
            position: "fixed", inset: 0,
            background: "rgba(10,20,30,0.7)",
            display: "flex", justifyContent: "center", alignItems: "center",
            zIndex: 1000, padding: "24px 20px",
          }}
        >
          <motion.div
            initial={{ opacity: 0, y: 24, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 12, scale: 0.97 }}
            transition={{ duration: 0.22 }}
            onClick={(e) => e.stopPropagation()}
            style={{
              background: COLORS.marfil,
              borderRadius: 4,
              width: "100%",
              maxWidth: 720,
              maxHeight: "88vh",
              overflow: "hidden",
              display: "flex",
              flexDirection: "column",
              border: `1px solid ${COLORS.pergamino}`,
              boxShadow: "0 24px 64px rgba(0,0,0,0.4)",
            }}
          >
            {/* Cabecera */}
            <div style={{
              background: COLORS.teal,
              padding: "20px 28px",
              borderBottom: `2px solid ${COLORS.oro}`,
              display: "flex", alignItems: "flex-start", justifyContent: "space-between",
              flexShrink: 0,
            }}>
              <div>
                <div style={{
                  fontSize: 10, color: COLORS.oro,
                  fontFamily: "'Cinzel', serif",
                  letterSpacing: "2px", textTransform: "uppercase",
                  marginBottom: 6,
                }}>
                  Tema
                </div>
                <h2 style={{
                  margin: 0,
                  fontFamily: "'Cinzel', serif",
                  fontSize: 18, color: COLORS.marfil,
                  fontWeight: 400, letterSpacing: "0.5px",
                  lineHeight: 1.4,
                }}>
                  {tema.titulo}
                </h2>
              </div>
              <button
                onClick={onClose}
                style={{
                  background: "rgba(255,255,255,0.08)",
                  border: "none", cursor: "pointer",
                  color: COLORS.pergamino, borderRadius: 2,
                  padding: 8, display: "flex", alignItems: "center",
                  marginLeft: 16, flexShrink: 0,
                }}
                onMouseEnter={(e) => e.currentTarget.style.background = "rgba(255,255,255,0.16)"}
                onMouseLeave={(e) => e.currentTarget.style.background = "rgba(255,255,255,0.08)"}
              >
                <X size={18} />
              </button>
            </div>

            {/* Barra de progreso */}
            {totalPasos > 0 && (
              <div style={{
                padding: "10px 28px",
                background: "white",
                borderBottom: `1px solid ${COLORS.pergamino}`,
                flexShrink: 0,
              }}>
                <div style={{
                  display: "flex", alignItems: "center",
                  justifyContent: "space-between", marginBottom: 6,
                }}>
                  <span style={{
                    fontSize: 11, fontFamily: "'Cinzel', serif",
                    color: COLORS.teal, letterSpacing: "1px",
                  }}>
                    Progreso
                  </span>
                  <span style={{
                    fontSize: 11, color: COLORS.oro,
                    fontFamily: "'Cinzel', serif",
                  }}>
                    {completadosCount} / {totalPasos}
                  </span>
                </div>
                <div style={{
                  height: 4, background: COLORS.pergamino,
                  borderRadius: 2, overflow: "hidden",
                }}>
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${progreso}%` }}
                    transition={{ duration: 0.4 }}
                    style={{ height: "100%", background: COLORS.oro, borderRadius: 2 }}
                  />
                </div>
              </div>
            )}

            {/* Contenido scrolleable */}
            <div style={{ overflowY: "auto", flex: 1, padding: "28px" }}>

              {/* Video */}
              {tema.video_url && (
                <section style={{ marginBottom: 28 }}>
                  <SectionTitle>Video</SectionTitle>
                  <div style={{
                    position: "relative",
                    width: "100%",
                    paddingBottom: "56.25%",
                    height: 0,
                    borderRadius: 4,
                    overflow: "hidden",
                    border: `1px solid ${COLORS.pergamino}`,
                  }}>
                    <iframe
                      src={getEmbedUrl(tema.video_url)}
                      title={tema.titulo}
                      frameBorder="0"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                      style={{
                        position: "absolute",
                        top: 0, left: 0,
                        width: "100%", height: "100%",
                      }}
                    />
                  </div>
                </section>
              )}

              {/* Contenido / texto */}
              {tema.contenido && (
                <section style={{ marginBottom: 28 }}>
                  <SectionTitle>Contenido</SectionTitle>
                  <div style={{
                    fontSize: 15, color: COLORS.teal,
                    fontFamily: "'EB Garamond', Georgia, serif",
                    lineHeight: 1.8, whiteSpace: "pre-wrap",
                  }}>
                    {tema.contenido}
                  </div>
                </section>
              )}

              {/* PDF */}
              {tema.pdf_url && (
                <section style={{ marginBottom: 28 }}>
                  <SectionTitle>Documento</SectionTitle>
                      <a

                    href={tema.pdf_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                      display: "inline-flex", alignItems: "center", gap: 10,
                      padding: "12px 20px",
                      background: "white",
                      border: `1px solid ${COLORS.pergamino}`,
                      borderLeft: `3px solid ${COLORS.oro}`,
                      borderRadius: "0 4px 4px 0",
                      textDecoration: "none",
                      color: COLORS.teal,
                      fontFamily: "'Cinzel', serif",
                      fontSize: 12, letterSpacing: "1px",
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.background = COLORS.marfil}
                    onMouseLeave={(e) => e.currentTarget.style.background = "white"}
                  >
                    <FileText size={16} style={{ color: COLORS.oro }} />
                    Abrir documento PDF
                    <ChevronRight size={14} style={{ color: COLORS.oro }} />
                  </a>
                </section>
              )}

              {/* Pasos */}
              {pasos.length > 0 && (
                <section>
                  <SectionTitle>Pasos a completar</SectionTitle>
                  <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                    {pasos.map((paso) => {
                      const hecho = !!completados[paso.id];
                      return (
                        <motion.div
                          key={paso.id}
                          whileHover={{ x: 2 }}
                          onClick={() => togglePaso(paso.id)}
                          style={{
                            display: "flex", alignItems: "flex-start", gap: 12,
                            padding: "12px 16px",
                            background: hecho ? "rgba(201,162,74,0.08)" : "white",
                            border: `1px solid ${hecho ? COLORS.oro : COLORS.pergamino}`,
                            borderRadius: 4,
                            cursor: "pointer",
                            transition: "all 0.15s",
                          }}
                        >
                          <div style={{
                            marginTop: 1, flexShrink: 0,
                            color: hecho ? COLORS.oro : COLORS.pergamino,
                          }}>
                            {hecho ? <CheckSquare size={18} /> : <Square size={18} />}
                          </div>
                          <div style={{ flex: 1 }}>
                            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 3 }}>
                              <span style={{
                                fontSize: 9, fontFamily: "'Cinzel', serif",
                                letterSpacing: "1px", padding: "2px 7px",
                                borderRadius: 2,
                                background: TIPO_COLORS[paso.tipo] || "#888",
                                color: "white",
                              }}>
                                {TIPO_LABELS[paso.tipo] || "Actividad"}
                              </span>
                            </div>
                            <p style={{
                              margin: 0,
                              fontSize: 14, color: hecho ? "#888" : COLORS.teal,
                              fontFamily: "'Cinzel', serif",
                              letterSpacing: "0.3px",
                              textDecoration: hecho ? "line-through" : "none",
                              transition: "all 0.2s",
                            }}>
                              {paso.titulo || "Sin título"}
                            </p>
                            {paso.descripcion && (
                              <p style={{
                                margin: "4px 0 0", fontSize: 13,
                                color: "#999", fontStyle: "italic",
                                fontFamily: "'EB Garamond', Georgia, serif",
                                lineHeight: 1.5,
                              }}>
                                {paso.descripcion}
                              </p>
                            )}
                          </div>
                        </motion.div>
                      );
                    })}
                  </div>
                </section>
              )}

              {/* Estado vacío */}
              {!tema.video_url && !tema.contenido && !tema.pdf_url && pasos.length === 0 && (
                <div style={{ textAlign: "center", padding: "48px 0", color: "#bbb" }}>
                  <p style={{ fontStyle: "italic", fontSize: 14 }}>
                    Este tema aún no tiene contenido.
                  </p>
                </div>
              )}

            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
