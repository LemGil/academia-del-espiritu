import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  BookOpen, BarChart3, Award, ChevronRight,
  Zap, CheckCircle2, Lock, Sparkles,
} from "lucide-react";
import { supabase } from "../lib/supabaseClient";

const COLORS = {
  teal: "#1A3A4A",
  oro: "#C9A24A",
  marfil: "#F5F1E8",
  pergamino: "#D6D0C4",
};

const VERSICULOS = [
  "«Fíate de Jehová de todo tu corazón, y no te apoyes en tu propia prudencia.» — Proverbios 3:5",
  "«Todo lo puedo en Cristo que me fortalece.» — Filipenses 4:13",
  "«El Señor es mi pastor; nada me faltará.» — Salmo 23:1",
  "«No temas, porque yo estoy contigo.» — Isaías 41:10",
  "«Encomienda a Jehová tu camino, y él hará.» — Salmo 37:5",
  "«Buscad primeramente el reino de Dios y su justicia.» — Mateo 6:33",
  "«El principio de la sabiduría es el temor de Jehová.» — Proverbios 1:7",
  "«Ama al Señor tu Dios con todo tu corazón.» — Marcos 12:30",
];

function SectionLabel({ children }) {
  return (
    <div style={{
      fontSize: 10, color: COLORS.oro,
      fontFamily: "'Cinzel', serif",
      letterSpacing: "2px",
      textTransform: "uppercase",
      marginBottom: 14,
    }}>
      {children}
    </div>
  );
}

function QuickButton({ icon: Icon, label, onClick }) {
  return (
    <motion.div
      whileHover={{ y: -2, boxShadow: "0 3px 12px rgba(0,0,0,0.06)" }}
      whileTap={{ scale: 0.97 }}
      onClick={onClick}
      style={{
        flex: 1,
        background: "white",
        border: `1px solid ${COLORS.pergamino}`,
        borderRadius: 3,
        padding: "16px 14px",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: 8,
        cursor: "pointer",
        transition: "all 0.15s",
      }}
    >
      <div style={{
        width: 36, height: 36, borderRadius: "50%",
        background: `${COLORS.oro}18`,
        display: "flex", alignItems: "center", justifyContent: "center",
      }}>
        <Icon size={16} color={COLORS.oro} />
      </div>
      <span style={{
        fontFamily: "'Cinzel', serif",
        fontSize: 11,
        color: COLORS.teal,
        letterSpacing: "0.5px",
        textAlign: "center",
      }}>
        {label}
      </span>
    </motion.div>
  );
}

