import { NextRequest, NextResponse } from "next/server";
import { spawn } from "child_process";
import { auth } from "@/process/auth";

export async function POST(request: NextRequest) {
  const session = await auth();
  if (!session?.user || (session.user as { role?: string }).role !== "ADMIN") {
    return NextResponse.json({ error: "Niet geautoriseerd" }, { status: 401 });
  }

  const type = new URL(request.url).searchParams.get("type") || "unit";
  const encoder = new TextEncoder();

  const stream = new ReadableStream({
    start(controller) {
      const send = (type: string, data: string, summary?: string) => {
        const payload = summary
          ? JSON.stringify({ type, data, summary })
          : JSON.stringify({ type, data });
        controller.enqueue(encoder.encode(`data: ${payload}\n\n`));
      };

      const cmd = type === "e2e"
        ? { bin: "npx", args: ["playwright", "test", "--reporter=line"] }
        : { bin: "npx", args: ["vitest", "run", "--reporter=verbose"] };

      send("stdout", `$ ${cmd.bin} ${cmd.args.join(" ")}\n`);

      const cwd = process.cwd();
      const child = spawn(cmd.bin, cmd.args, {
        cwd,
        env: { ...process.env, FORCE_COLOR: "0", CI: "true" },
        shell: true,
      });

      child.stdout?.on("data", (data: Buffer) => {
        send("stdout", data.toString());
      });

      child.stderr?.on("data", (data: Buffer) => {
        send("stderr", data.toString());
      });

      child.on("close", (code) => {
        const success = code === 0;
        send("done", success ? "success" : "failed", `exit code ${code}`);
        try { controller.close(); } catch {}
      });

      child.on("error", (err) => {
        send("error", `Proces fout: ${err.message}`);
        send("done", "failed");
        try { controller.close(); } catch {}
      });

      // Timeout na 5 minuten
      setTimeout(() => {
        child.kill();
        send("error", "Timeout: tests duurden langer dan 5 minuten");
        send("done", "failed", "timeout");
        try { controller.close(); } catch {}
      }, 300_000);
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
    },
  });
}
