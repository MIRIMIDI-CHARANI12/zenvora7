import { useState, useRef, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import ChatMessage from "@/components/ChatMessage";
import ChatInput from "@/components/ChatInput";
import WelcomeScreen from "@/components/WelcomeScreen";
import TypingIndicator from "@/components/TypingIndicator";
import { toast } from "sonner";
import { Sparkles, Plus } from "lucide-react";

type Msg = { role: "user" | "assistant"; content: string };

const CHAT_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/gemini-chat`;

async function streamChat({
  messages,
  onDelta,
  onDone,
}: {
  messages: Msg[];
  onDelta: (delta: string) => void;
  onDone: () => void;
}) {
  const resp = await fetch(CHAT_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
    },
    body: JSON.stringify({ messages }),
  });

  if (resp.status === 429) {
    throw new Error("Rate limited. Please wait a moment and try again.");
  }
  if (resp.status === 402) {
    throw new Error("Usage limit reached. Please add credits.");
  }
  if (!resp.ok || !resp.body) throw new Error("Failed to get response");

  const reader = resp.body.getReader();
  const decoder = new TextDecoder();
  let buffer = "";
  let done = false;

  while (!done) {
    const { done: readerDone, value } = await reader.read();
    if (readerDone) break;
    buffer += decoder.decode(value, { stream: true });

    let idx: number;
    while ((idx = buffer.indexOf("\n")) !== -1) {
      let line = buffer.slice(0, idx);
      buffer = buffer.slice(idx + 1);
      if (line.endsWith("\r")) line = line.slice(0, -1);
      if (line.startsWith(":") || line.trim() === "") continue;
      if (!line.startsWith("data: ")) continue;
      const json = line.slice(6).trim();
      if (json === "[DONE]") { done = true; break; }
      try {
        const parsed = JSON.parse(json);
        const content = parsed.choices?.[0]?.delta?.content;
        if (content) onDelta(content);
      } catch {
        buffer = line + "\n" + buffer;
        break;
      }
    }
  }
  onDone();
}

const Index = () => {
  const [messages, setMessages] = useState<Msg[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isStreaming, setIsStreaming] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading]);

  const send = async (input: string) => {
    const userMsg: Msg = { role: "user", content: input };
    const newMessages = [...messages, userMsg];
    setMessages(newMessages);
    setIsLoading(true);
    setIsStreaming(false);

    let assistantSoFar = "";
    const upsert = (chunk: string) => {
      if (!isStreaming) setIsStreaming(true);
      assistantSoFar += chunk;
      setMessages((prev) => {
        const last = prev[prev.length - 1];
        if (last?.role === "assistant") {
          return prev.map((m, i) => (i === prev.length - 1 ? { ...m, content: assistantSoFar } : m));
        }
        return [...prev, { role: "assistant", content: assistantSoFar }];
      });
    };

    try {
      await streamChat({
        messages: newMessages,
        onDelta: upsert,
        onDone: () => { setIsLoading(false); setIsStreaming(false); },
      });
    } catch (e: any) {
      setIsLoading(false);
      setIsStreaming(false);
      toast.error(e.message || "Something went wrong");
    }
  };

  const handleNewChat = () => {
    setMessages([]);
  };

  return (
    <div className="flex h-screen flex-col bg-background">
      {/* Header */}
      <header className="flex items-center justify-between border-b border-border px-6 py-3">
        <div className="flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-primary" />
          <span className="text-lg font-semibold font-display text-foreground">Gemini</span>
        </div>
        <button
          onClick={handleNewChat}
          className="flex items-center gap-2 rounded-xl bg-secondary px-4 py-2 text-sm text-secondary-foreground transition-colors hover:bg-muted"
        >
          <Plus className="h-4 w-4" />
          New chat
        </button>
      </header>

      {/* Chat area */}
      <div className="flex-1 overflow-y-auto scrollbar-thin">
        <div className="mx-auto max-w-3xl">
          {messages.length === 0 ? (
            <WelcomeScreen onSuggestionClick={send} />
          ) : (
            <div className="space-y-1 py-4">
              {messages.map((m, i) => (
                <ChatMessage key={i} role={m.role} content={m.content} />
              ))}
              {isLoading && !isStreaming && <TypingIndicator />}
              <div ref={bottomRef} />
            </div>
          )}
        </div>
      </div>

      {/* Input */}
      <div className="mx-auto w-full max-w-3xl px-4 pb-6 pt-2">
        <ChatInput onSend={send} isLoading={isLoading} />
        <p className="mt-2 text-center text-xs text-muted-foreground">
          Gemini may display inaccurate info. Double-check important responses.
        </p>
      </div>
    </div>
  );
};

export default Index;
