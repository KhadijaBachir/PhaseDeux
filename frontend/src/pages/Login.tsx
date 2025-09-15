import React, { useState, useEffect } from "react";
import axios, { AxiosError } from "axios";

// Config Axios globale
axios.defaults.baseURL = "http://127.0.0.1:8080";
axios.defaults.withCredentials = true;

interface ApiErrorResponse {
  message?: string;
  errors?: Record<string, string[]>;
}

const Login: React.FC = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  // Détecter redimensionnement
  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      await axios.get("/sanctum/csrf-cookie");
      const response = await axios.post("/api/login", { email, password });

      if (response.data.token) {
        localStorage.setItem("auth_token", response.data.token);
        window.location.href = "/dashboard";
      }
    } catch (err) {
      if (axios.isAxiosError(err)) {
        const axiosError = err as AxiosError<ApiErrorResponse>;
        if (axiosError.response?.status === 422) {
          const errors = axiosError.response.data.errors;
          setError(errors?.email ? errors.email[0] : "Validation échouée.");
        } else if (axiosError.response?.status === 401) {
          setError("Email ou mot de passe incorrect.");
        } else {
          setError(axiosError.response?.data?.message || "Erreur inconnue.");
        }
      } else if (err instanceof Error) {
        setError(err.message);
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
      padding: isMobile ? "20px" : "40px",
      borderRadius: "8px",
      width: isMobile ? "100%" : "400px",
      maxWidth: "100%",
      boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
    },
    title: {
      color: "#333333",
      marginBottom: "20px",
      textAlign: "center",
      fontSize: isMobile ? "18px" : "22px",
    },
    input: {
      width: "100%",
      padding: isMobile ? "8px" : "10px",
      border: "none",
      borderBottom: "2px solid #cccccc",
      outline: "none",
      fontSize: isMobile ? "13px" : "14px",
      background: "transparent",
      borderRadius: "4px",
    },
    registerButton: {
      width: "100%",
      padding: isMobile ? "10px" : "12px",
      backgroundColor: "#2e3034",
      color: "#ffffff",
      border: "none",
      borderRadius: "4px",
      fontSize: isMobile ? "14px" : "16px",
      cursor: "pointer",
      transition: "background-color 0.3s ease",
    },
    linkText: {
      marginTop: "20px",
      color: "#ffffff",
      textAlign: "center",
      fontSize: isMobile ? "13px" : "14px",
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
      fontSize: isMobile ? "13px" : "14px",
    },
  };

  return (
    <div style={styles.pageContainer}>
      {/* Logo + Titre */}
      <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "16px", flexWrap: "wrap", justifyContent: "center" }}>
        <svg width={isMobile ? "24" : "32"} height={isMobile ? "24" : "32"} viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg">
          <path d="M2.66602 2.66624H29.3286V29.3288L2.66602 2.66624Z" fill="white" />
          <path d="M2.66602 2.66624H22.663L15.9973 15.9975L2.66602 2.66624Z" fill="black" fillOpacity="0.15" />
          <path d="M2.66602 2.66624H15.9973L2.66602 29.3288V2.66624Z" fill="white" />
        </svg>
        <h2 style={{ color: "white", fontSize: isMobile ? "18px" : "22px", fontWeight: 600 }}>RED PRODUCT</h2>
      </div>

      {/* Formulaire */}
      <div style={styles.registerCard}>
        <h2 style={styles.title}>Connectez-vous en tant que admin</h2>
        {error && <div style={styles.errorText}>{error}</div>}

        <form onSubmit={handleLogin}>
          <div style={{ marginBottom: "15px" }}>
            <label style={{ display: "block", marginBottom: "5px", color: "#666666", fontSize: isMobile ? "12px" : "14px" }} htmlFor="email">
              Email
            </label>
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

          <div style={{ marginBottom: "15px" }}>
            <label style={{ display: "block", marginBottom: "5px", color: "#666666", fontSize: isMobile ? "12px" : "14px" }} htmlFor="password">
              Mot de passe
            </label>
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

          <div style={{ marginBottom: "15px" }}>
            <label style={{ display: "flex", alignItems: "center", gap: "10px", fontSize: isMobile ? "12px" : "14px", color: "#666" }}>
              <input type="checkbox" style={{ width: "16px", height: "16px" }} disabled={loading} />
              Gardez-moi connecté
            </label>
          </div>

          <button
            type="submit"
            style={{ ...styles.registerButton, opacity: loading ? 0.7 : 1, cursor: loading ? "not-allowed" : "pointer" }}
            disabled={loading}
          >
            {loading ? "Connexion..." : "Se connecter"}
          </button>
        </form>
      </div>

      <p style={styles.linkText}>
        <a href="/forgot-password" style={styles.link}>Mot de passe oublié ?</a>
      </p>
      <p style={styles.linkText}>
        Vous n'avez pas de compte ? <a href="/register" style={styles.link}>S'inscrire</a>
      </p>
    </div>
  );
};

export default Login;
