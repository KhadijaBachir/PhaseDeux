// src/pages/Dashboard.tsx
import React, { useEffect, useState } from "react";
import { FiLogOut, FiSearch, FiBell } from "react-icons/fi";
import {  BsHouseDoor } from "react-icons/bs";
import { MdOutlineHotel } from "react-icons/md";
import { NavLink } from "react-router-dom";
import axios from "axios";

interface User {
  id: number;
  name: string;
  email: string;
  photo: string | null;
}

const List: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);

  // Obtenir les initiales (au moins la première lettre du prénom)
  const getInitials = (name?: string) => {
    if (!name) return "U";
    return name.charAt(0).toUpperCase();
  };

  // Récupérer l'utilisateur connecté
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

  const handleLogout = () => {
    localStorage.removeItem("auth_token");
    window.location.href = "/login";
  };

  return (
    <div className="flex h-screen font-sans">
      {/* Sidebar */}
      <aside className="w-64 bg-[#2e3034] text-white flex flex-col justify-between p-4">
        <div>
          {/* Logo + Titre */}
          <div className="flex items-center gap-4 mb-8">
            <svg
              width="32"
              height="32"
              viewBox="0 0 32 32"
              xmlns="http://www.w3.org/2000/svg"
            >
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

          {/* Menu */}
          <nav className="space-y-4">
            <NavLink
                to="/dashboard"
                className={({ isActive }) =>
                `flex items-center gap-2 px-3 py-2 rounded transition ${
                    isActive
                    ? "bg-white text-[#2e3034]" // lien actif : bg blanc, texte + icone #2e3034
                    : "text-white hover:bg-gray-700" // lien inactif
                }`
                }
            >
                <BsHouseDoor /> Dashboard
            </NavLink>

            <NavLink
                to="/list"
                className={({ isActive }) =>
                `flex items-center gap-2 px-3 py-2 rounded transition ${
                    isActive
                    ? "bg-white text-[#2e3034]"
                    : "text-white hover:bg-gray-700"
                }`
                }
            >
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
        {/* Top Navbar */}
        <div className="bg-white shadow flex items-center justify-between px-6 py-3">
          <h1 className="text-lg font-semibold">Liste des hôtels</h1>

          <div className="flex items-center gap-5">
            {/* Recherche */}
            <div className="relative">
              <FiSearch className="absolute left-3 top-2.5 text-gray-400" />
              <input
                type="text"
                placeholder="Rechercher..."
                className="pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
              />
            </div>

            {/* Nom utilisateur */}
            <p className="font-medium">{user?.name || "Utilisateur"}</p>

            {/* Avatar avec initiale */}
            <div className="w-9 h-9 rounded-full bg-blue-500 flex items-center justify-center text-white font-bold border">
              {getInitials(user?.name)}
            </div>

            {/* Notifications */}
            <button className="relative text-gray-600 hover:text-gray-800">
              <FiBell size={22} />
              <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs w-4 h-4 flex items-center justify-center rounded-full">
                3
              </span>
            </button>

            {/* Déconnexion */}
            <button
              onClick={handleLogout}
              className="text-red-500 hover:text-red-700"
            >
              <FiLogOut size={22} />
            </button>
          </div>
        </div>

        {/* Dashboard content */}
        <div className="p-8 overflow-y-auto">
          <p className="text-gray-600 mb-8">
            Bienvenue sur RED Product <br />
            Votre gestionnaire d'hotelllerie
          </p>
        </div>
      </main>
    </div>
  );
};


export default List;
