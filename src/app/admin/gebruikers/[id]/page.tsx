import { notFound } from "next/navigation";
import { getUserById, ROLLEN_LABELS, ALL_ROLES } from "@/service/user";
import { getGemeentenForAdmin } from "@/service/gemeente";
import { getLeveranciersForAdmin } from "@/service/leverancier";
import UserEditForm from "./UserEditForm";

export default async function GebruikerDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const isNieuw = id === "nieuw";
  const user = isNieuw ? null : await getUserById(id);
  if (!isNieuw && !user) notFound();

  const [gemeenten, leveranciers] = await Promise.all([
    getGemeentenForAdmin(),
    getLeveranciersForAdmin(),
  ]);

  return (
    <div className="max-w-2xl">
      <h1 className="text-2xl font-bold text-[#1a6ca8] mb-6">
        {isNieuw ? "Gebruiker toevoegen" : user!.naam}
      </h1>

      <UserEditForm
        user={
          user
            ? {
                id: user.id,
                email: user.email,
                naam: user.naam,
                actief: user.actief,
                rollen: user.rollen,
                organisatieId: user.organisatieId,
                leverancierId: user.leverancierId,
              }
            : null
        }
        gemeenten={gemeenten}
        leveranciers={leveranciers}
        rollenLabels={ROLLEN_LABELS}
        alleRollen={ALL_ROLES}
      />
    </div>
  );
}
