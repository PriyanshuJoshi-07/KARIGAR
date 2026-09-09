export type Role = "BUYER" | "SELLER";

export function getLang() {
  return localStorage.getItem("karigar.lang") || "en";
}

export function setLang(code: string) {
  localStorage.setItem("karigar.lang", code);
}

export function getRole(): Role | null {
  const r = localStorage.getItem("karigar.role");
  return r === "BUYER" || r === "SELLER" ? r : null;
}

export function setRole(role: Role) {
  localStorage.setItem("karigar.role", role);
}

export function resetSession() {
  localStorage.removeItem("karigar.lang");
  localStorage.removeItem("karigar.role");
}
