"use client";

import dynamic from "next/dynamic";
import Spinner from "@/components/Spinner";

const NederlandKaart = dynamic(() => import("./NederlandKaart"), {
  ssr: false,
  loading: () => (
    <div className="h-[800px] bg-gray-50 rounded-lg border border-gray-200 flex items-center justify-center text-gray-500 text-sm">
      <Spinner label="Kaart laden..." />
    </div>
  ),
});

export default function KaartWrapper() {
  return <NederlandKaart />;
}
