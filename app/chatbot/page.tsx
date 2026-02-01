"use client";

import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Bot, Send, User, Calculator } from "lucide-react";
import { formatCurrency } from "@/lib/utils/calculations";

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
}

export default function ChatbotPage() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "welcome",
      role: "assistant",
      content:
        "Halo! Saya adalah AI Assistant BEBEKU. Saya bisa membantu Anda menghitung estimasi laba/rugi peternakan, FCR, dan memberikan analisis sederhana.\n\nCoba tanyakan:\n- \"Hitung laba dengan modal 50 juta\"\n- \"Estimasi FCR batch 1000 ekor\"\n- \"Hitung biaya pakan per kg\"",
    },
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  function calculateProfitAnalysis(query: string): Message | null {
    const lowerQuery = query.toLowerCase();

    // Profit calculation
    if (lowerQuery.includes("laba") || lowerQuery.includes("profit")) {
      const modalMatch = query.match(/(\d+[\.,]?\d*)\s*(juta|jt|ribu|ribu|rp)?/i);
      const modal = modalMatch
        ? parseFloat(modalMatch[1].replace(",", ".")) *
          (lowerQuery.includes("juta") || lowerQuery.includes("jt")
            ? 1000000
            : lowerQuery.includes("ribu")
            ? 1000
            : 1)
        : 50000000;

      const population = 1000; // Default
      const docCost = population * 8000; // Rp 8,000 per DOC
      const feedCost = population * 45 * 350; // 45 days * Rp 350/day feed estimate
      const otherCosts = modal * 0.1; // 10% for medicine, labor, etc

      const totalCost = docCost + feedCost + otherCosts;
      const estimatedRevenue = population * 2.5 * 35000; // 2.5 kg * Rp 35,000/kg
      const profit = estimatedRevenue - totalCost;

      return {
        id: Date.now().toString(),
        role: "assistant",
        content: `Berikut estimasi perhitungan laba/rugi dengan modal ${formatCurrency(
          modal
        )} untuk ${population} ekor bebek:`,
        type: "calculation",
        data: {
          revenue: estimatedRevenue,
          costs: totalCost,
          profit: profit,
        },
      };
    }

    // FCR calculation
    if (lowerQuery.includes("fcr")) {
      const populationMatch = query.match(/(\d+)\s*ekor/i);
      const population = populationMatch ? parseInt(populationMatch[1]) : 1000;

      const feedNeeded = population * 2.5 * 1.8; // 2.5 kg BW * 1.8 FCR
      const fcr = 1.8;

      return {
        id: Date.now().toString(),
        role: "assistant",
        content: `Estimasi FCR untuk ${population} ekor bebek:\n\n• Target Bobot Panen: 2.5 kg/ekor\n• Total Bobot: ${(population * 2.5).toLocaleString()} kg\n• Estimasi FCR: ${fcr}\n• Kebutuhan Pakan: ${feedNeeded.toLocaleString()} kg\n\nDengan harga pakan Rp 8,000/kg, biaya pakan per ekor: Rp ${(
          (feedNeeded / population) *
          8000
        ).toLocaleString()}`,
      };
    }

    // Feed cost calculation
    if (lowerQuery.includes("biaya pakan") || lowerQuery.includes("harga pakan")) {
      const weightMatch = query.match(/(\d+[\.,]?\d*)\s*kg/i);
      const weight = weightMatch ? parseFloat(weightMatch[1]) : 2.5;
      const fcr = 1.8;
      const feedPrice = 8000;

      const feedNeeded = weight * fcr;
      const cost = feedNeeded * feedPrice;

      return {
        id: Date.now().toString(),
        role: "assistant",
        content: `Perhitungan biaya pakan untuk bobot ${weight} kg:\n\n• FCR: ${fcr}\n• Kebutuhan Pakan: ${feedNeeded.toFixed(2)} kg\n• Harga Pakan: Rp ${feedPrice.toLocaleString()}/kg\n• Biaya Pakan per Ekor: Rp ${cost.toLocaleString()}\n\nTips: FCR ideal untuk bebek pedaging adalah 1.6-1.9`,
      };
    }

    // Mortality calculation
    if (lowerQuery.includes("mortalitas") || lowerQuery.includes("mati")) {
      const populationMatch = query.match(/(\d+)\s*ekor/i);
      const deadMatch = query.match(/(\d+)\s*mati/i);

      const population = populationMatch ? parseInt(populationMatch[1]) : 1000;
      const dead = deadMatch ? parseInt(deadMatch[1]) : 50;
      const rate = (dead / population) * 100;

      let assessment = "";
      if (rate < 3) assessment = "✅ Sangat baik (target < 5%)";
      else if (rate < 5) assessment = "✅ Baik";
      else if (rate < 10) assessment = "⚠️ Perlu perhatian";
      else assessment = "❌ Terlalu tinggi, perlu evaluasi manajemen!";

      return {
        id: Date.now().toString(),
        role: "assistant",
        content: `Perhitungan mortalitas:\n\n• Populasi Awal: ${population} ekor\n• Kematian: ${dead} ekor\n• Tingkat Mortalitas: ${rate.toFixed(2)}%\n\n${assessment}`,
        type: "calculation",
        data: {
          mortalityRate: rate,
        },
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
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    // Simulate AI processing
    setTimeout(() => {
      const response = calculateProfitAnalysis(userMessage.content);

      if (response) {
        setMessages((prev) => [...prev, response]);
      } else {
        setMessages((prev) => [
          ...prev,
          {
            id: (Date.now() + 1).toString(),
            role: "assistant",
            content:
              "Maaf, saya belum mengerti pertanyaan tersebut. Coba gunakan format seperti:\n\n• \"Hitung laba dengan modal 50 juta\"\n• \"Estimasi FCR 1000 ekor\"\n• \"Biaya pakan per kg\"\n• \"Hitung mortalitas 1000 ekor, 30 mati\"",
          },
        ]);
      }

      setIsLoading(false);
    }, 1000);
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">AI Chatbot</h1>
        <p className="text-muted-foreground">
          Asisten pintar untuk kalkulasi laba/rugi dan analisis peternakan
        </p>
      </div>

      <Card className="h-[calc(100vh-250px)] flex flex-col">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bot className="h-5 w-5" />
            BEBEKU Assistant
          </CardTitle>
          <CardDescription>
            Tanyakan tentang perhitungan keuangan, FCR, atau analisis peternakan
          </CardDescription>
        </CardHeader>
        <CardContent className="flex-1 flex flex-col">
          <div className="flex-1 overflow-y-auto space-y-4 pr-2">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex gap-3 ${
                  message.role === "user" ? "flex-row-reverse" : ""
                }`}
              >
                <Avatar className="h-8 w-8">
                  {message.role === "assistant" ? (
                    <AvatarFallback className="bg-primary text-primary-foreground">
                      <Bot className="h-4 w-4" />
                    </AvatarFallback>
                  ) : (
                    <AvatarFallback>
                      <User className="h-4 w-4" />
                    </AvatarFallback>
                  )}
                </Avatar>
                <div
                  className={`rounded-lg px-4 py-2 max-w-[80%] ${
                    message.role === "user"
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted"
                  }`}
                >
                  <p className="whitespace-pre-line">{message.content}</p>

                  {message.type === "calculation" && message.data && (
                    <div className="mt-3 p-3 bg-background rounded border">
                      <div className="flex items-center gap-2 mb-2">
                        <Calculator className="h-4 w-4" />
                        <span className="font-medium">Hasil Perhitungan</span>
                      </div>
                      {message.data.revenue !== undefined && (
                        <div className="space-y-1 text-sm">
                          <div className="flex justify-between">
                            <span>Estimasi Pendapatan:</span>
                            <span className="font-medium text-green-600">
                              {formatCurrency(message.data.revenue)}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span>Total Biaya:</span>
                            <span className="font-medium text-red-600">
                              {formatCurrency(message.data.costs || 0)}
                            </span>
                          </div>
                          <div className="border-t pt-1 mt-1 flex justify-between">
                            <span>Estimasi Laba:</span>
                            <span
                              className={`font-bold ${
                                (message.data.profit || 0) >= 0
                                  ? "text-green-600"
                                  : "text-red-600"
                              }`}
                            >
                              {formatCurrency(message.data.profit || 0)}
                            </span>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex gap-3">
                <Avatar className="h-8 w-8">
                  <AvatarFallback className="bg-primary text-primary-foreground">
                    <Bot className="h-4 w-4" />
                  </AvatarFallback>
                </Avatar>
                <div className="bg-muted rounded-lg px-4 py-2">
                  <div className="flex gap-1">
                    <span className="animate-bounce">.</span>
                    <span className="animate-bounce delay-100">.</span>
                    <span className="animate-bounce delay-200">.</span>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          <form onSubmit={handleSubmit} className="mt-4 flex gap-2">
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Tanyakan sesuatu..."
              disabled={isLoading}
              className="flex-1"
            />
            <Button type="submit" disabled={isLoading || !input.trim()}>
              <Send className="h-4 w-4" />
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Quick Suggestions */}
      <div className="flex flex-wrap gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => setInput("Hitung laba dengan modal 50 juta")}
        >
          Hitung Laba
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setInput("Estimasi FCR 1000 ekor")}
        >
          Estimasi FCR
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setInput("Biaya pakan per kg")}
        >
          Biaya Pakan
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setInput("Hitung mortalitas 1000 ekor, 30 mati")}
        >
          Hitung Mortalitas
        </Button>
      </div>
    </div>
  );
}
