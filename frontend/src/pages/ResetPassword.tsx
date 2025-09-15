import React, { useState, useEffect } from "react";
import axios, { AxiosError } from "axios";
import { useSearchParams } from "react-router-dom";

// Configuration Axios
// Utilise axios.defaults.baseURL si tu veux une config globale,
// sinon garde cette constante si tu préfères une URL spécifique à ce composant.
const API_BASE_URL = "http://127.0.0.1:8080"; 

// Interface pour la réponse d'erreur de l'API
interface ApiErrorResponse {
  message?: string;
  errors?: Record<string, string[]>;
}

const ResetPassword: React.FC = () => {
  const [searchParams] = useSearchParams();
  const [email, setEmail] = useState("");
  const [token, setToken] = useState("");
  const [password, setPassword] = useState("");
  const [passwordConfirmation, setPasswordConfirmation] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);
  const [serverError, setServerError] = useState(false);

  useEffect(() => {
    const emailParam = searchParams.get("email");
    const tokenParam = searchParams.get("token");

    if (emailParam) setEmail(emailParam);
    if (tokenParam) setToken(tokenParam);
  }, [searchParams]);

  // Fonction pour récupérer le cookie CSRF
  const getCsrfToken = async (): Promise<void> => {
    try {
      await axios.get(`${API_BASE_URL}/sanctum/csrf-cookie`, {
        withCredentials: true,
      });
      console.log("CSRF token obtenu avec succès");
    } catch (error) {
      console.error("Échec de l'obtention du token CSRF:", error);
      throw error;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setServerError(false);
    setLoading(true);

    try {
      // Étape 1: Récupérer le cookie CSRF
      await getCsrfToken();

      // Étape 2: Envoyer la requête de réinitialisation de mot de passe
      const response = await axios.post(
        `${API_BASE_URL}/api/reset-password`,
        {
          email,
          token,
          password,
          password_confirmation: passwordConfirmation,
        },
        {
          withCredentials: true,
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
            "X-Requested-With": "XMLHttpRequest",
          },
        }
      );

      console.log("Réponse du serveur:", response.data);
      setSuccess("Mot de passe réinitialisé avec succès ! Vous allez être redirigé vers la page de connexion.");

      setTimeout(() => {
        window.location.href = "/login";
      }, 3000);
    } catch (err: unknown) {
      if (axios.isAxiosError(err)) {
        const axiosError = err as AxiosError<ApiErrorResponse>;
        if (axiosError.code === "ERR_NETWORK") {
          setError("Impossible de se connecter au serveur. Vérifiez qu'il est démarré.");
          setServerError(true);
        } else if (axiosError.response?.status === 422) {
          const errorData = axiosError.response.data;
          if (errorData?.errors?.password) {
            setError(errorData.errors.password[0]);
          } else if (errorData?.message) {
            setError(errorData.message);
          } else {
            setError("Les informations fournies sont invalides.");
          }
        } else if (axiosError.response?.data?.message) {
          setError(axiosError.response.data.message);
        } else {
          setError("Une erreur est survenue lors de la réinitialisation.");
        }
      } else {
        setError("Une erreur inconnue s'est produite.");
      }
    } finally {
      setLoading(false);
    }
  };

  const retryConnection = () => {
    setServerError(false);
    setError("");
  };

  return (
    <div style={styles.pageContainer}>
      {/* Logo + Titre */}
      <div style={{ display: "flex", alignItems: "center", gap: "15px", marginBottom: "16px" }}>
        <svg width="32" height="32" viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg">
          <path d="M2.66602 2.66624H29.3286V29.3288L2.66602 2.66624Z" fill="white" />
          <path d="M2.66602 2.66624H22.663L15.9973 15.9975L2.66602 2.66624Z" fill="black" fillOpacity="0.15" />
          <path d="M2.66602 2.66624H15.9973L2.66602 29.3288V2.66624Z" fill="white" />
        </svg>
        <h2 style={{ color: "white", fontSize: "22px", fontWeight: 600 }}>RED PRODUCT</h2>
      </div>
      <br />

      <div style={styles.registerCard}>
        <h2 style={styles.title}>Réinitialisation</h2>
        <p>Entrez votre nouveau mot de passe ci-dessous.</p>
        <br />

        {serverError && (
          <div style={styles.serverError}>
            <span style={{ color: "#ef4444", fontSize: "20px", marginRight: "12px" }}>⚠️</span>
            <div>
              <div style={styles.serverErrorTitle}>Erreur de connexion au serveur</div>
              <div style={styles.serverErrorDetails}>
                {error}
                <button onClick={retryConnection} style={styles.retryButton}>
                  Réessayer la connexion
                </button>
              </div>
            </div>
          </div>
        )}

        {error && !serverError && <div style={styles.errorText}><span style={{ marginRight: "5px" }}>❌</span>{error}</div>}
        {success && <div style={styles.successText}><span style={{ marginRight: "5px" }}>✅</span>{success}</div>}

        <form onSubmit={handleSubmit}>
          <div style={styles.formGroup}>
            <label style={styles.label} htmlFor="email">Email</label>
            <input
              style={styles.input}
              type="email"
              id="email"
              value={email}
              readOnly
              disabled={loading}
            />
          </div>

          <div style={styles.formGroup}>
            <label style={styles.label} htmlFor="password">Nouveau mot de passe</label>
            <input
              style={styles.input}
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              disabled={loading}
            />
          </div>
          <div style={styles.formGroup}>
            <label style={styles.label} htmlFor="password_confirmation">Confirmer le mot de passe</label>
            <input
              style={styles.input}
              type="password"
              id="password_confirmation"
              value={passwordConfirmation}
              onChange={(e) => setPasswordConfirmation(e.target.value)}
              required
              disabled={loading}
            />
          </div>

          <button
            type="submit"
            style={{
              ...styles.resetButton, // Utilise le nouveau style pour le bouton
              opacity: loading ? 0.7 : 1,
              cursor: loading ? "not-allowed" : "pointer",
            }}
            disabled={loading}
          >
            {loading ? "⏳ Réinitialisation en cours..." : "Réinitialiser"}
          </button>
        </form>
      </div>

      <p style={{ ...styles.linkText, color: "white" }}>
        Revenir à la <a href="/login" style={styles.link}>Connexion</a>
      </p>
    </div>
  );
};

