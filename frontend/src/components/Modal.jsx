import { useEffect } from "react";

export default function Modal({ children, open, onClose, title, footer }) {
  useEffect(() => {
    if (!open) return;
    function handleEsc(e) {
      if (e.key === "Escape") onClose();
    }
    document.addEventListener("keydown", handleEsc);
    return () => document.removeEventListener("keydown", handleEsc);
  }, [onClose, open]);

  if (!open) return null;

  return (
    <div
      onClick={onClose}
      style={{
        position: "fixed", inset: 0, background: "rgba(0,0,0,0.55)",
        display: "flex", justifyContent: "center", alignItems: "center",
        zIndex: 1000, animation: "fadeIn 0.2s ease", padding: 20,
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          background: "#F5F1E8", borderRadius: 4, padding: 28,
          width: "100%", maxWidth: 500,
          border: "1px solid #D6D0C4",
          borderTop: "3px solid #C9A24A",
          animation: "scaleIn 0.2s ease", position: "relative",
          maxHeight: "90vh",
          display: "flex",
          flexDirection: "column",
        }}
      >
        {/* Botón cerrar */}
        <button
          onClick={onClose}
          style={{
            position: "absolute", top: 12, right: 14,
            border: "none", background: "transparent",
            fontSize: 18, cursor: "pointer", color: "#888",
          }}
        >
          ✕
        </button>

        {/* Título opcional */}
        {title && (
          <h3 style={{
            margin: "0 0 20px", fontFamily: "'Cinzel', serif",
            fontSize: 16, color: "#1A3A4A", letterSpacing: "1px", fontWeight: 400,
            flexShrink: 0,
          }}>
            {title}
          </h3>
        )}

        <div style={{ flex: 1, overflowY: "auto", paddingRight: 4 }}>
          {children}
        </div>
        {footer && (
          <div style={{ marginTop: 20, paddingTop: 15, borderTop: "1px solid #D6D0C4", flexShrink: 0 }}>
            {footer}
          </div>
        )}
      </div>

      <style>{`
        @keyframes fadeIn { from { opacity:0 } to { opacity:1 } }
        @keyframes scaleIn { from { transform:scale(0.95); opacity:0 } to { transform:scale(1); opacity:1 } }
      `}</style>
    </div>
  );
}
