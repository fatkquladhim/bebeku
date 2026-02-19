"use client";

import React, { useState, useRef, useEffect } from "react";
import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport, type UIMessage } from "ai";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Bot,
  Send,
  User,
  Sparkles,
  Database,
  PenLine,
  BarChart3,
  AlertTriangle,
  Egg,
  Wheat,
  CircleDollarSign,
  Loader2,
  CheckCircle2,
  XCircle,
} from "lucide-react";
import { cn } from "@/lib/utils";

// Helper to extract text from UIMessage parts
function getMessageText(message: UIMessage): string {
  if (!message.parts || !Array.isArray(message.parts)) return "";
  return message.parts
    .filter((p): p is { type: "text"; text: string } => p.type === "text")
    .map((p) => p.text)
    .join("");
}

function isToolPart(part: any): part is { type: string; state: string } {
  return (
    typeof part?.type === "string" &&
    part.type.startsWith("tool-") &&
    "state" in part
  );
}

// Tool name to human-readable label and icon
const toolMeta: Record<
  string,
  { label: string; icon: typeof Database; color: string }
> = {
  getDashboardSummary: {
    label: "Mengambil ringkasan dashboard",
    icon: BarChart3,
    color: "text-blue-600",
  },
  getBatchList: {
    label: "Mengambil daftar batch",
    icon: Database,
    color: "text-blue-600",
  },
  getBatchDetail: {
    label: "Mengambil detail batch",
    icon: Database,
    color: "text-blue-600",
  },
  getBarnList: {
    label: "Mengambil daftar kandang",
    icon: Database,
    color: "text-blue-600",
  },
  getFinanceSummary: {
    label: "Mengambil data keuangan",
    icon: CircleDollarSign,
    color: "text-emerald-600",
  },
  getEggProduction: {
    label: "Mengambil data produksi telur",
    icon: Egg,
    color: "text-amber-600",
  },
  getFeedStock: {
    label: "Mengambil data stok pakan",
    icon: Wheat,
    color: "text-orange-600",
  },
  getAlerts: {
    label: "Mengecek peringatan",
    icon: AlertTriangle,
    color: "text-red-600",
  },
  getRecentActivity: {
    label: "Mengambil aktivitas terbaru",
    icon: Database,
    color: "text-blue-600",
  },
  addEggRecord: {
    label: "Mencatat produksi telur",
    icon: PenLine,
    color: "text-green-600",
  },
  addDailyRecord: {
    label: "Mencatat data harian",
    icon: PenLine,
    color: "text-green-600",
  },
  addFinanceRecord: {
    label: "Mencatat transaksi keuangan",
    icon: PenLine,
    color: "text-green-600",
  },
  addFeedStock: {
    label: "Mencatat stok pakan",
    icon: PenLine,
    color: "text-green-600",
  },
  addBatch: {
    label: "Membuat batch baru",
    icon: PenLine,
    color: "text-green-600",
  },
  addBarn: {
    label: "Membuat kandang baru",
    icon: PenLine,
    color: "text-green-600",
  },
  addWeightRecord: {
    label: "Mencatat data penimbangan",
    icon: PenLine,
    color: "text-green-600",
  },
};

const quickSuggestions = [
  {
    label: "Kondisi Peternakan",
    icon: BarChart3,
    query: "Bagaimana kondisi peternakan hari ini?",
  },
  { label: "Peringatan", icon: AlertTriangle, query: "Ada peringatan apa hari ini?" },
  {
    label: "Produksi Telur",
    icon: Egg,
    query: "Berapa produksi telur hari ini?",
  },
  { label: "Stok Pakan", icon: Wheat, query: "Bagaimana stok pakan saat ini?" },
  { label: "Keuangan", icon: CircleDollarSign, query: "Ringkasan keuangan bulan ini" },
  {
    label: "Batch Aktif",
    icon: Database,
    query: "Tampilkan semua batch yang sedang aktif",
  },
];

