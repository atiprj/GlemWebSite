"use client";

import { useEffect } from "react";

export default function Error({
  error,
  reset
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="mx-auto flex min-h-[50vh] max-w-lg flex-col items-center justify-center gap-6 px-6 py-20 text-center">
      <h1 className="text-xl font-semibold text-neutral-900">Qualcosa è andato storto</h1>
      <p className="text-sm text-neutral-600">
        La pagina non è stata caricata correttamente. Prova a ricaricare o torna alla home.
      </p>
      <div className="flex flex-wrap justify-center gap-3">
        <button
          type="button"
          onClick={() => reset()}
          className="rounded-md border border-neutral-900 bg-neutral-900 px-4 py-2 text-sm text-white transition hover:bg-neutral-800"
        >
          Riprova
        </button>
        <a
          href="/"
          className="rounded-md border border-neutral-300 bg-white px-4 py-2 text-sm text-neutral-900 transition hover:bg-neutral-50"
        >
          Home
        </a>
      </div>
    </div>
  );
}
