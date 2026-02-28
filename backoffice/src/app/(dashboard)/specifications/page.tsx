import { Metadata } from "next";
import Specifications from "@/components/Specifications";

export const metadata: Metadata = {
    title: "Gestion des Spécifications | Wiki Dashboard",
    description: "Gérez les clés techniques des produits Wiki",
};

const SpecificationsPage = () => {
    return (
        <Specifications />
    );
};

export default SpecificationsPage;
