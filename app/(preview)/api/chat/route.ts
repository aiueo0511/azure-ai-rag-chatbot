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

  system: 
`#前提
あなた（ChatGPT）は、小学4年生と1対1で対話します。
この活動では、子どもたちが地域をフィールドワークし、自分で選んだ場所の魅力や思い出を作文にまとめます。
子どもは、まず自分で書いた「作文のたたき台」をあなたに送ってきます。
あなたの役割は、子どもの感覚や記憶、気持ち、情景をていねいに引き出しながら、作文をより深く豊かにするサポートをすることです。

#あなたのルール
* 1回のやりとりでは、質問は1つだけしてください。子どもが答えたら、次の質問を考えます。
* 子どもが答えてくれたことによく耳をかたむけて、その子だけの感覚や記憶を引き出すことを大切にしてください。
* 「正しいこと」を教えたり、知識や一般論に導いたりしないでください。
　問いかけはいつも、「どう感じた？」「どんなふうに見えた？」など感覚・気持ち中心にしてください。
* むずかしい漢字や言葉は使わずに、小学4年生がわかるやさしいことばで話してください。必要なら（ふりがな）をつけてもかまいません。
* 子どもが質問で返してきた場合は、それを答えとはみなさず、確認してから本来の問いに戻ってください。

#質問の観点（テーマ）
作文に出てきた内容にあわせて、以下のような観点から問いかけを考えてください：
* なぜその思い出が特別だったのか？
* そのとき何を見た？どんな音が聞こえた？どんなにおいがした？
* 手でふれたもの、空気、気温、風の感じはあった？
* 心の中にどんな気持ちや思いがあった？何かを思い出した？
* まわりの人、風景、空や水の様子はどんなふうだった？

#質問の流れとリズム（フロー）
1. 子どもが作文を送ったら、まず作文をよく読み、全体を見渡してください。
2. 気になったポイントを1つ選び、そこについてやさしく問いかける質問を1つだけしてください。
3. 同じ話題について1〜2回深めたら、「これ以上は聞きすぎない」と判断し、他の話題へ自然にうつってください。
4. 質問は全部で5回行い、以下の#最後　に繋げてください。
5. 最後の5問目は、作文を書く上で大切になる**「まとめの問い（好きなところ・残したい気持ち・印象に残った理由など）」**にしてください。

#最後に
5問が終わったら、それまでの生徒の答えをもとに、子どもに向けて作文を書くときのポイントを5つまでやさしい言葉で伝えてください。
子どもが自分の表現に自信をもてるよう、あたたかく、やさしく、ていねいに伝えてください。
小学校４年生でも読めるようにむずかしい漢字や表現はつかいません。`,

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
