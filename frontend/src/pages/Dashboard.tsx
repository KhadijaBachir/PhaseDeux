import React, { useEffect, useState } from "react";
import { FiMail, FiUsers, FiLogOut, FiSearch, FiBell, FiMenu, FiX } from "react-icons/fi";
import { BsBuilding, BsFileText, BsHouseDoor } from "react-icons/bs";
import { AiOutlineMessage } from "react-icons/ai";
import { MdOutlineHotel } from "react-icons/md";
import { NavLink, useNavigate } from "react-router-dom";
import axios from "axios";

// Configuration Axios globale
axios.defaults.baseURL = "http://127.0.0.1:8080";
axios.defaults.withCredentials = true;

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

const Dashboard: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [hotels, setHotels] = useState<Hotel[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const navigate = useNavigate();

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
        const res = await axios.get("/api/user", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setUser(res.data);
        localStorage.setItem("user", JSON.stringify(res.data)); // Sauvegarde dans le localStorage
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
      const res = await axios.get("/api/hotels", {
        headers: token ? { Authorization: `Bearer ${token}` } : {}
      });
      setHotels(res.data);
      localStorage.setItem("hotels", JSON.stringify(res.data));
    } catch (err) {
      console.error("Erreur récupération hôtels:", err);
    }
  };

  useEffect(() => {
    const savedHotels = localStorage.getItem("hotels");
    if (savedHotels) {
      setHotels(JSON.parse(savedHotels));
    }
    fetchHotels();
  }, []);

  // Récupérer et mettre en cache la liste des utilisateurs
  const fetchUsers = async () => {
    try {
      const token = localStorage.getItem("auth_token");
      const res = await axios.get("/api/users", {
        headers: token ? { Authorization: `Bearer ${token}` } : {}
      });
      setUsers(res.data);
      localStorage.setItem("all_users", JSON.stringify(res.data));
    } catch (err) {
      console.error("Erreur récupération utilisateurs:", err);
      // Fallback si la requête échoue et que l'utilisateur est connu
      if (user) {
        setUsers([user]);
      }
    }
  };

  useEffect(() => {
    const savedUsers = localStorage.getItem("all_users");
    if (savedUsers) {
      setUsers(JSON.parse(savedUsers));
    }
    fetchUsers();
  }, [user]);

  const handleLogout = () => {
    localStorage.clear(); // Efface toutes les données en cache
    navigate("/login");
  };

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const hotelCount = hotels.length;
  const emailCount = hotels.filter((h) => h.email && h.email.trim() !== '').length;
  const userCount = users.length;

  const cards = [
    { count: "0", label: "Formulaires", icon: <BsFileText size={24} />, color: "bg-purple-500" },
    { count: "0", label: "Messages", icon: <AiOutlineMessage size={24} />, color: "bg-teal-500" },
    { count: userCount.toString(), label: "Utilisateurs", icon: <FiUsers size={24} />, color: "bg-yellow-500" },
    { count: emailCount.toString(), label: "E-mails", icon: <FiMail size={24} />, color: "bg-red-500" },
    { count: hotelCount.toString(), label: "Hôtels", icon: <MdOutlineHotel size={24} />, color: "bg-purple-600" },
    { count: "0", label: "Entités", icon: <BsBuilding size={24} />, color: "bg-blue-500" },
  ];

  const filteredCards = cards.filter((card) =>
    card.label.toLowerCase().includes(searchTerm.toLowerCase())
  );

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
      <aside
        className={`fixed lg:static inset-y-0 left-0 z-50 w-64 text-white flex flex-col transform transition-transform duration-300 ease-in-out lg:translate-x-0 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
        style={{
          backgroundColor: "#1f2022",
          backgroundImage: "url('/befor.svg')",
          backgroundRepeat: "repeat",
          backgroundSize: "cover",
          backgroundBlendMode: "overlay",
          minHeight: "100vh",
        }}
      >
        <div className="flex-1 flex flex-col p-4 bg-[#44474d]">
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
            <h1 className="text-xl font-semibold text-gray-800">Tableau de bord</h1>
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
        
        <div className="bg-white px-4 lg:px-6 py-4 mb-6 border-b">
          <p className="text-gray-600 text-xl lg:text-2xl font-normal">Bienvenue sur RED Product</p>
          <p className="text-gray-600 text-sm lg:text-lg font-normal">Votre gestionnaire d'hôtellerie</p>
        </div>

        <div className="flex-1 px-4 lg:px-6 pb-6 overflow-y-auto">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-6">
            {filteredCards.map((card, index) => (
              <Card key={index} {...card} />
            ))}
          </div>
        </div>
      </main>
    </div>
  );
};

interface CardProps {
  count: string;
  label: string;
  icon: React.ReactNode;
  color: string;
}

const Card: React.FC<CardProps> = ({ count, label, icon, color }) => (
  <div className="bg-white shadow rounded-xl p-5 lg:p-6 flex items-center gap-4 hover:shadow-lg transition-all duration-200">
    <div className={`${color} text-white p-3 lg:p-4 rounded-xl`}>
      {icon}
    </div>
    <div className="flex-1 min-w-0">
      <h3 className="text-2xl lg:text-3xl font-bold text-gray-800 truncate">{count}</h3>
      <p className="text-gray-500 text-sm lg:text-base truncate">{label}</p>
    </div>
  </div>
);

export default Dashboard;