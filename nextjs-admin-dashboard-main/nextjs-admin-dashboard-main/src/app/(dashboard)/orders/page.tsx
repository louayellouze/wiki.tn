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
            <Orders />
        </>
    );
};

export default OrdersPage;
