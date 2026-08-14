import { List, Moon, Sun, X } from "@phosphor-icons/react";
import { useEffect, useState } from "react";
import { NavLink, Outlet, useLocation } from "react-router-dom";
import TargetCursor from "../reactbits/TargetCursor";

let visitCountRequest;
const THEME_STORAGE_KEY = "jacky-theme";

function getInitialTheme() {
  return document.documentElement.dataset.theme === "light" ? "light" : "dark";
}

function saveTheme(theme) {
  try {
    localStorage.setItem(THEME_STORAGE_KEY, theme);
  } catch (error) {
    console.warn("Theme preference could not be saved.", error);
  }
}

function applyThemeToDocument(theme) {
  const root = document.documentElement;
  const themeColor = theme === "light" ? "#f6f4ec" : "#0f1517";

  root.dataset.theme = theme;
  document.querySelector('meta[name="theme-color"]')?.setAttribute("content", themeColor);
}

function recordVisit() {
  const counterUrl = import.meta.env.VITE_VISIT_COUNTER_URL;
  if (!counterUrl) return null;

  if (!visitCountRequest) {
    visitCountRequest = Promise.resolve().then(async () => {
      const endpoint = new URL("/api/visit", counterUrl);
      const response = await fetch(endpoint, { method: "POST" });
      if (!response.ok) {
        throw new Error(`Visit counter returned ${response.status}.`);
      }

      const result = await response.json();
      if (!Number.isSafeInteger(result.count) || result.count < 0) {
        throw new Error("Visit counter returned an invalid count.");
      }

      return result.count;
    });
  }

  return visitCountRequest;
}

export default function AppShell() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [theme, setTheme] = useState(getInitialTheme);
  const [visitCount, setVisitCount] = useState(null);
  const location = useLocation();

  useEffect(() => {
    applyThemeToDocument(theme);
  }, [theme]);

  const toggleTheme = () => {
    const nextTheme = theme === "dark" ? "light" : "dark";
    const commitTheme = () => {
      applyThemeToDocument(nextTheme);
      setTheme(nextTheme);
      saveTheme(nextTheme);
    };
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    if (!document.startViewTransition || reducedMotion) {
      commitTheme();
      return;
    }

    document.startViewTransition(commitTheme);
  };

  useEffect(() => {
    setMenuOpen(false);
    window.scrollTo({ top: 0, behavior: "instant" });
  }, [location.pathname]);

  useEffect(() => {
    const request = recordVisit();
    if (!request) return undefined;

    let active = true;
    request
      .then((count) => {
        if (active) setVisitCount(count);
      })
      .catch((error) => {
        if (active) console.error("Failed to record site visit.", error);
      });

    return () => {
      active = false;
    };
  }, []);

  return (
    <div className="site-shell">
      <TargetCursor targetSelector="a, button" hoverDuration={0.16} />

      <header className="site-header">
        <NavLink className="wordmark" to="/" aria-label="Jacky home">Jacky</NavLink>
        <div className="site-header-actions">
          <nav className={menuOpen ? "site-nav is-open" : "site-nav"} aria-label="Primary navigation">
            <NavLink to="/" end>Home</NavLink>
            <NavLink to="/projects">Projects</NavLink>
            <NavLink to="/notes">Notes</NavLink>
            <NavLink to="/docs">Docs</NavLink>
          </nav>
          <button
            className="theme-toggle"
            type="button"
            aria-label={`Switch to ${theme === "dark" ? "light" : "dark"} mode`}
            title={`Switch to ${theme === "dark" ? "light" : "dark"} mode`}
            onClick={toggleTheme}
          >
            <span className="theme-toggle__icons" aria-hidden="true">
              <Sun className="theme-toggle__sun" size={19} />
              <Moon className="theme-toggle__moon" size={19} />
            </span>
          </button>
          <button
            className="menu-button"
            type="button"
            aria-label={menuOpen ? "Close navigation" : "Open navigation"}
            aria-expanded={menuOpen}
            onClick={() => setMenuOpen((value) => !value)}
          >
            <span className="menu-button__icons" aria-hidden="true">
              <List className="menu-button__list" size={24} />
              <X className="menu-button__close" size={24} />
            </span>
          </button>
        </div>
      </header>

      <Outlet />

      <footer className="site-footer">
        <span>© 2026 Jacky</span>
        {visitCount !== null && (
          <span className="site-visit-count" aria-live="polite">
            Visits {visitCount.toLocaleString("en-US")}
          </span>
        )}
      </footer>
    </div>
  );
}
