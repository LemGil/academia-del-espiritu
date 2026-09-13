import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, FileText, Download, Maximize2, X, ExternalLink } from "lucide-react";
import { marcarPasoCompletado, getProgresoPasos } from "../services/progresoService";
import { getPreguntasPorPasos } from "../services/preguntasService";
import { getPasosPorTemas } from "../services/pasosService";
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

function getGoogleDriveFileId(url) {
  if (!url) return null;
  const match = url.match(/\/d\/([a-zA-Z0-9_-]+)/);
  return match ? match[1] : null;
}

function getGoogleDriveEmbedUrl(url) {
  const id = getGoogleDriveFileId(url);
  if (!id) return url; // URL directa, usarla tal cual
  return `https://drive.google.com/file/d/${id}/preview`;
}

function getDownloadUrl(url) {
  const id = getGoogleDriveFileId(url);
  if (id) return `https://drive.google.com/uc?export=download&id=${id}`;
  return url; // URL directa — descargar/abrir tal cual
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

// Bloque PDF reutilizable: embed + modo lectura + descarga
function PDFBlock({ url, titulo, etiqueta = "PDF" }) {
  const [modoLectura, setModoLectura] = useState(false);
  const embedUrl = getGoogleDriveEmbedUrl(url);
  const downloadUrl = getDownloadUrl(url);

  return (
    <>
      <section style={{ marginBottom: 28 }}>
        <SectionTitle>{etiqueta}</SectionTitle>
        {titulo && (
          <p style={{
            fontSize: 13, color: COLORS.teal,
            fontFamily: "'Cinzel', serif", fontWeight: 600,
            margin: "0 0 12px", letterSpacing: "0.5px",
          }}>
            {titulo}
          </p>
        )}

        {/* Embed preview */}
        <div style={{
          width: "100%", height: 320,
          border: `1px solid ${COLORS.pergamino}`,
          borderRadius: 4, overflow: "hidden",
          position: "relative", background: "#f0ece4",
        }}>
          <iframe
            src={embedUrl}
            title={titulo || etiqueta}
            width="100%"
            height="100%"
            style={{ border: "none", display: "block" }}
            allowFullScreen
          />
        </div>

        {/* Acciones */}
        <div style={{ display: "flex", gap: 8, marginTop: 10 }}>
          <button
            onClick={() => setModoLectura(true)}
            style={{
              display: "inline-flex", alignItems: "center", gap: 7,
              padding: "9px 16px",
              background: COLORS.teal,
              color: COLORS.marfil,
              border: "none",
              borderRadius: 2,
              cursor: "pointer",
              fontFamily: "'Cinzel', serif",
              fontSize: 11, letterSpacing: "1px",
              fontWeight: 600,
            }}
          >
            <Maximize2 size={13} />
            Modo lectura
          </button>
          <a
            href={downloadUrl}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              display: "inline-flex", alignItems: "center", gap: 7,
              padding: "9px 16px",
              background: "white",
              color: COLORS.teal,
              border: `1px solid ${COLORS.pergamino}`,
              borderRadius: 2,
              textDecoration: "none",
              fontFamily: "'Cinzel', serif",
              fontSize: 11, letterSpacing: "1px",
              fontWeight: 600,
            }}
          >
            <Download size={13} style={{ color: COLORS.oro }} />
            Descargar
          </a>
          <a
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              display: "inline-flex", alignItems: "center", gap: 7,
              padding: "9px 16px",
              background: "white",
              color: COLORS.teal,
              border: `1px solid ${COLORS.pergamino}`,
              borderRadius: 2,
              textDecoration: "none",
              fontFamily: "'Cinzel', serif",
              fontSize: 11, letterSpacing: "1px",
              fontWeight: 600,
            }}
          >
            <ExternalLink size={13} style={{ color: COLORS.oro }} />
            Abrir
          </a>
        </div>
      </section>

      {/* Modal modo lectura */}
      {modoLectura && (
        <div
          onClick={() => setModoLectura(false)}
          style={{
            position: "fixed", inset: 0, zIndex: 1000,
            background: "rgba(26,58,74,0.92)",
            display: "flex", flexDirection: "column",
            alignItems: "center", justifyContent: "center",
            padding: 20,
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              width: "100%", maxWidth: 900,
              height: "90vh",
              display: "flex", flexDirection: "column",
              background: "white",
              borderRadius: 4,
              overflow: "hidden",
              border: `2px solid ${COLORS.oro}`,
            }}
          >
            {/* Modal header */}
            <div style={{
              display: "flex", alignItems: "center",
              justifyContent: "space-between",
              padding: "12px 20px",
              background: COLORS.teal,
              borderBottom: `1px solid ${COLORS.oro}`,
              flexShrink: 0,
            }}>
              <span style={{
                fontFamily: "'Cinzel', serif",
                fontSize: 12, color: COLORS.marfil,
                letterSpacing: "1px",
              }}>
                {titulo || etiqueta}
              </span>
              <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                <a
                  href={downloadUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    display: "inline-flex", alignItems: "center", gap: 6,
                    padding: "6px 12px",
                    background: "rgba(255,255,255,0.1)",
                    color: COLORS.pergamino,
                    border: `1px solid rgba(255,255,255,0.2)`,
                    borderRadius: 2,
                    textDecoration: "none",
                    fontFamily: "'Cinzel', serif",
                    fontSize: 10, letterSpacing: "1px",
                  }}
                >
                  <Download size={11} />
                  Descargar
                </a>
                <button
                  onClick={() => setModoLectura(false)}
                  style={{
                    background: "rgba(255,255,255,0.1)",
                    border: `1px solid rgba(255,255,255,0.2)`,
                    color: COLORS.pergamino,
                    borderRadius: 2,
                    padding: "6px 10px",
                    cursor: "pointer",
                    display: "flex", alignItems: "center",
                  }}
                >
                  <X size={15} />
                </button>
              </div>
            </div>

            {/* iframe fullsize */}
            <iframe
              src={embedUrl}
              title={titulo || etiqueta}
              width="100%"
              height="100%"
              style={{ border: "none", flex: 1, display: "block" }}
              allowFullScreen
            />
          </div>
        </div>
      )}
    </>
  );
}

