import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

export async function POST(req: Request) {
  try {
    const {
      googleId,
      googleSecret,
      facebookId,
      facebookSecret,
      githubId,
      githubSecret,
    } = await req.json();

    // In local development, we can write back to .env.local to persist them across runs and server restarts.
    // For deployment environments (e.g. Vercel, Docker, VPS), these values are read via standard process.env.
    const envPath = path.join(process.cwd(), ".env.local");
    
    let envContent = "";
    if (fs.existsSync(envPath)) {
      envContent = fs.readFileSync(envPath, "utf-8");
    }

    const updates: Record<string, string> = {
      GOOGLE_CLIENT_ID: googleId || "",
      GOOGLE_CLIENT_SECRET: googleSecret || "",
      FACEBOOK_CLIENT_ID: facebookId || "",
      FACEBOOK_CLIENT_SECRET: facebookSecret || "",
      GITHUB_CLIENT_ID: githubId || "",
      GITHUB_CLIENT_SECRET: githubSecret || "",
    };

    const lines = envContent.split("\n");
    
    // Update or add each key
    for (const [key, value] of Object.entries(updates)) {
      const index = lines.findIndex(line => line.startsWith(`${key}=`));
      if (index !== -1) {
        lines[index] = `${key}=${value}`;
      } else {
        lines.push(`${key}=${value}`);
      }
    }

    fs.writeFileSync(envPath, lines.join("\n"), "utf-8");

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Failed to save credentials to environment file:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
