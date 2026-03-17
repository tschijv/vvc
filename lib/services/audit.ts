import { prisma } from "@/lib/prisma";

export async function logAudit(params: {
  userId?: string;
  userEmail?: string;
  actie: string;
  entiteit: string;
  entiteitId?: string;
  details?: string;
  ipAdres?: string;
}) {
  try {
    await prisma.auditLog.create({ data: params });
  } catch {
    // Audit logging should never break the application
    console.error("[audit] Failed to write audit log", params.actie, params.entiteit);
  }
}

export async function getAuditLogs(options?: {
  skip?: number;
  take?: number;
  entiteit?: string;
  userId?: string;
}) {
  const { skip = 0, take = 50, entiteit, userId } = options || {};

  const where: Record<string, unknown> = {};
  if (entiteit) where.entiteit = entiteit;
  if (userId) where.userId = userId;

  const [logs, total] = await Promise.all([
    prisma.auditLog.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip,
      take,
    }),
    prisma.auditLog.count({ where }),
  ]);

  return { logs, total };
}
