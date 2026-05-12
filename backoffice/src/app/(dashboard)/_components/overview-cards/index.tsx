import { compactFormat } from "@/lib/format-number";
import { getOverviewData } from "../../fetch";
import { OverviewCard } from "./card";
import * as icons from "./icons";

export async function OverviewCardsGroup() {
  const { repairs, profit, products, users, payments } = await getOverviewData();

  return (
    <div className="grid gap-4 sm:grid-cols-2 sm:gap-6 xl:grid-cols-5 2xl:gap-7.5">
      <OverviewCard
        label="Demandes Réparations"
        data={{
          ...repairs,
          value: compactFormat(repairs.value),
        }}
        Icon={icons.Repairs}
      />

      <OverviewCard
        label="Total Profit"
        data={{
          ...profit,
          value: compactFormat(profit.value) + " DT",
        }}
        Icon={icons.Profit}
      />

      <OverviewCard
        label="Total Products"
        data={{
          ...products,
          value: compactFormat(products.value),
        }}
        Icon={icons.Product}
      />

      <OverviewCard
        label="Total Users"
        data={{
          ...users,
          value: compactFormat(users.value),
        }}
        Icon={icons.Users}
      />

      <OverviewCard
        label="Total Paiements"
        data={{
          ...payments,
          value: compactFormat(payments.value) + " DT",
        }}
        Icon={icons.Payments}
      />
    </div>
  );
}