export default function TemaPage({ estudiante }) {
  const { temaId } = useParams();
  const navigate = useNavigate();

  const [tema, setTema] = useState(null);
  const [pasos, setPasos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [completados, setCompletados] = useState({});
  const [submisiones, setSubmisiones] = useState({});
  const [subSaving, setSubSaving] = useState(null);
  const [saving, setSaving] = useState(null);
  const [preguntasData, setPreguntasData] = useState({});
  const [quizAnswers, setQuizAnswers] = useState({});
  const [quizResults, setQuizResults] = useState({});

  const AUTO_APROBABLE_TIPOS = ['leer_texto', 'ver_video', 'unirse_grupo', 'bautizarse', 'otro'];

  useEffect(() => {
    if (!temaId || !estudiante?.id) return;
    async function load() {
      setLoading(true);
      const { data: temaData } = await supabase
        .from("temas")
        .select("*, cursos(titulo, id)")
        .eq("id", temaId)
        .single();
      setTema(temaData);

      if (temaData) {
        const { data: pasosData } = await getPasosPorTemas([temaData.id]);
        setPasos(pasosData || []);

        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
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

          const responderIds = (pasosData || []).filter(p => p.tipo === 'responder_preguntas').map(p => p.id);
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
      }
      setLoading(false);
    }
    load();
  }, [temaId, estudiante?.id]);

  async function togglePaso(pasoId) {
    if (completados[pasoId] || saving === pasoId) return;
    setSaving(pasoId);
    await marcarPasoCompletado(estudiante.id, pasoId);
    setCompletados((prev) => ({ ...prev, [pasoId]: true }));
    setSaving(null);
  }

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
    const preguntas = preguntasData[pasoId] || [];
    const answers = quizAnswers[pasoId] || {};

    const errores = [];
    for (const pq of preguntas) {
      const selected = answers[pq.id];
      const correcta = (pq.opciones_respuesta || []).find(o => o.es_correcta);
      if (!correcta || selected !== correcta.id) {
        errores.push(pq.id);
      }
    }

    if (errores.length > 0) {
      setQuizResults(prev => ({ ...prev, [pasoId]: { allCorrect: false, errores } }));
      return;
    }

    setQuizResults(prev => ({ ...prev, [pasoId]: { allCorrect: true, errores: [] } }));

    setSubSaving(pasoId);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { setSubSaving(null); return; }

    const existing = submisiones[pasoId];
    let submission = null;
    if (existing) {
      const { error: upErr } = await supabase
        .from("entregas_actividades")
        .update({ estado: 'aprobada', respuesta_texto: JSON.stringify(answers) })
        .eq("id", existing.id);
      if (!upErr) submission = { ...existing, estado: 'aprobada', respuesta_texto: JSON.stringify(answers) };
    }

    if (!submission) {
      const { data: ins, error: inErr } = await supabase
        .from("entregas_actividades")
        .insert([{ alumno_id: user.id, actividad_id: pasoId, respuesta_texto: JSON.stringify(answers), estado: 'aprobada' }])
        .select();
      if (!inErr) {
        submission = ins?.[0] || { id: crypto.randomUUID(), alumno_id: user.id, actividad_id: pasoId, respuesta_texto: JSON.stringify(answers), estado: 'aprobada', comentario_admin: null };
      } else {
        console.error("Error al guardar quiz:", inErr);
      }
    }

    if (submission) setSubmisiones(prev => ({ ...prev, [pasoId]: submission }));
    setSubSaving(null);
  }

  if (loading) {
    return (
      <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: COLORS.marfil }}>
        <p style={{ color: "#666666", fontStyle: "italic", fontSize: 15 }}>Cargando tema...</p>
      </div>
    );
  }

  if (!tema) {
    return (
      <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: COLORS.marfil }}>
        <p style={{ color: "#666666", fontStyle: "italic", fontSize: 15 }}>Tema no encontrado.</p>
      </div>
    );
  }

  return (
    <div style={{ minHeight: "100vh", background: COLORS.marfil, display: "flex", flexDirection: "column" }}>
      {/* Header */}
      <div style={{
        background: COLORS.teal,
        padding: "14px 28px",
        borderBottom: `2px solid ${COLORS.oro}`,
        flexShrink: 0,
      }}>
        <div style={{ maxWidth: 720, margin: "0 auto", display: "flex", alignItems: "flex-start", gap: 16 }}>
          <button
            onClick={() => navigate(-1)}
            style={{
              background: "rgba(255,255,255,0.08)",
              border: "none", cursor: "pointer",
              color: COLORS.pergamino, borderRadius: 2,
              padding: "8px 12px", display: "flex", alignItems: "center", gap: 6,
              fontSize: 11, fontFamily: "'Cinzel', serif", letterSpacing: "1px", marginTop: 2,
            }}
          >
            <ArrowLeft size={15} />
            Volver
          </button>
          <div>
            <div style={{
              fontSize: 10, color: COLORS.oro,
              fontFamily: "'Cinzel', serif", letterSpacing: "2px", textTransform: "uppercase",
            }}>
              {tema.cursos?.titulo || "Curso"}
            </div>
            <h2 style={{
              margin: "4px 0 0", fontFamily: "'Cinzel', serif",
              fontSize: 18, color: COLORS.marfil, fontWeight: 400, lineHeight: 1.4,
            }}>
              {tema.titulo}
            </h2>
          </div>
        </div>
      </div>

      {/* Content */}
      <div style={{ flex: 1, overflowY: "auto", padding: "28px 20px" }}>
        <div style={{ maxWidth: 720, margin: "0 auto" }}>

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
                  style={{ position: "absolute", top: 0, left: 0, width: "100%", height: "100%" }}
                />
              </div>
            </section>
          )}

          {/* PDF de Clase */}
          {tema.contenido && (
            <PDFBlock
              url={tema.contenido}
              titulo={null}
              etiqueta="PDF de Clase"
            />
          )}

          {/* Material Adicional */}
          {tema.pdf_url && (
            <PDFBlock
              url={tema.pdf_url}
              titulo={tema.titulo_descarga || null}
              etiqueta="Material Adicional"
            />
          )}

          {/* Pasos */}
          {pasos.length > 0 && (
            <section>
              <SectionTitle>Pasos y Actividades</SectionTitle>
              <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                {pasos.map((paso) => {
                  const submision = submisiones[paso.id];
                  const tipo = paso.tipo || "otro";

                  return (
                    <div key={paso.id} style={{
                      padding: "14px 18px", background: "white",
                      border: `1px solid ${submision?.estado === 'aprobada' ? '#276749' : COLORS.pergamino}`,
                      borderRadius: 4,
                      boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
                    }}>
                      <p style={{ margin: "0 0 6px", fontSize: 14, color: COLORS.teal, fontFamily: "'Cinzel', serif", fontWeight: 600 }}>
                        {paso.titulo}
                      </p>
                      {paso.descripcion && (
                        <p style={{ margin: "0 0 12px", fontSize: 13, color: "#666666", fontStyle: "italic", fontFamily: "'EB Garamond', Georgia, serif" }}>
                          {paso.descripcion}
                        </p>
                      )}

                      {(!submision || (AUTO_APROBABLE_TIPOS.includes(tipo) && submision.estado !== 'aprobada')) && (
                        <div style={{ marginTop: 10 }}>
                          {tipo === "leer_texto" && (
                            <button onClick={() => handleEnviar(paso.id, "Confirmado: He leído el texto")} disabled={subSaving === paso.id}
                              style={{ background: COLORS.oro, color: COLORS.teal, border: "none", padding: "8px 16px", borderRadius: 2, fontFamily: "'Cinzel', serif", fontSize: 11, fontWeight: 600, cursor: "pointer" }}>
                              {subSaving === paso.id ? "Confirmando..." : "Confirmar que leí"}
                            </button>
                          )}
                          {tipo === "ver_video" && (
                            <button onClick={() => handleEnviar(paso.id, "Confirmado: He visto el video")} disabled={subSaving === paso.id}
                              style={{ background: COLORS.oro, color: COLORS.teal, border: "none", padding: "8px 16px", borderRadius: 2, fontFamily: "'Cinzel', serif", fontSize: 11, fontWeight: 600, cursor: "pointer" }}>
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
                                    return (
                                      <div key={pq.id} style={{ marginBottom: 16 }}>
                                        <p style={{ fontSize: 13, color: COLORS.teal, fontFamily: "'Cinzel', serif", fontWeight: 600, marginBottom: 8 }}>
                                          {idx + 1}. {pq.texto}
                                        </p>
                                        {(pq.opciones_respuesta || []).map(op => (
                                          <label key={op.id} style={{
                                            display: "block", padding: "7px 10px", marginBottom: 4,
                                            background: error && selectedOp === op.id ? "rgba(163,45,45,0.06)" : "transparent",
                                            border: `1px solid ${error && (selectedOp === op.id || op.es_correcta) ? (op.es_correcta ? "#276749" : "#a32d2d") : COLORS.pergamino}`,
                                            borderRadius: 2, cursor: "pointer", fontSize: 13, color: COLORS.teal,
                                            fontFamily: "'EB Garamond', Georgia, serif",
                                          }}>
                                            <input type="radio" name={`quiz-${paso.id}-${pq.id}`} value={op.id}
                                              checked={selectedOp === op.id}
                                              onChange={() => handleSelectAnswer(paso.id, pq.id, op.id)}
                                              style={{ marginRight: 8 }} />
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
                                  <button type="submit" disabled={subSaving === paso.id}
                                    style={{ background: COLORS.oro, color: COLORS.teal, border: "none", padding: "8px 16px", borderRadius: 2, fontFamily: "'Cinzel', serif", fontSize: 11, fontWeight: 600, cursor: subSaving === paso.id ? "not-allowed" : "pointer", opacity: subSaving === paso.id ? 0.7 : 1 }}>
                                    {subSaving === paso.id ? "Enviando..." : "Enviar Respuestas"}
                                  </button>
                                </form>
                              ) : (
                                <p style={{ fontSize: 12, color: "#999", fontStyle: "italic" }}>No hay preguntas configuradas para esta actividad.</p>
                              )}
                            </div>
                          )}
                          {tipo === "unirse_grupo" && (
                            <button onClick={() => handleEnviar(paso.id, "Confirmado: Me he unido al grupo")} disabled={subSaving === paso.id}
                              style={{ background: COLORS.oro, color: COLORS.teal, border: "none", padding: "8px 16px", borderRadius: 2, fontFamily: "'Cinzel', serif", fontSize: 11, fontWeight: 600, cursor: "pointer" }}>
                              {subSaving === paso.id ? "Confirmando..." : "Confirmar que me uní"}
                            </button>
                          )}
                          {tipo === "bautizarse" && (
                            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                              <p style={{ margin: 0, fontSize: 13, color: "#666666", fontStyle: "italic", fontFamily: "'EB Garamond', Georgia, serif" }}>
                                Al confirmar, notificarás al pastor que has sido bautizado. Él verificará y aprobará esta actividad.
                              </p>
                              <button onClick={() => handleEnviar(paso.id, "Solicitud: Confirmar bautismo")} disabled={subSaving === paso.id}
                                style={{ background: COLORS.oro, color: COLORS.teal, border: "none", padding: "8px 16px", borderRadius: 2, fontFamily: "'Cinzel', serif", fontSize: 11, fontWeight: 600, cursor: "pointer", alignSelf: "flex-start" }}>
                                {subSaving === paso.id ? "Confirmando..." : "Confirmar mi bautismo"}
                              </button>
                            </div>
                          )}
                          {tipo === "otro" && (
                            <button onClick={() => handleEnviar(paso.id, "Confirmado: Actividad completada")} disabled={subSaving === paso.id}
                              style={{ background: COLORS.oro, color: COLORS.teal, border: "none", padding: "8px 16px", borderRadius: 2, fontFamily: "'Cinzel', serif", fontSize: 11, fontWeight: 600, cursor: "pointer" }}>
                              {subSaving === paso.id ? "Confirmando..." : "Confirmar completado"}
                            </button>
                          )}
                        </div>
                      )}

                      {submision && (
                        <div style={{ marginTop: 10, paddingTop: 10, borderTop: "1px dashed #e2e8f0" }}>
                          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
                            <span style={{
                              fontSize: 10, fontFamily: "'Cinzel', serif", letterSpacing: "0.5px", padding: "3px 8px", borderRadius: 2,
                              background: submision.estado === "aprobada" ? "rgba(39,103,73,0.12)" : submision.estado === "rechazada" ? "rgba(163,45,45,0.12)" : "rgba(201,162,74,0.12)",
                              color: submision.estado === "aprobada" ? "#276749" : submision.estado === "rechazada" ? "#a32d2d" : COLORS.oro,
                              fontWeight: 600, textTransform: "uppercase",
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
      </div>
    </div>
  );
}
