import { PaymentsOverview } from "@/components/Charts/payments-overview";
import { StockLevels } from "@/components/Charts/stock-levels";
import { TopOrderedProducts } from "@/components/Charts/top-ordered-products";
import { WeeksProfit } from "@/components/Charts/weeks-profit";
import { FinancePulse } from "@/components/Charts/FinancePulse";
import { TopChannels } from "@/components/Tables/top-channels";
import { TopChannelsSkeleton } from "@/components/Tables/top-channels/skeleton";
import { createTimeFrameExtractor } from "@/utils/timeframe-extractor";
import { Suspense } from "react";
import { ChatsCard } from "./_components/chats-card";
import { OverviewCardsGroup } from "./_components/overview-cards";
import { OverviewCardsSkeleton } from "./_components/overview-cards/skeleton";
import { WelcomeBanner } from "./_components/welcome-banner";
import { QuickActions } from "./_components/quick-actions";
import { AIInsightCard } from "@/components/Charts/ai-insight";
import { RevenueForecast } from "@/components/Charts/revenue-forecast";
import { SystemMonitor } from "@/components/Charts/system-monitor";
import { getUserRole } from "@/services/auth.service";

import { LowStockWidget } from "./_components/low-stock-widget";

import { DraggableDashboard } from "./_components/draggable-dashboard";

type PropsType = {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
};

export default async function Home({ searchParams }: PropsType) {
  const { selected_time_frame } = await searchParams;
  const timeFrame = Array.isArray(selected_time_frame) ? selected_time_frame[0] : selected_time_frame;
  const extractTimeFrame = createTimeFrameExtractor(timeFrame);
  
  const widgets = {
    "payments": {
      label: "Vue d'ensemble Paiements",
      component: (
        <PaymentsOverview
          key={extractTimeFrame("payments_overview")}
          timeFrame={extractTimeFrame("payments_overview")?.split(":")[1]}
        />
      )
    },
    "low-stock": {
      label: "Alerte Stock Bas",
      component: <LowStockWidget />
    },
    "ai-insight": {
      label: "Insights IA",
      component: <AIInsightCard />
    },
    "system-monitor": {
      label: "Moniteur Système",
      component: <SystemMonitor />
    },
    "forecast": {
      label: "Prévision Revenus",
      component: <RevenueForecast />
    },
    "pulse": {
      label: "Finance Pulse",
      component: <FinancePulse value={78} />
    },
    "profit": {
      label: "Profit Hebdomadaire",
      component: (
        <WeeksProfit
          key={extractTimeFrame("weeks_profit")}
          timeFrame={extractTimeFrame("weeks_profit")?.split(":")[1]}
        />
      )
    },
    "stock-levels": {
      label: "Niveaux de Stock",
      component: <StockLevels />
    },
    "top-products": {
      label: "Top Produits",
      component: <TopOrderedProducts />
    },
    "channels": {
      label: "Canaux de Vente",
      component: (
        <Suspense fallback={<TopChannelsSkeleton />}>
          <div className="glass-premium rounded-2xl p-6 h-full">
              <TopChannels />
          </div>
        </Suspense>
      )
    },
    "chats": {
      label: "Messages & Chats",
      component: (
        <Suspense fallback={null}>
          <ChatsCard />
        </Suspense>
      )
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <WelcomeBanner />

      <Suspense fallback={<OverviewCardsSkeleton />}>
        <OverviewCardsGroup />
      </Suspense>

      <DraggableDashboard children={widgets} />

      <QuickActions />
    </div>
  );
}
