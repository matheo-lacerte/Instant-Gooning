import { Link, useNavigate, useLocation } from "react-router-dom";
import { useEffect, useRef, useState } from "react";
import "./Dev.css";

export default function Dev() {
  const navigate = useNavigate();
  const token = localStorage.getItem("token");
  const user = JSON.parse(localStorage.getItem("user"));

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [requests, setRequests] = useState([]);
  const [isPendingRequest, setIsPendingRequest] = useState(false);
  const lastCheckRef = useRef(0);

  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const isFormRequest = queryParams.has("formRequest");
  const isViewRequest = queryParams.has("viewRequest");

  useEffect(() => {
    const fetchData = async () => {
      try {
        // throttle isPendingRequest checks: at most once every 10s
        const now = Date.now();
        if (now - lastCheckRef.current < 10000) return;
        lastCheckRef.current = now;
        if (user.role !== "dev") {
          const checkResponse = await fetch(
            "http://localhost:5174/api/admin/isPendingRequest",
            {
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
              },
            }
          );

          const checkData = await checkResponse.json();

          if (checkResponse.ok) {
            setIsPendingRequest(checkData.hasPendingRequest);
            setErrorMsg(checkData.message);
          } else {
            setErrorMsg(checkResponse.error);
          }
        }

        if (isViewRequest) {
          const response = await fetch(
            "http://localhost:5174/api/user/getAllRequests",
            {
              headers: { Authorization: `Bearer ${token}` },
            }
          );

          const data = await response.json();
          if (response.ok) {
            setRequests(data);
          } else {
            setErrorMsg(data.error);
          }
        }
      } catch (error) {
        setErrorMsg(error);
      }
    };

    fetchData();
  }, [isFormRequest, isViewRequest, token]);

  const formSubmitDev = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch(
        "/api/admin/request-dev",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ title, description, checkExisting: false }),
        }
      );
      const data = await response.json();
      if (!response.ok) {
        alert(data.error);
        return;
      }
      alert("Demande envoyée avec succès !");
      navigate("/dev");
    } catch (error) {
      alert(error);
    }
  };

  return (
    <div className="dev">
      <div className="rangee">
        <div className="colonnes">
          <ul>
            <li>
              <h1>
                <Link to="/profile">Profil</Link>
              </h1>
            </li>
            <li>
              <h1>
                <Link to="/dev">Développeur</Link>
              </h1>
            </li>
            <li>
              <h1><Link to="/cart">Panier</Link></h1>
            </li>
          </ul>
        </div>

        <div className="colonnes">
          {isFormRequest && (
            <div className="margin-colonne">
              {errorMsg ? (
                <div className="error">
                  <h1>{errorMsg}</h1>
                </div>
              ) : (
                <>
                  <h1 className="top">
                    Formulaire de demande pour être développeur
                  </h1>
                  <form onSubmit={formSubmitDev} className="form-dev">
                    <div className="control no-margin space">
                      <label htmlFor="titre">Titre</label>
                      <input
                        id="titre"
                        type="text"
                        name="titre"
                        placeholder="Entrez le titre de la demande"
                        required
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                      />
                    </div>

                    <div className="control no-margin space">
                      <label htmlFor="contenu">Contenu</label>
                      <textarea
                        id="contenu"
                        name="contenu"
                        placeholder="Entrez le contenu de votre demande"
                        required
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        rows={7}
                      />
                    </div>
                    <div className="btn-envoyer">
                      <button type="submit" className="button_dev">
                        Envoyer la demande
                      </button>
                    </div>
                  </form>
                </>
              )}
            </div>
          )}

          {isViewRequest && (
            <div className="margin-colonne">
              <h1 className="space request">
                Vos demandes pour devenir développeur
              </h1>

              {requests.length > 0 ? (
                <div className="cards-container">
                  {requests.map((req) => (
                    <div key={req.id} className="request-card">
                      <h1 className="request-title">{req.title}</h1>
                      <h2 className="request-state">
                        État : <strong>{req.requestState}</strong>
                      </h2>
                      <p className="request-desc">{req.description}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <p>Aucune demande trouvée.</p>
              )}
            </div>
          )}

          {!isFormRequest &&
            !isViewRequest &&
            (user.role !== "dev" ? (
              <div className="link-dev">
                {!isPendingRequest ? (
                  <>
                    <h1 className="centre">
                      Bienvenue sur la page développeur.
                    </h1>
                    <h2 className="space">
                      <Link to="/dev?formRequest">
                        Faire une demande pour devenir développeur
                      </Link>
                    </h2>
                  </>
                ) : (
                  <h2 className="space">
                    Veuillez patienter jusqu’à l’acceptation de votre demande.
                  </h2>
                )}
                <h2>
                  <Link to="/dev?viewRequest">
                    Consulter mes demandes envoyées
                  </Link>
                </h2>
              </div>
            ) : (
              <div className="link-dev">
                <h2 className="space">
                  <Link to="/dev/create">Ajouter un jeu</Link>
                </h2>
                <h2 className="space">Modifier un de mes jeux</h2>
                <h2 className="space">Supprimer un de mes jeux</h2>
                <h2>
                  <Link to="/dev?viewRequest">
                    Consulter mes demandes envoyées
                  </Link>
                </h2>
              </div>
            ))}
        </div>
      </div>

      <Link to="/logout" className="button_dev">
        Déconnexion
      </Link>
    </div>
  );
}
