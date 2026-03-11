import { Bot } from "lucide-react";

const TypingIndicator = () => (
  <div className="flex gap-4 px-4 py-6">
    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/20">
      <Bot className="h-4 w-4 text-primary" />
    </div>
    <div className="flex items-center gap-1 pt-2">
      <span className="h-2 w-2 animate-bounce rounded-full bg-muted-foreground [animation-delay:0ms]" />
      <span className="h-2 w-2 animate-bounce rounded-full bg-muted-foreground [animation-delay:150ms]" />
      <span className="h-2 w-2 animate-bounce rounded-full bg-muted-foreground [animation-delay:300ms]" />
    </div>
  </div>
);

export default TypingIndicator;
