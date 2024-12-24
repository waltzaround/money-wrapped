import { Link, useLocation, matchPath } from "react-router";
import { useState } from "react";

export function Header() {
  const location = useLocation();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  // Don't render the header on the results page
  const isResultsPath =
    matchPath("/results/*", location.pathname) !== null ||
    matchPath("/final-results", location.pathname) !== null;

  if (isResultsPath) {
    return null;
  }

  return (
    <header className="flex border-b justify-between items-center border-gray-400">
      <Link to="/" className="p-4 font-semibold z-10">
        Money Wrapped
      </Link>

      {/* Hamburger Button */}
      <button
        className="p-4 z-10 md:hidden"
        onClick={() => setIsMenuOpen(!isMenuOpen)}
        aria-label="Toggle menu"
      >
        <div className={`hamburger-icon ${isMenuOpen ? "open" : ""}`}>
          <span className="block w-6 h-0.5 bg-black mb-1 transition-all"></span>
          <span className="block w-6 h-0.5 bg-black mb-1 transition-all"></span>
          <span className="block w-6 h-0.5 bg-black transition-all"></span>
        </div>
      </button>

      {/* Navigation Menu */}
      <nav
        className={`
        md:flex text-blue-600 underline
        ${isMenuOpen ? "flex" : "hidden"}
        ${
          isMenuOpen
            ? "fixed inset-0 bg-white flex-col items-center justify-center"
            : ""
        }
      `}
      >
        <a
          className="p-4 hover:text-blue-800 transition-colors"
          href="https://github.com/waltzaround/money-wrapped"
          target="_blank"
          rel="noopener noreferrer"
        >
          GitHub
        </a>
        <Link className="p-4 hover:text-blue-800 transition-colors" to="/faq">
          About
        </Link>
        <Link className="p-4 hover:text-blue-800 transition-colors" to="/csv">
          Upload CSV
        </Link>
        <Link
          className="p-4 hover:text-blue-800 transition-colors"
          to="/account"
        >
          Connect Account
        </Link>
      </nav>
    </header>
  );
}
