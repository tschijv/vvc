import { redirect } from "next/navigation";
import { getSessionUser } from "@/lib/auth-helpers";
import Breadcrumbs from "@/components/Breadcrumbs";
import DependencyAnalysis from "./DependencyAnalysis";

export const metadata = { title: "Dependency-analyse" };

export default async function DependenciesPage() {
  const user = await getSessionUser();
  if (!user || user.role !== "ADMIN") redirect("/");

  return (
    <div>
      <Breadcrumbs items={[
        { label: "Beheer", href: "/admin" },
        { label: "Dependency-analyse", href: "/admin/dependencies" },
      ]} />
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-1">Dependency-analyse</h1>
      <p className="text-sm text-gray-500 mb-6">Overzicht van alle npm packages: doel, veiligheid, licenties en grootte.</p>
      <DependencyAnalysis />
    </div>
  );
}
