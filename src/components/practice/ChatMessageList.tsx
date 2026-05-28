"use client";

import { useI18n } from "@/components/i18n/LocaleProvider";
import type { Message } from "@/lib/types";
import { cn } from "@/lib/utils";

export function isBriefingMessage(content: string): boolean {
  return content.trim().startsWith("{") && content.includes("suggested_opener");
}

export function filterChatMessages(messages: Message[]): Message[] {
  return messages.filter((m) => !isBriefingMessage(m.content));
}

export function ChatMessageList({ messages }: { messages: Message[] }) {
  const { t } = useI18n();

  if (messages.length === 0) {
    return (
      <p className="text-sm text-muted-foreground italic py-2">
        {t("chat.noMessages")}
      </p>
    );
  }

  return (
    <>
      {messages.map((msg) => (
        <div
          key={msg.id}
          className={cn(
            "flex",
            msg.role === "user" ? "justify-end" : "justify-start"
          )}
        >
          <div
            className={cn(
              "max-w-[85%] rounded-2xl px-4 py-2.5 text-sm",
              msg.role === "user"
                ? "bg-accent text-accent-foreground rounded-br-md"
                : "bg-muted text-foreground rounded-bl-md"
            )}
          >
            {msg.role === "assistant" && (
              <p className="text-xs text-muted-foreground mb-1">
                {t("chat.otherPerson")}
              </p>
            )}
            {msg.content}
          </div>
        </div>
      ))}
    </>
  );
}
