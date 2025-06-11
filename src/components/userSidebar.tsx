import { useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { useRouter } from 'next/navigation';

interface UserSidebarProps {
  avatarUrl?: string;
  email?: string;
}

export default function UserSidebar({ avatarUrl = '/pokeball.png', email }: UserSidebarProps) {
  const [open, setOpen] = useState(false);
  const router = useRouter();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setOpen(false);
    // Optionally, you can refresh the page or redirect
    window.location.reload();
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
            </div>
            <button className="mb-2 poke-btn" style={{background:'var(--poke-blue)'}} onClick={() => { setOpen(false); router.push('/'); }}>
              Home
            </button>
            <button className="mb-2 poke-btn" style={{background:'var(--poke-green)'}} onClick={() => { setOpen(false); router.push('/region'); }}>
              Catch Pokémon
            </button>
            <button className="mb-2 poke-btn" style={{background:'var(--poke-red)'}} onClick={() => { setOpen(false); router.push('/mypokemons'); }}>
              My Pokémons
            </button>
            <button className="mb-2 poke-btn" style={{background:'var(--poke-yellow)', color:'var(--poke-black)'}} onClick={() => {/* TODO: resources action */}}>
              Resources
            </button>
            <button className="mb-6 poke-btn" style={{background:'var(--poke-black)'}} onClick={() => {/* TODO: quiz action */}}>
              Quiz
            </button>
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
