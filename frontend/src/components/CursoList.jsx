import { motion, AnimatePresence } from "framer-motion";
import { Trash2, Edit3, BookOpen } from "lucide-react";

const COLORS = {
  teal: "#1A3A4A",
  oro: "#C9A24A",
  marfil: "#F5F1E8",
  pergamino: "#D6D0C4",
};

export default function CursoList({ cursos, onEdit, onDelete, onSelect }) {
  if (!cursos.length) {
    return (
      <div style={{ textAlign: "center", padding: "48px 0", color: "#999" }}>
        <BookOpen size={32} style={{ marginBottom: 12, opacity: 0.3, color: COLORS.teal }} />
        <p style={{ fontStyle: "italic", fontSize: 14 }}>
          Este nivel aún no tiene cursos.
        </p>
      </div>
    );
  }

  return (
    <div style={{
      display: "grid", gap: 16,
      gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))",
    }}>
      <AnimatePresence mode="popLayout">
        {cursos.map((curso) => (
          <motion.div
            key={curso.id}
            layout
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.97 }}
            transition={{ duration: 0.18 }}
            onClick={() => onSelect && onSelect(curso)}
            style={{
              background: "white",
              border: `1px solid ${COLORS.pergamino}`,
              borderRadius: 4,
              overflow: "hidden",
              cursor: "pointer",
            }}
          >
            {/* Imagen o placeholder */}
            {curso.imagen_url ? (
              <img
                src={curso.imagen_url}
                alt={curso.titulo}
                style={{ width: "100%", height: 130, objectFit: "cover" }}
              />
            ) : (
              <div style={{
                width: "100%", height: 130,
                background: COLORS.teal,
                display: "flex", alignItems: "center", justifyContent: "center",
              }}>
                <BookOpen size={28} style={{ color: COLORS.oro, opacity: 0.6 }} />
              </div>
            )}

            {/* Cuerpo */}
            <div style={{ padding: 16 }}>
              <div style={{
                fontSize: 10, color: COLORS.oro,
                fontFamily: "'Cinzel', serif",
                letterSpacing: "2px", textTransform: "uppercase",
                marginBottom: 4,
              }}>
                Curso {String(curso.orden).padStart(2, "0")}
              </div>
              <h3 style={{
                margin: "0 0 6px",
                fontFamily: "'Cinzel', serif",
                fontSize: 14, color: COLORS.teal,
                fontWeight: 400, letterSpacing: "0.5px",
              }}>
                {curso.titulo}
              </h3>
              <p style={{
                margin: "0 0 14px", fontSize: 13,
                color: "#888", lineHeight: 1.5,
                fontStyle: "italic",
                fontFamily: "'EB Garamond', Georgia, serif",
              }}>
                {curso.descripcion || "Sin descripción."}
              </p>

              {/* Acciones */}
              <div style={{ display: "flex", gap: 8 }}>
                <button
                  onClick={(e) => { e.stopPropagation(); onEdit(curso); }}
                  style={{
                    flex: 1, display: "flex", alignItems: "center",
                    justifyContent: "center", gap: 6,
                    background: COLORS.marfil,
                    border: `1px solid ${COLORS.pergamino}`,
                    padding: "7px 0", borderRadius: 2, cursor: "pointer",
                    fontSize: 12, color: COLORS.teal,
                    fontFamily: "'Cinzel', serif", letterSpacing: "0.5px",
                  }}
                >
                  <Edit3 size={13} /> Editar
                </button>
                <button
                  onClick={(e) => { e.stopPropagation(); onDelete(curso.id); }}
                  style={{
                    flex: 1, display: "flex", alignItems: "center",
                    justifyContent: "center", gap: 6,
                    background: "#fff5f5",
                    border: "1px solid #f0c0c0",
                    padding: "7px 0", borderRadius: 2, cursor: "pointer",
                    fontSize: 12, color: "#a32d2d",
                    fontFamily: "'Cinzel', serif", letterSpacing: "0.5px",
                  }}
                >
                  <Trash2 size={13} /> Eliminar
                </button>
              </div>
            </div>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
