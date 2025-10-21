import { useState, useEffect } from "react";

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
          <img src={logoImage} alt="maki.ai" className="h-10 w-auto" />
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

      {/* Spacer for mobile */}
      <div className="lg:hidden h-14"></div>

      {/* Desktop Header */}
      <div className="hidden lg:block">
        {/* Desktop Logo */}
        <div className="fixed top-0 left-8 h-20 z-50 flex items-center">
          {logoImage ? (
            <img src={logoImage} alt="maki.ai" className="h-14 w-auto" />
          ) : (
            <h1
              className="text-xl font-semibold text-foreground tracking-wide"
              style={{ fontFamily: "'Courier New', 'Courier', monospace" }}
            >
              maki.ai
            </h1>
          )}
        </div>
      </div>
    </>
  );
};

export default Header;
