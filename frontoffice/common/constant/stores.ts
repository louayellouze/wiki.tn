export interface Store {
    id: number;
    name: string;
    displayName: string;
    address: string;
    phones: string[];
    hours: string[];
    mapQuery: string;
}

export const STORES: Store[] = [
    {
        id: 1,
        name: "wiki-ariana",
        displayName: "Wiki Ariana",
        address: "5 & 7 Espace Forum à côté de la porte de sortie Magasin Général, Ariana 2080",
        phones: ["29 714 921"],
        hours: [
            "Du Lundi au Vendredi : 9:00 am - 6:00 pm",
            "Samedi : 9:00 am - 4:00 pm"
        ],
        mapQuery: "Wiki Ariana 5 & 7 Espace Forum"
    },
    {
        id: 2,
        name: "wiki-mjez-el-bab",
        displayName: "Wiki Mjez el Bab",
        address: "Avenue Habib Bourguiba cité Amal à côté de magasin aziza Argoub mjez beb",
        phones: ["28 540 487", "28 540 488"],
        hours: ["Du lundi au Samedi : 9:00 am - 7:00 pm"],
        mapQuery: "Wiki Mjez el Bab Avenue Habib Bourguiba"
    },
    {
        id: 3,
        name: "wiki-yasminette",
        displayName: "Wiki Yasminette",
        address: "À côté Magasin Aziza Yasminette Ben Arous",
        phones: ["28 540 486", "28 540 406"],
        hours: ["Du Lundi au Dimanche : 8:00 am - 8:00 pm"],
        mapQuery: "Wiki Yasminette Ben Arous"
    },
    {
        id: 4,
        name: "wiki-gabes",
        displayName: "Wiki Gabès",
        address: "Avenue de la République en face de la CNSS",
        phones: ["58 522 540", "58 522 541"],
        hours: ["Du Lundi au Samedi : 9:00 am - 7:00 pm"],
        mapQuery: "Wiki Gabès Avenue de la République"
    },
    {
        id: 5,
        name: "wiki-monastir",
        displayName: "Wiki Monastir",
        address: "Route de Khniss, Cité El Basatine - CP 5089 Monastir",
        phones: ["58 313 183"],
        hours: ["Du Lundi au Samedi : 9:00 am - 6:00 pm"],
        mapQuery: "Wiki Monastir Route de Khniss"
    },
    {
        id: 6,
        name: "wiki-sfax-5-aout",
        displayName: "Wiki Sfax 5 Août",
        address: "Avenue Baghdad, 5 Août imm. Salem Abid - CP 3002 Sfax",
        phones: ["58 423 738", "58 423 739"],
        hours: ["Du lundi au Samedi : 9:00 am - 7:00 pm"],
        mapQuery: "Wiki Sfax 5 Août Avenue Baghdad"
    },
    {
        id: 7,
        name: "wiki-sousse-trocadero",
        displayName: "Wiki Sousse Trocadéro",
        address: "148, Rue Victor Hugo - CP 4000 Sousse",
        phones: ["58 313 180", "58 313 181"],
        hours: ["Du lundi au Samedi : 9:00 am - 7:00 pm"],
        mapQuery: "Wiki Sousse Trocadéro"
    },
    {
        id: 8,
        name: "wiki-kef",
        displayName: "Wiki Kef",
        address: "Av. Mongi Slim, en face du Kiosque Agil - CP 7100 Kef",
        phones: ["29 666 720", "58 522 465"],
        hours: ["Du lundi au Samedi : 9:00 am - 6:00 pm"],
        mapQuery: "Wiki Kef Av. Mongi Slim"
    },
    {
        id: 9,
        name: "wiki-kairouan",
        displayName: "Wiki Kairouan",
        address: "Av. Habib Thameur, à 50m de Tunisie Télécom - CP 3100 Kairouan",
        phones: ["28 540 427"],
        hours: ["Du lundi au Samedi : 9:00 am - 6:00 pm"],
        mapQuery: "Wiki Kairouan Av. Habib Thameur"
    },
    {
        id: 10,
        name: "wiki-beja",
        displayName: "Wiki Béja",
        address: "16, Rue Hassen Ibn Noomen à 200m de la Municipalité de Béja",
        phones: ["25 500 807", "28 540 482"],
        hours: ["Du Lundi au Samedi : 9:00 am - 6:00 pm"],
        mapQuery: "Wiki Béja 16 Rue Hassen Ibn Noomen"
    },
    {
        id: 11,
        name: "wiki-menzel-bouzelfa",
        displayName: "Wiki Menzel Bouzelfa",
        address: "24 Av. Taieb Mhiri Menzel Bouzelfa",
        phones: [],
        hours: [
            "Du lundi au Vendredi : 9:00 am - 6:00 pm",
            "Samedi : 9:00 am - 4:00 pm"
        ],
        mapQuery: "Wiki Menzel Bouzelfa Av. Taieb Mhiri"
    },
    {
        id: 12,
        name: "wiki-kelibia",
        displayName: "Wiki Kélibia",
        address: "15, Rue Ezzouhour à 50m de Recette des Finances - CP 8090 Kélibia",
        phones: ["21 650 943", "28 540 404"],
        hours: [
            "Du lundi au vendredi : 9:00 am - 6:00 pm",
            "Samedi : 9:00 am - 4:00 pm"
        ],
        mapQuery: "Wiki Kélibia 15 Rue Ezzouhour"
    },
    {
        id: 13,
        name: "wiki-hammem-lif",
        displayName: "Wiki Hammem Lif",
        address: "Rue Antony N°24, à côté de l'Ecole Primaire Antony - CP 2050 Ben Arous, Tunis",
        phones: ["28 540 485", "58 313 182"],
        hours: [
            "Du Lundi au Vendredi : 9:00 am - 7:00 pm",
            "Samedi : 9:00 am - 5:00 pm"
        ],
        mapQuery: "Wiki Hammem Lif Rue Antony"
    },
    {
        id: 14,
        name: "wiki-mourouj",
        displayName: "Wiki Mourouj",
        address: "18, Rue des Martyrs devant Station Métro Mourouj 1 - CP 2059 Ben arous, Tunis",
        phones: ["25 500 805"],
        hours: ["Du Lundi au Samedi : 9:00 am - 6:00 pm"],
        mapQuery: "Wiki Mourouj 18 Rue des Martyrs"
    },
    {
        id: 15,
        name: "wiki-montplaisir",
        displayName: "Wiki Montplaisir",
        address: "Av. du Japon Imm. Safsaf à 300m de l'hôtel du Parc de l'Espérance - CP 1073 Tunis",
        phones: ["28 540 484", "58 420 137"],
        hours: [
            "Du Lundi au vendredi : 8:00 am - 5:00 pm",
            "Samedi : 8:00 am - 1:30 pm"
        ],
        mapQuery: "Wiki Montplaisir Av. du Japon"
    },
    {
        id: 16,
        name: "wiki-charguia",
        displayName: "Wiki Charguia",
        address: "Rue 8609, Derrière la Foire de Charguia - CP 8609 Tunis",
        phones: ["29 406 150", "22 206 004"],
        hours: [
            "Lundi au Vendredi : 9:00 am - 6:00 pm",
            "Samedi : 9:00 am - 1:30 pm"
        ],
        mapQuery: "Wiki Charguia Rue 8609"
    }
];
