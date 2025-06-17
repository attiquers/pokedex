import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import AnimatedNavLink from '@/utils/AnimatedNavLink';

interface UserSidebarProps {
  avatarUrl?: string;
  email?: string;
}

export default function UserSidebar({ avatarUrl = '/pokeball.png', email }: UserSidebarProps) {
  const [open, setOpen] = useState(false);
  const [money, setMoney] = useState<number | null>(null);
  const router = useRouter();

  // Fetch user money when sidebar opens
  useEffect(() => {
    async function fetchMoney() {
      try {
        const { createClient } = await import("@supabase/supabase-js");
        const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
        const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
        if (!supabaseUrl || !supabaseAnonKey) return;
        const supabase = createClient(supabaseUrl, supabaseAnonKey);
        const { data: userData } = await supabase.auth.getUser();
        const userId = userData?.user?.id;
        if (!userId) return;
        const { data, error } = await supabase
          .from("users")
          .select("money")
          .eq("id", userId)
          .single();
        if (!error && data) setMoney(data.money);
      } catch (err) {
        setMoney(null);
      }
    }
    if (open) fetchMoney();
  }, [open]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setOpen(false);
    router.push('/');
  };

  return (
    <>
      {/* User avatar button */}
      <button
        onClick={() => setOpen(true)}
        className="fixed top-4 right-4 z-50 focus:outline-none"
        aria-label="Open user sidebar"
      >
        <img
          src={avatarUrl}
          alt="Profile"
          className="w-12 h-12 rounded-full border-2 border-blue-500 shadow-lg object-cover"
        />
      </button>
      {/* Sidebar */}
      {open && (
        <>
          {/* Glassmorphic black overlay */}
          <div
            className="fixed inset-0 z-40 bg-black/40 backdrop-blur-md transition-opacity duration-200"
            onClick={() => setOpen(false)}
            aria-label="Close user sidebar"
          />
          {/* Sidebar */}
          <div className="fixed top-0 right-0 h-full w-72 max-w-full z-50 poke-sidebar shadow-2xl p-6 flex flex-col border-l border-gray-200 animate-slideInRight">
            {/* Close (X) button */}
            <button
              className="absolute top-4 right-4 text-2xl font-bold focus:outline-none text-yellow-400 hover:text-yellow-300"
              onClick={() => setOpen(false)}
              aria-label="Close sidebar"
              type="button"
            >
              ×
            </button>
            <div className="flex flex-col items-center mb-8 mt-2">
              <img
                src={avatarUrl}
                alt="Profile"
                className="w-16 h-16 rounded-full border-4 border-yellow-400 object-cover mb-2 bg-white"
              />
              <div className="font-bold text-lg text-yellow-300">{email?.split('@')[0] || 'Trainer'}</div>
              <div className="text-xs text-yellow-200 mt-1">{email}</div>
              {money !== null && (
                <div className="mt-2 px-3 py-1 rounded-full bg-yellow-100 text-yellow-800 font-bold text-base shadow border border-yellow-300">
                  ${money}
                </div>
              )}
            </div>
            <AnimatedNavLink href="/" className="mb-2 poke-btn block text-center" style={{background:'var(--poke-blue)'}} onClick={() => setOpen(false)}>
              Home
            </AnimatedNavLink>
            <AnimatedNavLink href="/region" className="mb-2 poke-btn block text-center" style={{background:'var(--poke-green)'}} onClick={() => setOpen(false)}>
              Catch Pokémon
            </AnimatedNavLink>
            <AnimatedNavLink href="/mypokemons" className="mb-2 poke-btn block text-center" style={{background:'var(--poke-red)'}} onClick={() => setOpen(false)}>
              My Pokémons
            </AnimatedNavLink>
            <AnimatedNavLink href="/quiz" className="mb-6 poke-btn block text-center" style={{background:'var(--poke-yellow)', color:'var(--poke-black)'}} onClick={() => setOpen(false)}>
              Quiz
            </AnimatedNavLink>
            <button
              onClick={handleLogout}
              className="mt-auto poke-btn" style={{background:'var(--poke-gray)'}}
            >
              Log Out
            </button>
          </div>
        </>
      )}
      <style jsx>{`
        @keyframes slideInRight {
          from { transform: translateX(100%); }
          to { transform: translateX(0); }
        }
        .animate-slideInRight {
          animation: slideInRight 0.2s ease-out;
        }
        .sidebar-action-btn:hover {
          cursor: pointer;
        }
      `}</style>
    </>
  );
}
