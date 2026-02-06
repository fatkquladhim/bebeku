"use client";

import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Bot, Send, User, Calculator, Sparkles, TrendingUp, Wheat, AlertCircle } from "lucide-react";
import { formatCurrency } from "@/lib/utils/calculations";
import { cn } from "@/lib/utils";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  type?: "text" | "calculation";
  data?: {
    revenue?: number;
    costs?: number;
    profit?: number;
    fcr?: number;
    mortalityRate?: number;
  };
  timestamp?: Date;
}

const quickSuggestions = [
  { label: "Hitung Laba", icon: TrendingUp, query: "Hitung laba dengan modal 50 juta" },
  { label: "Estimasi FCR", icon: Calculator, query: "Estimasi FCR 1000 ekor" },
  { label: "Biaya Pakan", icon: Wheat, query: "Biaya pakan per kg" },
  { label: "Hitung Mortalitas", icon: AlertCircle, query: "Hitung mortalitas 1000 ekor, 30 mati" },
];

export default function ChatbotPage() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "welcome",
      role: "assistant",
      content: "🐤 Halo, Peternak!\n\nSaya siap bantu hitung-hitungan peternakan Anda.",
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Auto-focus input on desktop
  useEffect(() => {
    if (window.innerWidth >= 1024) {
      inputRef.current?.focus();
    }
  }, []);

  // Helper functions for interpretations
  function getFCRStatus(fcr: number): { status: string; emoji: string } {
    if (fcr < 1.6) return { status: "Sangat Baik", emoji: "✅" };
    if (fcr <= 1.9) return { status: "Normal", emoji: "✅" };
    if (fcr <= 2.2) return { status: "Perlu Perhatian", emoji: "⚠️" };
    return { status: "Buruk", emoji: "❌" };
  }

  function getMortalityStatus(rate: number): { status: string; emoji: string } {
    if (rate <= 3) return { status: "Aman", emoji: "✅" };
    if (rate <= 5) return { status: "Waspada", emoji: "⚠️" };
    return { status: "Bahaya", emoji: "❌" };
  }

  function calculateProfitAnalysis(query: string): Message | null {
    const lowerQuery = query.toLowerCase();

    // Profit calculation
    if (lowerQuery.includes("laba") || lowerQuery.includes("profit") || lowerQuery.includes("rugi")) {
      const modalMatch = query.match(/(\d+[\.,]?\d*)\s*(juta|jt|ribu|rb|rp)?/i);
      const modal = modalMatch
        ? parseFloat(modalMatch[1].replace(",", ".")) *
          (lowerQuery.includes("juta") || lowerQuery.includes("jt")
            ? 1000000
            : lowerQuery.includes("ribu") || lowerQuery.includes("rb")
            ? 1000
            : 1)
        : 50000000;

      const populationMatch = query.match(/(\d+)\s*ekor/i);
      const population = populationMatch ? parseInt(populationMatch[1]) : 1000;

      const docCost = population * 8000; // Rp 8,000 per DOC
      const feedPerBird = 2.5 * 1.8; // 2.5 kg BW * 1.8 FCR
      const feedCost = population * feedPerBird * 8000; // Rp 8,000/kg pakan
      const otherCosts = modal * 0.15; // 15% for medicine, labor, etc

      const totalCost = docCost + feedCost + otherCosts;
      const harvestWeight = 2.5; // kg
      const pricePerKg = 35000; // Rp 35,000/kg
      const estimatedRevenue = population * harvestWeight * pricePerKg;
      const profit = estimatedRevenue - totalCost;
      const profitPerBird = profit / population;
      const margin = (profit / estimatedRevenue) * 100;

      const isProfit = profit >= 0;
      const statusEmoji = isProfit ? "✅" : "❌";
      const statusText = isProfit ? "Menguntungkan" : "Merugi";

      return {
        id: Date.now().toString(),
        role: "assistant",
        content: `📊 **Estimasi Laba/Rugi**

Ringkasan perhitungan ${population} ekor dengan modal ${formatCurrency(modal)}.

📈 **Data Utama:**
• Populasi: ${population.toLocaleString()} ekor
• Bobot panen: ${harvestWeight} kg/ekor
• Harga jual: ${formatCurrency(pricePerKg)}/kg
• Total pendapatan: ${formatCurrency(estimatedRevenue)}
• Total biaya: ${formatCurrency(totalCost)}
  - DOC: ${formatCurrency(docCost)}
  - Pakan: ${formatCurrency(feedCost)}
  - Lainnya: ${formatCurrency(otherCosts)}

${statusEmoji} **Kesimpulan:** ${statusText}
Laba bersih ${formatCurrency(profit)} (${margin.toFixed(1)}% margin).

💡 **Saran:** Laba/ekor ${formatCurrency(profitPerBird)}. ${isProfit ? "Pertahankan FCR < 1.9 untuk efisiensi." : "Periksa kembali biaya pakan dan mortalitas."}`,
        type: "calculation",
        data: {
          revenue: estimatedRevenue,
          costs: totalCost,
          profit: profit,
        },
        timestamp: new Date(),
      };
    }

    // FCR calculation
    if (lowerQuery.includes("fcr")) {
      const populationMatch = query.match(/(\d+)\s*ekor/i);
      const population = populationMatch ? parseInt(populationMatch[1]) : 1000;

      const targetWeight = 2.5; // kg
      const fcr = 1.8; // default estimation
      const feedNeeded = population * targetWeight * fcr;
      const feedPerBird = targetWeight * fcr;
      const feedCostPerBird = feedPerBird * 8000;
      const totalFeedCost = feedNeeded * 8000;

      const fcrStatus = getFCRStatus(fcr);

      return {
        id: Date.now().toString(),
        role: "assistant",
        content: `📊 **Estimasi FCR & Kebutuhan Pakan**

Perhitungan untuk ${population.toLocaleString()} ekor bebek pedaging.

📈 **Data Utama:**
• Target bobot: ${targetWeight} kg/ekor
• Total bobot: ${(population * targetWeight).toLocaleString()} kg
• FCR estimasi: ${fcr}
• Pakan dibutuhkan: ${feedNeeded.toLocaleString()} kg
• Biaya pakan: ${formatCurrency(totalFeedCost)}

${fcrStatus.emoji} **Kesimpulan:** FCR ${fcr} = ${fcrStatus.status}
Standar normal: 1.6 – 1.9

💡 **Saran:** Biaya pakan/ekor ${formatCurrency(feedCostPerBird)}. FCR < 1.6 sangat baik, > 2.2 perlu evaluasi manajemen.`,
        timestamp: new Date(),
      };
    }

    // Feed cost calculation
    if (lowerQuery.includes("biaya pakan") || lowerQuery.includes("harga pakan") || lowerQuery.includes("kebutuhan pakan")) {
      const weightMatch = query.match(/(\d+[\.,]?\d*)\s*kg/i);
      const weight = weightMatch ? parseFloat(weightMatch[1].replace(",", ".")) : 2.5;
      const populationMatch = query.match(/(\d+)\s*ekor/i);
      const population = populationMatch ? parseInt(populationMatch[1]) : 1;

      const fcr = 1.8;
      const feedPrice = 8000;

      const feedPerBird = weight * fcr;
      const totalFeedNeeded = feedPerBird * population;
      const costPerBird = feedPerBird * feedPrice;
      const totalCost = totalFeedNeeded * feedPrice;

      const fcrStatus = getFCRStatus(fcr);

      return {
        id: Date.now().toString(),
        role: "assistant",
        content: `🌾 **Perhitungan Biaya Pakan**

Estimasi untuk bobot ${weight} kg/ekor × ${population.toLocaleString()} ekor.

📈 **Data Utama:**
• FCR: ${fcr} (${fcrStatus.status})
• Pakan/ekor: ${feedPerBird.toFixed(2)} kg
• Total pakan: ${totalFeedNeeded.toFixed(2)} kg
• Harga pakan: ${formatCurrency(feedPrice)}/kg
• Biaya/ekor: ${formatCurrency(costPerBird)}
• Total biaya: ${formatCurrency(totalCost)}

${fcrStatus.emoji} **Kesimpulan:** FCR dalam batas ${fcrStatus.status.toLowerCase()}
Standar: 1.6 – 1.9

💡 **Saran:** Pakan = 60-70% biaya produksi. Jaga kualitas pakan & manajemen.`,
        timestamp: new Date(),
      };
    }

    // Mortality calculation
    if (lowerQuery.includes("mortalitas") || lowerQuery.includes("mati") || lowerQuery.includes("kematian")) {
      const populationMatch = query.match(/(\d+)\s*ekor/i);
      const deadMatch = query.match(/(\d+)\s*(mati|meninggal|dead)/i);

      const population = populationMatch ? parseInt(populationMatch[1]) : 1000;
      const dead = deadMatch ? parseInt(deadMatch[1]) : 50;
      const rate = (dead / population) * 100;
      const remaining = population - dead;

      const mortalityStatus = getMortalityStatus(rate);

      let interpretation = "";
      if (rate <= 3) interpretation = "Masih dalam batas aman (<5%).";
      else if (rate <= 5) interpretation = "Batas waspada, perlu monitoring.";
      else interpretation = "Di atas batas normal, segera evaluasi!";

      return {
        id: Date.now().toString(),
        role: "assistant",
        content: `⚠️ **Analisis Mortalitas**

Perhitungan tingkat kematian peternakan Anda.

📈 **Data Utama:**
• Populasi awal: ${population.toLocaleString()} ekor
• Kematian: ${dead} ekor
• Sisa hidup: ${remaining.toLocaleString()} ekor
• Tingkat mortalitas: ${rate.toFixed(2)}%

${mortalityStatus.emoji} **Kesimpulan:** Status ${mortalityStatus.status}
${interpretation} Batas aman: ≤ 5%

💡 **Saran:** ${rate > 5 ? "Periksa kondisi kandang, pakan, dan vaksinasi." : "Pertahankan manajemen yang baik."}`,
        type: "calculation",
        data: {
          mortalityRate: rate,
        },
        timestamp: new Date(),
      };
    }

    return null;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: input,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    // First, try local calculation functions
    const localResponse = calculateProfitAnalysis(userMessage.content);

    if (localResponse) {
      // Use local calculation response
      setMessages((prev) => [...prev, localResponse]);
      setIsLoading(false);
    } else {
      // Fall back to OpenRouter AI for other queries
      try {
        // Get conversation history for context
        const conversationHistory = messages.map((msg) => ({
          role: msg.role,
          content: msg.content,
        }));

        const response = await fetch("/api/chatbot", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            messages: [...conversationHistory, { role: "user", content: userMessage.content }],
          }),
        });

        if (!response.ok) {
          throw new Error("Failed to get AI response");
        }

        const data = await response.json();

        const aiMessage: Message = {
          id: (Date.now() + 1).toString(),
          role: "assistant",
          content: data.content || "Maaf, terjadi kesalahan saat memproses permintaan Anda.",
          timestamp: new Date(),
        };

        setMessages((prev) => [...prev, aiMessage]);
      } catch (error) {
        console.error("Error calling AI:", error);
        setMessages((prev) => [
          ...prev,
          {
            id: (Date.now() + 1).toString(),
            role: "assistant",
            content: `🤔 **Maaf, terjadi kesalahan**

Saya tidak dapat memproses permintaan Anda saat ini. Silakan coba lagi nanti atau gunakan fitur perhitungan yang tersedia:

• "Hitung laba modal 50 juta 1000 ekor"
• "Estimasi FCR 1000 ekor"
• "Biaya pakan 2.5 kg 1000 ekor"
• "Hitung mortalitas 1000 ekor 30 mati"

Atau pilih tombol cepat di bawah 👇`,
            timestamp: new Date(),
          },
        ]);
      } finally {
        setIsLoading(false);
      }
    }
  }

  const handleSuggestionClick = (query: string) => {
    setInput(query);
    inputRef.current?.focus();
  };

  const formatTime = (date: Date) => {
    return new Intl.DateTimeFormat("id-ID", {
      hour: "2-digit",
      minute: "2-digit",
    }).format(date);
  };

  // Parse markdown-like content
  const renderContent = (content: string) => {
    const lines = content.split("\n");
    return lines.map((line, index) => {
      // Bold text **text**
      if (line.startsWith("**") && line.endsWith("**")) {
        return (
          <p key={index} className="font-semibold text-foreground mb-2 leading-relaxed">
            {line.replace(/\*\*/g, "")}
          </p>
        );
      }
      // Bullet points
      if (line.startsWith("• ")) {
        return (
          <div key={index} className="flex items-start gap-2 mb-1.5 leading-relaxed">
            <span className="text-muted-foreground mt-1.5">•</span>
            <span className="flex-1">{line.substring(2)}</span>
          </div>
        );
      }
      // Empty line
      if (line.trim() === "") {
        return <div key={index} className="h-2" />;
      }
      // Regular text
      return (
        <p key={index} className="mb-2 leading-relaxed">
          {line}
        </p>
      );
    });
  };

  return (
    <div className="fixed inset-0 lg:left-64 bg-background flex flex-col">
      {/* Header */}
      <header className="flex-none px-4 sm:px-6 lg:px-8 py-4 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 z-10">
        <div className="max-w-3xl mx-auto flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-slate-800 to-slate-900 flex items-center justify-center shadow-lg">
            <Sparkles className="h-5 w-5 text-white" />
          </div>
          <div>
            <h1 className="text-lg font-semibold text-foreground tracking-tight">BEBEKU Assistant</h1>
            <p className="text-sm text-muted-foreground">AI-powered farming analytics</p>
          </div>
        </div>
      </header>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto scroll-smooth">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
          {messages.map((message, index) => (
            <div
              key={message.id}
              className={cn(
                "flex gap-3 sm:gap-4 animate-in fade-in slide-in-from-bottom-2 duration-300",
                message.role === "user" ? "flex-row-reverse" : "flex-row"
              )}
              style={{ animationDelay: `${index * 50}ms` }}
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

              {/* Message Bubble */}
              <div
                className={cn(
                  "flex-1 min-w-0",
                  message.role === "user" ? "flex justify-end" : "flex justify-start"
                )}
              >
                <div
                  className={cn(
                    "relative max-w-[85%] sm:max-w-[75%] rounded-2xl px-4 sm:px-5 py-3 sm:py-4 text-[15px] leading-relaxed",
                    message.role === "user"
                      ? "bg-slate-900 text-white shadow-md"
                      : "bg-white border border-border/50 shadow-sm text-foreground"
                  )}
                >
                  {/* Content */}
                  <div className="prose prose-sm max-w-none">
                    {renderContent(message.content)}
                  </div>

                  {/* Calculation Results Card */}
                  {message.type === "calculation" && message.data && (
                    <div className="mt-4 p-4 bg-background/80 backdrop-blur rounded-xl border border-border/50">
                      <div className="flex items-center gap-2 mb-3">
                        <Calculator className="h-4 w-4 text-muted-foreground" />
                        <span className="font-medium text-sm text-foreground">Hasil Perhitungan</span>
                      </div>
                      {message.data.revenue !== undefined && (
                        <div className="space-y-2 text-sm">
                          <div className="flex justify-between items-center">
                            <span className="text-muted-foreground">Estimasi Pendapatan</span>
                            <span className="font-medium text-emerald-600">
                              {formatCurrency(message.data.revenue)}
                            </span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-muted-foreground">Total Biaya</span>
                            <span className="font-medium text-red-500">
                              {formatCurrency(message.data.costs || 0)}
                            </span>
                          </div>
                          <div className="border-t pt-2 mt-2 flex justify-between items-center">
                            <span className="font-medium text-foreground">Estimasi Laba</span>
                            <span
                              className={cn(
                                "font-bold",
                                (message.data.profit || 0) >= 0 ? "text-emerald-600" : "text-red-500"
                              )}
                            >
                              {formatCurrency(message.data.profit || 0)}
                            </span>
                          </div>
                        </div>
                      )}
                      {message.data.mortalityRate !== undefined && (
                        <div className="space-y-2 text-sm">
                          <div className="flex justify-between items-center">
                            <span className="text-muted-foreground">Tingkat Mortalitas</span>
                            <span
                              className={cn(
                                "font-bold",
                                message.data.mortalityRate < 5 ? "text-emerald-600" : "text-amber-500"
                              )}
                            >
                              {message.data.mortalityRate.toFixed(2)}%
                            </span>
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Timestamp */}
                  <div
                    className={cn(
                      "mt-2 text-[11px] opacity-60",
                      message.role === "user" ? "text-right" : "text-left"
                    )}
                  >
                    {message.timestamp ? formatTime(message.timestamp) : ""}
                  </div>
                </div>
              </div>
            </div>
          ))}

          {/* Loading Indicator */}
          {isLoading && (
            <div className="flex gap-3 sm:gap-4 animate-in fade-in duration-200">
              <Avatar className="h-8 w-8 sm:h-9 sm:w-9 ring-2 ring-border shadow-sm">
                <AvatarFallback className="bg-gradient-to-br from-slate-700 to-slate-800 text-white text-xs">
                  <Bot className="h-4 w-4" />
                </AvatarFallback>
              </Avatar>
              <div className="bg-white border border-border/50 rounded-2xl px-4 py-3 shadow-sm">
                <div className="flex gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-muted-foreground/40 animate-bounce" style={{ animationDelay: "0ms" }} />
                  <span className="w-2 h-2 rounded-full bg-muted-foreground/40 animate-bounce" style={{ animationDelay: "150ms" }} />
                  <span className="w-2 h-2 rounded-full bg-muted-foreground/40 animate-bounce" style={{ animationDelay: "300ms" }} />
                </div>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Input Area */}
      <div className="flex-none border-t bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        {/* Quick Suggestions */}
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
          <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
            {quickSuggestions.map((suggestion) => (
              <button
                key={suggestion.label}
                onClick={() => handleSuggestionClick(suggestion.query)}
                className="flex-none inline-flex items-center gap-2 px-4 py-2 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-700 text-sm font-medium transition-colors active:scale-95"
              >
                <suggestion.icon className="h-4 w-4" />
                <span>{suggestion.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Input Form */}
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 pb-4 sm:pb-6">
          <form onSubmit={handleSubmit} className="flex gap-3 items-end">
            <div className="flex-1 relative">
              <Input
                ref={inputRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Tanyakan sesuatu tentang peternakan..."
                disabled={isLoading}
                className="min-h-[52px] pr-4 pl-4 py-3 text-[15px] rounded-2xl border-border/60 bg-white shadow-sm focus-visible:ring-2 focus-visible:ring-slate-900 focus-visible:ring-offset-0 resize-none"
              />
            </div>
            <Button
              type="submit"
              disabled={isLoading || !input.trim()}
              className="h-[52px] w-[52px] rounded-2xl bg-slate-900 hover:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed shadow-md active:scale-95 transition-all"
            >
              <Send className="h-5 w-5" />
            </Button>
          </form>
          <p className="text-center text-xs text-muted-foreground mt-3">
            AI Assistant dapat membuat kesalahan. Verifikasi informasi penting.
          </p>
        </div>
      </div>
    </div>
  );
}
