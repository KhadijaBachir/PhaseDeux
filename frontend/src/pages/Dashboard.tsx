// src/pages/Dashboard.tsx
import React, { useEffect, useState } from "react";
import { FiMail, FiUsers, FiLogOut, FiSearch, FiBell } from "react-icons/fi";
import { BsBuilding, BsFileText, BsHouseDoor } from "react-icons/bs";
import { AiOutlineMessage } from "react-icons/ai";
import { MdOutlineHotel } from "react-icons/md";
import { NavLink, useNavigate } from "react-router-dom";
import axios from "axios";

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
  const navigate = useNavigate();

  // Initiales
  const getInitials = (name?: string) => {
    if (!name) return "U";
    return name.charAt(0).toUpperCase();
  };

  // Récupérer user connecté
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const token = localStorage.getItem("auth_token");
        if (!token) return;
        const res = await axios.get("http://127.0.0.1:8080/api/user", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setUser(res.data);
      } catch (err) {
        console.error("Erreur récupération user:", err);
      }
    };
    fetchUser();
  }, []);

  // Récupérer tous les hôtels
  useEffect(() => {
    const fetchHotels = async () => {
      try {
        const res = await axios.get("http://127.0.0.1:8080/api/hotels");
        setHotels(res.data);
      } catch (err) {
        console.error("Erreur récupération hôtels:", err);
      }
    };
    fetchHotels();
  }, []);

  // Récupérer tous les utilisateurs
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const res = await axios.get("http://127.0.0.1:8080/api/users"); // adapte si ton backend est différent
        setUsers(res.data);
      } catch (err) {
        console.error("Erreur récupération utilisateurs:", err);
      }
    };
    fetchUsers();
  }, []);

  // Déconnexion
  const handleLogout = () => {
    localStorage.removeItem("auth_token");
    window.location.href = "/login";
  };

  // Compteurs dynamiques
  const hotelCount = hotels.length;
  const emailCount = hotels.filter((h) => h.email).length;
  const userCount = users.length;

  // Cartes disponibles
  const cards = [
    { count: "0", label: "Formulaires", icon: <BsFileText size={28} />, color: "bg-purple-500" },
    { count: "0", label: "Messages", icon: <AiOutlineMessage size={28} />, color: "bg-teal-500" },
    { count: userCount.toString(), label: "Utilisateurs", icon: <FiUsers size={28} />, color: "bg-yellow-500" },
    { count: emailCount.toString(), label: "E-mails", icon: <FiMail size={28} />, color: "bg-red-500" },
    { count: hotelCount.toString(), label: "Hôtels", icon: <MdOutlineHotel size={28} />, color: "bg-purple-600" },
    { count: "0", label: "Entités", icon: <BsBuilding size={28} />, color: "bg-blue-500" },
  ];

  // Filtrer avec la recherche
  const filteredCards = cards.filter((card) =>
    card.label.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="flex h-screen font-sans">
      {/* Sidebar */}
      <aside className="w-64 bg-[#2e3034] text-white flex flex-col justify-between p-4">
        <div>
          {/* Logo cliquable */}
          <div
            className="flex items-center gap-4 mb-8 cursor-pointer"
            onClick={() => navigate("/login")}
          >
            <svg width="32" height="32" viewBox="0 0 32 32">
              <path d="M2.66602 2.66624H29.3286V29.3288L2.66602 2.66624Z" fill="white" />
              <path d="M2.66602 2.66624H22.663L15.9973 15.9975L2.66602 2.66624Z" fill="black" fillOpacity="0.15" />
              <path d="M2.66602 2.66624H15.9973L2.66602 29.3288V2.66624Z" fill="white" />
            </svg>
            <h2 className="text-lg font-semibold">RED PRODUCT</h2>
          </div>

          {/* Menu */}
          <nav className="space-y-4">
            <NavLink to="/dashboard" className={({ isActive }) =>
              `flex items-center gap-2 px-3 py-2 rounded transition ${
                isActive ? "bg-white text-[#2e3034]" : "text-white hover:bg-gray-700"
              }`
            }>
              <BsHouseDoor /> Dashboard
            </NavLink>
            <NavLink to="/list" className={({ isActive }) =>
              `flex items-center gap-2 px-3 py-2 rounded transition ${
                isActive ? "bg-white text-[#2e3034]" : "text-white hover:bg-gray-700"
              }`
            }>
              <MdOutlineHotel /> Liste des hôtels
            </NavLink>
          </nav>
        </div>

        {/* User profil */}
        <div className="flex flex-col items-center p-3 rounded">
          <div className="w-10 h-10 rounded-full bg-blue-500 flex items-center justify-center mb-2 text-white font-bold">
            {getInitials(user?.name)}
          </div>
          <p className="font-medium">{user?.name || "Utilisateur"}</p>
          <p className="text-sm text-green-400">En ligne</p>
        </div>
      </aside>

      {/* Contenu principal */}
      <main className="flex-1 bg-gray-100 flex flex-col">
        {/* Navbar */}
        <div className="bg-white shadow flex items-center justify-between px-6 py-3">
          <h1 className="text-lg font-semibold">Dashboard</h1>
          <div className="flex items-center gap-5">
            <div className="relative">
              <FiSearch className="absolute left-3 top-2.5 text-gray-400" />
              <input
                type="text"
                placeholder="Rechercher..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
              />
            </div>
            <p className="font-medium">{user?.name || "Utilisateur"}</p>
            <div className="w-9 h-9 rounded-full bg-blue-500 flex items-center justify-center text-white font-bold border">
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

        {/* Bienvenue */}
        <div className="bg-white px-6 py-3 mb-8 border-t-2 border-gray-100">
          <p className="text-gray-600 text-2xl font-normal">Bienvenue sur RED Product</p>
          <p className="text-gray-600 text-lg font-normal">Votre gestionnaire d'hôtellerie</p>
        </div>

        {/* Cartes dynamiques */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 px-6">
          {filteredCards.map((card, index) => (
            <Card key={index} {...card} />
          ))}
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
  <div className="bg-white shadow rounded p-5 flex items-center gap-4">
    <div className={`${color} text-white p-3 rounded-full`}>{icon}</div>
    <div>
      <h3 className="text-xl font-bold">{count}</h3>
      <p className="text-gray-500">{label}</p>
    </div>
  </div>
);

export default Dashboard;
