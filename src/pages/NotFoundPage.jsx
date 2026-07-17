import { ArrowRight } from "@phosphor-icons/react";
import { NavLink } from "react-router-dom";

export default function NotFoundPage() {
  return (
    <main className="not-found">
      <p className="section-label">404</p>
      <h1>Nothing on this bench.</h1>
      <NavLink className="text-link" to="/">
        Return home <ArrowRight aria-hidden="true" size={18} />
      </NavLink>
    </main>
  );
}
