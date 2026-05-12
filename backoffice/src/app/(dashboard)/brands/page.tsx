import Brands from "@/components/Brands";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Gestion des Marques | Wiki.tn",
  description: "Gérez les marques de vos produits",
};

const BrandsPage = () => {
  return <Brands />;
};

export default BrandsPage;
