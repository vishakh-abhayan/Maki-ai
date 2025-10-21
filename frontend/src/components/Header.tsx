import { useState, useEffect } from "react";
import { Download, Settings } from "lucide-react";
import {
  SignedIn,
  SignedOut,
  SignInButton,
  UserButton,
} from "@clerk/clerk-react";

interface HeaderProps {
  logoImage?: string;
  showDivider?: boolean;
}

const Header = ({ logoImage, showDivider = true }: HeaderProps) => {
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <>
      {/* Glass Blur Bar on Scroll */}
      <div
        className={`fixed top-0 left-0 right-0 h-14 lg:h-20 transition-all duration-300 z-50 pointer-events-none ${
          isScrolled ? "backdrop-blur-xl bg-background/5" : ""
        }`}
      >
        {showDivider && (
          <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent" />
        )}
      </div>

      {/* Mobile Logo - FIXED */}
      <div className="lg:hidden fixed top-0 left-4 h-14 z-50 flex items-center">
        {logoImage ? (
          <img src={logoImage} alt="maki.ai" className="h-11 w-auto" />
        ) : (
          <h1
            className="text-lg font-semibold text-foreground tracking-wide"
            style={{ fontFamily: "'Courier New', 'Courier', monospace" }}
          >
            maki.ai
          </h1>
        )}
      </div>

      {/* Mobile Buttons - FIXED */}
      <div className="lg:hidden fixed right-4 top-3.5 z-50 flex items-center gap-2">
        <button className="w-8 h-8 rounded-lg bg-card/60 backdrop-blur-xl border border-card-border flex items-center justify-center hover:bg-card/80 transition-colors active:scale-95 shadow-lg">
          <Download className="w-4 h-4 text-foreground" />
        </button>
        <button className="w-8 h-8 rounded-lg bg-card/60 backdrop-blur-xl border border-card-border flex items-center justify-center hover:bg-card/80 transition-colors active:scale-95 shadow-lg">
          <Settings className="w-4 h-4 text-foreground" />
        </button>
      </div>

      {/* Spacer for mobile */}
      <div className="lg:hidden h-14"></div>

      {/* Desktop Header */}
      <div className="hidden lg:block">
        {/* Desktop Logo */}
        <div className="fixed top-0 left-8 h-20 z-50 flex items-center">
          {logoImage ? (
            <img src={logoImage} alt="maki.ai" className="h-16 w-auto" />
          ) : (
            <h1
              className="text-xl font-semibold text-foreground tracking-wide"
              style={{ fontFamily: "'Courier New', 'Courier', monospace" }}
            >
              maki.ai
            </h1>
          )}
        </div>

        {/* Desktop Buttons */}
        <div className="fixed right-8 top-6 z-50">
          <div className="flex items-center gap-3">
            <button className="w-9 h-9 rounded-full bg-card/60 backdrop-blur-xl border border-card-border flex items-center justify-center hover:bg-card/80 transition-all active:scale-95 shadow-lg">
              <Download className="w-[18px] h-[18px] text-foreground" />
            </button>
            <button className="w-9 h-9 rounded-full bg-card/60 backdrop-blur-xl border border-card-border flex items-center justify-center hover:bg-card/80 transition-all active:scale-95 shadow-lg">
              <Settings className="w-[18px] h-[18px] text-foreground" />
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default Header;
