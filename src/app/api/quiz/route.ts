import { NextRequest, NextResponse } from "next/server";
import { QUESTIONS } from "@/app/api/quiz/questions"; // <-- import the new question bank

function getRandomQuestion(difficulty: "easy" | "medium" | "difficult", used: string[] = []) {
  const pool = QUESTIONS[difficulty];
  // Filter out used questions if provided
  const available = pool.filter(q => !used.includes(q.question));
  const arr = available.length > 0 ? available : pool;
  const idx = Math.floor(Math.random() * arr.length);
  const q = arr[idx];
  const shuffled = [...q.choices].sort(() => Math.random() - 0.5);
  return { question: q.question, choices: shuffled, correct: q.correct };
}

// Add this for debugging API requests
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const difficulty = searchParams.get("difficulty") as "easy" | "medium" | "difficult";
    // Optionally, allow passing used questions as a comma-separated list
    const used = searchParams.get("used")?.split("|||") ?? [];
    if (!difficulty || !QUESTIONS[difficulty]) {
      return NextResponse.json({ error: "Invalid difficulty" }, { status: 400 });
    }
    const quiz = getRandomQuestion(difficulty, used);
    return NextResponse.json(quiz);
  } catch (err) {
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

// Generate a Pokémon quiz question using Deepseek API
async function getQuizFromDeepseek(difficulty: "easy" | "medium" | "difficult") {
  // Compose a prompt for Deepseek to generate a Pokémon quiz question
  const prompt = `
Generate a single-choice Pokémon quiz question of ${difficulty} difficulty.
Return a JSON object with the following format:
{
  "question": "The question text?",
  "choices": ["choice1", "choice2", "choice3", "choice4"],
  "correct": "the correct answer (must match one of the choices)"
}
The question should be about Pokémon, and the choices must be plausible. Only return the JSON object, no explanation.
`;

  const apiKey = process.env.OPEN_ROUTER_API;
  if (!apiKey) throw new Error("Missing Deepseek/OpenRouter API key");

  const res = await fetch("https://openrouter.ai/api/v1/chat/completions", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "deepseek/deepseek-chat",
      messages: [
        { role: "system", content: "You are a Pokémon quiz generator." },
        { role: "user", content: prompt }
      ],
      max_tokens: 512,
      temperature: 0.7,
    }),
  });

  if (!res.ok) {
    throw new Error(`Deepseek API error: ${res.statusText}`);
  }

  const data = await res.json();
  // Try to extract the JSON object from the response
  let content = data.choices?.[0]?.message?.content ?? "";
  try {
    // Remove code block markers if present
    content = content.trim().replace(/^```json|^```|```$/g, "").trim();
    const quiz = JSON.parse(content);
    // Validate structure
    if (
      typeof quiz.question === "string" &&
      Array.isArray(quiz.choices) &&
      quiz.choices.length === 4 &&
      typeof quiz.correct === "string" &&
      quiz.choices.includes(quiz.correct)
    ) {
      return quiz;
    }
    throw new Error("Invalid quiz format from Deepseek");
  } catch (err) {
    throw new Error("Failed to parse Deepseek quiz: " + content);
  }
}

// Add POST endpoint to update user's money
export async function POST(req: NextRequest) {
  try {
    const { userId, amount } = await req.json();
    if (!userId || typeof amount !== "number") {
      return NextResponse.json({ error: "Missing userId or amount" }, { status: 400 });
    }

    // Use environment variables directly from process.env (not from env.local file at runtime)
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    if (!supabaseUrl || !supabaseAnonKey) {
      console.error("Supabase env vars missing", { supabaseUrl, supabaseAnonKey });
      return NextResponse.json({ error: "Supabase env vars missing" }, { status: 500 });
    }

    // Dynamically import supabase-js and create a single client instance
    const { createClient } = await import("@supabase/supabase-js");
    const supabase = createClient(supabaseUrl, supabaseAnonKey);

    // Log for debugging
    console.log("Updating money for user:", userId, "by amount:", amount);

    // Get current money
    const { data: userData, error: getError } = await supabase
      .from("users")
      .select("money")
      .eq("id", userId)
      .single();

    if (getError) {
      console.error("User not found or error fetching user:", getError);
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const newMoney = (userData?.money ?? 0) + amount;

    const { error: updateError } = await supabase
      .from("users")
      .update({ money: newMoney })
      .eq("id", userId);

    if (updateError) {
      console.error("Failed to update money:", updateError);
      return NextResponse.json({ error: "Failed to update money" }, { status: 500 });
    }

    console.log("Money updated to", newMoney, "for user", userId);
    return NextResponse.json({ success: true, money: newMoney });
  } catch (err) {
    console.error("Money update error:", err);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
