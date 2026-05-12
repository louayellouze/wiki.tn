import React from "react";
import Breadcrumb from "@/components/Breadcrumbs/Breadcrumb";
import Orders from "@/components/Orders";
import { Metadata } from "next";

export const metadata: Metadata = {
    title: "Gestion des Commandes | Wiki Admin",
    description: "Suivi des ventes et livraisons",
};

const OrdersPage = () => {
    return (
        <>
            <Breadcrumb pageName="Commandes" />
            <React.Suspense fallback={<div className="p-8 text-center">Chargement des commandes...</div>}>
                <Orders />
            </React.Suspense>
        </>
    );
};

export default OrdersPage;
