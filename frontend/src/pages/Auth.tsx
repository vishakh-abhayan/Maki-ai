import { useState } from "react";
import { useSignIn, useSignUp } from "@clerk/clerk-react";
import { useNavigate } from "react-router-dom";

// Password Strength Indicator Component
const PasswordStrengthIndicator = ({ password }: { password: string }) => {
  const calculateStrength = (pass: string) => {
    let strength = 0;
    const feedback: string[] = [];

    if (pass.length === 0)
      return { strength: 0, feedback: [], level: "", color: "" };

    // Length check
    if (pass.length >= 8) {
      strength += 25;
    } else {
      feedback.push("8+ characters");
    }

    // Uppercase check
    if (/[A-Z]/.test(pass)) {
      strength += 25;
    } else {
      feedback.push("uppercase");
    }

    // Lowercase check
    if (/[a-z]/.test(pass)) {
      strength += 25;
    } else {
      feedback.push("lowercase");
    }

    // Number or special character check
    if (/[0-9]/.test(pass) || /[^A-Za-z0-9]/.test(pass)) {
      strength += 25;
    } else {
      feedback.push("number/symbol");
    }

    // Determine level and color
    let level = "";
    let color = "";
    if (strength <= 25) {
      level = "Weak";
      color = "#ef4444"; // red
    } else if (strength <= 50) {
      level = "Fair";
      color = "#f97316"; // orange
    } else if (strength <= 75) {
      level = "Good";
      color = "#eab308"; // yellow
    } else {
      level = "Strong";
      color = "#22c55e"; // green
    }

    return { strength, feedback, level, color };
  };

  const { strength, feedback, level, color } = calculateStrength(password);

  if (password.length === 0) return null;

  return (
    <div className="mt-2 space-y-2">
      {/* Progress bar */}
      <div className="w-full h-1.5 bg-white/10 rounded-full overflow-hidden backdrop-blur-md">
        <div
          className="h-full transition-all duration-300 ease-out"
          style={{
            width: `${strength}%`,
            backgroundColor: color,
          }}
        />
      </div>

      {/* Strength level and feedback */}
      <div className="flex items-center justify-between text-xs">
        <span className="font-medium tracking-wide" style={{ color }}>
          {level}
        </span>
        {feedback.length > 0 && (
          <span className="text-white/50">Need: {feedback.join(", ")}</span>
        )}
      </div>
    </div>
  );
};

