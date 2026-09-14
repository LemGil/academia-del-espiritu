import { useState, useEffect } from "react";
import { X, FileText, ChevronRight } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { getProgresoPasos } from "../services/progresoService";
import { getPreguntasPorPasos, calificarQuiz } from "../services/preguntasService";
import { supabase } from "../lib/supabaseClient";

const COLORS = {
  teal: "#1A3A4A",
  oro: "#C9A24A",
  marfil: "#F5F1E8",
  pergamino: "#D6D0C4",
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

function getGoogleDriveEmbedUrl(url) {
  if (!url) return "";
  const match = url.match(/\/d\/([a-zA-Z0-9_-]+)/);
  if (!match) return "";
  const prefix = url.match(/^(https?:\/\/[^/]+\/[^/]+)/);
  if (prefix) return `${prefix[1]}/d/${match[1]}/preview`;
  return `https://drive.google.com/file/d/${match[1]}/preview`;
}

function SectionTitle({ children }) {
  return (
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
}

export default function PortalTemaDetalle({ tema, pasos = [], open, onClose, estudiante }) {
  const [, setCompletados] = useState({});
  const [submisiones, setSubmisiones] = useState({});
  const [subSaving, setSubSaving] = useState(null);
  const [preguntasData, setPreguntasData] = useState({});
  const [quizAnswers, setQuizAnswers] = useState({});
  const [quizResults, setQuizResults] = useState({});

  const AUTO_APROBABLE_TIPOS = ['leer_texto', 'ver_video', 'unirse_grupo', 'bautizarse', 'otro'];

  useEffect(() => {
    if (!open || !tema?.id || !estudiante?.id) return;
    async function load() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const [progreso, subs] = await Promise.all([
        getProgresoPasos(estudiante.id),
        supabase.from("entregas_actividades").select("*").eq("alumno_id", user.id)
      ]);
      const mapP = {};
      (progreso.data || []).forEach((p) => { mapP[p.paso_id] = true; });
      setCompletados(mapP);
      const mapS = {};
      (subs.data || []).forEach((s) => { mapS[s.actividad_id] = s; });
      setSubmisiones(mapS);

      const responderIds = pasos.filter(p => p.tipo === 'responder_preguntas').map(p => p.id);
      if (responderIds.length > 0) {
        const { data: preguntas } = await getPreguntasPorPasos(responderIds);
        const pregMap = {};
        (preguntas || []).forEach(pq => {
          if (!pregMap[pq.paso_id]) pregMap[pq.paso_id] = [];
          pregMap[pq.paso_id].push(pq);
        });
        setPreguntasData(pregMap);
      }
    }
    load();
  }, [tema?.id, open, estudiante?.id]);

  useEffect(() => {
    if (!open) return;
    function handleEsc(e) {
      if (e.key === "Escape") onClose();
    }
    document.addEventListener("keydown", handleEsc);
    return () => document.removeEventListener("keydown", handleEsc);
  }, [open, onClose]);

  if (!open || !tema) return null;

  async function handleEnviar(pasoId, respuesta) {
    setSubSaving(pasoId);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { setSubSaving(null); return; }

    const paso = pasos.find(p => p.id === pasoId);
    const tipo = paso?.tipo || 'otro';
    const autoApprove = AUTO_APROBABLE_TIPOS.includes(tipo);
    const estado = autoApprove ? 'aprobada' : 'pendiente';
    const existing = submisiones[pasoId];

    let submission = null;
    if (existing) {
      const { error: upErr } = await supabase
        .from("entregas_actividades")
        .update({ estado, respuesta_texto: respuesta || null })
        .eq("id", existing.id);
      if (!upErr) submission = { ...existing, estado, respuesta_texto: respuesta || null };
    }

    if (!submission) {
      const { data: ins, error: inErr } = await supabase
        .from("entregas_actividades")
        .insert([{ alumno_id: user.id, actividad_id: pasoId, respuesta_texto: respuesta || null, estado }])
        .select();
      if (!inErr) {
        submission = ins?.[0] || { id: crypto.randomUUID(), alumno_id: user.id, actividad_id: pasoId, respuesta_texto: respuesta || null, estado, comentario_admin: null };
      } else {
        console.error("Error al guardar entrega:", inErr);
      }
    }

    if (submission) setSubmisiones(prev => ({ ...prev, [pasoId]: submission }));
    setSubSaving(null);
  }

  function handleSelectAnswer(pasoId, preguntaId, opcionId) {
    setQuizAnswers(prev => ({
      ...prev,
      [pasoId]: { ...(prev[pasoId] || {}), [preguntaId]: opcionId }
    }));
    setQuizResults(prev => {
      const next = { ...prev };
      delete next[pasoId];
      return next;
    });
  }

  async function handleSubmitQuiz(pasoId) {
    const answers = quizAnswers[pasoId] || {};

    // La calificación ocurre en el servidor (fn_calificar_quiz): el estudiante
    // nunca recibe las respuestas correctas. Si todo está bien, la función
    // ya registró la entrega como 'aprobada'.
    setSubSaving(pasoId);
    const { data, error } = await calificarQuiz(pasoId, answers);
    setSubSaving(null);

    if (error || !data) {
      console.error("Error al calificar quiz:", error);
      return;
    }

    if (!data.correcta) {
      const errores = (data.errores || []).map(e => e.pregunta_id);
      const correctas = {};
      for (const e of (data.errores || [])) {
        if (e.opcion_correcta_id) correctas[e.pregunta_id] = e.opcion_correcta_id;
      }
      setQuizResults(prev => ({ ...prev, [pasoId]: { allCorrect: false, errores, correctas } }));
      return;
    }

    setQuizResults(prev => ({ ...prev, [pasoId]: { allCorrect: true, errores: [], correctas: {} } }));

    const { data: { user } } = await supabase.auth.getUser();
    if (data.entrega_id && user) {
      const submission = {
        id: data.entrega_id,
        alumno_id: user.id,
        actividad_id: pasoId,
        respuesta_texto: JSON.stringify(answers),
        estado: 'aprobada',
        comentario_admin: null,
      };
      setSubmisiones(prev => ({ ...prev, [pasoId]: submission }));
    }
  }

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
            {/* Header */}
            <div style={{
              background: COLORS.teal,
              padding: "20px 28px",
              borderBottom: `2px solid ${COLORS.oro}`,
              display: "flex", alignItems: "flex-start", justifyContent: "space-between",
              flexShrink: 0,
            }}>
              <div>
                <div style={{ fontSize: 10, color: COLORS.oro, fontFamily: "'Cinzel', serif", letterSpacing: "2px", textTransform: "uppercase", marginBottom: 6 }}>Tema</div>
                <h2 style={{ margin: 0, fontFamily: "'Cinzel', serif", fontSize: 18, color: COLORS.marfil, fontWeight: 400, lineHeight: 1.4 }}>{tema.titulo}</h2>
              </div>
              <button onClick={onClose} style={{ background: "rgba(255,255,255,0.08)", border: "none", cursor: "pointer", color: COLORS.pergamino, borderRadius: 2, padding: 8 }}>
                <X size={18} />
              </button>
            </div>

            {/* Content */}
            <div style={{ overflowY: "auto", flex: 1, padding: "28px" }}>
              {/* Video */}
              {tema.video_url && (
                <section style={{ marginBottom: 28 }}>
                  <SectionTitle>Video</SectionTitle>
                  <div style={{
                    position: "relative", width: "100%",
                    paddingBottom: "56.25%", height: 0,
                    borderRadius: 4, overflow: "hidden",
                    border: `1px solid ${COLORS.pergamino}`,
                  }}>
                    <iframe
                      src={getEmbedUrl(tema.video_url)}
                      title={tema.titulo}
                      frameBorder="0"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                      style={{
                        position: "absolute", top: 0, left: 0,
                        width: "100%", height: "100%",
                      }}
                    />
                  </div>
                </section>
              )}

              {/* Google Drive PDF */}
              {tema.contenido && getGoogleDriveEmbedUrl(tema.contenido) && (
                <section style={{ marginBottom: 28 }}>
                  <SectionTitle>PDF de Clase</SectionTitle>
                  <div style={{
                    width: "100%",
                    border: `1px solid ${COLORS.pergamino}`,
                    borderRadius: 4,
                    overflow: "hidden",
                  }}>
                    <iframe
                      src={getGoogleDriveEmbedUrl(tema.contenido)}
                      title="PDF de clase"
                      width="100%"
                      height="500"
                      style={{ border: "none", minHeight: 500 }}
                      allowFullScreen
                    />
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
                  <SectionTitle>Pasos y Actividades</SectionTitle>
                  <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                    {pasos.map((paso) => {
                      const submision = submisiones[paso.id];
                      const tipo = paso.tipo || "otro"; // Tipo de actividad

                      return (
                        <div key={paso.id} style={{
                          padding: "14px 18px", background: "white",
                          border: `1px solid ${submision?.estado === 'aprobada' ? '#276749' : COLORS.pergamino}`,
                          borderRadius: 4,
                          boxShadow: "0 1px 3px rgba(0,0,0,0.05)"
                        }}>
                          <p style={{ margin: "0 0 6px", fontSize: 14, color: COLORS.teal, fontFamily: "'Cinzel', serif", fontWeight: 600 }}>
                            {paso.titulo}
                          </p>
                          {paso.descripcion && (
                            <p style={{ margin: "0 0 12px", fontSize: 13, color: "#666666", fontStyle: "italic", fontFamily: "'EB Garamond', Georgia, serif" }}>
                              {paso.descripcion}
                            </p>
                          )}
                          
                          {/* 1. Si no ha sido enviado aún, o si es tipo auto-aprobable y aún no está aprobada, mostramos la acción */}
                          {(!submision || (AUTO_APROBABLE_TIPOS.includes(tipo) && submision.estado !== 'aprobada')) && (
                            <div style={{ marginTop: 10 }}>
                              {tipo === "leer_texto" && (
                                <button 
                                  onClick={() => handleEnviar(paso.id, "Confirmado: He leído el texto")} 
                                  disabled={subSaving === paso.id}
                                  style={{ background: COLORS.oro, color: COLORS.teal, border: "none", padding: "8px 16px", borderRadius: 2, fontFamily: "'Cinzel', serif", fontSize: 11, fontWeight: 600, cursor: "pointer" }}
                                >
                                  {subSaving === paso.id ? "Confirmando..." : "Confirmar que leí"}
                                </button>
                              )}

                              {tipo === "ver_video" && (
                                <button 
                                  onClick={() => handleEnviar(paso.id, "Confirmado: He visto el video")} 
                                  disabled={subSaving === paso.id}
                                  style={{ background: COLORS.oro, color: COLORS.teal, border: "none", padding: "8px 16px", borderRadius: 2, fontFamily: "'Cinzel', serif", fontSize: 11, fontWeight: 600, cursor: "pointer" }}
                                >
                                  {subSaving === paso.id ? "Confirmando..." : "Confirmar que vi el video"}
                                </button>
                              )}

                              {tipo === "responder_preguntas" && (
                                <div>
                                  {(preguntasData[paso.id] || []).length > 0 ? (
                                    <form onSubmit={(e) => { e.preventDefault(); handleSubmitQuiz(paso.id); }}>
                                      {(preguntasData[paso.id] || []).map((pq, idx) => {
                                        const selectedOp = (quizAnswers[paso.id] || {})[pq.id];
                                        const error = (quizResults[paso.id]?.errores || []).includes(pq.id);
                                        const correctaId = (quizResults[paso.id]?.correctas || {})[pq.id];
                                        return (
                                          <div key={pq.id} style={{ marginBottom: 16 }}>
                                            <p style={{ fontSize: 13, color: COLORS.teal, fontFamily: "'Cinzel', serif", fontWeight: 600, marginBottom: 8 }}>
                                              {idx + 1}. {pq.texto}
                                            </p>
                                            {(pq.opciones_respuesta || []).map(op => (
                                              <label key={op.id} style={{
                                                display: "block", padding: "7px 10px", marginBottom: 4,
                                                background: error && selectedOp === op.id ? "rgba(163,45,45,0.06)" : "transparent",
                                                border: `1px solid ${error && (selectedOp === op.id || correctaId === op.id) ? (correctaId === op.id ? "#276749" : "#a32d2d") : COLORS.pergamino}`,
                                                borderRadius: 2, cursor: "pointer", fontSize: 13, color: COLORS.teal,
                                                fontFamily: "'EB Garamond', Georgia, serif",
                                              }}>
                                                <input
                                                  type="radio"
                                                  name={`quiz-${paso.id}-${pq.id}`}
                                                  value={op.id}
                                                  checked={selectedOp === op.id}
                                                  onChange={() => handleSelectAnswer(paso.id, pq.id, op.id)}
                                                  style={{ marginRight: 8 }}
                                                />
                                                {op.texto}
                                              </label>
                                            ))}
                                            {error && (
                                              <p style={{ margin: "3px 0 0", fontSize: 11, color: "#a32d2d", fontStyle: "italic" }}>
                                                ✗ Respuesta incorrecta
                                              </p>
                                            )}
                                          </div>
                                        );
                                      })}
                                      {quizResults[paso.id]?.allCorrect && (
                                        <p style={{ color: "#276749", fontSize: 13, marginBottom: 8, fontStyle: "italic" }}>
                                          ✓ ¡Todas las respuestas son correctas!
                                        </p>
                                      )}
                                      {quizResults[paso.id] && !quizResults[paso.id].allCorrect && (
                                        <p style={{ color: "#a32d2d", fontSize: 13, marginBottom: 8, fontStyle: "italic" }}>
                                          Algunas respuestas son incorrectas. Intenta de nuevo.
                                        </p>
                                      )}
                                      <button type="submit" disabled={subSaving === paso.id} style={{
                                        background: COLORS.oro, color: COLORS.teal, border: "none",
                                        padding: "8px 16px", borderRadius: 2, fontFamily: "'Cinzel', serif",
                                        fontSize: 11, fontWeight: 600, cursor: subSaving === paso.id ? "not-allowed" : "pointer", opacity: subSaving === paso.id ? 0.7 : 1,
                                      }}>
                                        {subSaving === paso.id ? "Enviando..." : "Enviar Respuestas"}
                                      </button>
                                    </form>
                                  ) : (
                                    <p style={{ fontSize: 12, color: "#999", fontStyle: "italic" }}>
                                      No hay preguntas configuradas para esta actividad.
                                    </p>
                                  )}
                                </div>
                              )}

                              {tipo === "unirse_grupo" && (
                                <button 
                                  onClick={() => handleEnviar(paso.id, "Confirmado: Me he unido al grupo")} 
                                  disabled={subSaving === paso.id}
                                  style={{ background: COLORS.oro, color: COLORS.teal, border: "none", padding: "8px 16px", borderRadius: 2, fontFamily: "'Cinzel', serif", fontSize: 11, fontWeight: 600, cursor: "pointer" }}
                                >
                                  {subSaving === paso.id ? "Confirmando..." : "Confirmar que me uní"}
                                </button>
                              )}

                              {tipo === "bautizarse" && (
                                <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                                  <p style={{ margin: 0, fontSize: 13, color: "#666666", fontStyle: "italic", fontFamily: "'EB Garamond', Georgia, serif" }}>
                                    Al confirmar, notificarás al pastor que has sido bautizado. Él verificará y aprobará esta actividad.
                                  </p>
                                  <button 
                                    onClick={() => handleEnviar(paso.id, "Solicitud: Confirmar bautismo")} 
                                    disabled={subSaving === paso.id}
                                    style={{ background: COLORS.oro, color: COLORS.teal, border: "none", padding: "8px 16px", borderRadius: 2, fontFamily: "'Cinzel', serif", fontSize: 11, fontWeight: 600, cursor: "pointer", alignSelf: "flex-start" }}
                                  >
                                    {subSaving === paso.id ? "Confirmando..." : "Confirmar mi bautismo"}
                                  </button>
                                </div>
                              )}

                              {tipo === "otro" && (
                                <button 
                                  onClick={() => handleEnviar(paso.id, "Confirmado: Actividad completada")} 
                                  disabled={subSaving === paso.id}
                                  style={{ background: COLORS.oro, color: COLORS.teal, border: "none", padding: "8px 16px", borderRadius: 2, fontFamily: "'Cinzel', serif", fontSize: 11, fontWeight: 600, cursor: "pointer" }}
                                >
                                  {subSaving === paso.id ? "Confirmando..." : "Confirmar completado"}
                                </button>
                              )}
                            </div>
                          )}

                          {/* 2. Si ya ha sido enviado/confirmado, mostramos el estado de la entrega */}
                          {submision && (
                            <div style={{ marginTop: 10, paddingTop: 10, borderTop: "1px dashed #e2e8f0" }}>
                              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
                                <span style={{
                                  fontSize: 10, fontFamily: "'Cinzel', serif", letterSpacing: "0.5px", padding: "3px 8px", borderRadius: 2,
                                  background: submision.estado === "aprobada" ? "rgba(39,103,73,0.12)" : submision.estado === "rechazada" ? "rgba(163,45,45,0.12)" : "rgba(201,162,74,0.12)",
                                  color: submision.estado === "aprobada" ? "#276749" : submision.estado === "rechazada" ? "#a32d2d" : COLORS.oro,
                                  fontWeight: 600, textTransform: "uppercase"
                                }}>
                                  {submision.estado === "aprobada" ? "Aprobada" : submision.estado === "rechazada" ? "Rechazada" : "Pendiente de revisión"}
                                </span>
                              </div>
                              {tipo === "responder_preguntas" && (
                                <p style={{ margin: "6px 0 0", fontSize: 13, color: "#276749", fontStyle: "italic", fontFamily: "'EB Garamond', Georgia, serif" }}>
                                  ✓ Quiz completado exitosamente
                                </p>
                              )}
                              {submision.comentario_admin && (
                                <p style={{ margin: "6px 0 0", fontSize: 13, color: "#2d3748", fontFamily: "'EB Garamond', Georgia, serif" }}>
                                  <strong>Feedback:</strong> {submision.comentario_admin}
                                </p>
                              )}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </section>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
