/** Convierte timestamp ISO o fecha de BD al formato yyyy-MM-dd para <input type="date"> */
export function toDateInputValue(value) {
  if (!value) return "";
  return String(value).slice(0, 10);
}