export default function Dashboard({ estudiante, onNavigate, onSelectCurso }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [versiculo] = useState(
    () => VERSICULOS[Math.floor(Math.random() * VERSICULOS.length)]
  );

  useEffect(() => {
    if (!estudiante?.id) { setLoading(false); return; }
    let mounted = true;
    async function load() {
      try {
        const eId = estudiante.id;

        const { data: nivelesData } = await supabase
          .from("niveles")
          .select("id, nombre, orden")
          .order("orden", { ascending: true });
        const niveles = nivelesData || [];

        const { data: ultimosPasos } = await supabase
          .from("progreso_pasos")
          .select("paso_id, completado_at")
          .eq("estudiante_id", eId)
          .order("completado_at", { ascending: false })
          .limit(1);
        const ultimoPaso = ultimosPasos?.[0] || null;

        let lastActive = null;
        if (ultimoPaso) {
          const { data: pasoData } = await supabase
            .from("pasos")
            .select("id, titulo, tipo, orden, tema_id")
            .eq("id", ultimoPaso.paso_id)
            .single();
          if (pasoData) {
            const { data: temaData } = await supabase
              .from("temas")
              .select("id, titulo, orden, curso_id")
              .eq("id", pasoData.tema_id)
              .single();
            if (temaData) {
              const { data: cursoData } = await supabase
                .from("cursos")
                .select("id, titulo, nivel_id")
                .eq("id", temaData.curso_id)
                .single();
              lastActive = {
                paso: pasoData,
                tema: temaData,
                curso: cursoData,
              };
            }
          }
        }

        const nivelIds = niveles.map((n) => n.id);

        const { data: cursosData } = nivelIds.length
          ? await supabase
              .from("cursos")
              .select("*, temas(id, pasos(id, obligatorio))")
              .in("nivel_id", nivelIds)
          : { data: [] };
        const cursos = cursosData || [];

        const { data: ppData } = await supabase
          .from("progreso_pasos")
          .select("paso_id")
          .eq("estudiante_id", eId);
        const ppSet = new Set((ppData || []).map((p) => p.paso_id));

        const { data: pnData } = await supabase
          .from("progreso_niveles")
          .select("nivel_id")
          .eq("estudiante_id", eId);
        const nivelesCompletadosSet = new Set((pnData || []).map((n) => n.nivel_id));

        let totalPasos = 0;
        let completados = 0;
        for (const c of cursos) {
          for (const t of c.temas || []) {
            for (const p of t.pasos || []) {
              if (p.obligatorio !== false) {
                totalPasos++;
                if (ppSet.has(p.id)) completados++;
              }
            }
          }
        }
        const pctGlobal = totalPasos > 0 ? Math.round((completados / totalPasos) * 100) : 0;

        const { data: pcData } = await supabase
          .from("progreso_cursos")
          .select("curso_id")
          .eq("estudiante_id", eId);
        const cursosCompletadosCount = (pcData || []).length;

        if (!mounted) return;
        setData({
          pctGlobal, completados, totalPasos,
          nivelesCompletados: nivelesCompletadosSet.size,
          cursosCompletados: cursosCompletadosCount,
          lastActive,
        });
      } catch (err) {
        console.error("Dashboard error", err);
      }
      setLoading(false);
    }
    load();
    return () => { mounted = false; };
  }, [estudiante]);

  if (loading) {
    return (
      <div style={{
        flex: 1, padding: 32, overflowY: "auto",
        display: "flex", alignItems: "center", justifyContent: "center",
      }}>
        <p style={{ color: "#666666", fontStyle: "italic", fontSize: 15 }}>Cargando...</p>
      </div>
    );
  }

  return (
    <div style={{ flex: 1, padding: 32, overflowY: "auto" }}>

      {/* ── 1. ENCABEZADO + VERSÍCULO ── */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        style={{ marginBottom: 28 }}
      >
        <h1 style={{
          fontFamily: "'Cinzel', serif", fontSize: 22, color: COLORS.teal,
          fontWeight: 400, letterSpacing: "1px", margin: "0 0 4px",
        }}>
          Bienvenido, {estudiante?.nombre || "Estudiante"}
        </h1>
        <p style={{
          fontSize: 14, color: "#666666", fontStyle: "italic", margin: 0,
        }}>
          {estudiante?.niveles?.nombre
            ? `Nivel actual: ${estudiante.niveles.nombre}`
            : "Continúa tu camino de formación espiritual"}
        </p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.05 }}
        style={{
          background: "white",
          border: `1px solid ${COLORS.pergamino}`,
          borderLeft: `3px solid ${COLORS.oro}`,
          borderRadius: "0 3px 3px 0",
          padding: "16px 20px",
          marginBottom: 24,
          fontFamily: "'EB Garamond', Georgia, serif",
          fontSize: 15,
          fontStyle: "italic",
          color: "#666666",
          lineHeight: 1.5,
        }}
      >
        {versiculo}
      </motion.div>

      {/* ── 2. RESUMEN GENERAL ── */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        style={{
          background: "white",
          border: `1px solid ${COLORS.pergamino}`,
          borderRadius: 3,
          padding: "20px 24px",
          marginBottom: 24,
        }}
      >
        <SectionLabel>Resumen general</SectionLabel>
        <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 14 }}>
          <div style={{
            width: 48, height: 48, borderRadius: "50%",
            background: COLORS.oro,
            display: "flex", alignItems: "center", justifyContent: "center",
            flexShrink: 0,
          }}>
            <Award size={22} color={COLORS.teal} />
          </div>
          <div style={{ flex: 1 }}>
            <span style={{
              fontFamily: "'Cinzel', serif",
              fontSize: 16, color: COLORS.teal,
              letterSpacing: "0.5px",
            }}>
              {estudiante?.niveles?.nombre || "Sin nivel"}
            </span>
            <p style={{ margin: "2px 0 0", fontSize: 12, color: "#666666", fontStyle: "italic" }}>
              {data?.cursosCompletados || 0} cursos &middot; {data?.nivelesCompletados || 0} niveles completados
            </p>
          </div>
          <div style={{ textAlign: "right" }}>
            <span style={{
              fontFamily: "'Cinzel', serif",
              fontSize: 22, color: COLORS.teal,
              fontWeight: 600,
            }}>
              {data?.pctGlobal || 0}%
            </span>
            <p style={{ margin: 0, fontSize: 10, color: "#666666", fontStyle: "italic" }}>
              global
            </p>
          </div>
        </div>
        <div style={{
          height: 5,
          background: COLORS.pergamino,
          borderRadius: 3,
          overflow: "hidden",
        }}>
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${data?.pctGlobal || 0}%` }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            style={{
              height: "100%",
              background: `linear-gradient(90deg, ${COLORS.oro}, #d4a843)`,
              borderRadius: 3,
            }}
          />
        </div>
      </motion.div>

      {/* ── 3. ACCESO RÁPIDO ── */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15 }}
        style={{
          display: "flex",
          gap: 12,
          marginBottom: 24,
        }}
      >
        <QuickButton icon={BookOpen} label="Mis Cursos" onClick={() => onNavigate?.("cursos")} />
        <QuickButton icon={BarChart3} label="Mi Progreso" onClick={() => onNavigate?.("progreso")} />
        <QuickButton icon={Award} label="Certificados" onClick={() => onNavigate?.("certificados")} />
      </motion.div>

      {/* ── 4. CONTINUAR DONDE LO DEJÉ ── */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        {data?.lastActive ? (
          <div
            onClick={() => onSelectCurso?.(data.lastActive.curso)}
            style={{
              background: "white",
              border: `1px solid ${COLORS.pergamino}`,
              borderRadius: 3,
              padding: "18px 20px",
              marginBottom: 24,
              cursor: "pointer",
            }}
          >
            <SectionLabel>Continuar donde lo dejé</SectionLabel>
            <div style={{
              display: "flex", justifyContent: "space-between",
              alignItems: "flex-start", gap: 16,
            }}>
              <div style={{ flex: 1, minWidth: 0 }}>
                <span style={{
                  display: "block",
                  fontSize: 11, color: COLORS.oro,
                  fontFamily: "'Cinzel', serif", letterSpacing: "0.5px",
                  marginBottom: 2,
                }}>
                  {data.lastActive.curso?.titulo}
                </span>
                <span style={{
                  display: "block",
                  fontSize: 16, color: COLORS.teal,
                  fontFamily: "'Cinzel', serif", fontWeight: 400,
                  letterSpacing: "0.3px", marginBottom: 4,
                }}>
                  {data.lastActive.tema?.titulo}
                </span>
                <span style={{
                  fontSize: 12, color: "#666666", fontStyle: "italic",
                }}>
                  {data.lastActive.paso?.titulo}
                </span>
              </div>
              <div style={{
                background: COLORS.oro,
                color: COLORS.teal,
                padding: "6px 14px",
                borderRadius: 2,
                fontFamily: "'Cinzel', serif",
                fontSize: 11,
                letterSpacing: "1px",
                fontWeight: 600,
                display: "flex",
                alignItems: "center",
                gap: 6,
                flexShrink: 0,
              }}>
                Continuar <ChevronRight size={14} />
              </div>
            </div>
          </div>
        ) : (
          <div style={{
            background: "white",
            border: `1px solid ${COLORS.pergamino}`,
            borderRadius: 3,
            padding: "18px 20px",
            marginBottom: 24,
          }}>
            <SectionLabel>Continuar donde lo dejé</SectionLabel>
            <p style={{
              margin: 0, fontSize: 14, color: "#666666",
              fontStyle: "italic",
            }}>
              Aún no has comenzado. Explora tus cursos para dar el primer paso.
            </p>
          </div>
        )}
      </motion.div>

      {/* ── 5. NOTIFICACIONES ── */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.25 }}
        style={{
          background: "white",
          border: `1px solid ${COLORS.pergamino}`,
          borderRadius: 3,
          padding: "18px 20px",
        }}
      >
        <SectionLabel>Notificaciones</SectionLabel>
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {data?.nivelesCompletados > 0 ? (
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <Sparkles size={14} color={COLORS.oro} />
              <span style={{ fontSize: 13, color: COLORS.teal }}>
                {data.nivelesCompletados === 1
                  ? "Has completado 1 nivel. ¡Sigue así!"
                  : `Has completado ${data.nivelesCompletados} niveles. ¡Sigue avanzando!`}
              </span>
            </div>
          ) : null}
          {data?.totalPasos > 0 ? (
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <Zap size={14} color={COLORS.oro} />
              <span style={{ fontSize: 13, color: COLORS.teal }}>
                {data.completados} de {data.totalPasos} pasos completados
              </span>
            </div>
          ) : (
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <BookOpen size={14} color={COLORS.oro} />
              <span style={{ fontSize: 13, color: "#666666", fontStyle: "italic" }}>
                No hay actividad registrada aún
              </span>
            </div>
          )}
        </div>
      </motion.div>

    </div>
  );
}
