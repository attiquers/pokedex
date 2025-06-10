import { useState } from 'react';
import { supabase } from '@/lib/supabaseClient';

interface UserSidebarProps {
  avatarUrl?: string;
  email?: string;
}

export default function UserSidebar({ avatarUrl = '/pokeball.png', email }: UserSidebarProps) {
  const [open, setOpen] = useState(false);

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
        <div className="fixed inset-0 z-50 flex">
          <div className="w-64 bg-white h-full shadow-2xl p-6 flex flex-col animate-slideInRight">
            <div className="flex items-center mb-6">
              <img
                src={avatarUrl}
                alt="Profile"
                className="w-16 h-16 rounded-full border-2 border-blue-500 object-cover"
              />
              <div className="ml-4">
                <div className="font-bold text-lg text-gray-800">{email}</div>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="mt-auto bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-4 rounded shadow"
            >
              Log Out
            </button>
          </div>
          <div
            className="flex-1 bg-black bg-opacity-40"
            onClick={() => setOpen(false)}
            aria-label="Close user sidebar"
          />
        </div>
      )}
      <style jsx>{`
        @keyframes slideInRight {
          from { transform: translateX(100%); }
          to { transform: translateX(0); }
        }
        .animate-slideInRight {
          animation: slideInRight 0.2s ease-out;
        }
      `}</style>
    </>
  );
}
