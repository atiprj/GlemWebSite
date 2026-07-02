"use client";

import { useEffect, useState } from "react";

/**
 * Always returns `false` on the first render so server and client markup
 * match, then updates from a `useEffect` once `matchMedia` is available.
 */
export function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = useState(false);

  useEffect(() => {
    const media = window.matchMedia(query);
    const update = () => setMatches(media.matches);
    update();
    media.addEventListener("change", update);
    return () => media.removeEventListener("change", update);
  }, [query]);

  return matches;
}
