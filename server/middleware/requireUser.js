export default function requireUser(req, res, next) {
  if (!req.user || !req.user.id) {
    return res.status(401).json({ error: "Non autorisé" });
  }
  next();
}
