import Coupons from "@/components/Coupons";
import Breadcrumb from "@/components/Breadcrumbs/Breadcrumb";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Gestion des Coupons | Wiki Admin",
};

export default function CouponsPage() {
  return (
    <div className="mx-auto max-w-7xl">
      <Breadcrumb pageName="Coupons" />
      <Coupons />
    </div>
  );
}
