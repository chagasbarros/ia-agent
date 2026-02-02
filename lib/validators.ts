export function validatePrompt(prompt: unknown): string {
    if (typeof prompt !== "string") {
        throw new Error("Prompt inválido");
    }

    if (prompt.length < 3) {
        throw new Error("Prompt muito curto");
    }

    if (prompt.length > 4000) {
        throw new Error("Prompt muito longo");
    }

    return prompt;
}
