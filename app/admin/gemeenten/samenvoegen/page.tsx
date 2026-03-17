import { redirect } from "next/navigation";
import { getSessionUser } from "@/lib/auth-helpers";
import { getGemeentenForAdmin } from "@/lib/services/gemeente";
import MergeForm from "./MergeForm";

export default async function SamenVoegenPage() {
  const user = await getSessionUser();
  if (!user || user.role !== "ADMIN") {
    redirect("/");
  }

  const gemeenten = await getGemeentenForAdmin();

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-2">
        Gemeente samenvoegen
      </h1>
      <p className="text-sm text-gray-500 mb-6">
        Voeg twee gemeenten samen bij een herindeling. Alle gebruikers,
        pakketten, koppelingen en samenwerkingen van de brongemeente worden
        overgenomen door de doelgemeente. De brongemeente wordt daarna
        verwijderd.
      </p>

      <MergeForm gemeenten={gemeenten} />
    </div>
  );
}
