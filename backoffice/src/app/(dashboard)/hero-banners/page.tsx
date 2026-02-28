import Breadcrumb from "@/components/Breadcrumbs/Breadcrumb";
import HeroBanners from "@/components/HeroBanners";
import { Metadata } from "next";

export const metadata: Metadata = {
    title: "Gestion des Bannières Hero | Wiki Admin",
    description: "Page de gestion des bannières publicitaires de la page d'accueil",
};

const HeroBannersPage = () => {
    return (
        <>
            <Breadcrumb pageName="Bannières Hero" />
            <HeroBanners />
        </>
    );
};

export default HeroBannersPage;
