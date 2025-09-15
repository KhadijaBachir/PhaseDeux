import React, { useEffect, useState } from "react";
import { FiLogOut, FiSearch, FiBell, FiMenu, FiX } from "react-icons/fi";
import { BsHouseDoor } from "react-icons/bs";
import { MdOutlineHotel } from "react-icons/md";
import { AiOutlinePlus } from "react-icons/ai";
import { FaEdit, FaTrash } from "react-icons/fa";
import { NavLink, useNavigate } from "react-router-dom";
import axios, { AxiosError } from "axios";

// Configuration Axios globale
axios.defaults.baseURL = "http://127.0.0.1:8080";
axios.defaults.withCredentials = true;

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
  user_id: number;
}

const List: React.FC = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState<User | null>(null);
  const [hotels, setHotels] = useState<Hotel[]>([]);
  const [showPopup, setShowPopup] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [currentHotel, setCurrentHotel] = useState<Hotel | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);

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

  // Récupérer et mettre en cache les informations de l'utilisateur
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const token = localStorage.getItem("auth_token");
        if (!token) {
          navigate("/login");
          return;
        }
        await axios.get("/sanctum/csrf-cookie");
        const response = await axios.get("/api/user", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setUser(response.data);
        localStorage.setItem("user", JSON.stringify(response.data)); // Sauvegarde dans le localStorage
      } catch (err) {
        console.error("Erreur récupération user:", err);
        localStorage.removeItem("user");
        localStorage.removeItem("auth_token");
        navigate("/login");
      }
    };

    const savedUser = localStorage.getItem("user");
    if (savedUser) {
      try {
        setUser(JSON.parse(savedUser));
      } catch (e) {
        console.error("Erreur de parsing de l'utilisateur en cache:", e);
        localStorage.removeItem("user");
        fetchUser(); // Appeler l'API si le cache est corrompu
      }
    } else {
      fetchUser(); // Appeler l'API si aucune donnée n'est en cache
    }
  }, [navigate]);

  // Récupérer et mettre en cache la liste des hôtels
  const fetchHotels = async () => {
    try {
      const token = localStorage.getItem("auth_token");
      let response;
      const savedHotels = localStorage.getItem("hotels");
      
      // Afficher les données du cache si elles existent pour une UX instantanée
      if (savedHotels) {
        setHotels(JSON.parse(savedHotels));
      }

      // Tenter la route protégée
      if (token) {
        try {
          response = await axios.get("/api/user/hotels", {
            headers: { Authorization: `Bearer ${token}` },
          });
        } catch (err) {
          if (axios.isAxiosError(err) && (err.response?.status === 401 || err.response?.status === 403)) {
            console.warn("Accès non autorisé à la route protégée, utilisation de la route publique.");
            response = await axios.get("/api/hotels");
          } else {
            throw err;
          }
        }
      } else {
        response = await axios.get("/api/hotels");
      }

      const hotelData = response.data;
      
      // Mettre à jour l'état et le cache local avec les données fraîches
      setHotels(hotelData);
      localStorage.setItem("hotels", JSON.stringify(hotelData));

    } catch (err) {
      console.error("Erreur récupération hôtels:", err);
      // Ne pas effacer les données existantes pour ne pas perturber l'utilisateur
      if (hotels.length === 0) {
        setHotels([]);
      }
    }
  };

  useEffect(() => {
    // S'assurer que l'utilisateur est bien chargé avant de tenter de récupérer les hôtels
    if (user) {
      fetchHotels();
    }
  }, [user]);

  const handleLogout = () => {
    localStorage.removeItem("auth_token");
    localStorage.removeItem("user");
    localStorage.removeItem("hotels");
    navigate("/login");
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm("Êtes-vous sûr de vouloir supprimer cet hôtel ?")) return;
    
    try {
      const token = localStorage.getItem("auth_token");
      if (!token) {
        setError("Token d'authentification manquant");
        return;
      }
      await axios.delete(`/api/hotels/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      // Mettre à jour la liste sans recharger la page
      const updatedHotels = hotels.filter(hotel => hotel.id !== id);
      setHotels(updatedHotels);
      localStorage.setItem("hotels", JSON.stringify(updatedHotels));
      
    } catch (err) {
      console.error("Erreur suppression:", err);
      if (axios.isAxiosError(err)) {
        const axiosError = err as AxiosError<ApiErrorResponse>;
        setError(
          axiosError.response?.status === 403
            ? "Vous n'êtes pas autorisé à supprimer cet hôtel."
            : "Impossible de supprimer l'hôtel."
        );
      } else {
        setError("Une erreur est survenue lors de la suppression.");
      }
    }
  };

  const handleOpenPopup = (hotel?: Hotel) => {
    if (hotel) {
      if (user && hotel.user_id !== user.id) {
        setError("Vous n'êtes pas autorisé à modifier cet hôtel");
        return;
      }
      setIsEditing(true);
      setCurrentHotel(hotel);
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
      setName("");
      setAddress("");
      setEmail("");
      setPhone("");
      setPrice("");
      setCurrency("F XOF");
      setPhoto(null);
    }
    setShowPopup(true);
    setError("");
  };

  const handleClosePopup = () => {
    setShowPopup(false);
    setIsEditing(false);
    setCurrentHotel(null);
    setError("");
  };

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
        if (currentHotel.user_id !== user?.id) {
          setError("Vous n'êtes pas autorisé à modifier cet hôtel");
          setLoading(false);
          return;
        }
        formData.append("_method", "PUT");
        await axios.post(`/api/hotels/${currentHotel.id}`, formData, {
          headers: { 
            Authorization: `Bearer ${token}`, 
            "Content-Type": "multipart/form-data" 
          },
        });
      } else {
        await axios.post("/api/hotels", formData, {
          headers: { 
            Authorization: `Bearer ${token}`, 
            "Content-Type": "multipart/form-data" 
          },
        });
      }
      handleClosePopup();
      fetchHotels(); // Rafraîchir les données après l'action
    } catch (err) {
      console.error("Erreur formulaire:", err);
      let message = "Une erreur est survenue.";
      
      if (axios.isAxiosError(err)) {
        const axiosError = err as AxiosError<ApiErrorResponse>;
        const status = axiosError.response?.status;
        
        if (status === 422 && axiosError.response?.data?.errors) {
          const firstKey = Object.keys(axiosError.response.data.errors)[0];
          message = axiosError.response.data.errors[firstKey][0];
        } else if (status === 419) {
          message = "Erreur CSRF. Rafraîchissez la page.";
        } else if (status === 401) {
          message = "Non autorisé. Reconnectez-vous.";
        } else if (status === 403) {
          message = "Action non autorisée.";
        } else if (status === 500) {
          message = "Erreur serveur. Veuillez réessayer.";
        } else {
          message = axiosError.response?.data?.message || message;
        }
      }
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  const filteredHotels = hotels.filter((hotel) =>
    hotel.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  return (
    <div className="flex h-screen font-sans bg-gray-100">
      {/* Overlay mobile */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        ></div>
      )}

      {/* Sidebar */}
      <aside className={`fixed lg:static inset-y-0 left-0 z-50 w-64 bg-[#44474d] text-white flex flex-col transform transition-transform duration-300 ease-in-out lg:translate-x-0 ${
        sidebarOpen ? 'translate-x-0' : '-translate-x-full'
      }`}>
        <div className="flex-1 flex flex-col p-4">
          {/* Header sidebar */}
          <div className="flex items-center justify-between mb-8">
            <div
              className="flex items-center gap-4 cursor-pointer"
              onClick={() => navigate("/login")}
            >
              <svg width="32" height="32" viewBox="0 0 32 32">
                <path d="M2.66602 2.66624H29.3286V29.3288L2.66602 2.66624Z" fill="white" />
                <path d="M2.66602 2.66624H22.663L15.9973 15.9975L2.66602 2.66624Z" fill="black" fillOpacity="0.15" />
                <path d="M2.66602 2.66624H15.9973L2.66602 29.3288V2.66624Z" fill="white" />
              </svg>
              <h2 className="text-lg font-semibold">RED PRODUCT</h2>
            </div>
            <button 
              className="lg:hidden text-white"
              onClick={() => setSidebarOpen(false)}
            >
              <FiX size={24} />
            </button>
          </div>

          {/* Menu */}
          <nav className="space-y-2 flex-1">
            <NavLink 
              to="/dashboard" 
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
                  isActive ? "bg-white text-[#2e3034] font-medium" : "text-white hover:bg-gray-700"
                }`
              }
              onClick={() => setSidebarOpen(false)}
            >
              <BsHouseDoor size={20} /> Dashboard
            </NavLink>
            <NavLink 
              to="/list" 
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
                  isActive ? "bg-white text-[#2e3034] font-medium" : "text-white hover:bg-gray-700"
                }`
              }
              onClick={() => setSidebarOpen(false)}
            >
              <MdOutlineHotel size={20} /> Liste des hôtels
            </NavLink>
          </nav>

          {/* User profil */}
          <div className="flex flex-col items-center p-4 rounded-lg mt-4">
            <div className="w-12 h-12 rounded-full bg-[#ffa500] flex items-center justify-center text-white font-bold mb-2">
              {getInitials(user?.name)}
            </div>
            <p className="font-medium text-center">{user?.name || "Utilisateur"}</p>
            <p className="text-sm text-green-400">En ligne</p>
          </div>
        </div>
      </aside>

      {/* Contenu principal */}
      <main className="flex-1 flex flex-col lg:ml-0 min-h-screen">
        {/* Navbar */}
        <div className="bg-white shadow-sm flex items-center justify-between p-4 lg:px-6">
          <div className="flex items-center gap-4">
            <button 
              className="lg:hidden text-gray-600"
              onClick={toggleSidebar}
            >
              <FiMenu size={24} />
            </button>
            <h1 className="text-xl font-semibold text-gray-800">Liste des hôtels</h1>
          </div>
          
          <div className="flex items-center gap-3 lg:gap-4">
            <div className="relative hidden md:block">
              <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Rechercher..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 w-40 lg:w-56"
              />
            </div>
            
            <div className="flex items-center gap-3">
              <button className="relative text-gray-600 hover:text-gray-800 p-2">
                <FiBell size={20} />
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs w-4 h-4 flex items-center justify-center rounded-full">3</span>
              </button>
              
              <div className="hidden sm:flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-[#ffa500] flex items-center justify-center text-white font-bold">
                  {getInitials(user?.name)}
                </div>
              </div>
              
              <button 
                onClick={handleLogout} 
                className="text-gray-600 hover:text-red-600 p-2"
                title="Déconnexion"
              >
                <FiLogOut size={20} />
              </button>
            </div>
          </div>
        </div>

        {/* Search mobile */}
        <div className="px-4 md:hidden mb-4">
          <div className="relative">
            <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Rechercher..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 w-full"
            />
          </div>
        </div>

        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between bg-white px-4 lg:px-6 py-4 mb-6 border-b gap-3 sm:gap-0">
          <p className="text-gray-600 text-lg font-medium">
            Mes hôtels <span className="text-gray-800 font-semibold">{filteredHotels.length}</span>
          </p>
          <button
            onClick={() => handleOpenPopup()}
            className="flex items-center gap-2 px-4 py-2 bg-white-500 text-black rounded-lg shadow hover:bg-blue-600 transition-colors"
          >
            <AiOutlinePlus /> Créer un nouvel hôtel
          </button>
        </div>

        {/* Error */}
        {error && (
          <div className="mx-4 lg:mx-6 mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
            {error}
          </div>
        )}

        {/* Cards */}
        <div className="flex-1 px-4 lg:px-6 pb-6 overflow-y-auto">
          {filteredHotels.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 lg:gap-6">
              {filteredHotels.map((hotel) => (
                <div
                  key={hotel.id}
                  className="bg-white rounded-xl shadow-md relative overflow-hidden transition-transform hover:scale-105"
                >
                  {hotel.photo && (
                    <img
                      src={hotel.photo}
                      alt={hotel.name}
                      className="object-cover w-full h-48"
                    />
                  )}
                  <div className="p-4">
                    <h3 className="text-lg font-semibold truncate">{hotel.name}</h3>
                    <p className="text-gray-500 truncate text-sm">{hotel.address}</p>
                    <p className="text-sm text-gray-600 mt-1">{hotel.price} {hotel.currency}</p>
                  </div>
                  <div className="absolute bottom-4 right-4 flex gap-2">
                    <button
                      onClick={() => handleOpenPopup(hotel)}
                      className="text-yellow-400 hover:text-yellow-500 text-sm bg-white p-1 rounded-full shadow"
                    >
                      <FaEdit size={15} />
                    </button>
                    <button
                      onClick={() => handleDelete(hotel.id)}
                      className="text-red-500 hover:text-red-600 text-sm bg-white p-1 rounded-full shadow"
                    >
                      <FaTrash size={15} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-64">
              <MdOutlineHotel className="text-6xl text-gray-300 mb-4" />
              <h3 className="text-xl font-semibold text-gray-500 text-center">
                Aucun hôtel trouvé
              </h3>
              <p className="text-gray-400 mt-2 text-center">
                {searchTerm 
                  ? "Aucun résultat pour votre recherche" 
                  : "Commencez par créer votre premier hôtel"
                }
              </p>
            </div>
          )}
        </div>
      </main>

      {/* Popup création/modification */}
      {showPopup && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 p-4">
          <div className="bg-white w-full max-w-2xl rounded-lg shadow-lg p-6 max-h-[90vh] overflow-y-auto">
            <h2 className="text-lg font-semibold mb-4">
              {isEditing ? `Modifier l'hôtel: ${currentHotel?.name}` : "Créer un nouvel hôtel"}
            </h2>
            {error && (
              <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
                {error}
              </div>
            )}
            <form onSubmit={handleFormSubmit}>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Nom de l'hôtel</label>
                  <input
                    type="text"
                    placeholder="Nom de l'hôtel"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="border rounded px-3 py-2 w-full"
                    required
                    disabled={loading}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Adresse</label>
                  <input
                    type="text"
                    placeholder="Adresse"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    className="border rounded px-3 py-2 w-full"
                    required
                    disabled={loading}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                  <input
                    type="email"
                    placeholder="Email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="border rounded px-3 py-2 w-full"
                    disabled={loading}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Téléphone</label>
                  <input
                    type="text"
                    placeholder="Numéro de téléphone"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="border rounded px-3 py-2 w-full"
                    disabled={loading}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Prix par nuit</label>
                  <input
                    type="text"
                    placeholder="Prix par nuit"
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    className="border rounded px-3 py-2 w-full"
                    required
                    disabled={loading}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Devise</label>
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
              </div>
              <div className="mt-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
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
              <div className="flex flex-col sm:flex-row justify-end gap-3 mt-6">
                <button
                  type="button"
                  onClick={handleClosePopup}
                  className="px-4 py-2 bg-gray-200 rounded-lg hover:bg-gray-300 transition-colors"
                  disabled={loading}
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-[#2e3034] text-white rounded-lg hover:bg-black disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  disabled={loading}
                >
                  {loading ? (isEditing ? "Mise à jour..." : "Création...") : (isEditing ? "Enregistrer" : "Créer")}
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