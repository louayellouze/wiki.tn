import * as Icons from "../icons";

export const NAV_DATA = [
  {
    label: "MAIN MENU",
    items: [
      {
        title: "Dashboard",
        icon: Icons.HomeIcon,
        items: [
          {
            title: "eCommerce",
            url: "/",
          },
        ],
      },
      {
        title: "Calendar",
        url: "/calendar",
        icon: Icons.Calendar,
        items: [],
      },
      {
        title: "Profile",
        url: "/profile",
        icon: Icons.User,
        items: [],
      },
      {
        title: "Forms",
        icon: Icons.Alphabet,
        items: [
          {
            title: "Form Elements",
            url: "/forms/form-elements",
          },
          {
            title: "Form Layout",
            url: "/forms/form-layout",
          },
        ],
      },
      {
        title: "Produits",
        url: "/products",
        icon: Icons.Table,
        items: [],
      },
      {
        title: "Catégories",
        url: "/categories",
        icon: Icons.Alphabet,
        items: [],
      },
      {
        title: "Spécifications",
        url: "/specifications",
        icon: Icons.FourCircle,
        items: [],
      },
      {
        title: "Bannières Hero",
        url: "/hero-banners",
        icon: Icons.Table,
        items: [],
      },
      {
        title: "Commandes",
        url: "/orders",
        icon: Icons.PieChart,
        items: [],
      },
      {
        title: "Utilisateurs",
        url: "/users",
        icon: Icons.User,
        items: [],
      },
      {
        title: "Historique",
        url: "/historique",
        icon: Icons.Calendar,
        items: [],
      },
      {
        title: "Messages Contact",
        url: "/contact-messages",
        icon: Icons.Mail,
        items: [],
      },
      {
        title: "Pages",
        icon: Icons.Alphabet,
        items: [
          {
            title: "Settings",
            url: "/pages/settings",
          },
        ],
      },
    ],
  },
  {
    label: "OTHERS",
    items: [
      {
        title: "Charts",
        icon: Icons.PieChart,
        items: [
          {
            title: "Basic Chart",
            url: "/charts/basic-chart",
          },
        ],
      },
      {
        title: "UI Elements",
        icon: Icons.FourCircle,
        items: [
          {
            title: "Alerts",
            url: "/ui-elements/alerts",
          },
          {
            title: "Buttons",
            url: "/ui-elements/buttons",
          },
        ],
      },
    ],
  },
];
