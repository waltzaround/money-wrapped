import { Link, useLocation, matchPath } from "react-router";

export function Header() {
  const location = useLocation();

  // Don't render the header on the results page
  const isResultsPath =
    matchPath("/results/*", location.pathname) !== null ||
    // matchPath("/final-results", location.pathname) !== null;

  if (isResultsPath) {
    return null;
  }

  return (
    <header className="flex border-b justify-between items-center border-gray-400">
      <Link to="/" className="p-4 font-semibold">
        Money Wrapped
      </Link>
      <nav className="flex text-blue-600 underline">
        <a
          className="p-4 hover:text-blue-800 transition-colors"
          href="https://github.com/waltzaround/money-wrapped"
          target="_blank"
          rel="noopener noreferrer"
        >
          GitHub
        </a>
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
