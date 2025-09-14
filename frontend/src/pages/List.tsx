import React, { useEffect, useState } from "react";
import { FiLogOut, FiSearch, FiBell } from "react-icons/fi";
import { BsHouseDoor } from "react-icons/bs";
import { MdOutlineHotel } from "react-icons/md";
import { AiOutlinePlus } from "react-icons/ai";
import { FaEdit, FaTrash } from "react-icons/fa";
import { NavLink } from "react-router-dom";
import axios, { AxiosError } from "axios";

// Configuration Axios globale
axios.defaults.baseURL = "http://127.0.0.1:8080";
axios.defaults.withCredentials = true;

// Interfaces pour les réponses de l'API
interface ApiErrorResponse {
  message?: string;
  error?: string;
  errors?: Record<string, string[]>;
}

interface User {
  id: number;
  name: string;
  email: string;
  photo: string | null;
}

interface Hotel {
  id: number;
  name: string;
  address: string;
  email: string;
  phone: string;
  price: string;
  currency: string;
  photo: string | null;
}

const List: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [hotels, setHotels] = useState<Hotel[]>([]);
  const [showPopup, setShowPopup] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [currentHotel, setCurrentHotel] = useState<Hotel | null>(null);

  // Formulaire création/modification d'hôtel
  const [name, setName] = useState("");
  const [address, setAddress] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [price, setPrice] = useState("");
  const [currency, setCurrency] = useState("F XOF");
  const [photo, setPhoto] = useState<File | null>(null);

  const getInitials = (name?: string) => {
    if (!name) return "U";
    return name.charAt(0).toUpperCase();
  };

  // Récupérer utilisateur connecté
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const token = localStorage.getItem("auth_token");
        if (!token) return;
        await axios.get("/sanctum/csrf-cookie");
        const response = await axios.get("/api/user", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setUser(response.data);
      } catch (err) {
        console.error("Erreur récupération user:", err);
      }
    };
    fetchUser();
  }, []);

  // Récupérer les hôtels
  const fetchHotels = async () => {
    try {
      const response = await axios.get("/api/hotels");
      setHotels(response.data);
    } catch (err) {
      console.error("Erreur récupération hôtels:", err);
    }
  };

  useEffect(() => {
    fetchHotels();
  }, []);

  // Déconnexion
  const handleLogout = () => {
    localStorage.removeItem("auth_token");
    window.location.href = "/login";
  };

  // Supprimer un hôtel
  const handleDelete = async (id: number) => {
    if (!window.confirm("Êtes-vous sûr de vouloir supprimer cet hôtel ?")) {
      return;
    }
    try {
      const token = localStorage.getItem("auth_token");
      if (!token) {
        setError("Token d'authentification manquant");
        return;
      }
      await axios.delete(`/api/hotels/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      fetchHotels();
    } catch (error) {
      console.error("Erreur suppression hôtel:", error);
      setError("Impossible de supprimer l'hôtel.");
    }
  };

  // Gérer l'ouverture du popup pour création ou modification
  const handleOpenPopup = (hotel?: Hotel) => {
    if (hotel) {
      setIsEditing(true);
      setCurrentHotel(hotel);
      // Pré-remplir le formulaire avec les données de l'hôtel
      setName(hotel.name);
      setAddress(hotel.address);
      setEmail(hotel.email);
      setPhone(hotel.phone);
      setPrice(hotel.price);
      setCurrency(hotel.currency);
      setPhoto(null);
    } else {
      setIsEditing(false);
      setCurrentHotel(null);
      // Réinitialiser le formulaire pour la création
      setName("");
      setAddress("");
      setEmail("");
      setPhone("");
      setPrice("");
      setCurrency("F XOF");
      setPhoto(null);
    }
    setShowPopup(true);
    setError(""); // Réinitialiser l'erreur
  };

  // Gérer la fermeture du popup
  const handleClosePopup = () => {
    setShowPopup(false);
    setIsEditing(false);
    setCurrentHotel(null);
    setError("");
  };

  // Gérer la soumission du formulaire (création ou modification)
  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      await axios.get("/sanctum/csrf-cookie");
      const token = localStorage.getItem("auth_token");
      if (!token) {
        setError("Token d'authentification manquant");
        setLoading(false);
        return;
      }

      const formData = new FormData();
      formData.append("name", name);
      formData.append("address", address);
      formData.append("email", email);
      formData.append("phone", phone);
      formData.append("price", price);
      formData.append("currency", currency);
      if (photo) formData.append("photo", photo);

      if (isEditing && currentHotel) {
        formData.append("_method", "PUT"); // Important pour Laravel
        await axios.post(`/api/hotels/${currentHotel.id}`, formData, {
          headers: { 
            Authorization: `Bearer ${token}`, 
            "Content-Type": "multipart/form-data" 
          },
        });
        console.log("Hôtel mis à jour avec succès.");
      } else {
        await axios.post("/api/hotels", formData, {
          headers: { 
            Authorization: `Bearer ${token}`, 
            "Content-Type": "multipart/form-data" 
          },
        });
        console.log("Hôtel créé avec succès.");
      }
      handleClosePopup();
      fetchHotels();
    } catch (err) {
      console.error("Erreur formulaire hôtel:", err);
      if (axios.isAxiosError(err)) {
        const axiosError = err as AxiosError<ApiErrorResponse>;
        if (axiosError.code === "ERR_NETWORK") {
          setError("Serveur injoignable.");
        } else if (axiosError.response?.status === 419) {
          setError("Erreur CSRF. Rafraîchissez la page.");
        } else if (axiosError.response?.status === 422) {
          const errorData = axiosError.response.data;
          if (errorData?.errors) {
            const firstErrorKey = Object.keys(errorData.errors)[0];
            setError(errorData.errors[firstErrorKey][0]);
          } else if (errorData?.message) {
            setError(errorData.message);
          } else {
            setError("Données invalides.");
          }
        } else if (axiosError.response?.status === 401) {
          setError("Non autorisé. Reconnectez-vous.");
        } else {
          setError(axiosError.response?.data?.message || "Erreur lors de l'opération.");
        }
      } else {
        setError("Une erreur est survenue.");
      }
    } finally {
      setLoading(false);
    }
  };

  // Filtrer les hôtels
  const filteredHotels = hotels.filter((hotel) =>
    hotel.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Fonction pour obtenir l'URL complète de l'image
  const getImageUrl = (photoPath: string | null) => {
    if (!photoPath) return "";
    if (photoPath.startsWith('http')) return photoPath;
    return `http://127.0.0.1:8080${photoPath}`;
  };

  return (
    <div className="flex h-screen font-sans">
      {/* Sidebar */}
      <aside className="w-64 bg-[#2e3034] text-white flex flex-col justify-between p-4">
        <div>
          <div className="flex items-center gap-4 mb-8">
            <svg width="32" height="32" viewBox="0 0 32 32">
              <path d="M2.66602 2.66624H29.3286V29.3288L2.66602 2.66624Z" fill="white" />
              <path d="M2.66602 2.66624H22.663L15.9973 15.9975L2.66602 2.66624Z" fill="black" fillOpacity="0.15" />
              <path d="M2.66602 2.66624H15.9973L2.66602 29.3288V2.66624Z" fill="white" />
            </svg>
            <h2 className="text-lg font-semibold">RED PRODUCT</h2>
          </div>
          <nav className="space-y-4">
            <NavLink 
              to="/dashboard" 
              className={({ isActive }) => 
                `flex items-center gap-2 px-3 py-2 rounded transition ${isActive ? "bg-white text-[#2e3034]" : "text-white hover:bg-gray-700"}`
              }
            >
              <BsHouseDoor /> Dashboard
            </NavLink>
            <NavLink 
              to="/list" 
              className={({ isActive }) => 
                `flex items-center gap-2 px-3 py-2 rounded transition ${isActive ? "bg-white text-[#2e3034]" : "text-white hover:bg-gray-700"}`
              }
            >
              <MdOutlineHotel /> Liste des hôtels
            </NavLink>
          </nav>
        </div>
        <div className="flex flex-col items-center p-3 rounded">
          <div className="w-10 h-10 rounded-full bg-[#ffa500] flex items-center justify-center mb-2 text-white font-bold">
            {getInitials(user?.name)}
          </div>
          <p className="font-medium">{user?.name || "Utilisateur"}</p>
          <p className="text-sm text-green-400">En ligne</p>
        </div>
      </aside>

      {/* Main */}
      <main className="flex-1 bg-gray-100 flex flex-col overflow-y-auto">
        {/* Navbar */}
        <div className="bg-white shadow flex items-center justify-between px-6 py-3">
          <h1 className="text-lg font-semibold">Liste des hôtels</h1>
          <div className="flex items-center gap-5">
            <div className="relative">
              <FiSearch className="absolute left-3 top-2.5 text-gray-400" />
              <input
                type="text"
                placeholder="Rechercher..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 border rounded-lg"
              />
            </div>
            <div className="w-9 h-9 rounded-full bg-[#ffa500] flex items-center justify-center text-white font-bold border">
              {getInitials(user?.name)}
            </div>
            <button className="relative text-gray-600 hover:text-gray-800">
              <FiBell size={22} />
              <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs w-4 h-4 flex items-center justify-center rounded-full">3</span>
            </button>
            <button onClick={handleLogout} className="text-red-500 hover:text-red-700">
              <FiLogOut size={22} />
            </button>
          </div>
        </div>

        {/* Header */}
        <div className="flex items-center justify-between bg-white px-6 py-3 mb-8 border-t-2 border-gray-100">
          <p className="text-gray-600 text-lg font-medium">
            Hôtels <span className="text-gray-800 font-semibold">{filteredHotels.length}</span>
          </p>
          <button
            onClick={() => handleOpenPopup()}
            className="flex items-center gap-2 px-4 py-2 border rounded-lg shadow hover:bg-gray-100"
          >
            <AiOutlinePlus /> Créer un nouveau hôtel
          </button>
        </div>

        {/* Error */}
        {error && <div className="mx-6 mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">{error}</div>}

        {/* Cards */}
        <div className="px-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 justify-items-center mb-8">
          {filteredHotels.map((hotel) => (
            <div
              key={hotel.id}
              className="bg-white rounded-xl shadow-md relative overflow-hidden"
              style={{ width: "250px", height: "350px" }}
            >
              {hotel.photo && (
                <img
                  src={getImageUrl(hotel.photo)}
                  alt={hotel.name}
                  className="object-cover w-full h-64"
                />
              )}
              <div className="p-4">
                <h3 className="text-lg font-semibold">{hotel.name}</h3>
                <p className="text-gray-500 truncate">{hotel.address}</p>
                <p className="text-sm text-gray-600">{hotel.price} {hotel.currency}</p>
              </div>
              <div className="absolute bottom-4 right-4 flex gap-2">
                <button
                  onClick={() => handleOpenPopup(hotel)}
                  className="text-yellow-400 hover:text-yellow-500 text-sm"
                >
                  <FaEdit size={15} />
                </button>
                <button
                  onClick={() => handleDelete(hotel.id)}
                  className="text-red-500 hover:text-red-600 text-sm"
                >
                  <FaTrash size={15} />
                </button>
              </div>
            </div>
          ))}
        </div>
      </main>

      {/* Popup création/modification */}
      {showPopup && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
          <div className="bg-white w-[600px] rounded-lg shadow-lg p-6">
            <h2 className="text-lg font-semibold mb-4">
              {isEditing ? `Modifier l'hôtel: ${currentHotel?.name}` : "Créer un nouvel hôtel"}
            </h2>
            {error && (
              <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
                {error}
              </div>
            )}
            <form onSubmit={handleFormSubmit}>
              <div className="grid grid-cols-2 gap-4">
                <input
                  type="text"
                  placeholder="Nom de l'hôtel"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="border rounded px-3 py-2 w-full"
                  required
                  disabled={loading}
                />
                <input
                  type="text"
                  placeholder="Adresse"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  className="border rounded px-3 py-2 w-full"
                  required
                  disabled={loading}
                />
                <input
                  type="email"
                  placeholder="Email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="border rounded px-3 py-2 w-full"
                  disabled={loading}
                />
                <input
                  type="text"
                  placeholder="Numéro de téléphone"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="border rounded px-3 py-2 w-full"
                  disabled={loading}
                />
                <input
                  type="text"
                  placeholder="Prix par nuit"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  className="border rounded px-3 py-2 w-full"
                  required
                  disabled={loading}
                />
                <select
                  value={currency}
                  onChange={(e) => setCurrency(e.target.value)}
                  className="border rounded px-3 py-2 w-full"
                  disabled={loading}
                >
                  <option>F XOF</option>
                  <option>€ EUR</option>
                  <option>$ USD</option>
                </select>
              </div>
              <div className="mt-4">
                <label className="block mb-1 text-sm text-gray-600">
                  {isEditing ? "Ajouter une nouvelle photo (facultatif)" : "Ajouter une photo"}
                </label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => setPhoto(e.target.files ? e.target.files[0] : null)}
                  className="w-full"
                  disabled={loading}
                />
              </div>
              <div className="flex justify-end gap-3 mt-6">
                <button
                  type="button"
                  onClick={handleClosePopup}
                  className="px-4 py-2 bg-gray-200 rounded-lg hover:bg-gray-300"
                  disabled={loading}
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-[#2e3034] text-white rounded-lg hover:bg-black disabled:opacity-50 disabled:cursor-not-allowed"
                  disabled={loading}
                >
                  {loading ? (isEditing ? "Mise à jour..." : "Création...") : (isEditing ? "Enregistrer les modifications" : "Enregistrer")}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default List;