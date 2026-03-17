import { NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth-helpers";
import { exec } from "child_process";

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

  try {
    const result = await new Promise<{ stdout: string; stderr: string }>(
      (resolve, reject) => {
        exec(
          "npx vercel --prod --yes",
          {
            cwd: process.cwd(),
            timeout: 300000, // 5 minuten timeout
            env: { ...process.env, FORCE_COLOR: "0" },
          },
          (error, stdout, stderr) => {
            if (error) {
              reject({ message: error.message, stdout, stderr });
            } else {
              resolve({ stdout, stderr });
            }
          }
        );
      }
    );

    // Extract deployment URL from output
    const urlMatch = result.stdout.match(
      /https:\/\/[^\s]+\.vercel\.app[^\s]*/
    );
    const deployUrl = urlMatch ? urlMatch[0] : null;

    return NextResponse.json({
      success: true,
      url: deployUrl,
      output: result.stdout,
      stderr: result.stderr,
    });
  } catch (err: unknown) {
    const error = err as {
      message?: string;
      stdout?: string;
      stderr?: string;
    };
    return NextResponse.json(
      {
        success: false,
        error: error.message || "Deployment mislukt",
        output: error.stdout || "",
        stderr: error.stderr || "",
      },
      { status: 500 }
    );
  }
}
