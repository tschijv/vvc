import { NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth-helpers";
import { spawn } from "child_process";

export async function POST() {
  // Only allow in development
  if (process.env.NODE_ENV !== "development") {
    return NextResponse.json(
      { error: "Deploy is alleen beschikbaar in development mode" },
      { status: 403 }
    );
  }

  const user = await getSessionUser();
  if (!user || user.role !== "ADMIN") {
    return NextResponse.json({ error: "Niet geautoriseerd" }, { status: 401 });
  }

  const encoder = new TextEncoder();

  const stream = new ReadableStream({
    start(controller) {
      const send = (type: string, data: string) => {
        controller.enqueue(
          encoder.encode(`data: ${JSON.stringify({ type, data })}\n\n`)
        );
      };

      // ── Stap 1: Pre-deploy build check ──
      send("stdout", "🧹 Cache opschonen...\n");

      // Verwijder .next cache om stale pre-render data te voorkomen
      const rimraf = spawn("rm", ["-rf", ".next"], {
        cwd: process.cwd(),
        shell: true,
      });

      rimraf.on("close", () => {
      send("stdout", "⏳ Pre-deploy check: npm run build...\n");

      const buildChild = spawn("npm", ["run", "build"], {
        cwd: process.cwd(),
        env: { ...process.env, FORCE_COLOR: "0", NODE_ENV: "production" },
        shell: true,
      });

      let buildFailed = false;

      buildChild.stdout.on("data", (chunk: Buffer) => {
        send("stdout", chunk.toString());
      });

      buildChild.stderr.on("data", (chunk: Buffer) => {
        const text = chunk.toString();
        send("stderr", text);
        if (text.includes("Failed to compile") || text.includes("Type error")) {
          buildFailed = true;
        }
      });

      buildChild.on("close", (buildCode) => {
        if (buildCode !== 0 || buildFailed) {
          send("stdout", "\n❌ Build mislukt — deploy afgebroken.\n");
          send("stdout", "Los de fouten hierboven op en probeer opnieuw.\n");
          send("done", "1");
          controller.close();
          return;
        }

        send("stdout", "\n✅ Build geslaagd — deploy starten...\n\n");

        // ── Stap 2: Deploy naar Vercel ──
        const child = spawn("npx", ["vercel", "--prod", "--yes"], {
          cwd: process.cwd(),
          env: { ...process.env, FORCE_COLOR: "0" },
          shell: true,
        });

        child.stdout.on("data", (chunk: Buffer) => {
          send("stdout", chunk.toString());
        });

        child.stderr.on("data", (chunk: Buffer) => {
          send("stderr", chunk.toString());
        });

        child.on("close", (code) => {
          send("done", String(code ?? 0));
          controller.close();
        });

        child.on("error", (err) => {
          send("error", err.message);
          controller.close();
        });

        // 5 minuten timeout voor deploy
        setTimeout(() => {
          child.kill();
          send("error", "Timeout na 5 minuten");
          controller.close();
        }, 300000);
      });

      buildChild.on("error", (err) => {
        send("error", `Build fout: ${err.message}`);
        controller.close();
      });

      // 3 minuten timeout voor build
      setTimeout(() => {
        if (!buildFailed) {
          buildChild.kill();
          send("error", "Build timeout na 3 minuten");
          controller.close();
        }
      }, 180000);
      }); // einde rimraf.on("close")
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
