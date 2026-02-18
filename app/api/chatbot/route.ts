import {
  streamText,
  convertToModelMessages,
  UIMessage,
  stepCountIs,
} from "ai";
import { createOpenAI } from "@ai-sdk/openai";
import { bebekuTools } from "@/lib/ai/tools";

export const maxDuration = 60;

// Create OpenRouter-compatible provider using @ai-sdk/openai
const openrouter = createOpenAI({
  baseURL: "https://openrouter.ai/api/v1",
  apiKey: process.env.OPENROUTER_API_KEY || "",
  headers: {
    "HTTP-Referer": process.env.OPENROUTER_SITE_URL || "https://bebeku.com",
    "X-Title": process.env.OPENROUTER_SITE_NAME || "BEBEKU",
  },
});

const SYSTEM_PROMPT = `Kamu adalah BEBEKU Assistant, asisten AI cerdas untuk peternakan bebek BEBEKU di Indonesia.

## Kemampuan Utama
Kamu memiliki AKSES PENUH ke database peternakan melalui tools yang tersedia. Kamu bisa:
1. **Membaca data** - Dashboard, batch, kandang, pakan, telur, keuangan, peringatan
2. **Menginput data** - Mencatat telur, mortalitas, pakan, keuangan, membuat batch/kandang baru
3. **Menganalisis data** - Memberikan analisis berdasarkan data real dari database

## Panduan Penggunaan Tools
- Ketika user bertanya tentang kondisi peternakan, SELALU gunakan tool untuk mengambil data real
- Ketika user ingin menginput data, gunakan tool yang sesuai
- Jika user menyebutkan kode batch (misal B-2026-001), gunakan getBatchList dulu untuk mendapatkan ID-nya
- Untuk input data, SELALU konfirmasi detail sebelum melakukan pencatatan jika informasi kurang lengkap
- Jika batch/kandang belum disebutkan user, tampilkan daftar batch aktif agar user bisa memilih

## Format Respons
- Gunakan bahasa Indonesia yang ramah dan profesional
- Gunakan markdown formatting: **bold** untuk penekanan, bullet points, dan angka yang jelas
- Untuk data keuangan, selalu format dalam Rupiah (Rp)
- Berikan interpretasi dan saran setelah menampilkan data
- Jika data kosong/belum ada, beritahu user dan sarankan langkah selanjutnya

## Pengetahuan Tambahan
- FCR normal bebek: 1.6-1.9 (baik), 2.0-2.2 (perlu perhatian), >2.2 (buruk)
- Mortalitas normal: <5% (aman), 5-7% (waspada), >7% (bahaya)
- Umur panen bebek pedaging: 40-50 hari
- Bobot panen ideal: 2.0-3.0 kg

Jawab secara ringkas tapi informatif. Jangan bertele-tele.`;

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const messages: UIMessage[] = body.messages;

    if (!messages || !Array.isArray(messages)) {
      return new Response(
        JSON.stringify({ error: "Invalid request: messages array is required" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    const modelId = process.env.OPENROUTER_MODEL || "tngtech/deepseek-r1t2-chimera:free";

    const result = streamText({
      model: openrouter(modelId),
      system: SYSTEM_PROMPT,
      messages: await convertToModelMessages(messages),
      tools: bebekuTools,
      stopWhen: stepCountIs(8),
      maxOutputTokens: 4096,
    });

    return result.toUIMessageStreamResponse();
  } catch (error) {
    console.error("Chatbot API error:", error);
    return new Response(
      JSON.stringify({
        error: "Failed to process request",
        details: error instanceof Error ? error.message : "Unknown error",
      }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}
