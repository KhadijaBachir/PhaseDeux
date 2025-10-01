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


interface Message {

  id: number;

  subject: string;

  content: string;

  sender: string;

  date: string;

  read: boolean;

}


interface Form {

  id: number;

  title: string;

  description: string;

  submissions: number;

  lastSubmission: string;

}


const Dashboard: React.FC = () => {

  const [user, setUser] = useState<User | null>(null);

  const [hotels, setHotels] = useState<Hotel[]>([]);

  const [users, setUsers] = useState<User[]>([]);

  const [messages, setMessages] = useState<Message[]>([]);

  const [forms, setForms] = useState<Form[]>([]);

  const [searchTerm, setSearchTerm] = useState("");

  const [sidebarOpen, setSidebarOpen] = useState(false);

  const navigate = useNavigate();


  const getInitials = (name?: string) => {

    if (!name) return "U";

    return name.charAt(0).toUpperCase();

  };


  // ------------------- FETCH USER-------------------

  useEffect(() => {

    const fetchUser = async () => {

      try {

        const token = localStorage.getItem("auth_token");

        if (!token) {

          navigate("/login");

          return;

        }

        

        // Ajout du CSRF cookie comme dans List.tsx

        await axios.get("/sanctum/csrf-cookie");

        

        const res = await axios.get<User>("/api/user", {

          headers: { Authorization: `Bearer ${token}` },

        });

        setUser(res.data);

        console.log("Utilisateur connecté:", res.data);

      } catch (err) {

        console.error("Erreur fetchUser:", err);

        localStorage.removeItem("auth_token");

        localStorage.removeItem("user");

        navigate("/login");

      }

    };


    fetchUser();

  }, [navigate]);


  // Données fictives pour les messages

  const generateMockMessages = (): Message[] => {

    return [

      {

        id: 1,

        subject: "Demande d'information",

        content: "Bonjour, je souhaiterais obtenir plus d'informations sur vos services...",

        sender: "client@example.com",

        date: "2024-01-15",

        read: false

      },

      {

        id: 2,

        subject: "Réservation confirmée",

        content: "Votre réservation a été confirmée avec succès.",

        sender: "reservations@hotel.com",

        date: "2024-01-14",

        read: true

      },

      {

        id: 3,

        subject: "Problème technique",

        content: "Nous rencontrons un problème technique avec le système de réservation...",

        sender: "support@example.com",

        date: "2024-01-13",

        read: false

      },

      {

        id: 4,

        subject: "Newsletter janvier",

        content: "Découvrez nos offres spéciales pour le mois de janvier...",

        sender: "newsletter@company.com",

        date: "2024-01-12",

        read: true

      },

      {

        id: 5,

        subject: "Facture #12345",

        content: "Votre facture du mois de décembre est disponible...",

        sender: "billing@service.com",

        date: "2024-01-11",

        read: true

      }

    ];

  };


  // Données fictives pour les formulaires

  const generateMockForms = (): Form[] => {

    return [

      {

        id: 1,

        title: "Formulaire de contact",

        description: "Formulaire général de prise de contact",

        submissions: 24,

        lastSubmission: "2024-01-15"

      },

      {

        id: 2,

        title: "Demande de réservation",

        description: "Formulaire pour les réservations en ligne",

        submissions: 156,

        lastSubmission: "2024-01-14"

      },

      {

        id: 3,

        title: "Satisfaction client",

        description: "Questionnaire de satisfaction après séjour",

        submissions: 89,

        lastSubmission: "2024-01-13"

      },

      {

        id: 4,

        title: "Demande d'information groupe",

        description: "Formulaire pour les réservations de groupe",

        submissions: 12,

        lastSubmission: "2024-01-12"

      },

      {

        id: 5,

        title: "Candidature emploi",

        description: "Formulaire de dépôt de candidature",

        submissions: 45,

        lastSubmission: "2024-01-11"

      }

    ];

  };


  // ------------------- FETCH HOTELS -------------------

  const fetchHotels = async () => {

    try {

      console.log(" Début du fetchHotels...");

      const token = localStorage.getItem("auth_token");

      let res;


      const timestamp = Date.now();


      if (token) {

        try {

          res = await axios.get<Hotel[]>("/api/user/hotels", {

            headers: { Authorization: `Bearer ${token}` },

            params: { _t: timestamp }

          });

        } catch (err) {

          if (axios.isAxiosError(err) && (err.response?.status === 401 || err.response?.status === 403)) {

            console.warn("Accès non autorisé, utilisation de la route publique");

            res = await axios.get<Hotel[]>("/api/hotels", {

              params: { _t: timestamp }

            });

          } else {

            throw err;

          }

        }

      } else {

        res = await axios.get<Hotel[]>("/api/hotels", {

          params: { _t: timestamp }

        });

      }


      console.log("Hôtels chargés:", res.data);

      setHotels(res.data);

      

    } catch (err) {

      console.error(" Erreur fetchHotels:", err);

      // Fallback avec des données fictives si l'API échoue

      const mockHotels: Hotel[] = [

        {

          id: 1,

          name: "Hôtel Plaza",

          address: "123 Bourguiba",

          email: "contact@plaza.com",

          phone: "+221 77 489 34 56",

          price: "250",

          currency: "EUR",

          photo: null

        },

        {

          id: 2,

          name: "Grand Hotel",

          address: "456 Rue Fass de lorm",

          email: "info@grandhotel.com",

          phone: "+221 77 457 78 57",

          price: "180",

          currency: "EUR",

          photo: null

        },

        {

          id: 3,

          name: "Seaside Resort",

          address: "789 Boulevard Mars",

          email: "reservation@seaside.com",

          phone: "+221 78 568 45 56",

          price: "320",

          currency: "EUR",

          photo: null

        }

      ];

      setHotels(mockHotels);

    }

  };


  useEffect(() => {

    // Charger les données fictives

    setMessages(generateMockMessages());

    setForms(generateMockForms());

    

    // Charger les hôtels

    fetchHotels();

  }, []);


  // ------------------- FETCH USERS -------------------

  const fetchUsers = async () => {

    try {

      const token = localStorage.getItem("auth_token");

      if (!token) {

        console.warn("Token manquant pour fetchUsers");

        return;

      }


      const res = await axios.get<User[]>("/api/users", {

        headers: { Authorization: `Bearer ${token}` }

      });

      setUsers(res.data);

      console.log(" Utilisateurs chargés:", res.data.length);

    } catch (err) {

      console.error(" Erreur récupération utilisateurs:", err);

      // Fallback avec des données fictives si l'API échoue

      const mockUsers: User[] = [

        {

          id: 1,

          name: "Babacar ndiaye",

          email: "babacar@example.com",

          photo: null

        },

        {

          id: 2,

          name: "Maty Ndiaye",

          email: "marty@example.com",

          photo: null

        },

        {

          id: 3,

          name: "Pierre Mendy",

          email: "pierre@example.com",

          photo: null

        },

        {

          id: 4,

          name: "Sophie Diagne",

          email: "sophiediagn@example.com",

          photo: null

        }

      ];

      setUsers(mockUsers);

    }

  };


  useEffect(() => {

    if (user) {

      fetchUsers();

    }

  }, [user]);


  // ------------------- LOGOUT  -------------------

  const handleLogout = () => {

    localStorage.removeItem("auth_token");

    localStorage.removeItem("user");

    navigate("/login");

  };


  const toggleSidebar = () => {

    setSidebarOpen(!sidebarOpen);

  };


  const hotelCount = hotels.length;

  const emailCount = hotels.filter((h) => h.email && h.email.trim() !== '').length;

  const userCount = users.length;

  const messageCount = messages.length;

  const formCount = forms.length;

  const totalSubmissions = forms.reduce((sum, form) => sum + form.submissions, 0);


  const cards = [

    { count: totalSubmissions.toString(), label: "Soumissions formulaires", icon: <BsFileText size={24} />, color: "bg-purple-500" },

    { count: messageCount.toString(), label: "Messages", icon: <AiOutlineMessage size={24} />, color: "bg-teal-500" },

    { count: userCount.toString(), label: "Utilisateurs", icon: <FiUsers size={24} />, color: "bg-yellow-500" },

    { count: emailCount.toString(), label: "E-mails", icon: <FiMail size={24} />, color: "bg-red-500" },

    { count: hotelCount.toString(), label: "Hôtels", icon: <MdOutlineHotel size={24} />, color: "bg-purple-600" },

    { count: formCount.toString(), label: "Formulaires", icon: <BsBuilding size={24} />, color: "bg-blue-500" },

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


          {/* Profil utilisateur */}

          <div className="flex flex-col items-center p-4 rounded-lg mt-4 ">

            <div className="w-12 h-12 rounded-full bg-[#ffa500] flex items-center justify-center text-white font-bold mb-2">

              {getInitials(user?.name)}

            </div>

            <p className="font-medium text-center text-sm">{user?.name || "Utilisateur"}</p>

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

                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs w-4 h-4 flex items-center justify-center rounded-full">

                  {messages.filter(m => !m.read).length}

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

              placeholder="Rechercher..."

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

              Bienvenue sur RED PRODUCT

            </p>

            <p className="text-gray-500 text-sm">Votre gestionnaire d'hôtellerie</p>

          </div>

        </div>


        {/* Erreurs */}

        {!user && (

          <div className="mx-4 lg:mx-6 mb-4 p-4 bg-yellow-50 border border-yellow-200 text-yellow-700 rounded-lg">

            <div className="flex items-center">

              <span className="font-medium">Chargement:</span>

              <span className="ml-2">Récupération des informations utilisateur...</span>

            </div>

          </div>

        )}


        {/* Liste des cartes */}

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