export default function validatePassword(password) {
  if (!password) return false;

  // Longueur minimum
  if (password.length < 12) return false;

  // Au moins une minuscule
  if (!/[a-z]/.test(password)) return false;

  // Au moins une majuscule
  if (!/[A-Z]/.test(password)) return false;

  // Au moins un chiffre
  if (!/[0-9]/.test(password)) return false;

  // Au moins un caractère spécial
  if (!/[@$!%*?&]/.test(password)) return false;

  return true;
}
