import { redirect } from "next/navigation";
import { getSessionUser } from "@/lib/auth-helpers";
import { prisma } from "@/lib/prisma";

interface Props {
  searchParams: Promise<{ tab?: string; gemeenteId?: string }>;
}

export default async function DashboardRedirect({ searchParams }: Props) {
  const params = await searchParams;
  const user = await getSessionUser();

  if (!user) redirect("/auth/login?callbackUrl=/dashboard");

  // If gemeenteId provided, redirect there
  if (params.gemeenteId) {
    const tab = params.tab || "dashboard";
    redirect(`/gemeenten/${params.gemeenteId}?tab=${tab}`);
  }

  // For GEMEENTE users, find their gemeente
  if (user.role === "GEMEENTE" && user.gemeenteId) {
    const tab = params.tab || "dashboard";
    redirect(`/gemeenten/${user.gemeenteId}?tab=${tab}`);
  }

  // For ADMIN, redirect to first gemeente or gemeenten list
  if (user.role === "ADMIN") {
    const first = await prisma.gemeente.findFirst({ orderBy: { naam: "asc" } });
    if (first) {
      const tab = params.tab || "dashboard";
      redirect(`/gemeenten/${first.id}?tab=${tab}`);
    }
  }

  // For LEVERANCIER
  if (user.role === "LEVERANCIER") redirect("/leveranciers");

  redirect("/gemeenten");
}
