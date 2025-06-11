import { OpenAI } from "openai";
import { NextRequest, NextResponse } from "next/server";

const openai = new OpenAI({
  apiKey: process.env.OPEN_ROUTER_API,
  baseURL: "https://openrouter.ai/api/v1",
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { wildData, userData } = body;

    // Helper function to format top 3 most powerful moves
    const formatTopMoves = (moves: any[]) =>
      moves
        .filter((move) => move.power)
        .sort((a, b) => b.power - a.power)
        .slice(0, 3)
        .map((m) => `${m.name} [${m.type}] (Power: ${m.power})`)
        .join(", ");

    // Helper to format arrays for prompt
    const formatArr = (arr: any[] | undefined) =>
      arr && arr.length > 0 ? arr.join(", ") : "none";

    const wildMoves = formatTopMoves(wildData.moves || []);
    const userMoves = formatTopMoves(userData.moves || []);

    const prompt = `
You are a Pokemon Battle Expert.

Evaluate two Pokemon in a 1v1 battle. Consider their base stats, types, abilities, weaknesses, strengths, and their top 3 most powerful moves.

Return only the winner's name in lowercase, or "tie" if it's an even match.
Do not explain. Respond with a single word only.

Examples:
---
Pokemon 1: charmander
Types: fire
Abilities: blaze
Weaknesses: water, ground, rock
Strengths: grass, bug, ice, steel
Stats: hp: 39, attack: 52, defense: 43, special-attack: 60, special-defense: 50, speed: 65
Moves: ember [fire] (Power: 40), scratch [normal] (Power: 40), growl [normal]

Pokemon 2: squirtle
Types: water
Abilities: torrent
Weaknesses: electric, grass
Strengths: fire, ground, rock
Stats: hp: 44, attack: 48, defense: 65, special-attack: 50, special-defense: 64, speed: 43
Moves: water gun [water] (Power: 40), tackle [normal] (Power: 40), tail whip [normal]

Answer: squirtle

---
Pokemon 1: ${wildData.name}
Types: ${formatArr(wildData.types)}
Abilities: ${formatArr(wildData.abilities)}
Weaknesses: ${formatArr(wildData.weaknesses)}
Strengths: ${formatArr(wildData.strengths)}
Stats: ${wildData.stats?.map((s: any) => `${s.name}: ${s.value}`).join(", ")}
Moves: ${wildMoves}

Pokemon 2: ${userData.name}
Types: ${formatArr(userData.types)}
Abilities: ${formatArr(userData.abilities)}
Weaknesses: ${formatArr(userData.weaknesses)}
Strengths: ${formatArr(userData.strengths)}
Stats: ${userData.stats?.map((s: any) => `${s.name}: ${s.value}`).join(", ")}
Moves: ${userMoves}

Answer:
    `.trim();

    console.log("wildData", wildData);
    console.log("userData", userData);
    console.log("Prompt:", prompt);

    const completion = await openai.chat.completions.create({
      model: "deepseek/deepseek-r1-0528:free",
      messages: [
        {
          role: "system",
          content:
            "You are a Pokemon Battle Expert. Only respond with the winner's name in lowercase or 'tie'. No reasoning or extra text. One word only.",
        },
        { role: "user", content: prompt },
      ],
      max_tokens: 140000,
      temperature: 0.2,
    });

    console.log("OpenRouter completion:", JSON.stringify(completion, null, 2));

    const rawResponse = completion.choices[0]?.message?.content || "";
    const winner = rawResponse.split("\n")[0]?.trim().toLowerCase();

    const sanitize = (name: string) => name.trim().toLowerCase();
    let result = "tie";

    if (winner === sanitize(wildData.name)) {
      result = wildData.name;
    } else if (winner === sanitize(userData.name)) {
      result = userData.name;
    }

    return NextResponse.json({ winner: result });
  } catch (err) {
    console.error("Battle error:", err);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
