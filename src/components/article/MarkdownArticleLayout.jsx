import { Children, isValidElement, useEffect, useMemo, useRef, useState } from "react";
import ReactMarkdown from "react-markdown";
import LineSidebar from "../reactbits/LineSidebar";
import "./MarkdownArticleLayout.css";

function getPlainText(value) {
  return Children.toArray(value).map((child) => {
    if (typeof child === "string" || typeof child === "number") return String(child);
    if (isValidElement(child)) return getPlainText(child.props.children);
    return "";
  }).join("");
}

function cleanHeadingText(value) {
  return value
    .replace(/!\[([^\]]*)\]\([^)]*\)/g, "$1")
    .replace(/\[([^\]]+)\]\([^)]*\)/g, "$1")
    .replace(/`([^`]+)`/g, "$1")
    .replace(/<[^>]+>/g, "")
    .replace(/[*_~]/g, "")
    .trim();
}

function slugify(value) {
  return value
    .normalize("NFKC")
    .toLocaleLowerCase()
    .replace(/[^\p{Letter}\p{Number}\s-]/gu, "")
    .trim()
    .replace(/[\s-]+/g, "-") || "section";
}

export function extractMarkdownHeadings(markdown) {
  const headings = [];
  const slugs = new Map();
  let fence = null;

  markdown.split(/\r?\n/).forEach((line, index) => {
    const fenceMatch = line.match(/^\s*(```+|~~~+)/);

    if (fenceMatch) {
      if (!fence) fence = fenceMatch[1][0];
      else if (fence === fenceMatch[1][0]) fence = null;
      return;
    }

    if (fence) return;

    const match = line.match(/^(#{2,3})[ \t]+(.+?)[ \t]*#*[ \t]*$/);
    if (!match) return;

    const label = cleanHeadingText(match[2]);
    const baseSlug = slugify(label);
    const occurrence = (slugs.get(baseSlug) ?? 0) + 1;
    slugs.set(baseSlug, occurrence);

    headings.push({
      id: occurrence === 1 ? baseSlug : `${baseSlug}-${occurrence}`,
      label,
      level: match[1].length,
      line: index + 1,
    });
  });

  return headings;
}

function useActiveHeading(headings) {
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    if (headings.length === 0) return undefined;

    let frame = null;
    const update = () => {
      const activationLine = window.innerHeight * 0.28;
      let nextIndex = 0;

      headings.forEach((heading, index) => {
        const element = document.getElementById(heading.id);
        if (element && element.getBoundingClientRect().top <= activationLine) {
          nextIndex = index;
        }
      });

      setActiveIndex((current) => current === nextIndex ? current : nextIndex);
      frame = null;
    };
    const scheduleUpdate = () => {
      if (frame === null) frame = window.requestAnimationFrame(update);
    };

    update();
    window.addEventListener("scroll", scheduleUpdate, { passive: true });
    window.addEventListener("resize", scheduleUpdate);

    return () => {
      window.removeEventListener("scroll", scheduleUpdate);
      window.removeEventListener("resize", scheduleUpdate);
      if (frame !== null) window.cancelAnimationFrame(frame);
    };
  }, [headings]);

  return activeIndex;
}

function MarkdownHeading({ as: Tag, node, headingsByLine, children, ...props }) {
  const heading = headingsByLine.get(node?.position?.start?.line);
  const id = heading?.id ?? slugify(getPlainText(children));

  return <Tag id={id} {...props}>{children}</Tag>;
}

export default function MarkdownArticleLayout({
  body,
  articleClassName = "article",
  className = "",
  children,
}) {
  const headings = useMemo(() => extractMarkdownHeadings(body), [body]);
  const headingsByLine = useMemo(
    () => new Map(headings.map((heading) => [heading.line, heading])),
    [headings],
  );
  const activeIndex = useActiveHeading(headings);
  const mobileTocRef = useRef(null);
  const hasToc = headings.length >= 2;

  const goToHeading = (heading, closeMobile = false) => {
    const element = document.getElementById(heading.id);
    if (!element) return;

    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    element.scrollIntoView({
      behavior: reducedMotion ? "auto" : "smooth",
      block: "start",
    });
    window.history.replaceState(null, "", `#${encodeURIComponent(heading.id)}`);

    if (closeMobile && mobileTocRef.current) {
      mobileTocRef.current.open = false;
    }
  };

  const markdownComponents = useMemo(() => ({
    h2: (props) => (
      <MarkdownHeading as="h2" headingsByLine={headingsByLine} {...props} />
    ),
    h3: (props) => (
      <MarkdownHeading as="h3" headingsByLine={headingsByLine} {...props} />
    ),
  }), [headingsByLine]);

  return (
    <section
      className={[
        "markdown-article-layout",
        hasToc && "markdown-article-layout--with-toc",
        className,
      ].filter(Boolean).join(" ")}
    >
      {hasToc && (
        <aside className="markdown-article-toc">
          <div className="markdown-article-toc__inner">
            <p>IN THIS NOTE</p>
            <LineSidebar
              accentColor="var(--accent)"
              activeIndex={activeIndex}
              ariaLabel="本文目录"
              className="markdown-article-line-sidebar"
              fontSize={0.78}
              itemGap={17}
              items={headings}
              markerColor="#46504d"
              markerLength={34}
              maxShift={12}
              onItemClick={goToHeading}
              proximityRadius={76}
              showIndex={false}
              smoothing={120}
              textColor="#7f8986"
            />
          </div>
        </aside>
      )}

      <article className={articleClassName}>
        {hasToc && (
          <details className="markdown-article-mobile-toc" ref={mobileTocRef}>
            <summary>
              <span>IN THIS NOTE</span>
              <span>{String(activeIndex + 1).padStart(2, "0")} / {String(headings.length).padStart(2, "0")}</span>
            </summary>
            <ol>
              {headings.map((heading, index) => (
                <li className={`is-level-${heading.level}`} key={heading.id}>
                  <button
                    aria-current={index === activeIndex ? "location" : undefined}
                    onClick={() => goToHeading(heading, true)}
                    type="button"
                  >
                    <span>{String(index + 1).padStart(2, "0")}</span>
                    {heading.label}
                  </button>
                </li>
              ))}
            </ol>
          </details>
        )}
        {children}
        <ReactMarkdown components={markdownComponents}>{body}</ReactMarkdown>
      </article>
    </section>
  );
}
