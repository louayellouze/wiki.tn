import Breadcrumb from "@/components/Breadcrumbs/Breadcrumb";
import Categories from "@/components/Categories";
import { Metadata } from "next";

export const metadata: Metadata = {
    title: "Gestion des Catégories | Wiki Admin",
    description: "Gérez la hiérarchie de vos produits",
};

const CategoriesPage = () => {
    return (
        <>
            <Breadcrumb pageName="Catégories" />
            <Categories />
        </>
    );
};

export default CategoriesPage;
