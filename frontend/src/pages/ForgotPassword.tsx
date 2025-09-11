import React, { useState } from "react";
import axios, { AxiosError } from "axios";

// Configuration Axios
axios.defaults.baseURL = "http://127.0.0.1:8080";
axios.defaults.withCredentials = true;

interface ApiErrorResponse {
  message?: string;
  errors?: Record<string, string[]>;
}

const ForgotPassword: React.FC = () => {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState("");

  // Fonction pour récupérer le cookie CSRF
  const getCsrfToken = async (): Promise<void> => {
    try {
      await axios.get("/sanctum/csrf-cookie");
    } catch (error) {
      console.error("Échec de l'obtention du token CSRF:", error);
      throw error;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);

    try {
      // Étape 1: Récupérer le cookie CSRF
      await getCsrfToken();

      // Étape 2: Envoyer la requête de mot de passe oublié
      const response = await axios.post(
        "/api/forgot-password",
        { email }
      );

      console.log("Réponse du serveur:", response.data);
      setSuccess("Un email de réinitialisation a été envoyé !");
    } catch (err: unknown) {
      if (axios.isAxiosError(err)) {
        const axiosError = err as AxiosError<ApiErrorResponse>;
        if (axiosError.response?.status === 422) {
          const errorData = axiosError.response.data;
          setError(errorData?.errors?.email ? errorData.errors.email[0] : "Email invalide.");
        } else if (axiosError.response?.status === 404) {
          setError("Aucun compte trouvé avec cet email.");
        } else if (axiosError.response?.status === 419) {
          setError("Erreur de sécurité. Veuillez rafraîchir la page et réessayer.");
        } else {
          setError(axiosError.response?.data?.message || "Une erreur est survenue.");
        }
      } else {
        setError("Une erreur inconnue s'est produite.");
      }
    } finally {
      setLoading(false);
    }
  };

  const styles: { [key: string]: React.CSSProperties } = {
    pageContainer: {
      minHeight: "100vh",
      backgroundColor: "#2e3034",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      fontFamily: "Arial, sans-serif",
    },
    registerCard: {
      backgroundColor: "#ffffff",
      padding: "40px",
      borderRadius: "6px",
      width: "400px",
      boxShadow: "0 4px 8px rgba(0,0,0,0.1)",
    },
    title: {
      color: "#333333",
      marginBottom: "20px",
      textAlign: "center",
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
      borderBottom: "2px solid #cccccc",
      outline: "none",
      fontSize: "14px",
      background: "transparent",
      borderRadius: "4px",
    },
    registerButton: {
      width: "100%",
      padding: "12px",
      backgroundColor: "#333333",
      color: "#ffffff",
      border: "none",
      borderRadius: "4px",
      fontSize: "16px",
      cursor: "pointer",
      transition: "background-color 0.3s ease",
    },
    linkText: {
      marginTop: "20px",
      color: "#666666",
      textAlign: "center",
    },
    link: {
      color: "#ffa500",
      textDecoration: "none",
      fontWeight: "bold",
    },
    errorText: {
      color: "red",
      marginBottom: "10px",
      textAlign: "center",
    },
    successText: {
      color: "green",
      marginBottom: "10px",
      textAlign: "center",
    },
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

      {/* Formulaire */}
      <div style={styles.registerCard}>
        <h2 style={styles.title}>Mot de passe oublié ?</h2>
        {error && <div style={styles.errorText}>{error}</div>}
        {success && <div style={styles.successText}>{success}</div>}

        <form onSubmit={handleSubmit}>
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

          <button
            type="submit"
            style={{ ...styles.registerButton, opacity: loading ? 0.7 : 1, cursor: loading ? "not-allowed" : "pointer" }}
            disabled={loading}
          >
            {loading ? "Envoi en cours..." : "Envoyer"}
          </button>
        </form>
      </div>

      <p style={{ ...styles.linkText, color: "white" }}>
        Revenir à la <a href="/login" style={styles.link}>Connexion</a>
      </p>
    </div>
  );
};

export default ForgotPassword;