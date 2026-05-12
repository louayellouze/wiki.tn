import Breadcrumb from "@/components/Breadcrumbs/Breadcrumb";
import HistoriqueComponent from "@/components/Historique";
import { Metadata } from "next";

export const metadata: Metadata = {
    title: "Historique d'Audit | Wiki Admin",
    description: "Suivi des activités administrateur",
};

const HistoriquePage = () => {
    return (
        <>
            <Breadcrumb pageName="Historique" />
            <HistoriqueComponent />
        </>
    );
};

export default HistoriquePage;
