export const DOC_PREVIEW_LIMIT = 3;

export function countProjectDocs(project) {
  return project.sections.reduce((total, section) => total + section.docs.length, 0);
}

export function takeDocSections(sections, limit = DOC_PREVIEW_LIMIT) {
  let remaining = limit;

  return sections.flatMap((section) => {
    if (remaining <= 0) return [];

    const docs = section.docs.slice(0, remaining);
    remaining -= docs.length;

    return docs.length ? [{ ...section, docs }] : [];
  });
}
