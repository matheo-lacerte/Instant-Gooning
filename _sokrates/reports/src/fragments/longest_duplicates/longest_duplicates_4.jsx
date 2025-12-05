src/pages/Dev/DevGameDetail/devGameDetail.jsx [25:50]:
- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
function BackLinkHome() {
  return (
    <Link className="back-link" to="/" aria-label="Retour à l'accueil">
      <span className="icon" aria-hidden>
        <svg viewBox="0 0 24 24" width="12" height="12">
          <path
            d="M15 18l-6-6 6-6"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </span>
      <span>Retour</span>
    </Link>
  );
}

export default function GameDetail() {
  const navigate = useNavigate();
  const { id } = useParams();
  const [game, setGame] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -



src/pages/GameDetail/GameDetail.jsx [5:30]:
- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
function BackLinkHome() {
  return (
    <Link className="back-link" to="/" aria-label="Retour à l'accueil">
      <span className="icon" aria-hidden>
        <svg viewBox="0 0 24 24" width="12" height="12">
          <path
            d="M15 18l-6-6 6-6"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </span>
      <span>Retour</span>
    </Link>
  );
}

export default function GameDetail() {
  const navigate = useNavigate();
  const { id } = useParams();
  const [game, setGame] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -



