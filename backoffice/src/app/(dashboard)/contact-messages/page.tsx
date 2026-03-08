import Breadcrumb from "@/components/Breadcrumbs/Breadcrumb";
import ContactMessagesComponent from "@/components/ContactMessages";
import { Metadata } from "next";

export const metadata: Metadata = {
    title: "Messages de Contact | Wiki Admin",
    description: "Consultation des messages envoyés via le formulaire de contact",
};

const ContactMessagesPage = () => {
    return (
        <>
            <Breadcrumb pageName="Messages Contact" />
            <ContactMessagesComponent />
        </>
    );
};

export default ContactMessagesPage;