// Simple markdown renderer
function renderMarkdown(text: string) {
  const lines = text.split("\n");
  return lines.map((line, index) => {
    // Headers
    if (line.startsWith("### ")) {
      return (
        <h3
          key={index}
          className="font-bold text-foreground mt-3 mb-1.5 text-base"
        >
          {renderInlineMarkdown(line.substring(4))}
        </h3>
      );
    }
    if (line.startsWith("## ")) {
      return (
        <h2
          key={index}
          className="font-bold text-foreground mt-3 mb-1.5 text-lg"
        >
          {renderInlineMarkdown(line.substring(3))}
        </h2>
      );
    }
    // Numbered lists
    const numberedMatch = line.match(/^(\d+)\.\s(.+)/);
    if (numberedMatch) {
      return (
        <div
          key={index}
          className="flex items-start gap-2 mb-1 leading-relaxed"
        >
          <span className="text-muted-foreground font-medium min-w-[1.25rem]">
            {numberedMatch[1]}.
          </span>
          <span className="flex-1">
            {renderInlineMarkdown(numberedMatch[2])}
          </span>
        </div>
      );
    }
    // Bullet points
    if (line.startsWith("- ") || line.startsWith("* ")) {
      return (
        <div
          key={index}
          className="flex items-start gap-2 mb-1 leading-relaxed"
        >
          <span className="text-muted-foreground mt-2 w-1 h-1 rounded-full bg-muted-foreground flex-none" />
          <span className="flex-1">
            {renderInlineMarkdown(line.substring(2))}
          </span>
        </div>
      );
    }
    // Empty line
    if (line.trim() === "") {
      return <div key={index} className="h-1.5" />;
    }
    // Regular paragraph
    return (
      <p key={index} className="mb-1.5 leading-relaxed">
        {renderInlineMarkdown(line)}
      </p>
    );
  });
}

// Render inline markdown (bold, italic, code)
function renderInlineMarkdown(text: string) {
  const parts: (string | React.ReactNode)[] = [];
  let remaining = text;
  let keyCounter = 0;

  while (remaining.length > 0) {
    // Bold
    const boldMatch = remaining.match(/\*\*(.+?)\*\*/);
    if (boldMatch && boldMatch.index !== undefined) {
      if (boldMatch.index > 0) {
        parts.push(remaining.substring(0, boldMatch.index));
      }
      parts.push(
        <strong key={keyCounter++} className="font-semibold text-foreground">
          {boldMatch[1]}
        </strong>
      );
      remaining = remaining.substring(boldMatch.index + boldMatch[0].length);
      continue;
    }
    // Inline code
    const codeMatch = remaining.match(/`(.+?)`/);
    if (codeMatch && codeMatch.index !== undefined) {
      if (codeMatch.index > 0) {
        parts.push(remaining.substring(0, codeMatch.index));
      }
      parts.push(
        <code
          key={keyCounter++}
          className="px-1.5 py-0.5 rounded bg-muted text-sm font-mono"
        >
          {codeMatch[1]}
        </code>
      );
      remaining = remaining.substring(codeMatch.index + codeMatch[0].length);
      continue;
    }
    // No more matches
    parts.push(remaining);
    break;
  }

  return <>{parts}</>;
}

