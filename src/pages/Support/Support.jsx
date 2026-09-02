import React, { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import "./support.css";

const DEFAULT_FAQ = [
  {
    q: "Comment utiliser un code de jeu ?",
    a: "Les clés s'affichent sur la page de confirmation d'achat. Tu peux aussi retrouver tes clés dans ton profil > Achats.",
  },
  {
    q: "J'ai un problème de paiement.",
    a: "Vérifie tes informations de facturation et ta carte. Si le problème persiste, contacte ta banque ou utilise un autre moyen de paiement.",
  },
  {
    q: "Mon jeu n'apparaît pas.",
    a: "Assure-toi que le jeu est bien actif et que tu as rafraîchi la page. Si le problème persiste, envoie-nous les détails via le formulaire de contact.",
  },
  {
    q: "Puis-je obtenir un remboursement ?",
    a: "Les remboursements sont traités au cas par cas. Contacte le support avec ton identifiant de commande et motif, et nous examinerons la demande.",
  },
  {
    q: "Comment obtenir une clé cadeau ?",
    a: "Les clés cadeaux ne sont pas encore supportées directement. En attendant, contacte l'éditeur ou utilise un code promo si disponible.",
  },
];

export default function Support() {
  const [query, setQuery] = useState("");
  const [openIndex, setOpenIndex] = useState(null);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [status, setStatus] = useState("idle"); 

  const faq = useMemo(() => {
    const q = (query || "").trim().toLowerCase();
    if (!q) return DEFAULT_FAQ;
    return DEFAULT_FAQ.filter((f) => (f.q + " " + f.a).toLowerCase().includes(q));
  }, [query]);

  function toggle(i) {
    setOpenIndex(openIndex === i ? null : i);
  }

  function simulateSend(e) {
    e.preventDefault();
    if (!name.trim() || !message.trim() || !email.trim()) {
      setStatus("error");
      return;
    }
    setStatus("sending");
    
    setTimeout(() => {
      setStatus("sent");
      
      try {
        const history = JSON.parse(localStorage.getItem("ig_support_messages") || "[]");
        history.unshift({ name, email, subject, message, at: new Date().toISOString() });
        localStorage.setItem("ig_support_messages", JSON.stringify(history.slice(0, 20)));
      } catch {}

      setName("");
      setEmail("");
      setSubject("");
      setMessage("");
    }, 900);
  }

  return (
    <div className="support-page wrap">
      <header className="support-hero">
        <div>
          <h1>Support</h1>
          <p>
            Bienvenue sur la page de support de Game Commerce Platform
            <a href="mailto:support@example.com"> support@example.com</a>.
          </p>
        </div>
        <div className="support-quick">
          <Link to="#" onClick={(e) => e.preventDefault()} className="btn-primary">Rejoindre le Discord</Link>
        </div>
      </header>

      <section className="support-sections">
        <main className="support-main">
          <div className="support-search">
            <input aria-label="Rechercher la FAQ" placeholder="Rechercher la FAQ..." value={query} onChange={(e) => setQuery(e.target.value)} />
          </div>

          <h2>FAQ rapide</h2>

          <div className="faq-list">
            {faq.length === 0 && <div className="faq-empty">Aucun résultat trouvé pour "{query}"</div>}
            {faq.map((f, i) => (
              <div key={i} className={`faq-item ${openIndex === i ? 'open' : ''}`}>
                <button className="faq-question" onClick={() => toggle(i)} aria-expanded={openIndex === i}>
                  <span>{f.q}</span>
                  <span className="chev">{openIndex === i ? '−' : '+'}</span>
                </button>
                <div className="faq-answer" style={{ display: openIndex === i ? 'block' : 'none' }}>
                  <p>{f.a}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="support-footer">
            <small>Tu n'as pas trouvé ? Utilise le formulaire à droite pour nous envoyer un message.</small>
          </div>
        </main>

        <aside className="support-contact">
          <h2>Contact</h2>
          {status === 'sent' ? (
            <div className="success-message">
              <strong>Message envoyé — merci !</strong>
              <p>Nous avons bien reçu ta demande. Consulte ton historique local si nécessaire.</p>
            </div>
          ) : (
            <form onSubmit={simulateSend} className="contact-form" aria-label="Formulaire de contact (simulé)">
              <label>
                Nom
                <input value={name} onChange={(e) => setName(e.target.value)} />
              </label>
              <label>
                E-mail
                <input value={email} onChange={(e) => setEmail(e.target.value)} />
              </label>
              <label>
                Sujet
                <input value={subject} onChange={(e) => setSubject(e.target.value)} />
              </label>
              <label>
                Message
                <textarea value={message} onChange={(e) => setMessage(e.target.value)} rows={6} />
              </label>
              {status === 'error' && <div className="form-error">Veuillez remplir les champs Nom, E-mail et Message.</div>}
              <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
                <button type="submit" className="btn-primary">Envoyer</button>
                <button type="button" className="btn-ghost" onClick={() => { setName(''); setEmail(''); setSubject(''); setMessage(''); setStatus('idle'); }}>Effacer</button>
              </div>
            </form>
          )}

          <div style={{ marginTop: 12 }}>
            <strong>Autres ressources</strong>
            <ul style={{ marginTop: 8 }}>
              <li><Link to="#" onClick={(e) => e.preventDefault()}>Centre de remboursements</Link></li>
              <li><Link to="#" onClick={(e) => e.preventDefault()}>Politique de confidentialité</Link></li>
            </ul>
          </div>
        </aside>
      </section>

      <div style={{ marginTop: 24 }}>
        <Link to="/">← Retour à l'accueil</Link>
      </div>
    </div>
  );
}
