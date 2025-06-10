"use client";
import { useUser } from '@/lib/useUser';
import { useState } from 'react';
import SignInSignUpModal from '@/components/SignInSignUpModal';
import UserSidebar from '@/components/userSidebar';

export default function AuthGlobalUI() {
  const { user, loading: userLoading } = useUser();
  const [showSidebar, setShowSidebar] = useState(false);
  const [showModal, setShowModal] = useState(false);

  if (userLoading) return null;

  return (
    <>
      {user ? (
        <UserSidebar
          avatarUrl={user.user_metadata?.avatar_url || '/pokeball.png'}
          email={user.email}
        />
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
