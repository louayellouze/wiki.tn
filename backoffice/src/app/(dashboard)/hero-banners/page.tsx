import Breadcrumb from "@/components/Breadcrumbs/Breadcrumb";
import HeroBanners from "@/components/HeroBanners";
import { Metadata } from "next";

export const metadata: Metadata = {
    title: "Gestion des Bannières Hero | Wiki Admin",
    description: "Page de gestion des bannières publicitaires de la page d'accueil",
};

import { Suspense } from "react";

const HeroBannersPage = () => {
    return (
        <>
            <Breadcrumb pageName="Bannières Hero" />
            <Suspense fallback={<div className="p-8 text-center animate-pulse">Chargement de la console...</div>}>
                <HeroBanners />
            </Suspense>
        </>
    );
};

export default HeroBannersPage;