const styles: { [key: string]: React.CSSProperties } = {
  pageContainer: {
    minHeight: "100vh",
    backgroundColor: "#1f2022",
    backgroundImage: "url('/befor.svg')",
    backgroundRepeat: "repeat",
    backgroundSize: "cover",
    backgroundBlendMode: "overlay",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    padding: "20px",
    fontFamily: "Arial, sans-serif",
  },
  registerCard: {
    backgroundColor: "#ffffff",
    padding: "30px", // Diminuer le padding pour réduire la taille
    borderRadius: "6px", // Arrondir un peu plus les bords
    boxShadow: "0 4px 8px rgba(0, 0, 0, 0.1)",
    width: "100%",
    maxWidth: "400px", // Diminuer la largeur maximale
  },
  title: {
    color: "#333333",
    marginBottom: "15px", // Ajuster la marge
    textAlign: "center",
    fontSize: "22px", // Diminuer la taille du titre
    fontWeight: 700,
  },
  formGroup: {
    textAlign: "left",
    marginBottom: "20px", // Ajuster la marge
  },
  label: {
    display: "block",
    marginBottom: "8px",
    color: "#666666",
    fontSize: "14px",
    fontWeight: 500,
  },
  input: {
    width: "100%",
    padding: "10px 0", // Padding vertical seulement
    border: "none",
    borderBottom: "2px solid #cccccc", // Seulement un trait en dessous
    outline: "none", // Supprimer l'outline au focus
    fontSize: "15px", // Ajuster la taille de la police
    background: "transparent",
    borderRadius: "0", // Pas de bordure arrondie pour un trait
  },
  // Nouveau style pour le bouton Réinitialiser
  resetButton: {
    width: "100%",
    padding: "12px",
    backgroundColor: "#2e3034", // Couleur du background de la page
    color: "#ffffff",
    border: "none",
    borderRadius: "4px", // Bords un peu plus arrondis
    fontSize: "16px",
    fontWeight: 600,
    cursor: "pointer",
    transition: "background-color 0.3s ease",
  },
  linkText: {
    marginTop: "25px", // Ajuster la marge
    color: "#666666",
    textAlign: "center",
  },
  link: {
    color: "#ffa500",
    textDecoration: "none",
    fontWeight: "bold",
  },
  errorText: {
    color: "#ef4444",
    marginBottom: "15px", // Ajuster la marge
    textAlign: "center",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  successText: {
    color: "#10b981",
    marginBottom: "15px", // Ajuster la marge
    textAlign: "center",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  serverError: {
    backgroundColor: "#fef2f2",
    border: "1px solid #fecaca",
    borderRadius: "8px",
    padding: "16px",
    marginBottom: "20px", // Ajuster la marge
    display: "flex",
    alignItems: "flex-start",
  },
  serverErrorTitle: {
    fontWeight: 600,
    color: "#ef4444",
    marginBottom: "4px",
  },
  serverErrorDetails: {
    fontSize: "14px",
    color: "#6b7280",
  },
  retryButton: {
    background: "none",
    border: "none",
    color: "#4f46e5",
    cursor: "pointer",
    fontSize: "14px",
    fontWeight: 500,
    padding: 0,
    marginTop: "8px",
    display: "block",
  },
};

export default ResetPassword;