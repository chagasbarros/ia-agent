type OllamaResponse = {
    response: string;
};

export async function* callOllama(prompt: string): AsyncGenerator<string, void, unknown> {
    const res = await fetch("http://localhost:11434/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            model: "deepseek-coder:6.7b",
            prompt,
            stream: true
        }),
        cache: "no-store"
    });

    if (!res.ok) {
        throw new Error("Erro ao chamar o modelo");
    }

    if (!res.body) {
        throw new Error("Sem resposta do corpo");
    }

    const reader = res.body.getReader();
    const decoder = new TextDecoder();
    let buffer = '';

    try {
        while (true) {
            const { done, value } = await reader.read();
            if (done) {
                if (buffer.trim()) {
                    try {
                        const json = JSON.parse(buffer);
                        if (json.response) yield json.response;
                    } catch (e) {
                        console.error("Erro no parse do buffer final", e);
                    }
                }
                break;
            }

            const chunk = decoder.decode(value, { stream: true });
            buffer += chunk;

            const lines = buffer.split('\n');
            buffer = lines.pop() || '';

            for (const line of lines) {
                if (!line.trim()) continue;
                try {
                    const json = JSON.parse(line);
                    if (json.response) {
                        yield json.response;
                    }
                    if (json.done) return;
                } catch (e) {
                    console.error("Erro ao fazer parse da linha Ollama", e);
                }
            }
        }
    } finally {
        reader.releaseLock();
    }
}
