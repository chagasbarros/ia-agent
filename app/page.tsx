"use client";

import { useState } from "react";

export default function Page() {
  const [prompt, setPrompt] = useState("");
  const [messages, setMessages] = useState<
    { role: "user" | "assistant"; content: string }[]
  >([
    {
      role: "assistant",
      content: `👋 Olá! Sou seu agente especializado em TypeScript fullstack.

Posso te ajudar com:
• Desenvolvimento de APIs
• React / Next.js
• Backend com Node.js
• Testes
• Arquitetura
• Performance

Como posso te ajudar hoje?`,
    },
  ]);
  const [loading, setLoading] = useState(false);

  async function sendMessage(text?: string) {
    const content = text ?? prompt;
    if (!content.trim()) return;

    setMessages((prev) => [...prev, { role: "user", content }]);
    setPrompt("");
    setLoading(true);

    const res = await fetch("/api/prompt", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ prompt: content }),
    });

    if (!res.ok) {
      const data = await res.json();
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: data.error || "Ocorreu um erro ao processar sua solicitação." },
      ]);
      setLoading(false);
      return;
    }

    if (!res.body) return;

    const reader = res.body.getReader();
    const decoder = new TextDecoder();
    let currentResponse = "";

    setMessages((prev) => [
      ...prev,
      { role: "assistant", content: "" },
    ]);

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      const chunk = decoder.decode(value, { stream: true });
      currentResponse += chunk;

      setMessages((prev) => {
        const newMessages = [...prev];
        const lastMessage = newMessages[newMessages.length - 1];
        if (lastMessage.role === "assistant") {
          lastMessage.content = currentResponse;
        }
        return newMessages;
      });
    }

    setLoading(false);
  }

  return (
    <div className="container">
      <div className="header">
        <h1>
          <span>🚀</span>
          <span>Agente TypeScript Fullstack</span>
        </h1>
        <p>Seu especialista em desenvolvimento TypeScript</p>
      </div>

      <div className="examples">
        <h3>💡 Experimente perguntar:</h3>
        <div className="example-chips">
          <div
            className="example-chip"
            onClick={() =>
              sendMessage("Crie uma API REST para gerenciar usuários com JWT")
            }
          >
            API REST com JWT
          </div>
          <div
            className="example-chip"
            onClick={() =>
              sendMessage(
                "Crie um hook React customizado para debounce em inputs"
              )
            }
          >
            Hook customizado
          </div>
        </div>
      </div>

      <div className="messages">
        {messages.map((msg, i) => (
          <div key={i} className={`message ${msg.role}`}>
            <div className="message-content">{msg.content}</div>
          </div>
        ))}

        {loading && (
          <div className="loading active">
            <div className="spinner"></div>
            <p>Pensando...</p>
          </div>
        )}
      </div>

      <div className="input-area">
        <div className="prompt-input">
          <textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="Digite sua pergunta..."
            rows={2}
          />
          <button onClick={() => sendMessage()} disabled={loading}>
            Enviar
          </button>
        </div>
      </div>
    </div>
  );
}