const AuthPage = () => {
  const [mode, setMode] = useState<"sign-up" | "sign-in" | "forgot-password">(
    "sign-up"
  );
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [pendingVerification, setPendingVerification] = useState(false);
  const [code, setCode] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [showPassword, setShowPassword] = useState(false); // NEW: Toggle password visibility

  const { signIn, setActive: setActiveSignIn } = useSignIn();
  const { signUp, setActive: setActiveSignUp } = useSignUp();
  const navigate = useNavigate();

  const handleOAuth = async (
    provider: "google" | "github" | "linkedin_oidc"
  ) => {
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
        setError("Sign in failed. Please try again.");
      }
    } catch (err: any) {
      setError(err.errors?.[0]?.message || "Invalid email or password");
    } finally {
      setIsLoading(false);
    }
  };

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
      setError(err.errors?.[0]?.message || "Sign up failed");
    } finally {
      setIsLoading(false);
    }
  };

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
      setError(err.errors?.[0]?.message || "Invalid verification code");
    } finally {
      setIsLoading(false);
    }
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!signIn) return;

    setIsLoading(true);
    setError("");
    setSuccessMessage("");

    try {
      await signIn.create({
        strategy: "reset_password_email_code",
        identifier: email,
      });

      setPendingVerification(true);
      setSuccessMessage("Reset code sent! Check your email.");
    } catch (err: any) {
      setError(err.errors?.[0]?.message || "Failed to send reset code");
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!signIn) return;

    setIsLoading(true);
    setError("");

    try {
      const result = await signIn.attemptFirstFactor({
        strategy: "reset_password_email_code",
        code,
        password: newPassword,
      });

      if (result.status === "complete") {
        await setActiveSignIn({ session: result.createdSessionId });
        setSuccessMessage("Password reset successful!");
        setTimeout(() => navigate("/"), 1500);
      } else {
        setError("Password reset failed. Please try again.");
      }
    } catch (err: any) {
      setError(err.errors?.[0]?.message || "Invalid code or password");
    } finally {
      setIsLoading(false);
    }
  };

  const resetForm = () => {
    setEmail("");
    setPassword("");
    setFirstName("");
    setLastName("");
    setCode("");
    setNewPassword("");
    setError("");
    setSuccessMessage("");
    setPendingVerification(false);
    setShowPassword(false);
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center relative overflow-hidden p-4 gap-8">
      {/* Header */}
      <div className="flex flex-col items-center gap-2.5 z-20 px-4">
        <h1 className="font-semibold text-white text-[40px] tracking-[2px]">
          MAKI
        </h1>
        <p className="font-light text-white text-center text-base sm:text-lg md:text-xl tracking-wide">
          Convergence of Mind and Machine
        </p>
      </div>

      {/* Main Auth Card */}
      <div className="relative z-10 w-full max-w-[450px]">
        <div className="relative backdrop-blur-xl bg-white/10 border border-white/20 rounded-[30px] shadow-2xl p-8">
          {/* FORGOT PASSWORD MODE */}
          {mode === "forgot-password" ? (
            <>
              {!pendingVerification ? (
                <>
                  <div className="text-center mb-6">
                    <h2 className="text-2xl font-light text-white mb-2">
                      Reset Password
                    </h2>
                    <p className="text-white/60 text-sm">
                      Enter your email to receive a reset code
                    </p>
                  </div>

                  {error && (
                    <div className="mb-4 p-3 rounded-xl bg-red-500/20 border border-red-500/30 backdrop-blur-md">
                      <p className="text-red-200 text-sm text-center">
                        {error}
                      </p>
                    </div>
                  )}

                  {successMessage && (
                    <div className="mb-4 p-3 rounded-xl bg-green-500/20 border border-green-500/30 backdrop-blur-md">
                      <p className="text-green-200 text-sm text-center">
                        {successMessage}
                      </p>
                    </div>
                  )}

                  <form onSubmit={handleForgotPassword} className="space-y-4">
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="Enter your email"
                      required
                      disabled={isLoading}
                      className="w-full h-12 px-4 bg-white/10 backdrop-blur-md border border-white/20 rounded-xl text-white placeholder:text-white/40 focus:bg-white/15 focus:border-white/30 focus:outline-none transition-all disabled:opacity-50"
                    />

                    <button
                      type="submit"
                      disabled={isLoading}
                      className="w-full h-12 bg-blue-600 hover:bg-blue-700 rounded-xl text-white font-semibold shadow-lg shadow-blue-600/50 hover:shadow-blue-600/60 transition-all disabled:opacity-50"
                    >
                      {isLoading ? "Sending..." : "Send Reset Code"}
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        setMode("sign-in");
                        resetForm();
                      }}
                      className="w-full text-white/60 hover:text-white text-sm transition-colors"
                    >
                      ← Back to sign in
                    </button>
                  </form>
                </>
              ) : (
                <>
                  <div className="text-center mb-6">
                    <h2 className="text-2xl font-light text-white mb-2">
                      Enter Reset Code
                    </h2>
                    <p className="text-white/60 text-sm">
                      Code sent to{" "}
                      <span className="text-white font-medium">{email}</span>
                    </p>
                  </div>

                  {error && (
                    <div className="mb-4 p-3 rounded-xl bg-red-500/20 border border-red-500/30 backdrop-blur-md">
                      <p className="text-red-200 text-sm text-center">
                        {error}
                      </p>
                    </div>
                  )}

                  {successMessage && (
                    <div className="mb-4 p-3 rounded-xl bg-green-500/20 border border-green-500/30 backdrop-blur-md">
                      <p className="text-green-200 text-sm text-center">
                        {successMessage}
                      </p>
                    </div>
                  )}

                  <form onSubmit={handleResetPassword} className="space-y-4">
                    <input
                      type="text"
                      value={code}
                      onChange={(e) => setCode(e.target.value)}
                      placeholder="000000"
                      required
                      maxLength={6}
                      disabled={isLoading}
                      className="w-full h-16 px-4 bg-white/10 backdrop-blur-md border border-white/20 rounded-xl text-white text-2xl text-center tracking-widest placeholder:text-white/30 focus:bg-white/15 focus:border-white/30 focus:outline-none transition-all disabled:opacity-50"
                    />

                    {/* NEW: Password input with strength indicator for reset */}
                    <div>
                      <div className="relative">
                        <input
                          type={showPassword ? "text" : "password"}
                          value={newPassword}
                          onChange={(e) => setNewPassword(e.target.value)}
                          placeholder="Enter new password"
                          required
                          disabled={isLoading}
                          className="w-full h-12 px-4 pr-12 bg-white/10 backdrop-blur-md border border-white/20 rounded-xl text-white placeholder:text-white/40 focus:bg-white/15 focus:border-white/30 focus:outline-none transition-all disabled:opacity-50"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-4 top-1/2 -translate-y-1/2 text-white/60 hover:text-white transition-colors"
                        >
                          {showPassword ? (
                            <svg
                              className="w-5 h-5"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21"
                              />
                            </svg>
                          ) : (
                            <svg
                              className="w-5 h-5"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                              />
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                              />
                            </svg>
                          )}
                        </button>
                      </div>
                      <PasswordStrengthIndicator password={newPassword} />
                    </div>

                    <button
                      type="submit"
                      disabled={isLoading}
                      className="w-full h-12 bg-blue-600 hover:bg-blue-700 rounded-xl text-white font-semibold shadow-lg shadow-blue-600/50 hover:shadow-blue-600/60 transition-all disabled:opacity-50"
                    >
                      {isLoading ? "Resetting..." : "Reset Password"}
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        setPendingVerification(false);
                        setCode("");
                        setNewPassword("");
                        setError("");
                      }}
                      className="w-full text-white/60 hover:text-white text-sm transition-colors"
                    >
                      ← Resend code
                    </button>
                  </form>
                </>
              )}
            </>
          ) : !pendingVerification ? (
            <>
              {/* Tab Switcher */}
              <div className="flex justify-center mb-6">
                <div className="bg-white/5 backdrop-blur-md rounded-full p-1 inline-flex gap-1 border border-white/10">
                  <button
                    onClick={() => {
                      setMode("sign-up");
                      resetForm();
                    }}
                    className={`px-6 py-2 rounded-full text-sm font-medium tracking-wide transition-all ${
                      mode === "sign-up"
                        ? "bg-white/20 text-white shadow-lg backdrop-blur-xl"
                        : "text-white/60 hover:text-white/80"
                    }`}
                  >
                    Sign up
                  </button>

                  <button
                    onClick={() => {
                      setMode("sign-in");
                      resetForm();
                    }}
                    className={`px-6 py-2 rounded-full text-sm font-medium tracking-wide transition-all ${
                      mode === "sign-in"
                        ? "bg-white/20 text-white shadow-lg backdrop-blur-xl"
                        : "text-white/60 hover:text-white/80"
                    }`}
                  >
                    Sign in
                  </button>
                </div>
              </div>

              {/* Subtitle */}
              <p className="text-left text-white text-lg tracking-wide mb-6">
                {mode === "sign-up" ? "Join the movement." : "Welcome Back!"}
              </p>

              {/* Error Message */}
              {error && (
                <div className="mb-4 p-3 rounded-xl bg-red-500/20 border border-red-500/30 backdrop-blur-md">
                  <p className="text-red-200 text-sm text-center">{error}</p>
                </div>
              )}

              {/* Form */}
              <form
                onSubmit={mode === "sign-in" ? handleSignIn : handleSignUp}
                className="space-y-4"
              >
                {/* First Name & Last Name - Only for Sign Up */}
                {mode === "sign-up" && (
                  <div className="flex gap-3">
                    <input
                      type="text"
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                      placeholder="First name"
                      required
                      disabled={isLoading}
                      className="flex-1 min-w-0 h-12 px-4 bg-white/10 backdrop-blur-md border border-white/20 rounded-xl text-white placeholder:text-white/40 focus:bg-white/15 focus:border-white/30 focus:outline-none transition-all disabled:opacity-50"
                    />

                    <input
                      type="text"
                      value={lastName}
                      onChange={(e) => setLastName(e.target.value)}
                      placeholder="Last name"
                      required
                      disabled={isLoading}
                      className="flex-1 min-w-0 h-12 px-4 bg-white/10 backdrop-blur-md border border-white/20 rounded-xl text-white placeholder:text-white/40 focus:bg-white/15 focus:border-white/30 focus:outline-none transition-all disabled:opacity-50"
                    />
                  </div>
                )}

                {/* Email Input */}
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email"
                  required
                  disabled={isLoading}
                  className="w-full h-12 px-4 bg-white/10 backdrop-blur-md border border-white/20 rounded-xl text-white placeholder:text-white/40 focus:bg-white/15 focus:border-white/30 focus:outline-none transition-all disabled:opacity-50"
                />

                {/* Password Input with Strength Indicator */}
                <div>
                  <div className="relative">
                    <input
                      type={showPassword ? "text" : "password"}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Enter your password"
                      required
                      disabled={isLoading}
                      className="w-full h-12 px-4 pr-12 bg-white/10 backdrop-blur-md border border-white/20 rounded-xl text-white placeholder:text-white/40 focus:bg-white/15 focus:border-white/30 focus:outline-none transition-all disabled:opacity-50"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-white/60 hover:text-white transition-colors"
                    >
                      {showPassword ? (
                        <svg
                          className="w-5 h-5"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21"
                          />
                        </svg>
                      ) : (
                        <svg
                          className="w-5 h-5"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                          />
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                          />
                        </svg>
                      )}
                    </button>
                  </div>

                  {/* Show strength indicator only for sign-up */}
                  {mode === "sign-up" && (
                    <PasswordStrengthIndicator password={password} />
                  )}
                </div>

                {/* Forgot Password Link - Only shown in sign-in mode */}
                {mode === "sign-in" && (
                  <div className="flex justify-end -mt-2">
                    <button
                      type="button"
                      onClick={() => {
                        setMode("forgot-password");
                        resetForm();
                      }}
                      className="text-white/60 hover:text-white text-sm transition-colors"
                    >
                      Forgot password?
                    </button>
                  </div>
                )}

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full h-12 bg-blue-600 hover:bg-blue-700 rounded-xl text-white font-semibold shadow-lg shadow-blue-600/50 hover:shadow-blue-600/60 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoading
                    ? "Loading..."
                    : mode === "sign-up"
                    ? "Join"
                    : "Login"}
                </button>
              </form>

              {/* Divider */}
              <div className="flex items-center gap-4 my-6">
                <div className="flex-1 h-px bg-white/20"></div>
                <span className="text-white/50 text-xs uppercase tracking-widest">
                  OR JOIN WITH
                </span>
                <div className="flex-1 h-px bg-white/20"></div>
              </div>

              {/* Social Login Buttons */}
              <div className="flex justify-center gap-3">
                {/* Google */}
                <button
                  onClick={() => handleOAuth("google")}
                  disabled={isLoading}
                  className="w-12 h-12 bg-white/10 backdrop-blur-md border border-white/20 rounded-xl hover:bg-white/15 transition-all disabled:opacity-50 flex items-center justify-center"
                  title="Continue with Google"
                >
                  <svg className="w-5 h-5" viewBox="0 0 24 24">
                    <path
                      fill="#fff"
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    />
                    <path
                      fill="#fff"
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    />
                    <path
                      fill="#fff"
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                    />
                    <path
                      fill="#fff"
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                    />
                  </svg>
                </button>

                {/* GitHub */}
                <button
                  onClick={() => handleOAuth("github")}
                  disabled={isLoading}
                  className="w-12 h-12 bg-white/10 backdrop-blur-md border border-white/20 rounded-xl hover:bg-white/15 transition-all disabled:opacity-50 flex items-center justify-center"
                  title="Continue with GitHub"
                >
                  <svg className="w-5 h-5" fill="#fff" viewBox="0 0 24 24">
                    <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
                  </svg>
                </button>

                {/* LinkedIn */}
                <button
                  onClick={() => handleOAuth("linkedin_oidc")}
                  disabled={isLoading}
                  className="w-12 h-12 bg-white/10 backdrop-blur-md border border-white/20 rounded-xl hover:bg-white/15 transition-all disabled:opacity-50 flex items-center justify-center"
                  title="Continue with LinkedIn"
                >
                  <svg className="w-5 h-5" fill="#fff" viewBox="0 0 24 24">
                    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
                  </svg>
                </button>
              </div>
            </>
          ) : (
            // Email Verification Screen (for sign-up)
            <>
              <div className="text-center mb-6">
                <h2 className="text-2xl font-light text-white mb-2">
                  Verify your email
                </h2>
                <p className="text-white/60 text-sm">
                  We sent a code to{" "}
                  <span className="text-white font-medium">{email}</span>
                </p>
              </div>

              {error && (
                <div className="mb-4 p-3 rounded-xl bg-red-500/20 border border-red-500/30 backdrop-blur-md">
                  <p className="text-red-200 text-sm text-center">{error}</p>
                </div>
              )}

              <form onSubmit={handleVerifyEmail} className="space-y-4">
                <input
                  type="text"
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  placeholder="000000"
                  required
                  maxLength={6}
                  disabled={isLoading}
                  className="w-full h-16 px-4 bg-white/10 backdrop-blur-md border border-white/20 rounded-xl text-white text-2xl text-center tracking-widest placeholder:text-white/30 focus:bg-white/15 focus:border-white/30 focus:outline-none transition-all disabled:opacity-50"
                />

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full h-12 bg-blue-600 hover:bg-blue-700 rounded-xl text-white font-semibold shadow-lg shadow-blue-600/50 hover:shadow-blue-600/60 transition-all disabled:opacity-50"
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
                  className="w-full text-white/60 hover:text-white text-sm transition-colors"
                >
                  ← Back to sign up
                </button>
              </form>
            </>
          )}
        </div>
      </div>

      {/* Footer */}
      <footer className="flex items-center justify-center gap-2 z-20">
        <span className="text-white/60 text-sm">© maki.ai 2025</span>
      </footer>
    </div>
  );
};

export default AuthPage;
