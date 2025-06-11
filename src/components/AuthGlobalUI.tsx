"use client";
import { useUser } from '@/lib/useUser';
import { useState, useEffect } from 'react';
import SignInSignUpModal from '@/components/SignInSignUpModal';
import UserSidebar from '@/components/userSidebar';
import { supabase } from '@/lib/supabaseClient';
import { useRouter } from 'next/navigation';

export default function AuthGlobalUI() {
  const { user, loading: userLoading } = useUser();
  const [showSidebar, setShowSidebar] = useState(false);
  const [showModal, setShowModal] = useState(false);
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
