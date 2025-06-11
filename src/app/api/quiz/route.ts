import { NextRequest, NextResponse } from "next/server";

// Example question bank (replace/expand with your own logic or API)
const QUESTIONS = {
  easy: [
    {
      question: "Which Pokémon is known as the Seed Pokémon?",
      correct: "Bulbasaur",
      choices: ["Bulbasaur", "Charmander", "Squirtle", "Pikachu"],
    },
    {
      question: "What type is Charmander?",
      correct: "Fire",
      choices: ["Fire", "Water", "Grass", "Electric"],
    },
    {
      question: "Which Pokémon evolves into Butterfree?",
      correct: "Metapod",
      choices: ["Metapod", "Caterpie", "Weedle", "Kakuna"],
    },
  ],
  medium: [
    {
      question: "Which Pokémon has the ability 'Overgrow'?",
      correct: "Bulbasaur",
      choices: ["Bulbasaur", "Charmander", "Squirtle", "Pidgey"],
    },
    {
      question: "Which move is super effective against Water type?",
      correct: "Thunderbolt",
      choices: ["Thunderbolt", "Ember", "Vine Whip", "Tackle"],
    },
    {
      question: "What is the evolved form of Machop?",
      correct: "Machoke",
      choices: ["Machoke", "Machamp", "Makuhita", "Mankey"],
    },
  ],
  difficult: [
    {
      question: "Which Pokémon can learn the move 'Spore'?",
      correct: "Parasect",
      choices: ["Parasect", "Pikachu", "Charizard", "Lapras"],
    },
    {
      question: "Which of these is NOT a Dragon type?",
      correct: "Gyarados",
      choices: ["Gyarados", "Dragonite", "Salamence", "Altaria"],
    },
    {
      question: "What is the base stat total of Mewtwo?",
      correct: "680",
      choices: ["680", "600", "720", "580"],
    },
  ],
};

function getRandomQuestion(difficulty: "easy" | "medium" | "difficult") {
  const pool = QUESTIONS[difficulty];
  const idx = Math.floor(Math.random() * pool.length);
  // Shuffle choices
  const q = pool[idx];
  const shuffled = [...q.choices].sort(() => Math.random() - 0.5);
  return { question: q.question, choices: shuffled, correct: q.correct };
}

// Add this for debugging API requests
export async function GET(req: NextRequest) {
  // Debug logging for API call
  try {
    const { searchParams } = new URL(req.url);
    const difficulty = searchParams.get("difficulty") as "easy" | "medium" | "difficult";
    console.log("Quiz API called with difficulty:", difficulty);
    if (!difficulty || !QUESTIONS[difficulty]) {
      console.log("Quiz API error: Invalid difficulty");
      return NextResponse.json({ error: "Invalid difficulty" }, { status: 400 });
    }
    const quiz = getRandomQuestion(difficulty);
    console.log("Quiz API returning question:", quiz);
    return NextResponse.json(quiz);
  } catch (err) {
    console.error("Quiz API unexpected error:", err);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
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
