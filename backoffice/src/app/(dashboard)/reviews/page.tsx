import { Metadata } from "next";
import Reviews from "@/components/Reviews";

export const metadata: Metadata = {
  title: "Gestion des Avis | Wiki.tn Dashboard",
  description: "Modération des avis et notes clients",
};

const ReviewsPage = () => {
  return (
    <Reviews />
  );
};

export default ReviewsPage;
