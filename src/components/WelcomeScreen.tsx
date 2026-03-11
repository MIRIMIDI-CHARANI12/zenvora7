import { Sparkles, Code, Lightbulb, PenTool } from "lucide-react";

const suggestions = [
  { icon: Lightbulb, text: "Explain quantum computing in simple terms" },
  { icon: Code, text: "Write a Python function to sort a list" },
  { icon: PenTool, text: "Help me write a professional email" },
  { icon: Sparkles, text: "What are the latest AI trends?" },
];

interface WelcomeScreenProps {
  onSuggestionClick: (text: string) => void;
}

const WelcomeScreen = ({ onSuggestionClick }: WelcomeScreenProps) => {
  return (
    <div className="flex flex-1 flex-col items-center justify-center px-4">
      <div className="mb-3 flex h-16 w-16 items-center justify-center rounded-full bg-primary/15">
        <Sparkles className="h-8 w-8 text-primary" />
      </div>
      <h1 className="mb-2 text-3xl font-semibold text-foreground font-display">
        Hello there
      </h1>
      <p className="mb-10 text-muted-foreground">
        How can I help you today?
      </p>
      <div className="grid w-full max-w-2xl grid-cols-1 gap-3 sm:grid-cols-2">
        {suggestions.map((s, i) => (
          <button
            key={i}
            onClick={() => onSuggestionClick(s.text)}
            className="flex items-start gap-3 rounded-xl border border-border bg-card p-4 text-left text-sm text-secondary-foreground transition-colors hover:bg-secondary"
          >
            <s.icon className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
            <span>{s.text}</span>
          </button>
        ))}
      </div>
    </div>
  );
};

export default WelcomeScreen;
