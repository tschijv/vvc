"use client";

import { useRouter } from "next/navigation";
import dynamic from "next/dynamic";
const RichTextEditor = dynamic(() => import("@/components/RichTextEditor"), {
  ssr: false,
  loading: () => <div className="h-48 bg-gray-100 animate-pulse rounded-lg" />,
});
import { updatePagina } from "../actions";

interface PaginaEditorProps {
  slug: string;
  titel: string;
  inhoud: string;
}

export default function PaginaEditor({ slug, titel, inhoud }: PaginaEditorProps) {
  const router = useRouter();

  const terugUrl = slug.startsWith("homepage-") ? "/" : `/info/${slug}`;

  const handleSave = async (newTitel: string, newInhoud: string) => {
    await updatePagina(slug, newTitel, newInhoud);
    router.push(terugUrl);
  };

  const handleCancel = () => {
    router.push(terugUrl);
  };

  return (
    <RichTextEditor
      initialContent={inhoud}
      titel={titel}
      onSave={handleSave}
      onCancel={handleCancel}
    />
  );
}