export default function ChatbotPage() {
  const [input, setInput] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const { messages, sendMessage, status } = useChat({
    transport: new DefaultChatTransport({ api: "/api/chatbot" }),
  });

  const isLoading = status === "streaming" || status === "submitted";

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, status]);

  useEffect(() => {
    if (window.innerWidth >= 1024) {
      inputRef.current?.focus();
    }
  }, []);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!input.trim() || isLoading) return;
    sendMessage({ text: input });
    setInput("");
  }

  function handleSuggestionClick(query: string) {
    if (isLoading) return;
    sendMessage({ text: query });
  }

  const hasMessages = messages.length > 0;

  return (
    <div className="fixed inset-0 lg:left-64 bg-background flex flex-col">
      {/* Header */}
      <header className="flex-none px-4 sm:px-6 lg:px-8 py-4 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 z-10">
        <div className="max-w-3xl mx-auto flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-slate-800 to-slate-900 flex items-center justify-center shadow-lg">
            <Sparkles className="h-5 w-5 text-white" />
          </div>
          <div>
            <h1 className="text-lg font-semibold text-foreground tracking-tight">
              BEBEKU Assistant
            </h1>
            <p className="text-sm text-muted-foreground">
              {isLoading
                ? "Sedang memproses..."
                : "AI dengan akses penuh ke database peternakan"}
            </p>
          </div>
        </div>
      </header>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto scroll-smooth">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
          {/* Welcome message if no messages */}
          {!hasMessages && (
            <div className="flex flex-col items-center justify-center py-12 gap-6">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-slate-800 to-slate-900 flex items-center justify-center shadow-xl">
                <Sparkles className="h-8 w-8 text-white" />
              </div>
              <div className="text-center">
                <h2 className="text-xl font-semibold text-foreground mb-2">
                  Halo, Peternak!
                </h2>
                <p className="text-muted-foreground max-w-md leading-relaxed">
                  Saya bisa membaca dan menginput data peternakan Anda langsung
                  melalui percakapan. Coba tanyakan sesuatu atau pilih tombol di
                  bawah.
                </p>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 w-full max-w-lg">
                {quickSuggestions.map((suggestion) => (
                  <button
                    key={suggestion.label}
                    onClick={() => handleSuggestionClick(suggestion.query)}
                    className="flex items-center gap-2 px-3 py-2.5 rounded-xl bg-card border border-border/50 hover:bg-accent text-foreground text-sm font-medium transition-colors text-left"
                  >
                    <suggestion.icon className="h-4 w-4 text-muted-foreground flex-none" />
                    <span className="truncate">{suggestion.label}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Messages Loop */}
          {messages.map((message) => (
            <div
              key={message.id}
              className={cn(
                "flex gap-3 sm:gap-4",
                message.role === "user" ? "flex-row-reverse" : "flex-row"
              )}
            >
              {/* Avatar */}
              <div className="flex-none">
                {message.role === "assistant" ? (
                  <Avatar className="h-8 w-8 sm:h-9 sm:w-9 ring-2 ring-border shadow-sm">
                    <AvatarFallback className="bg-gradient-to-br from-slate-700 to-slate-800 text-white text-xs">
                      <Bot className="h-4 w-4" />
                    </AvatarFallback>
                  </Avatar>
                ) : (
                  <Avatar className="h-8 w-8 sm:h-9 sm:w-9 ring-2 ring-border shadow-sm">
                    <AvatarFallback className="bg-slate-900 text-white text-xs">
                      <User className="h-4 w-4" />
                    </AvatarFallback>
                  </Avatar>
                )}
              </div>

              {/* Message Content */}
              <div
                className={cn(
                  "flex-1 min-w-0",
                  message.role === "user"
                    ? "flex justify-end"
                    : "flex justify-start"
                )}
              >
                <div
                  className={cn(
                    "relative max-w-[85%] sm:max-w-[80%] rounded-2xl px-4 sm:px-5 py-3 sm:py-4 text-[15px]",
                    message.role === "user"
                      ? "bg-slate-900 text-white shadow-md"
                      : "bg-card border border-border/50 shadow-sm text-foreground"
                  )}
                >
                  <div className="prose prose-sm max-w-none">
                    {message.parts.map((part, partIndex) => {
                      if (part.type === "text") {
                        return (
                          <div key={partIndex}>
                            {renderMarkdown(part.text)}
                          </div>
                        );
                      }

                      if (isToolPart(part)) {
                        const toolName = part.type.replace("tool-", "");
                        const meta = toolMeta[toolName];
                        const state = part.state;

                        if (!meta) return null;

                        const isRunning =
                          state === "input-streaming" ||
                          state === "call" ||
                          state === "partial-call";

                        const isDone =
                          state === "output-available" ||
                          state === "result";

                        const isError = state === "error";

                        const ToolIcon = meta.icon;

                        return (
                          <div
                            key={partIndex}
                            className={cn(
                              "flex items-center gap-2 my-2 px-3 py-2 rounded-lg text-xs font-medium",
                              isRunning &&
                                "bg-blue-50 text-blue-700 border border-blue-200 dark:bg-blue-950 dark:text-blue-300 dark:border-blue-800",
                              isDone &&
                                "bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-emerald-950 dark:text-emerald-300 dark:border-emerald-800",
                              isError &&
                                "bg-red-50 text-red-700 border border-red-200 dark:bg-red-950 dark:text-red-300 dark:border-red-800"
                            )}
                          >
                            {isRunning && (
                              <Loader2 className="h-3.5 w-3.5 animate-spin" />
                            )}
                            {isDone && (
                              <CheckCircle2 className="h-3.5 w-3.5" />
                            )}
                            {isError && <XCircle className="h-3.5 w-3.5" />}
                            <ToolIcon className="h-3.5 w-3.5" />
                            <span>
                              {isRunning && meta.label + "..."}
                              {isDone && meta.label + " - selesai"}
                              {isError && meta.label + " - gagal"}
                            </span>
                          </div>
                        );
                      }

                      return null;
                    })}
                  </div>
                </div>
              </div>
            </div>
          ))}

          {/* Loading Indicator */}
          {isLoading && messages.length > 0 && (() => {
            const lastMsg = messages[messages.length - 1];
            const hasContent =
              lastMsg.role === "assistant" &&
              lastMsg.parts.some((p) => p.type === "text");
            if (hasContent) return null;
            
            return (
              <div className="flex gap-3 sm:gap-4">
                <Avatar className="h-8 w-8 sm:h-9 sm:w-9 ring-2 ring-border shadow-sm">
                  <AvatarFallback className="bg-gradient-to-br from-slate-700 to-slate-800 text-white text-xs">
                    <Bot className="h-4 w-4" />
                  </AvatarFallback>
                </Avatar>
                <div className="bg-card border border-border/50 rounded-2xl px-4 py-3 shadow-sm">
                  <div className="flex gap-1.5">
                    <span
                      className="w-2 h-2 rounded-full bg-muted-foreground/40 animate-bounce"
                      style={{ animationDelay: "0ms" }}
                    />
                    <span
                      className="w-2 h-2 rounded-full bg-muted-foreground/40 animate-bounce"
                      style={{ animationDelay: "150ms" }}
                    />
                    <span
                      className="w-2 h-2 rounded-full bg-muted-foreground/40 animate-bounce"
                      style={{ animationDelay: "300ms" }}
                    />
                  </div>
                </div>
              </div>
            );
          })()}

          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Input Area */}
      <div className="flex-none border-t bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        {/* Quick Suggestions - only when there are messages */}
        {hasMessages && (
          <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
            <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
              {quickSuggestions.map((suggestion) => (
                <button
                  key={suggestion.label}
                  onClick={() => handleSuggestionClick(suggestion.query)}
                  disabled={isLoading}
                  className="flex-none inline-flex items-center gap-2 px-3.5 py-2 rounded-full bg-secondary hover:bg-accent text-foreground text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <suggestion.icon className="h-3.5 w-3.5" />
                  <span>{suggestion.label}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Input Form */}
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 pb-4 sm:pb-6">
          <form onSubmit={handleSubmit} className="flex gap-3 items-end">
            <div className="flex-1 relative">
              <Input
                ref={inputRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder={
                  isLoading
                    ? "Menunggu respons..."
                    : 'Tanya atau perintah, misal: "catat 500 telur hari ini"'
                }
                disabled={isLoading}
                className="min-h-[52px] pr-4 pl-4 py-3 text-[15px] rounded-2xl border-border/60 bg-card shadow-sm focus-visible:ring-2 focus-visible:ring-slate-900 focus-visible:ring-offset-0 resize-none"
              />
            </div>
            <Button
              type="submit"
              disabled={isLoading || !input.trim()}
              className="h-[52px] w-[52px] rounded-2xl bg-slate-900 hover:bg-slate-800 text-white disabled:opacity-50 disabled:cursor-not-allowed shadow-md active:scale-95 transition-all"
            >
              {isLoading ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : (
                <Send className="h-5 w-5" />
              )}
            </Button>
          </form>
          <p className="text-center text-xs text-muted-foreground mt-3">
            AI Assistant dengan akses database penuh. Verifikasi informasi
            penting.
          </p>
        </div>
      </div>
    </div>
  );
}
