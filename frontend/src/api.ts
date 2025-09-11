// src/services/api.ts
import axios from "axios";

const API_BASE_URL = "http://localhost:8080";

// Instance Axios pour les requêtes API
export const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true, // Essential for Sanctum
  headers: {
    "Content-Type": "application/json",
    "Accept": "application/json",
  },
});

// Instance Axios pour les requêtes CSRF
export const csrfApi = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
});

// Fonction pour récupérer le cookie CSRF
export const getCsrfToken = async (): Promise<void> => {
  try {
    await csrfApi.get("/sanctum/csrf-cookie");
    console.log("CSRF token obtenu avec succès");
  } catch (error) {
    console.error("Échec de l'obtention du token CSRF:", error);
    throw error;
  }
};

// Intercepteur pour gérer les erreurs
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 419 || error.response?.status === 401) {
      // Token CSRF expiré ou session invalide
      try {
        await getCsrfToken();
        // Retenter la requête originale
        return api.request(error.config);
      } catch (csrfError) {
        return Promise.reject(csrfError);
      }
    }
    return Promise.reject(error);
  }
);

export default api;