import { ArrowRight, MagnifyingGlass, X } from "@phosphor-icons/react";
import { useEffect, useRef, useState } from "react";
import { NavLink, useSearchParams } from "react-router-dom";
import PageIntro from "../components/layout/PageIntro";
import { notes } from "../content/contentRegistry";
import { getSearchChangeCommit } from "./noteSearchInput";

function normalize(value) {
  return value.toLocaleLowerCase().normalize("NFKC");
}

function markdownToText(markdown) {
  return markdown
    .replace(/```[\s\S]*?```/g, " ")
    .replace(/`([^`]+)`/g, "$1")
    .replace(/!\[[^\]]*]\([^)]*\)/g, " ")
    .replace(/\[([^\]]+)]\([^)]*\)/g, "$1")
    .replace(/[#>*_~|]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function getSearchTerms(query) {
  return normalize(query).split(/\s+/).filter(Boolean);
}

function getResultSummary(note, terms) {
  const summary = note.summary.trim();
  const normalizedPreview = normalize(`${note.title} ${summary}`);

  if (terms.every((term) => normalizedPreview.includes(term))) {
    return summary;
  }

  const body = markdownToText(note.body);
  const normalizedBody = normalize(body);
  const matchIndex = terms
    .filter((term) => !normalizedPreview.includes(term))
    .map((term) => normalizedBody.indexOf(term))
    .filter((index) => index >= 0)
    .sort((a, b) => a - b)[0];

  if (matchIndex === undefined) {
    return summary;
  }

  const start = Math.max(0, matchIndex - 72);
  const end = Math.min(body.length, matchIndex + 150);
  return `${start > 0 ? "…" : ""}${body.slice(start, end).trim()}${end < body.length ? "…" : ""}`;
}

function HighlightedText({ terms, text }) {
  if (!terms.length) {
    return text;
  }

  const pattern = new RegExp(
    `(${terms.map((term) => term.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")).join("|")})`,
    "giu",
  );

  return text.split(pattern).map((part, index) =>
    terms.includes(normalize(part)) ? <mark key={`${part}-${index}`}>{part}</mark> : part,
  );
}

export default function NotesPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const query = searchParams.get("q") ?? "";
  const [searchInput, setSearchInput] = useState(query);
  const isComposing = useRef(false);
  const committedCompositionValue = useRef(null);
  const terms = getSearchTerms(query);
  const results = terms.length
    ? notes.filter((note) => {
        const searchableText = normalize(`${note.title} ${note.summary} ${markdownToText(note.body)}`);
        return terms.every((term) => searchableText.includes(term));
      })
    : notes;

  useEffect(() => {
    if (!isComposing.current) setSearchInput(query);
  }, [query]);

  function updateQuery(value) {
    const nextParams = new URLSearchParams(searchParams);

    if (value) {
      nextParams.set("q", value);
    } else {
      nextParams.delete("q");
    }

    setSearchParams(nextParams, { replace: true });
  }

  function handleSearchChange(event) {
    const value = event.currentTarget.value;
    const composing = isComposing.current || event.nativeEvent.isComposing;
    const committedValue = getSearchChangeCommit(
      value,
      composing,
      committedCompositionValue.current,
    );

    setSearchInput(value);
    if (!composing) committedCompositionValue.current = null;
    if (committedValue !== null) updateQuery(committedValue);
  }

  function handleCompositionEnd(event) {
    const value = event.currentTarget.value;
    isComposing.current = false;
    committedCompositionValue.current = value;
    setSearchInput(value);
    updateQuery(value);
  }

  function clearQuery() {
    isComposing.current = false;
    committedCompositionValue.current = null;
    setSearchInput("");
    updateQuery("");
  }

  return (
    <main className="interior-page">
      <PageIntro
        label="NOTES"
        title="Field notes from the workbench."
        copy="Longer thoughts on systems, tools, debugging, and the choices that shape software."
      />
      <section className="note-search" aria-label="Search notes">
        <label className="note-search-field">
          <MagnifyingGlass aria-hidden="true" size={21} />
          <span className="sr-only">Search notes</span>
          <input
            autoComplete="off"
            onChange={handleSearchChange}
            onCompositionEnd={handleCompositionEnd}
            onCompositionStart={() => {
              isComposing.current = true;
              committedCompositionValue.current = null;
            }}
            placeholder="Search titles, summaries, and full text"
            type="search"
            value={searchInput}
          />
          {searchInput && (
            <button aria-label="Clear search" onClick={clearQuery} type="button">
              <X aria-hidden="true" size={18} />
            </button>
          )}
        </label>
        <div className="note-search-meta" aria-live="polite">
          <span>{terms.length ? `${results.length} ${results.length === 1 ? "match" : "matches"}` : `${notes.length} notes`}</span>
          {query && <span>QUERY / {query}</span>}
        </div>
      </section>

      {results.length ? (
        <div className="index-list">
          {results.map((note) => (
            <NavLink className="index-row" key={note.slug} to={`/notes/${note.slug}`}>
              <span className="index-number">
                {String(notes.findIndex((entry) => entry.slug === note.slug) + 1).padStart(2, "0")}
              </span>
              <div>
                <time>{note.date}</time>
                <h2>
                  <HighlightedText terms={terms} text={note.title} />
                </h2>
                <p>
                  <HighlightedText terms={terms} text={getResultSummary(note, terms)} />
                </p>
              </div>
              <ArrowRight aria-hidden="true" size={24} />
            </NavLink>
          ))}
        </div>
      ) : (
        <div className="note-search-empty">
          <span>NO MATCHES</span>
          <h2>Nothing in the notebook yet.</h2>
          <p>Try a shorter phrase or search for a different system, tool, or idea.</p>
          <button onClick={clearQuery} type="button">CLEAR SEARCH</button>
        </div>
      )}
    </main>
  );
}
