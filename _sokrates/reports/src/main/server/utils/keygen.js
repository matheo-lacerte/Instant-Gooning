import crypto from "crypto";

export function generateKeyCode() {
  const alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"; // sans O/I/0/1
  const bytes = crypto.randomBytes(25);
  let out = "";
  for (let i = 0; i < bytes.length; i++) {
    out += alphabet[bytes[i] % alphabet.length];
  }
  // 5 blocs de 5
  return `${out.slice(0,5)}-${out.slice(5,10)}-${out.slice(10,15)}-${out.slice(15,20)}-${out.slice(20,25)}`;
}
