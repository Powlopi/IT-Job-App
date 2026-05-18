import { useState } from "react";
import { supabase } from "./supabase";

export default function Auth() {
  const [isSignUp, setIsSignUp] = useState(false); // Toggles between Login and Sign Up views
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");

  // Handle standard Email/Password Authentication
  const handleAuth = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    if (isSignUp) {
      const { error } = await supabase.auth.signUp({ email, password });
      if (error) setMessage(error.message);
      else setMessage("Account created successfully!");
    } else {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (error) setMessage(error.message);
    }
    setLoading(false);
  };

  // Handle Social Provider Logins (Google, GitHub, etc.)
  const handleSocialLogin = async (provider) => {
    setMessage("");
    const { error } = await supabase.auth.signInWithOAuth({
      provider: provider,
      options: {
        // Redirection URL back to your app after authentication completes
        redirectTo: window.location.origin,
      },
    });
    if (error) setMessage(error.message);
  };

  return (
    <div className="w-full max-w-md mx-auto mt-6 md:mt-16 p-6 sm:p-8 bg-white dark:bg-slate-800 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-700 transition-all">
      {/* Dynamic Header text based on state */}
      <h2 className="text-2xl font-bold text-center text-slate-800 dark:text-white mb-2">
        {isSignUp ? "Create an account" : "Welcome back"}
      </h2>
      <p className="text-center text-xs sm:text-sm text-slate-500 dark:text-slate-400 mb-6">
        {isSignUp
          ? "Get started with your IT career journey"
          : "Log in to manage your applications"}
      </p>

      {/* Main Email Form */}
      <form className="flex flex-col gap-4" onSubmit={handleAuth}>
        <div>
          <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1.5 uppercase tracking-wider">
            Email Address
          </label>
          <input
            type="email"
            required
            placeholder="name@company.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full p-3 text-sm rounded-lg border text-slate-700 border-slate-300 dark:border-slate-600 bg-slate-50 dark:bg-slate-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-shadow"
          />
        </div>
        <div>
          <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1.5 uppercase tracking-wider">
            Password
          </label>
          <input
            type="password"
            required
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full p-3 text-sm rounded-lg border text-slate-700 border-slate-300 dark:border-slate-600 bg-slate-50 dark:bg-slate-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-shadow"
          />
        </div>

        {message && (
          <p
            className={`text-xs text-center font-medium p-2.5 rounded-lg ${message.includes("success") ? "bg-emerald-50 text-emerald-600 dark:bg-emerald-950/20 dark:text-emerald-400" : "bg-red-50 text-red-600 dark:bg-red-950/20 dark:text-red-400"}`}
          >
            {message}
          </p>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-indigo-600 hover:bg-indigo-700 text-white p-3 rounded-lg font-semibold text-sm sm:text-base transition-colors shadow-sm disabled:opacity-50 mt-2 cursor-pointer"
        >
          {loading
            ? "Processing..."
            : isSignUp
              ? "Register Account"
              : "Sign In"}
        </button>
      </form>

      {/* Split Divider */}
      <div className="relative flex py-5 items-center">
        <div className="grow border-t border-slate-200 dark:border-slate-700"></div>
        <span className="shrink mx-4 text-slate-400 dark:text-slate-500 text-xs font-medium uppercase tracking-wider">
          Or continue with
        </span>
        <div className="grow border-t border-slate-200 dark:border-slate-700"></div>
      </div>

      {/* Social Logins Layout Grid */}
      <div className="grid grid-cols-2 gap-3">
        {/* Google OAuth Button */}
        <button
          onClick={() => handleSocialLogin("google")}
          className="flex items-center justify-center gap-2 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700/50 p-2.5 rounded-lg text-sm font-medium transition-colors cursor-pointer"
        >
          <svg className="h-4 w-4" viewBox="0 0 24 24">
            <path
              fill="#EA4335"
              d="M12.24 10.285V14.4h6.887c-.275 1.565-1.88 4.604-6.887 4.604-4.33 0-7.859-3.578-7.859-8s3.53-8 7.859-8c2.46 0 4.105 1.025 5.047 1.926l3.227-3.111C18.281 1.055 15.477 0 12.24 0 5.58 0 0 5.37 0 12s5.58 12 12.24 12c6.96 0 11.57-4.834 11.57-11.79 0-.79-.085-1.4-.188-1.925H12.24z"
            />
          </svg>
          Google
        </button>

        {/* GitHub OAuth Button */}
        <button
          onClick={() => handleSocialLogin("github")}
          className="flex items-center justify-center gap-2 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700/50 p-2.5 rounded-lg text-sm font-medium transition-colors cursor-pointer"
        >
          <svg
            className="h-4 w-4 fill-current text-slate-900 dark:text-white"
            viewBox="0 0 24 24"
          >
            <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.93 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z" />
          </svg>
          GitHub
        </button>
      </div>

      {/* Screen Switcher Link Toggle */}
      <div className="mt-6 text-center">
        <button
          onClick={() => {
            setIsSignUp(!isSignUp);
            setMessage("");
          }}
          className="text-xs sm:text-sm text-indigo-600 dark:text-indigo-400 hover:underline font-medium cursor-pointer"
        >
          {isSignUp
            ? "Already have an account? Log in"
            : "Don't have an account? Sign up"}
        </button>
      </div>
    </div>
  );
}
