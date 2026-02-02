import { NextResponse } from "next/server";
import { systemPrompt } from "@/agent/systemPrompt";
import { callOllama } from "@/services/ollama";
import { validatePrompt } from "@/lib/validators";

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const userPrompt = validatePrompt(body.prompt);

        const finalPrompt = `
${systemPrompt}

Usuário:
${userPrompt}
`;

        const streamIterator = callOllama(finalPrompt);

        const stream = new ReadableStream({
            async start(controller) {
                for await (const chunk of streamIterator) {
                    controller.enqueue(new TextEncoder().encode(chunk));
                }
                controller.close();
            },
        });

        return new NextResponse(stream, {
            headers: {
                "Content-Type": "text/plain; charset=utf-8",
            },
        });
    } catch (error) {
        return NextResponse.json(
            { error: (error as Error).message },
            { status: 400 }
        );
    }
}
