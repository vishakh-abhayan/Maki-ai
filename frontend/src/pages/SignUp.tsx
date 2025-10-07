import { SignUp } from "@clerk/clerk-react";

const SignUpPage = () => {
  return (
    <div 
      className="min-h-screen flex items-center justify-center relative overflow-hidden"
      style={{
        background: 'linear-gradient(135deg, #0a1929 0%, #203a43 50%, #0d2c4a 100%)'
      }}
    >
      {/* Animated background effect */}
      <div className="absolute inset-0 opacity-30">
        <div className="absolute top-20 left-20 w-96 h-96 bg-teal-500 rounded-full mix-blend-multiply filter blur-3xl animate-pulse"></div>
        <div className="absolute bottom-20 right-20 w-96 h-96 bg-blue-500 rounded-full mix-blend-multiply filter blur-3xl animate-pulse delay-700"></div>
      </div>

      <div className="relative z-10 w-full max-w-md px-4">
        {/* Custom branding */}
        <div className="text-center mb-8">
          <h1 
            className="text-4xl font-semibold text-white tracking-wide mb-2" 
            style={{ fontFamily: "'Courier New', 'Courier', monospace" }}
          >
            maki.ai
          </h1>
        </div>
        
        {/* Clerk's Sign Up Component with custom styling */}
        <SignUp 
          appearance={{
            elements: {
              rootBox: "mx-auto",
              card: "bg-white/10 backdrop-blur-md border border-white/20 shadow-2xl",
              headerTitle: "text-white",
              headerSubtitle: "text-gray-300",
              socialButtonsBlockButton: "bg-white/10 border-white/20 text-white hover:bg-white/20",
              socialButtonsBlockButtonText: "text-white font-medium",
              dividerLine: "bg-white/20",
              dividerText: "text-gray-300",
              formFieldLabel: "text-gray-200",
              formFieldInput: "bg-white/10 border-white/20 text-white placeholder:text-gray-400 focus:border-teal-400",
              formButtonPrimary: "bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-medium",
              footerActionLink: "text-teal-400 hover:text-teal-300",
              identityPreviewText: "text-white",
              identityPreviewEditButton: "text-teal-400",
              formFieldInputShowPasswordButton: "text-gray-300 hover:text-white",
              formFieldAction: "text-teal-400 hover:text-teal-300",
              formFieldRow__username: "hidden", // Hide username if not needed
              formFieldSuccessText: "text-green-400",
              formFieldErrorText: "text-red-400",
              footer: "hidden",
            }
          }}
          redirectUrl="/"
          signInUrl="/sign-in"
        />
        
        {/* Custom footer */}
        <div className="mt-6 text-center">
          <p className="text-gray-400 text-sm">
            Already have an account?{" "}
            <a href="/sign-in" className="text-teal-400 hover:text-teal-300 font-medium">
              Sign in
            </a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default SignUpPage;