"use client";
import { useUser } from '@/lib/useUser';
import { useState, useEffect } from 'react';
import SignInSignUpModal from '@/components/SignInSignUpModal';
import UserSidebar from '@/components/userSidebar';
import { supabase } from '@/lib/supabaseClient';
import { useRouter } from 'next/navigation';

function formatMoneyShort(n: number | null) {
  if (n === null) return "";
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(1).replace(/\.0$/, "") + "m";
  if (n >= 1_000) return (n / 1_000).toFixed(1).replace(/\.0$/, "") + "k";
  return n.toString();
}

export default function AuthGlobalUI() {
  const { user, loading: userLoading } = useUser();
  const [showSidebar, setShowSidebar] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [money, setMoney] = useState<number | null>(null);
  const router = useRouter();

  useEffect(() => {
    if (!user) return;
    // Ensure user exists in users table
    async function ensureUserInDb() {
      try {
        const { data, error } = await supabase
          .from('users')
          .select('id')
          .eq('id', user.id)
          .single();
        if (error && error.code !== 'PGRST116') {
          // Not found is not an error, but other errors are
          console.error('Error checking user in users table:', error);
        }
        if (!data) {
          // Insert user if not present
          const { error: insertError } = await supabase.from('users').insert({
            id: user.id,
            email: user.email,
            name: user.email ? user.email.split('@')[0] : 'Trainer',
            created_at: new Date().toISOString(), // Add if your table requires it
          });
          if (insertError) {
            console.error('Error inserting user into users table:', insertError);
          }
        }
      } catch (err) {
        console.error('User DB check/insert failed:', err);
      }
    }
    ensureUserInDb();
  }, [user, router]);

  useEffect(() => {
    if (!user) return;
    async function checkStarter() {
      const { count, error } = await supabase
        .from('user_pokemons')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id);
      if (!error && count === 0) {
        router.replace('/starterpokemon');
      }
    }
    checkStarter();
  }, [user, router]);

  // Fetch user money for compressed display
  useEffect(() => {
    async function fetchMoney() {
      if (!user) return setMoney(null);
      try {
        const { createClient } = await import("@supabase/supabase-js");
        const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
        const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
        if (!supabaseUrl || !supabaseAnonKey) return;
        const supabase = createClient(supabaseUrl, supabaseAnonKey);
        const { data } = await supabase
          .from("users")
          .select("money")
          .eq("id", user.id)
          .single();
        setMoney(data?.money ?? null);
      } catch {
        setMoney(null);
      }
    }
    fetchMoney();
  }, [user]);

  if (userLoading) return null;

  return (
    <>
      {user ? (
        <>
          {/* Show avatar with compressed money below when sidebar is closed */}
          <div className="fixed top-4 right-4 z-50 flex flex-col items-center">
            <button
              onClick={() => setShowSidebar(true)}
              className="focus:outline-none"
              aria-label="Open user sidebar"
              style={{ background: "none", border: "none", padding: 0 }}
            >
              <img
                src={user.user_metadata?.avatar_url || '/pokeball.png'}
                alt="Profile"
                className="w-12 h-12 rounded-full border-2 border-blue-500 shadow-lg object-cover"
              />
            </button>
            {money !== null && (
              <span className="mt-1 text-xs font-bold bg-yellow-100 text-yellow-800 px-2 py-0.5 rounded-full shadow border border-yellow-300">
                ${formatMoneyShort(money)}
              </span>
            )}
          </div>
          {/* Sidebar with exact money shown inside UserSidebar */}
          {showSidebar && (
            <UserSidebar
              avatarUrl={user.user_metadata?.avatar_url || '/pokeball.png'}
              email={user.email}
              // ...pass other props if needed...
            />
          )}
        </>
      ) : (
        <div className="fixed top-4 right-4 z-50">
          <button
            className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-6 rounded-full shadow-lg transition"
            onClick={() => setShowModal(true)}
          >
            Sign In
          </button>
        </div>
      )}
      {showModal && !user && (
        <SignInSignUpModal onClose={() => setShowModal(false)} />
      )}
    </>
  );
}
