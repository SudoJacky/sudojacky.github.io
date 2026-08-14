export function getSearchChangeCommit(value, isComposing, committedCompositionValue) {
  if (isComposing || value === committedCompositionValue) return null;
  return value;
}
