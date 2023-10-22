import { NextResponse } from "next/server";
import { z } from "zod";
import { loadGithubIntoPinecone } from "@/lib/pinecone";
import { generateDocumentation } from "@/lib/chat";

const bodyParser = z.object({
  githubUrl: z.string().url(),
  spaceId: z.string(),
});

export async function POST(req: Request, res: Response) {
  try {
    const body = await req.json();
    const { githubUrl, spaceId } = await bodyParser.parseAsync(body);
    if (!githubUrl.includes("https://github.com")) {
      return NextResponse.json({ error: "Invalid Github URL" });
    }
    const projectName = await loadGithubIntoPinecone(githubUrl);
    const documentation = await generateDocumentation(projectName, githubUrl);
    console.log("generated documentation", documentation);
    return NextResponse.json({ documentation });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.issues });
    } else {
      return NextResponse.json("Something went wrong!");
    }
  }
}

export async function OPTIONS() {
  try {
    return new Response("", {
      status: 200,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Content-Type": "application/json",
      },
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json("Something went wrong!");
  }
}
