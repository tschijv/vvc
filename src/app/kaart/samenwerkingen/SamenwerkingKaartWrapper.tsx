"use client";

import dynamic from "next/dynamic";
import Spinner from "@/ui/components/Spinner";
import type { SamenwerkingKaartItem } from "@/service/samenwerking-kaart";

const SamenwerkingKaart = dynamic(() => import("./SamenwerkingKaart"), {
  ssr: false,
  loading: () => (
    <div className="h-[700px] bg-gray-50 dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700 flex items-center justify-center text-gray-500 text-sm">
      <Spinner label="Kaart laden..." />
    </div>
  ),
});

export default function SamenwerkingKaartWrapper({
  samenwerkingen,
}: {
  samenwerkingen: SamenwerkingKaartItem[];
}) {
  return <SamenwerkingKaart samenwerkingen={samenwerkingen} />;
}
