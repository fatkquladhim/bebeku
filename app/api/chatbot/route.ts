import { NextRequest, NextResponse } from "next/server";
import { OpenRouter } from "@openrouter/sdk";

// Initialize OpenRouter client
const openRouter = new OpenRouter({
  apiKey: process.env.OPENROUTER_API_KEY || "",
  httpReferer: process.env.OPENROUTER_SITE_URL || "https://bebeku.com",
  xTitle: process.env.OPENROUTER_SITE_NAME || "BEBEKU",
});

// System prompt for the farming assistant
const SYSTEM_PROMPT = `You are BEBEKU Assistant, a helpful AI assistant for duck farmers (peternak bebek) in Indonesia. 

Your role is to help farmers with:
- Farming calculations (profit, FCR, feed costs, mortality rates)
- Best practices for duck farming
- Disease prevention and management
- Feed and nutrition advice
- General farming questions

Guidelines:
- Respond in Indonesian language
- Be friendly and professional
- Provide practical, actionable advice
- When asked for calculations, provide clear step-by-step explanations
- If you're unsure about something, be honest and suggest consulting a veterinarian or agricultural expert
- Keep responses concise but informative

Remember: You're assisting Indonesian duck farmers, so use appropriate terminology and context.`;

interface ChatMessage {
  role: "user" | "assistant" | "system";
  content: string;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { messages } = body;

    if (!messages || !Array.isArray(messages)) {
      return NextResponse.json(
        { error: "Invalid request: messages array is required" },
        { status: 400 }
      );
    }

    // Prepare messages with system prompt
    const apiMessages: ChatMessage[] = [
      { role: "system", content: SYSTEM_PROMPT },
      ...messages.map((msg: ChatMessage) => ({
        role: msg.role,
        content: msg.content,
      })),
    ];

    // Call OpenRouter API
    const completion = await openRouter.chat.send({
      chatGenerationParams: {
        model: process.env.OPENROUTER_MODEL || 'tngtech/deepseek-r1t2-chimera:free', // Using a cost-effective model
        messages: apiMessages,
        stream: false,
      },
    });

    // Extract the response
    const responseContent = completion.choices[0]?.message?.content || "";

    return NextResponse.json({
      content: responseContent,
      model: completion.model,
    });
  } catch (error) {
    console.error("OpenRouter API error:", error);
    return NextResponse.json(
      {
        error: "Failed to get response from AI",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
