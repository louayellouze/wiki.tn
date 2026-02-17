import Breadcrumb from "@/components/Breadcrumbs/Breadcrumb";
import Products from "@/components/Products";
import { Metadata } from "next";

export const metadata: Metadata = {
    title: "Gestion des Produits | Wiki Admin",
    description: "Page de gestion des produits et spécifications",
};

const ProductsPage = () => {
    return (
        <>
            <Breadcrumb pageName="Produits" />
            <Products />
        </>
    );
};

export default ProductsPage;
