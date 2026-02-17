import Breadcrumb from "@/components/Breadcrumbs/Breadcrumb";
import Users from "@/components/Users";
import { Metadata } from "next";

export const metadata: Metadata = {
    title: "Gestion des Utilisateurs | Wiki Admin",
    description: "Gérez les accès et les rôles administrateurs",
};

const UsersPage = () => {
    return (
        <>
            <Breadcrumb pageName="Utilisateurs" />
            <Users />
        </>
    );
};

export default UsersPage;
