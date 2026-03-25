import { getSessionUser } from "@/process/auth-helpers";
import { stopImpersonation } from "@/process/actions/impersonation";

export default async function ImpersonationBanner() {
  const user = await getSessionUser();

  if (!user?.isImpersonating || !user.realUser) return null;

  return (
    <div className="bg-amber-500 text-white text-sm px-4 py-2 flex items-center justify-center gap-3 relative z-[60]">
      <svg viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4 flex-shrink-0">
        <path d="M10 8a3 3 0 1 0 0-6 3 3 0 0 0 0 6ZM3.465 14.493a1.23 1.23 0 0 0 .41 1.412A9.957 9.957 0 0 0 10 18c2.31 0 4.438-.784 6.131-2.1.43-.333.604-.903.408-1.41a7.002 7.002 0 0 0-13.074.003Z" />
      </svg>
      <span>
        <strong>{user.realUser.naam}</strong> bekijkt de applicatie als{" "}
        <strong>{user.naam}</strong> ({user.role})
      </span>
      <form action={stopImpersonation}>
        <button
          type="submit"
          className="bg-white text-amber-700 px-3 py-0.5 rounded text-xs font-semibold hover:bg-amber-50 transition ml-2"
        >
          Stoppen
        </button>
      </form>
    </div>
  );
}
