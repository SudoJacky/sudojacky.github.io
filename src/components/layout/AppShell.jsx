import { List, X } from "@phosphor-icons/react";
import { useEffect, useState } from "react";
import { NavLink, Outlet, useLocation } from "react-router-dom";
import TargetCursor from "../reactbits/TargetCursor";

let visitCountRequest;

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
  const [visitCount, setVisitCount] = useState(null);
  const location = useLocation();

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
        <button
          className="menu-button"
          type="button"
          aria-label={menuOpen ? "Close navigation" : "Open navigation"}
          aria-expanded={menuOpen}
          onClick={() => setMenuOpen((value) => !value)}
        >
          {menuOpen ? <X size={24} /> : <List size={24} />}
        </button>
        <nav className={menuOpen ? "site-nav is-open" : "site-nav"} aria-label="Primary navigation">
          <NavLink to="/" end>Home</NavLink>
          <NavLink to="/projects">Projects</NavLink>
          <NavLink to="/notes">Notes</NavLink>
          <NavLink to="/docs">Docs</NavLink>
        </nav>
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
