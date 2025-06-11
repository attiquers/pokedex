"use client";
import React, { useState, useEffect } from "react";

type QuizQuestion = {
  question: string;
  choices: string[];
  correct: string;
};

export default function QuizPage() {
  const [difficulty, setDifficulty] = useState<"easy" | "medium" | "difficult" | null>(null);
  const [quiz, setQuiz] = useState<QuizQuestion | null>(null);
  const [selected, setSelected] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [questionCount, setQuestionCount] = useState(0);
  const [userId, setUserId] = useState<string | null>(null);
  const [usedQuestions, setUsedQuestions] = useState<Set<string>>(new Set());
  const MAX_QUESTIONS = 5;

  // Fetch user id from supabase on mount
  useEffect(() => {
    async function fetchUser() {
      try {
        const { createClient } = await import("@supabase/supabase-js");
        const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
        const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
        if (!supabaseUrl || !supabaseAnonKey) return;
        const supabase = createClient(supabaseUrl, supabaseAnonKey);
        const { data } = await supabase.auth.getUser();
        setUserId(data?.user?.id ?? null);
      } catch (err) {
        console.error("Error fetching user:", err);
      }
    }
    fetchUser();
  }, []);

  async function fetchQuiz(diff: "easy" | "medium" | "difficult") {
    setLoading(true);
    setQuiz(null);
    setSelected(null);
    setFeedback(null);
    console.log("Fetching quiz question for difficulty:", diff);

    // Pass used questions to backend to avoid repeats
    const usedArr = Array.from(usedQuestions);
    const usedParam = usedArr.length > 0 ? `&used=${encodeURIComponent(usedArr.join("|||"))}` : "";
    try {
      const res = await fetch(`/api/quiz?difficulty=${diff}${usedParam}&t=${Date.now()}`);
      console.log("API response status:", res.status);
      if (res.ok) {
        const data = await res.json();
        console.log("Quiz data received:", data);
        const questionKey = (data.question || "").trim();
        setQuiz({
          question: data.question,
          choices: data.choices,
          correct: data.correct,
        });
        setUsedQuestions(prev => new Set(prev).add(questionKey));
      } else {
        console.error("Quiz API error:", res.statusText);
      }
    } catch (err) {
      console.error("Quiz fetch error:", err);
    }
    setLoading(false);
  }

  async function rewardMoney(difficulty: "easy" | "medium" | "difficult") {
    if (!userId) return;
    let amount = 0;
    if (difficulty === "easy") amount = 10;
    else if (difficulty === "medium") amount = 20;
    else if (difficulty === "difficult") amount = 50;

    try {
      // Call your Next.js API route instead of Supabase RPC
      const res = await fetch("/api/quiz", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, amount }),
      });
      const data = await res.json();
      if (!res.ok) {
        console.error("API money update error:", data.error);
      } else {
        console.log("Money updated via API:", data);
      }
    } catch (err) {
      console.error("Error updating user money via API:", err);
    }
  }

  async function handleSelect(choice: string) {
    setSelected(choice);
    if (quiz) {
      const correct = choice === quiz.correct;
      setFeedback(correct ? "Correct!" : `Incorrect! Correct answer: ${quiz.correct}`);
      if (correct && difficulty) {
        console.log("Money rewarded for", difficulty, "userId:", userId);
        await rewardMoney(difficulty);
      }
    }
  }

  function handleNext() {
    if (questionCount >= MAX_QUESTIONS - 1) {
      // After MAX_QUESTIONS, reset to difficulty selection
      setSelected(null);
      setDifficulty(null);
      setQuiz(null);
      setFeedback(null);
      setQuestionCount(0);
      setUsedQuestions(new Set());
    } else {
      setQuestionCount((c) => c + 1);
      if (difficulty) fetchQuiz(difficulty);
      setSelected(null);
      setFeedback(null);
    }
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-blue-100 to-green-100 py-10">
      <h1 className="text-3xl font-bold mb-8 text-blue-700">Pokémon Quiz</h1>
      {!difficulty ? (
        <div className="flex flex-col items-center gap-6">
          <div className="flex flex-row gap-4">
            <button
              className="px-6 py-3 rounded-xl bg-blue-500 text-white font-bold hover:bg-blue-600"
              onClick={() => {
                setDifficulty("easy");
                setQuestionCount(0);
                fetchQuiz("easy");
              }}
            >
              Easy
            </button>
            <button
              className="px-6 py-3 rounded-xl bg-yellow-500 text-white font-bold hover:bg-yellow-600"
              onClick={() => {
                setDifficulty("medium");
                setQuestionCount(0);
                fetchQuiz("medium");
              }}
            >
              Medium
            </button>
            <button
              className="px-6 py-3 rounded-xl bg-red-500 text-white font-bold hover:bg-red-600"
              onClick={() => {
                setDifficulty("difficult");
                setQuestionCount(0);
                fetchQuiz("difficult");
              }}
            >
              Difficult
            </button>
          </div>
          <div className="text-gray-700 font-semibold mt-2">
            Answer up to {MAX_QUESTIONS} questions per round!
          </div>
        </div>
      ) : (
        <div className="w-full max-w-xl flex flex-col items-center">
          <button
            className="mb-6 text-blue-700 underline"
            onClick={() => {
              setDifficulty(null);
              setQuiz(null);
              setFeedback(null);
              setSelected(null);
              setQuestionCount(0);
            }}
          >
            &larr; Change Difficulty
          </button>
          <div className="mb-2 text-gray-700 font-semibold">
            Question {questionCount + 1} of {MAX_QUESTIONS}
          </div>
          {loading && <div className="text-center text-black">Loading question...</div>}
          {quiz && (
            <div className="w-full bg-white rounded-2xl shadow-lg p-4 flex flex-col items-center">
              <div className="text-lg font-semibold text-center text-black mb-2">
                {quiz.question}
              </div>
              <div className="grid grid-cols-1 gap-2 w-full">
                {quiz.choices.map((choice) => (
                  <button
                    key={choice}
                    className={`px-4 py-2 rounded-lg border font-bold ${
                      selected
                        ? choice === quiz.correct
                          ? "bg-green-200 border-green-500 text-green-800"
                          : choice === selected
                          ? "bg-red-200 border-red-500 text-red-800"
                          : "bg-gray-100 border-gray-300 text-gray-700"
                        : "bg-blue-100 border-blue-300 text-blue-700 hover:bg-blue-200"
                    }`}
                    disabled={!!selected}
                    onClick={() => handleSelect(choice)}
                  >
                    {choice}
                  </button>
                ))}
              </div>
              {feedback && (
                <div className="text-xl font-bold text-center">
                  {feedback}
                </div>
              )}
              {selected && (
                <button
                  className="px-6 py-2 rounded-xl bg-blue-500 text-white font-bold hover:bg-blue-600"
                  onClick={handleNext}
                >
                  {questionCount >= MAX_QUESTIONS - 1 ? "Finish" : "Next Question"}
                </button>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}