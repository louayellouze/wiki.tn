import {
  LayoutDashboard, Clock, Users,
  Package, ShoppingCart, CreditCard, Layers, Tag, Percent,
  Wrench, Settings2, Star, AlertTriangle, MessageSquare, Image
} from "lucide-react";

export const NAV_DATA = [
  {
    label: "ANALYTIQUE",
    items: [
      { title: "Tableau de Bord",     icon: LayoutDashboard, url: "/",           items: [] },
      { title: "Historique",          icon: Clock,           url: "/historique", items: [] },
      { title: "Utilisateurs",        icon: Users,           url: "/users",      items: [] },
    ],
  },
  {
    label: "CATALOGUE",
    items: [
      { title: "Produits",            icon: Package,         url: "/products",   items: [] },
      { title: "Commandes",           icon: ShoppingCart,    url: "/orders",     items: [] },
      { title: "Paiements",           icon: CreditCard,      url: "/payments",   items: [] },
      { title: "Catégories",          icon: Layers,          url: "/categories", items: [] },
      { title: "Marques",             icon: Tag,             url: "/brands",     items: [] },
      { title: "Coupons",             icon: Percent,         url: "/coupons",    items: [] },
    ],
  },
  {
    label: "SERVICE",
    items: [
      { title: "Demandes Réparation", icon: Wrench,          url: "/repair-requests",  items: [] },
      { title: "Wiki Repair CMS",     icon: Settings2,       url: "/repair",           items: [] },
      { title: "Avis Clients",        icon: Star,            url: "/reviews",          items: [] },
      { title: "Réclamations",        icon: AlertTriangle,   url: "/reclamations",     items: [] },
      { title: "Messages Contact",    icon: MessageSquare,   url: "/contact-messages", items: [] },
      { title: "Bannières Hero",      icon: Image,           url: "/hero-banners",     items: [] },
    ],
  },
];
