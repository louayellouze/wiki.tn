import * as Icons from "../icons";

export const NAV_DATA = [
  {
    label: "ANALYTIQUE",
    items: [
      { title: "Tableau de Bord",     icon: Icons.HomeIcon,    url: "/",           items: [] },
      { title: "Historique",          icon: Icons.Calendar,    url: "/historique", items: [] },
      { title: "Utilisateurs",        icon: Icons.User,        url: "/users",      items: [] },
    ],
  },
  {
    label: "CATALOGUE",
    items: [
      { title: "Produits",            icon: Icons.Table,       url: "/products",         items: [] },
      { title: "Commandes",           icon: Icons.PieChart,    url: "/orders",           items: [] },
      { title: "Paiements",           icon: Icons.PieChart,    url: "/payments",         items: [] },
      { title: "Catégories",          icon: Icons.Alphabet,    url: "/categories",       items: [] },
      { title: "Marques",             icon: Icons.Table,       url: "/brands",           items: [] },
      { title: "Coupons",             icon: Icons.PieChart,    url: "/coupons",          items: [] },
    ],
  },
  {
    label: "SERVICE",
    items: [
      { title: "Demandes Réparation", icon: Icons.Mail,        url: "/repair-requests",  items: [] },
      { title: "Wiki Repair CMS",     icon: Icons.Alphabet,    url: "/repair",           items: [] },
      { title: "Avis Clients",        icon: Icons.Chat,        url: "/reviews",          items: [] },
      { title: "Réclamations",        icon: Icons.Mail,        url: "/reclamations",     items: [] },
      { title: "Messages Contact",    icon: Icons.Mail,        url: "/contact-messages", items: [] },
      { title: "Bannières Hero",      icon: Icons.Table,       url: "/hero-banners",     items: [] },
    ],
  },
];
