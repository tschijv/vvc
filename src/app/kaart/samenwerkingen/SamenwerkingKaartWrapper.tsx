"use client";

import dynamic from "next/dynamic";
import Spinner from "@/ui/components/Spinner";
import type { SamenwerkingKaartData } from "@/service/samenwerking-kaart";

const SamenwerkingKaart = dynamic(() => import("./SamenwerkingKaart"), {
  ssr: false,
  loading: () => (
    <div className="flex flex-col lg:flex-row gap-4">
      <div className="flex-1 min-w-0">
        <div className="h-[700px] bg-gray-50 dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700 flex items-center justify-center text-gray-500 text-sm">
          <Spinner label="Kaart laden..." />
        </div>
      </div>
      <div className="w-full lg:w-80 xl:w-96 shrink-0">
        <div className="h-[700px] bg-gray-50 dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700 animate-pulse" />
      </div>
    </div>
  ),
});

export default function SamenwerkingKaartWrapper({
  samenwerkingen,
}: {
  samenwerkingen: SamenwerkingKaartData[];
}) {
  return <SamenwerkingKaart samenwerkingen={samenwerkingen} />;
}
