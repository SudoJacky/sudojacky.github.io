import { List, X } from "@phosphor-icons/react";
import { useEffect, useState } from "react";
import { NavLink, Outlet, useLocation } from "react-router-dom";
import TargetCursor from "../reactbits/TargetCursor";

export default function AppShell() {
  const [menuOpen, setMenuOpen] = useState(false);
  const location = useLocation();

  useEffect(() => {
    setMenuOpen(false);
    window.scrollTo({ top: 0, behavior: "instant" });
  }, [location.pathname]);

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
        <span>Built in public.</span>
      </footer>
    </div>
  );
}
