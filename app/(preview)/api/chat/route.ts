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
      system: `You are a helpful assistant acting as the users' second brain.
Use the getInformation tool to search for relevant knowledge.
If no relevant information is found, answer based on your general knowledge and reasoning.
Only respond "Sorry, I don't know." if you truly cannot answer using any available information.
Be sure to adhere to any instructions in tool calls if they specify response style.
Keep responses short and concise. Answer in a single sentence where possible.
Cite sources using source ids like 【234d987】 if available. Otherwise, omit citations.`,
      tools: {
        getInformation: tool({
          description: `get information from your knowledge base to answer the user's question.`,
          parameters: z.object({
            question: z.string().describe("The user's question"),
            similarQuestions: z
              .array(z.string())
              .describe("3 similar questions to the user's question."),
          }),
          execute: async ({ similarQuestions }) => {
            try {
              const results = await Promise.all(
                similarQuestions.map((question) =>
                  findRelevantContent(question)
                )
              );

              const flatResults = results.flat().filter(Boolean);
              const uniqueResults = Array.from(
                new Map(flatResults.map((item) => [item?.text, item])).values()
              );

              return {
                result: uniqueResults.map((item, index) => ({
                  id: item.id ?? `doc-${index}`,
                  text: item.text ?? "（内容なし）",
                })),
              };
            } catch (err) {
              console.error("getInformation error:", err);
              return { result: [] };
            }
          },
        }),
      },
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
