import { useState } from "react";
import { useSignIn, useSignUp } from "@clerk/clerk-react";
import { useNavigate } from "react-router-dom";

const AuthPage = () => {
  const [mode, setMode] = useState<"sign-up" | "sign-in">("sign-up");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [pendingVerification, setPendingVerification] = useState(false);
  const [code, setCode] = useState("");

  const { signIn, setActive: setActiveSignIn } = useSignIn();
  const { signUp, setActive: setActiveSignUp } = useSignUp();
  const navigate = useNavigate();

  // OAuth Handler - Always shows all providers
  const handleOAuth = async (provider: "google" | "github" | "linkedin_oidc") => {
    setIsLoading(true);
    setError("");
    
    try {
      if (mode === "sign-in" && signIn) {
        await signIn.authenticateWithRedirect({
          strategy: `oauth_${provider}`,
          redirectUrl: window.location.origin + "/",
          redirectUrlComplete: window.location.origin + "/",
        });
      } else if (mode === "sign-up" && signUp) {
        await signUp.authenticateWithRedirect({
          strategy: `oauth_${provider}`,
          redirectUrl: window.location.origin + "/",
          redirectUrlComplete: window.location.origin + "/",
        });
      }
    } catch (err: any) {
      console.error("OAuth error:", err);
      setError(err.errors?.[0]?.message || "Authentication failed");
      setIsLoading(false);
    }
  };

  // Email/Password Sign In
  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!signIn) return;

    setIsLoading(true);
    setError("");

    try {
      const result = await signIn.create({
        identifier: email,
        password,
      });

      if (result.status === "complete") {
        await setActiveSignIn({ session: result.createdSessionId });
        navigate("/");
      } else {
        console.error("Sign in not complete:", result);
        setError("Sign in failed. Please try again.");
      }
    } catch (err: any) {
      console.error("Sign in error:", err);
      setError(err.errors?.[0]?.message || "Invalid email or password");
    } finally {
      setIsLoading(false);
    }
  };

  // Email/Password Sign Up
  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!signUp) return;

    setIsLoading(true);
    setError("");

    try {
      await signUp.create({
        emailAddress: email,
        password,
        firstName,
        lastName,
      });

      await signUp.prepareEmailAddressVerification({
        strategy: "email_code",
      });

      setPendingVerification(true);
    } catch (err: any) {
      console.error("Sign up error:", err);
      setError(err.errors?.[0]?.message || "Sign up failed");
    } finally {
      setIsLoading(false);
    }
  };

  // Verify Email Code
  const handleVerifyEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!signUp) return;

    setIsLoading(true);
    setError("");

    try {
      const result = await signUp.attemptEmailAddressVerification({
        code,
      });

      if (result.status === "complete") {
        await setActiveSignUp({ session: result.createdSessionId });
        navigate("/");
      } else {
        setError("Verification failed. Please try again.");
      }
    } catch (err: any) {
      console.error("Verification error:", err);
      setError(err.errors?.[0]?.message || "Invalid verification code");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden p-4">
      {/* Remove the old animated background and use the same one from your app */}
      
      <div className="relative z-10 w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-light text-white/90 mb-3 tracking-wider">MAKI</h1>
          <p className="text-gray-400 text-sm tracking-wide">Convergence of Mind and Machine</p>
        </div>
        
        {/* Main auth card */}
        <div className="glass-container p-8">
          {!pendingVerification ? (
            <>
              {/* Tab switcher */}
              <div className="flex gap-1 mb-6 bg-black/20 p-1 rounded-xl w-fit mx-auto">
                <button
                  onClick={() => {
                    setMode("sign-up");
                    setError("");
                    setEmail("");
                    setPassword("");
                    setFirstName("");
                    setLastName("");
                  }}
                  className={`py-1.5 px-6 rounded-lg text-xs font-medium transition-all ${
                    mode === "sign-up" 
                      ? "bg-white/10 text-white" 
                      : "text-gray-500 hover:text-gray-300"
                  }`}
                >
                  Sign up
                </button>
                <button
                  onClick={() => {
                    setMode("sign-in");
                    setError("");
                    setEmail("");
                    setPassword("");
                  }}
                  className={`py-1.5 px-6 rounded-lg text-xs font-medium transition-all ${
                    mode === "sign-in" 
                      ? "bg-white/10 text-white" 
                      : "text-gray-500 hover:text-gray-300"
                  }`}
                >
                  Sign in
                </button>
              </div>
              
              {/* Subtitle */}
              <p className="text-center text-gray-400 mb-5 text-sm font-light">
                Join the movement.
              </p>

              {/* Error Message */}
              {error && (
                <div className="mb-4 p-3 rounded-lg bg-red-500/10 border border-red-500/20">
                  <p className="text-red-400 text-sm text-center">{error}</p>
                </div>
              )}
              
              {/* Email/Password Form */}
              <form onSubmit={mode === "sign-in" ? handleSignIn : handleSignUp} className="space-y-4">
                {/* First Name & Last Name - Only for Sign Up */}
                {mode === "sign-up" && (
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-gray-300/80 text-sm mb-2">
                        First name
                      </label>
                      <input
                        type="text"
                        value={firstName}
                        onChange={(e) => setFirstName(e.target.value)}
                        placeholder="First name"
                        required
                        disabled={isLoading}
                        className="w-full bg-transparent border border-white/10 text-white placeholder:text-gray-500 rounded-xl px-4 py-3 text-sm transition-all focus:border-blue-400/50 focus:outline-none focus:ring-3 focus:ring-blue-400/10 disabled:opacity-50"
                      />
                    </div>
                    <div>
                      <label className="block text-gray-300/80 text-sm mb-2">
                        Last name
                      </label>
                      <input
                        type="text"
                        value={lastName}
                        onChange={(e) => setLastName(e.target.value)}
                        placeholder="Last name"
                        required
                        disabled={isLoading}
                        className="w-full bg-transparent border border-white/10 text-white placeholder:text-gray-500 rounded-xl px-4 py-3 text-sm transition-all focus:border-blue-400/50 focus:outline-none focus:ring-3 focus:ring-blue-400/10 disabled:opacity-50"
                      />
                    </div>
                  </div>
                )}

                {/* Email Input */}
                <div>
                  <label className="block text-gray-300/80 text-sm mb-2">
                    Email address
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter your email address"
                    required
                    disabled={isLoading}
                    className="w-full bg-transparent border border-white/10 text-white placeholder:text-gray-500 rounded-xl px-4 py-3 text-sm transition-all focus:border-blue-400/50 focus:outline-none focus:ring-3 focus:ring-blue-400/10 disabled:opacity-50"
                  />
                </div>

                {/* Password Input */}
                <div>
                  <label className="block text-gray-300/80 text-sm mb-2">
                    Password
                  </label>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter your password"
                    required
                    disabled={isLoading}
                   className="w-full bg-transparent border border-white/10 text-white placeholder:text-gray-500 rounded-xl px-4 py-3 text-sm transition-all focus:border-blue-400/50 focus:outline-none focus:ring-3 focus:ring-blue-400/10 disabled:opacity-50"
                  />
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-xl transition-all shadow-lg shadow-blue-600/40 hover:shadow-blue-600/50 hover:translate-y-[-1px] disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoading ? "Loading..." : "Continue"}
                </button>
              </form>

              {/* Divider */}
              <div className="flex items-center gap-4 my-6">
                <div className="flex-1 h-px bg-white/10"></div>
                <span className="text-gray-500 text-xs uppercase tracking-widest font-light">
                  OR
                </span>
                <div className="flex-1 h-px bg-white/10"></div>
              </div>

              {/* Social Login Buttons */}
              <div className="flex justify-center gap-4">
                {/* Google */}
                <button
                  onClick={() => handleOAuth("google")}
                  disabled={isLoading}
                  className="w-12 h-12 bg-white/6 border border-white/10 rounded-xl flex items-center justify-center hover:bg-white/10 hover:border-white/20 transition-all hover:translate-y-[-2px] disabled:opacity-50 disabled:cursor-not-allowed"
                  title="Continue with Google"
                >
                  <svg className="w-5 h-5" viewBox="0 0 24 24">
                    <path fill="#fff" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                    <path fill="#fff" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                    <path fill="#fff" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                    <path fill="#fff" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                  </svg>
                </button>

                {/* GitHub */}
                <button
                  onClick={() => handleOAuth("github")}
                  disabled={isLoading}
                  className="w-12 h-12 bg-white/6 border border-white/10 rounded-xl flex items-center justify-center hover:bg-white/10 hover:border-white/20 transition-all hover:translate-y-[-2px] disabled:opacity-50 disabled:cursor-not-allowed"
                  title="Continue with GitHub"
                >
                  <svg className="w-5 h-5" fill="#fff" viewBox="0 0 24 24">
                    <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
                  </svg>
                </button>

                {/* LinkedIn */}
                <button
                  onClick={() => handleOAuth("linkedin_oidc")}
                  disabled={isLoading}
                  className="w-12 h-12 bg-white/6 border border-white/10 rounded-xl flex items-center justify-center hover:bg-white/10 hover:border-white/20 transition-all hover:translate-y-[-2px] disabled:opacity-50 disabled:cursor-not-allowed"
                  title="Continue with LinkedIn"
                >
                  <svg className="w-5 h-5" fill="#fff" viewBox="0 0 24 24">
                    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                  </svg>
                </button>
              </div>
            </>
          ) : (
            // Verification Code Screen
            <>
              <div className="text-center mb-6">
                <h2 className="text-2xl font-light text-white mb-2">Verify your email</h2>
                <p className="text-gray-400 text-sm">
                  We sent a code to <span className="text-white">{email}</span>
                </p>
              </div>

              {error && (
                <div className="mb-4 p-3 rounded-lg bg-red-500/10 border border-red-500/20">
                  <p className="text-red-400 text-sm text-center">{error}</p>
                </div>
              )}

              <form onSubmit={handleVerifyEmail} className="space-y-4">
                <div>
                  <label className="block text-gray-300/80 text-sm mb-2">
                    Verification code
                  </label>
                  <input
                    type="text"
                    value={code}
                    onChange={(e) => setCode(e.target.value)}
                    placeholder="Enter 6-digit code"
                    required
                    maxLength={6}
                    disabled={isLoading}
                    className="w-full bg-transparent border border-white/10 text-white placeholder:text-gray-500 rounded-xl px-4 py-3 text-sm transition-all focus:border-blue-400/50 focus:outline-none focus:ring-3 focus:ring-blue-400/10 disabled:opacity-50 text-center text-2xl tracking-widest"
                  />
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-xl transition-all shadow-lg shadow-blue-600/40 hover:shadow-blue-600/50 hover:translate-y-[-1px] disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoading ? "Verifying..." : "Verify Email"}
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setPendingVerification(false);
                    setCode("");
                    setError("");
                  }}
                  className="w-full text-gray-400 hover:text-white text-sm transition-colors"
                >
                  ← Back to sign up
                </button>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default AuthPage;