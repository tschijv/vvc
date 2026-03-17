"use client";

import { useRouter } from "next/navigation";
import RichTextEditor from "@/components/RichTextEditor";
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
