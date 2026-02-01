import ReactMarkdown from "react-markdown";
import { cn } from "@/lib/utils";

interface MarkdownContentProps {
  content: string;
  className?: string;
}

export function MarkdownContent({ content, className }: MarkdownContentProps) {
  return (
    <div className={cn("prose prose-sm dark:prose-invert max-w-none", className)}>
      <ReactMarkdown
      components={{
        // Customize link rendering
        a: ({ href, children }) => (
          <a
            href={href}
            target="_blank"
            rel="noopener noreferrer"
            className="text-primary hover:underline"
          >
            {children}
          </a>
        ),
        // Spoiler tag support (custom syntax: ||spoiler||)
        p: ({ children }) => {
          if (typeof children === "string") {
            const spoilerRegex = /\|\|(.+?)\|\|/g;
            const parts = children.split(spoilerRegex);
            
            if (parts.length > 1) {
              return (
                <p>
                  {parts.map((part, index) => {
                    if (index % 2 === 1) {
                      return (
                        <span
                          key={index}
                          className="spoiler bg-muted-foreground text-transparent hover:text-foreground hover:bg-transparent transition-all cursor-pointer rounded px-1"
                          title="Click to reveal spoiler"
                          onClick={(e) => {
                            const target = e.currentTarget;
                            target.classList.toggle("text-transparent");
                            target.classList.toggle("text-foreground");
                            target.classList.toggle("bg-muted-foreground");
                            target.classList.toggle("bg-transparent");
                          }}
                        >
                          {part}
                        </span>
                      );
                    }
                    return part;
                  })}
                </p>
              );
            }
          }
          return <p>{children}</p>;
        },
        // Style code blocks
        code: ({ children, className }) => {
          const isInline = !className;
          return isInline ? (
            <code className="bg-muted px-1.5 py-0.5 rounded text-sm font-mono">
              {children}
            </code>
          ) : (
            <code className={cn("block bg-muted p-3 rounded-lg text-sm font-mono overflow-x-auto", className)}>
              {children}
            </code>
          );
        },
        // Style blockquotes
        blockquote: ({ children }) => (
          <blockquote className="border-l-4 border-primary/50 pl-4 italic text-muted-foreground">
            {children}
          </blockquote>
        ),
        // Style lists
        ul: ({ children }) => (
          <ul className="list-disc list-inside space-y-1">{children}</ul>
        ),
        ol: ({ children }) => (
          <ol className="list-decimal list-inside space-y-1">{children}</ol>
        ),
        // Style headings
        h1: ({ children }) => (
          <h1 className="text-xl font-bold mt-4 mb-2">{children}</h1>
        ),
        h2: ({ children }) => (
          <h2 className="text-lg font-bold mt-3 mb-2">{children}</h2>
        ),
        h3: ({ children }) => (
          <h3 className="text-base font-bold mt-2 mb-1">{children}</h3>
        ),
      }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}
