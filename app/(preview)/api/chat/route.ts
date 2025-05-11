import { findRelevantContent } from "@/lib/ai/search";
import { azure } from "@ai-sdk/azure";
import { convertToCoreMessages, streamText, tool } from "ai";
import { z } from "zod";

// Allow streaming responses up to 30 seconds
export const maxDuration = 30;

export async function POST(req: Request) {
  try {
    const { messages } = await req.json();

    const result = await streamText({
  model: azure(process.env.AZURE_DEPLOYMENT_NAME!),
  messages: convertToCoreMessages(messages),

  system: `You are a helpful assistant.
Answer based only on your general knowledge.
Do not rely on any tools or external knowledge base.
Keep your answers short and clear.
If you don't know the answer, say "Sorry, I don't know."`,

  // 🛑 一時的に getInformation tool を無効化（残す）
  // tools: {
  //   getInformation: tool({
  //     description: `get information from your knowledge base to answer the user's question.`,
  //     parameters: z.object({
  //       question: z.string().describe("The user's question"),
  //       similarQuestions: z
  //         .array(z.string())
  //         .describe("3 similar questions to the user's question."),
  //     }),
  //     execute: async ({ similarQuestions }) => {
  //       try {
  //         const results = await Promise.all(
  //           similarQuestions.map((question) =>
  //             findRelevantContent(question)
  //           )
  //         );
  //         const flatResults = results.flat().filter(Boolean);
  //         const uniqueResults = Array.from(
  //           new Map(flatResults.map((item) => [item?.text, item])).values()
  //         );
  //         return {
  //           result: uniqueResults.map((item, index) => ({
  //             id: item.id ?? `doc-${index}`,
  //             text: item.text ?? "（内容なし）",
  //           })),
  //         };
  //       } catch (err) {
  //         console.error("getInformation error:", err);
  //         return { result: [] };
  //       }
  //     },
  //   }),
  // },

  tools: {}, // ← 空定義にしておくと動作は維持される
});

    return result.toDataStreamResponse();
  } catch (error: unknown) {
    console.error(error);
    return new Response(
      JSON.stringify({
        error: "An unexpected error occurred. Please try again later.",
      }),
      { status: 500 }
    );
  }
}
