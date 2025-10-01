import React, { useState, useEffect } from "react";
import axios, { AxiosError } from "axios";

// Configuration Axios globale
axios.defaults.baseURL = "http://127.0.0.1:8080";
axios.defaults.withCredentials = true;

// Interface pour la réponse d'erreur de l'API
interface ApiErrorResponse {
  message?: string;
  errors?: Record<string, string[]>;
}

// Interface pour les props du composant
interface RegisterPageProps {
  onSwitchToLogin?: () => void;
}

const RegisterPage: React.FC<RegisterPageProps> = ({ onSwitchToLogin }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [password_confirmation, setPasswordConfirmation] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    if (password !== password_confirmation) {
      setError("Les mots de passe ne correspondent pas");
      setLoading(false);
      return;
    }

    try {
      await axios.get("/sanctum/csrf-cookie");

      const response = await axios.post("/api/register", {
        name,
        email,
        password,
        password_confirmation,
      });

      console.log("Inscription réussie :", response.data);

      if (response.data.message || response.data.user) {
        window.location.href = "/login?registered=true";
      }
    } catch (err) {
      console.error("Erreur d'inscription:", err);

      if (axios.isAxiosError(err)) {
        const axiosError = err as AxiosError<ApiErrorResponse>;
        if (axiosError.code === "ERR_NETWORK") {
          setError("Impossible de se connecter au serveur. Vérifiez qu'il est démarré.");
        } else if (axiosError.response?.status === 419) {
          setError("Erreur de jeton CSRF. Veuillez rafraîchir la page.");
        } else if (axiosError.response?.status === 422) {
          const errorData = axiosError.response.data;
          if (errorData?.errors) {
            const firstErrorKey = Object.keys(errorData.errors)[0];
            setError(errorData.errors[firstErrorKey][0]);
          } else if (errorData?.message) {
            setError(errorData.message);
          } else {
            setError("Données d'inscription invalides.");
          }
        } else if (axiosError.response?.data?.message) {
          setError(axiosError.response.data.message);
        } else {
          setError("Une erreur est survenue lors de l'inscription.");
        }
      } else if (err instanceof Error) {
        setError(`Erreur: ${err.message}`);
      } else {
        setError("Une erreur inconnue s'est produite.");
      }
    } finally {
      setLoading(false);
    }
  };

  // Styles principaux
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
      padding: "25px",
      borderRadius: "5px",
      boxShadow: "0 4px 8px rgba(0, 0, 0, 0.1)",
      width: "400px",
      maxWidth: "100%",
    },
    title: {
      color: "#333333",
      marginBottom: "20px",
      textAlign: "center",
      fontSize: "20px",
    },
    formGroup: {
      textAlign: "left",
      marginBottom: "20px",
    },
    label: {
      display: "block",
      marginBottom: "5px",
      color: "#666666",
      fontSize: "14px",
    },
    input: {
      width: "100%",
      padding: "10px",
      border: "none",
      borderBottom: "1px solid #e0e0e0",
      outline: "none",
      fontSize: "14px",
      background: "transparent",
    },
    registerButton: {
      width: "100%",
      padding: "12px",
      backgroundColor: "#2e3034",
      color: "#ffffff",
      border: "none",
      borderRadius: "4px",
      fontSize: "16px",
      cursor: "pointer",
      transition: "background-color 0.3s ease",
    },
    linkText: {
      marginTop: "20px",
      color: "#ffffff",
      textAlign: "center",
      fontSize: "14px",
    },
    link: {
      color: "#ffa500",
      textDecoration: "none",
      fontWeight: "bold",
      cursor: "pointer",
    },
    errorText: {
      color: "red",
      marginBottom: "10px",
      textAlign: "center",
      fontSize: "14px",
    },
  };

  // Injection des media queries pour la responsivité
  useEffect(() => {
    const styleSheet = document.createElement("style");
    styleSheet.innerHTML = `
      @media (max-width: 480px) {
        .register-card {
          width: 90% !important;
          padding: 15px !important;
        }
        .register-title {
          font-size: 18px !important;
        }
      }

      @media (max-width: 768px) {
        .register-card {
          width: 80% !important;
        }
      }
    `;
    document.head.appendChild(styleSheet);
    return () => {
      document.head.removeChild(styleSheet);
    };
  }, []);

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

      <div style={{ ...styles.registerCard }} className="register-card">
        <h2 style={{ ...styles.title }} className="register-title">Inscrivez-vous en tant que admin</h2>

        {error && <div style={styles.errorText}>{error}</div>}

        <form onSubmit={handleRegister}>
          <div style={styles.formGroup}>
            <label style={styles.label} htmlFor="name">Nom</label>
            <input
              style={styles.input}
              type="text"
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              disabled={loading}
            />
          </div>

          <div style={styles.formGroup}>
            <label style={styles.label} htmlFor="email">Email</label>
            <input
              style={styles.input}
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              disabled={loading}
            />
          </div>

          <div style={styles.formGroup}>
            <label style={styles.label} htmlFor="password">Mot de passe</label>
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
              value={password_confirmation}
              onChange={(e) => setPasswordConfirmation(e.target.value)}
              required
              disabled={loading}
            />
          </div>

          <div style={styles.formGroup}>
            <label style={{ display: "flex", alignItems: "center", gap: "10px", fontSize: "14px", color: "#666" }}>
              <input type="checkbox" required style={{ width: "16px", height: "16px" }} disabled={loading} />
              Accepter les termes et la politique
            </label>
          </div>

          <button
            type="submit"
            style={{
              ...styles.registerButton,
              opacity: loading ? 0.7 : 1,
              cursor: loading ? "not-allowed" : "pointer",
            }}
            disabled={loading}
          >
            {loading ? "Inscription..." : "S'inscrire"}
          </button>
        </form>
      </div>

      <p style={styles.linkText}>
        Vous avez déjà un compte ?{" "}
        <span 
          style={styles.link} 
          onClick={onSwitchToLogin}
        >
          Se connecter
        </span>
      </p>
    </div>
  );
};

export default RegisterPage;