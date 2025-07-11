import { useState } from 'react';
import { supabase } from '@/lib/supabaseClient'; // Adjust path based on your setup
import { FaGoogle } from 'react-icons/fa';
import { useUser } from '@/lib/useUser';

const SignInSignUpModal = ({ onClose }: { onClose: () => void }) => {
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showSidebar, setShowSidebar] = useState(false);
  const { user, loading: userLoading } = useUser();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    if (isSignUp) {
      if (password !== confirmPassword) {
        setError("Passwords don't match");
        setLoading(false);
        return;
      }

      const { error } = await supabase.auth.signUp({
        email,
        password,
      });

      if (error) {
        setError(error.message);
      } else {
        onClose(); // Close modal on success
      }
    } else {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        setError(error.message);
      } else {
        onClose(); // Close modal on success
      }
    }

    setLoading(false);
  };

  const handleOAuthSignIn = async () => {
    setError('');
    setLoading(true);
    const { error } = await supabase.auth.signInWithOAuth({ provider: 'google' });
    if (error) setError(error.message);
    setLoading(false);
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setShowSidebar(false);
    window.location.href = '/';
  };

  if (user) {
    return (
      <>
        <div className="fixed top-4 right-4 z-50">
          <button onClick={() => setShowSidebar(true)} className="focus:outline-none">
            <img
              src={user.user_metadata?.avatar_url || '/pokeball.png'}
              alt="Profile"
              className="w-12 h-12 rounded-full border-2 border-blue-500 shadow-lg object-cover"
            />
          </button>
        </div>
        {showSidebar && (
          <div className="fixed inset-0 z-50 flex">
            <div className="w-64 bg-white h-full shadow-2xl p-6 flex flex-col">
              <div className="flex items-center mb-6">
                <img
                  src={user.user_metadata?.avatar_url || '/pokeball.png'}
                  alt="Profile"
                  className="w-16 h-16 rounded-full border-2 border-blue-500 object-cover"
                />
                <div className="ml-4">
                  <div className="font-bold text-lg text-gray-800">{user.email}</div>
                </div>
              </div>
              <button
                onClick={handleLogout}
                className="mt-auto bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-4 rounded shadow"
              >
                Log Out
              </button>
            </div>
            <div className="flex-1 bg-black bg-opacity-40" onClick={() => setShowSidebar(false)} />
          </div>
        )}
      </>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-sm w-full relative transform transition-all duration-300 ease-out scale-95 opacity-0 animate-scaleIn">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-500 hover:text-gray-700 text-2xl font-bold"
          aria-label="Close"
        >
          &times;
        </button>

        <h2 className="text-3xl font-extrabold text-gray-800 mb-6 text-center">
          {isSignUp ? 'Sign Up' : 'Sign In'}
        </h2>

        {error && <p className="text-red-500 text-sm mb-4 text-center">{error}</p>}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700">
              Email
            </label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm text-gray-900 placeholder-gray-500"
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700">
              Password
            </label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm text-gray-900 placeholder-gray-500"
            />
          </div>

          {isSignUp && (
            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">
                Confirm Password
              </label>
              <input
                type="password"
                id="confirmPassword"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm text-gray-900 placeholder-gray-500"
              />
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className={`w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-lg font-semibold text-white ${
              loading ? 'bg-blue-400' : 'bg-blue-600 hover:bg-blue-700'
            } focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition duration-150 ease-in-out transform hover:scale-105`}
          >
            {loading ? 'Please wait...' : isSignUp ? 'Create Account' : 'Sign In'}
          </button>

          <button
            type="button"
            onClick={handleOAuthSignIn}
            className="flex items-center justify-center gap-2 w-full py-2 px-4 border border-gray-300 rounded-md shadow-sm bg-white text-gray-800 font-semibold hover:bg-gray-100 transition mt-2"
            disabled={loading}
          >
            <FaGoogle /> Continue with Google
          </button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-sm text-gray-600">
            {isSignUp ? 'Already have an account?' : "Don't have an account?"}{' '}
            <button
              type="button"
              onClick={() => {
                setIsSignUp((prev) => !prev);
                setError('');
              }}
              className="font-medium text-blue-600 hover:text-blue-500 focus:outline-none"
            >
              {isSignUp ? 'Sign In' : 'Sign Up'}
            </button>
          </p>
        </div>
      </div>

      <style jsx>{`
        @keyframes scaleIn {
          from {
            opacity: 0;
            transform: scale(0.95);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }
        .animate-scaleIn {
          animation: scaleIn 0.2s ease-out forwards;
        }
      `}</style>
    </div>
  );
};

export default SignInSignUpModal;
