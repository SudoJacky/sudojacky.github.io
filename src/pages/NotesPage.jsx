import { ArrowRight } from "@phosphor-icons/react";
import { NavLink } from "react-router-dom";
import PageIntro from "../components/layout/PageIntro";
import { notes } from "../content/contentRegistry";

export default function NotesPage() {
  return (
    <main className="interior-page">
      <PageIntro
        label="NOTES"
        title="Field notes from the workbench."
        copy="Longer thoughts on systems, tools, debugging, and the choices that shape software."
      />
      <div className="index-list">
        {notes.map((note, index) => (
          <NavLink className="index-row" key={note.slug} to={`/notes/${note.slug}`}>
            <span className="index-number">{String(index + 1).padStart(2, "0")}</span>
            <div>
              <time>{note.date}</time>
              <h2>{note.title}</h2>
              <p>{note.summary}</p>
            </div>
            <ArrowRight aria-hidden="true" size={24} />
          </NavLink>
        ))}
      </div>
    </main>
  );
}
