import { NextResponse } from "next/server";
import { z } from "zod";
import { ask } from "@/lib/chat";

// export const runtime = "edge";

const bodyParser = z.object({
  spaceId: z.string(),
  question: z.string(),
});

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { spaceId, question } = await bodyParser.parseAsync(body);
    const response = await fetch(process.env.REDIS_URL!);
    const data = (await response.json()) as { result: string };
    if (!data.result) {
      return NextResponse.json({ error: "Invalid spaceId" });
    }
    const projectName = data.result;
    const answer = await ask(question, projectName);
    return NextResponse.json({ answer });
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
