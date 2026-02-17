import React from "react";
import ProductDetail from "@/components/Products/ProductDetail";
import { Metadata } from "next";

export const metadata: Metadata = {
    title: "Détails du Produit | Admin Dashboard",
    description: "Consulter les informations détaillées du produit",
};

const Page = () => {
    return (
        <div className="p-4 md:p-6 2xl:p-10">
            <ProductDetail />
        </div>
    );
};

export default Page;
