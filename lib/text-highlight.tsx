import type { ReactNode } from "react";

export function renderWithFirstBold(text: string, target: string, state: { found: boolean }): ReactNode {
  if (state.found) return text;
  const index = text.indexOf(target);
  if (index === -1) return text;
  state.found = true;
  return (
    <>
      {text.slice(0, index)}
      <strong>{target}</strong>
      {text.slice(index + target.length)}
    </>
  );
}
