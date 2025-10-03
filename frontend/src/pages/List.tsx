import React, { useEffect, useState } from "react";
import { FiLogOut, FiSearch, FiBell, FiMenu, FiX } from "react-icons/fi";
import { BsHouseDoor } from "react-icons/bs";
import { MdOutlineHotel } from "react-icons/md";
import { AiOutlinePlus } from "react-icons/ai";
import { FaEdit, FaTrash } from "react-icons/fa";
import { NavLink, useNavigate } from "react-router-dom";
import axios from "axios";

// Configuration Axios globale
axios.defaults.baseURL = import.meta.env.VITE_API_BASE_URL;
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
  price_per_night: string;
  currency: string;
  photo: string | null;
  user_id: number;
}

// Composant pour l'affichage sécurisé des images
const HotelImage: React.FC<{ hotel: Hotel }> = ({ hotel }) => {
  const [imageError, setImageError] = useState(false);

  // Si photo est une URL absolue (commence par "http"), on utilise directement, sinon on construit
  const imageUrl = hotel.photo
    ? hotel.photo.startsWith("http")
      ? hotel.photo
      : `${import.meta.env.VITE_STORAGE_BASE_URL}/${hotel.photo}`
    : null;

  if (!imageUrl || imageError) {
    return (
      <div className="w-full h-48 bg-gradient-to-br from-gray-200 to-gray-300 flex flex-col items-center justify-center">
        <MdOutlineHotel className="text-4xl text-gray-500 mb-2" />
        <span className="text-gray-500 text-sm">Aucune image</span>
      </div>
    );
  }

  return (
    <img
      src={imageUrl}
      alt={`Photo de ${hotel.name}`}
      className="w-full h-48 object-cover"
      onError={() => {
        setImageError(true);
      }}
    />
  );
};

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

  // Form states
  const [name, setName] = useState("");
  const [address, setAddress] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [price, setPrice] = useState("");
  const [currency, setCurrency] = useState("F XOF");
  const [photo, setPhoto] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);

  const getInitials = (name?: string) => {
    if (!name) return "U";
    return name.charAt(0).toUpperCase();
  };

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  // ------------------- FETCH USER -------------------
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const token = localStorage.getItem("auth_token");
        if (!token) {
          navigate("/login");
          return;
        }
        await axios.get("/sanctum/csrf-cookie");
        const res = await axios.get<User>("/api/user", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setUser(res.data);
      } catch (err) {
        localStorage.removeItem("auth_token");
        navigate("/login");
      }
    };
    fetchUser();
  }, [navigate]);

  // ------------------- FETCH HOTELS -------------------
  const fetchHotels = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("auth_token");
      let res;
      const timestamp = Date.now();

      if (token) {
        try {
          res = await axios.get<Hotel[]>("/api/user/hotels", {
            headers: { Authorization: `Bearer ${token}` },
            params: { _t: timestamp },
          });
        } catch (err) {
          if (
            axios.isAxiosError(err) &&
            (err.response?.status === 401 || err.response?.status === 403)
          ) {
            res = await axios.get<Hotel[]>("/api/hotels", {
              params: { _t: timestamp },
            });
          } else {
            throw err;
          }
        }
      } else {
        res = await axios.get<Hotel[]>("/api/hotels", {
          params: { _t: timestamp },
        });
      }

      console.log("Hôtels chargés (FRESH):", res.data);
      setHotels(res.data);
    } catch (err) {
      setError("Impossible de charger les hôtels. Vérifiez votre connexion.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHotels();
  }, []);

  // ------------------- LOGOUT -------------------
  const handleLogout = () => {
    localStorage.removeItem("auth_token");
    localStorage.removeItem("user");
    navigate("/login");
  };

  // ------------------- DELETE HOTEL -------------------
  const handleDelete = async (id: number) => {
    if (
      !window.confirm(
        "Êtes-vous sûr de vouloir supprimer cet hôtel ? Cette action est irréversible."
      )
    )
      return;

    try {
      const token = localStorage.getItem("auth_token");
      if (!token) {
        setError("Token d'authentification manquant");
        return;
      }

      await axios.delete(`/api/hotels/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setHotels(hotels.filter((hotel) => hotel.id !== id));
    } catch (err) {
      setError("Impossible de supprimer l'hôtel. Vérifiez vos permissions.");
    }
  };

  // ------------------- OPEN / CLOSE POPUP -------------------
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
      setEmail(hotel.email || "");
      setPhone(hotel.phone || "");

      // PRIX POUR L'UI
      const priceForUI = hotel.price_per_night.replace(".", ",");
      setPrice(priceForUI);

      setCurrency(hotel.currency);
      setPhoto(null);

      // Aperçu : si hotel.photo est URL absolue, on l’utilise ; sinon on le complète
      const previewUrl = hotel.photo
        ? hotel.photo.startsWith("http")
          ? hotel.photo
          : `${import.meta.env.VITE_STORAGE_BASE_URL}/${hotel.photo}`
        : null;
      setPhotoPreview(previewUrl);
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
      setPhotoPreview(null);
    }
    setShowPopup(true);
    setError("");
  };

  const handleClosePopup = () => {
    setShowPopup(false);
    setIsEditing(false);
    setCurrentHotel(null);
    setPhoto(null);
    setPhotoPreview(null);
    setError("");
  };

  // ------------------- PHOTO HANDLING -------------------
  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setPhoto(file);

      const reader = new FileReader();
      reader.onload = (e) => {
        setPhotoPreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  // ------------------- FORM SUBMIT -------------------
  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const standardizedPrice = price.replace(",", ".");

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
      formData.append("price_per_night", standardizedPrice);
      formData.append("currency", currency);

      if (photo) {
        formData.append("photo", photo);
      }

      const config = {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
      };

      if (isEditing && currentHotel) {
        formData.append("_method", "PUT");
        await axios.post(`/api/hotels/${currentHotel.id}`, formData, config);
      } else {
        await axios.post("/api/hotels", formData, config);
      }

      handleClosePopup();

      await fetchHotels();
    } catch (err) {
      if (axios.isAxiosError(err) && err.response) {
        const apiError = err.response.data as ApiErrorResponse;
        if (apiError.errors) {
          const validationErrors = Object.values(apiError.errors)
            .flat()
            .join(", ");
          setError(`Erreurs de validation: ${validationErrors}`);
        } else if (apiError.message) {
          setError(apiError.message);
        } else {
          setError("Une erreur est survenue lors de la soumission du formulaire.");
        }
      } else {
        setError("Erreur de connexion. Vérifiez votre réseau.");
      }
    } finally {
      setLoading(false);
    }
  };

  const filteredHotels = hotels.filter((hotel) =>
    hotel.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    hotel.address.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // ------------------- RENDER -------------------
  return (
    <div className="flex h-screen font-sans bg-gray-100">
      {/* Overlay mobile */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        ></div>
      )}

      {/* Sidebar (omitted for brevity, assume content is identical) */}
      <aside
        className={`fixed lg:static inset-y-0 left-0 z-50 w-64 bg-[#44474d] text-white flex flex-col transform transition-transform duration-300 ease-in-out lg:translate-x-0 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex-1 flex flex-col p-4 bg-[#44474d]">
          <div className="flex items-center justify-between mb-8">
            <div
              className="flex items-center gap-4 cursor-pointer"
              onClick={() => navigate("/login")}
            >
              <svg width="32" height="32" viewBox="0 0 32 32">
                <path
                  d="M2.66602 2.66624H29.3286V29.3288L2.66602 2.66624Z"
                  fill="white"
                />
                <path
                  d="M2.66602 2.66624H22.663L15.9973 15.9975L2.66602 2.66624Z"
                  fill="black"
                  fillOpacity="0.15"
                />
                <path
                  d="M2.66602 2.66624H15.9973L2.66602 29.3288V2.66624Z"
                  fill="white"
                />
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

          <nav className="space-y-2 flex-1">
            <NavLink
              to="/dashboard"
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
                  isActive
                    ? "bg-white text-[#2e3034] font-medium"
                    : "text-white hover:bg-gray-700"
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
                  isActive
                    ? "bg-white text-[#2e3034] font-medium"
                    : "text-white hover:bg-gray-700"
                }`
              }
              onClick={() => setSidebarOpen(false)}
            >
              <MdOutlineHotel size={20} /> Liste des hôtels
            </NavLink>
          </nav>

          <div className="flex flex-col items-center p-4 rounded-lg mt-4 ">
            <div className="w-12 h-12 rounded-full bg-[#ffa500] flex items-center justify-center text-white font-bold mb-2">
              {getInitials(user?.name)}
            </div>
            <p className="font-medium text-center text-sm">
              {user?.name || "Utilisateur"}
            </p>
            <p className="text-xs text-green-400 mt-1">En ligne</p>
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
            <h1 className="text-xl font-semibold text-gray-800">
              Liste des hôtels
            </h1>
          </div>

          <div className="flex items-center gap-3 lg:gap-4">
            <div className="relative hidden md:block">
              <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Rechercher un hôtel..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 w-40 lg:w-56"
              />
            </div>
            <div className="flex items-center gap-3">
              <button className="relative text-gray-600 hover:text-gray-800 p-2">
                <FiBell size={20} />
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs w-4 h-4 flex items-center justify-center rounded-full">
                  3
                </span>
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
        <div className="px-4 md:hidden mb-4 mt-4">
          <div className="relative">
            <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Rechercher un hôtel..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 w-full"
            />
          </div>
        </div>

        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between bg-white px-4 lg:px-6 py-4 mb-6 border-b gap-3 sm:gap-0">
          <div>
            <p className="text-gray-600 text-lg font-medium">
              Mes hôtels{" "}
              <span className="text-gray-800 font-semibold">
                ({filteredHotels.length})
              </span>
            </p>
            <p className="text-gray-500 text-sm">
              Gérez vos établissements hôteliers
            </p>
          </div>
          <button
            onClick={() => handleOpenPopup()}
            className="flex items-center gap-2 px-4 py-2 bg-white-500 text-black rounded-lg shadow hover:bg-blue-600 transition-colors font-medium"
          >
            <AiOutlinePlus size={18} /> Créer un nouveau hôtel
          </button>
        </div>

        {/* Erreurs */}
        {error && (
          <div className="mx-4 lg:mx-6 mb-4 p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg">
            <div className="flex items-center">
              <span className="font-medium">Erreur:</span>
              <span className="ml-2">{error}</span>
            </div>
          </div>
        )}

        {/* Loading */}
        {loading && hotels.length === 0 && (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
          </div>
        )}

        {/* Liste des hôtels */}
        <div className="flex-1 px-4 lg:px-6 pb-6 overflow-y-auto">
          {filteredHotels.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filteredHotels.map((hotel) => (
                <div
                  key={hotel.id}
                  className="bg-white rounded-xl shadow-md hover:shadow-lg transition-all duration-300 overflow-hidden border border-gray-100"
                >
                  <HotelImage hotel={hotel} />

                  <div className="p-4">
                    <h3 className="text-lg font-semibold text-gray-800 truncate mb-1">
                      {hotel.name}
                    </h3>
                    <p className="text-gray-600 text-sm truncate mb-2 flex items-center">
                      <span className="truncate">{hotel.address}</span>
                    </p>

                    <div className="flex items-center justify-between mt-3">
                      <span className="text-blue-600 font-semibold">
                        {hotel.price_per_night} {hotel.currency}
                        <span className="text-gray-500 text-xs font-normal ml-1">
                          /nuit
                        </span>
                      </span>

                      <div className="flex gap-2">
                        <button
                          onClick={() => handleOpenPopup(hotel)}
                          className="text-blue-500 hover:text-blue-600 p-2 rounded-full hover:bg-blue-50 transition-colors"
                          title="Modifier"
                        >
                          <FaEdit size={14} />
                        </button>
                        <button
                          onClick={() => handleDelete(hotel.id)}
                          className="text-red-500 hover:text-red-600 p-2 rounded-full hover:bg-red-50 transition-colors"
                          title="Supprimer"
                        >
                          <FaTrash size={14} />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-64 bg-white rounded-xl shadow-sm border border-gray-200">
              <MdOutlineHotel className="text-6xl text-gray-300 mb-4" />
              <h3 className="text-xl font-semibold text-gray-500 text-center mb-2">
                {searchTerm ? "Aucun hôtel trouvé" : "Aucun hôtel"}
              </h3>
              <p className="text-gray-400 text-center mb-6">
                {searchTerm
                  ? "Aucun résultat ne correspond à votre recherche"
                  : "Commencez par créer votre premier hôtel"}
              </p>
              {!searchTerm && (
                <button
                  onClick={() => handleOpenPopup()}
                  className="flex items-center gap-2 px-4 py-2 bg-white-500 text-black rounded-lg hover:bg-blue-600 transition-colors"
                >
                  <AiOutlinePlus /> Créer un hôtel
                </button>
              )}
            </div>
          )}
        </div>
      </main>

      {/* Popup de création/édition */}
      {showPopup && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 p-4">
          <div className="bg-white w-full max-w-2xl rounded-xl shadow-2xl p-6 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-semibold text-gray-800">
                {isEditing ? `Modifier ${currentHotel?.name}` : "Créer un nouvel hôtel"}
              </h2>
              <button
                onClick={handleClosePopup}
                className="text-gray-400 hover:text-gray-600 p-1 rounded-full hover:bg-gray-100"
              >
                <FiX size={20} />
              </button>
            </div>

            {error && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg">
                {error}
              </div>
            )}

            <form onSubmit={handleFormSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Nom */}
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Nom de l'hôtel *
                  </label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Ex: Hôtel Plaza"
                    required
                  />
                </div>

                {/* Adresse */}
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Adresse complète *
                  </label>
                  <input
                    type="text"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Avenue Cheikh Anta Diop"
                    required
                  />
                </div>

                {/* Email */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="contact@hotel.com"
                  />
                </div>

                {/* Téléphone */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Téléphone
                  </label>
                  <input
                    type="text"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="+221 77 398 76 54"
                  />
                </div>

                {/* Prix */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Prix par nuit *
                  </label>
                  <input
                    type="text"
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="0,00"
                    required
                  />
                </div>

                {/* Devise */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Devise *
                  </label>
                  <select
                    value={currency}
                    onChange={(e) => setCurrency(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  >
                    <option value="F XOF">F CFA</option>
                    <option value="€ EUR">€ EUR</option>
                    <option value="$ USD">$ USD</option>
                  </select>
                </div>

                {/* Photo */}
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Photo de l'hôtel
                  </label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handlePhotoChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                  />

                  {/* Aperçu de la photo */}
                  {(photoPreview || currentHotel?.photo) && (
                    <div className="mt-3">
                      <p className="text-sm text-gray-600 mb-2">Aperçu:</p>
                      <img
                        src={
                          photoPreview
                            ? photoPreview
                            : currentHotel?.photo
                            ? (currentHotel.photo.startsWith("http")
                                ? currentHotel.photo
                                : `${import.meta.env.VITE_STORAGE_BASE_URL}/${currentHotel.photo}`
                              )
                            : ""
                        }
                        alt="Aperçu"
                        className="w-32 h-32 object-cover rounded-lg border border-gray-300"
                      />
                    </div>
                  )}
                </div>
              </div>

              {/* Boutons d'action */}
              <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
                <button
                  type="button"
                  onClick={handleClosePopup}
                  className="px-6 py-2 border border_gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
                  disabled={loading}
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium flex items-center gap-2"
                >
                  {loading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      {isEditing ? "Mise à jour..." : "Création..."}
                    </>
                  ) : isEditing ? (
                    "Mettre à jour"
                  ) : (
                    "Créer l’hôtel"
                  )}
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
