"use client";

import { useMemo, useState } from "react";

interface ContactUsFormProps {
  toEmail: string;
  variant?: "light" | "dark";
}

export default function ContactUsForm({ toEmail, variant = "light" }: ContactUsFormProps) {
  const isDark = variant === "dark";
  const [status, setStatus] = useState<"idle" | "ready">("idle");
  const [error, setError] = useState<string | null>(null);

  const to = useMemo(() => toEmail.trim(), [toEmail]);
  const fieldInputClass = isDark
    ? "h-12 w-full rounded-sm border-2 border-neutral-500/60 bg-white/10 px-3 text-sm text-white placeholder:text-white/50 outline-none focus:border-neutral-300 focus:ring-2 focus:ring-neutral-300/20"
    : "h-12 w-full rounded-sm border-2 border-black bg-white px-3 text-sm text-neutral-900 outline-none focus:ring-2 focus:ring-black/20";

  const fieldTextAreaClass = isDark
    ? "w-full resize-none rounded-sm border-2 border-neutral-500/60 bg-white/10 px-3 py-3 text-sm text-white placeholder:text-white/50 outline-none focus:border-neutral-300 focus:ring-2 focus:ring-neutral-300/20"
    : "w-full resize-none rounded-sm border-2 border-black bg-white px-3 py-3 text-sm text-neutral-900 outline-none focus:ring-2 focus:ring-black/20";

  const fieldSelectClass = isDark
    ? "h-12 w-full rounded-full border-2 border-neutral-500/60 bg-white/10 px-4 text-sm text-white outline-none focus:ring-2 focus:ring-neutral-300/20"
    : "h-12 w-full rounded-full border-2 border-black bg-white px-4 text-sm text-neutral-900 outline-none focus:ring-2 focus:ring-black/20";

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    const form = new FormData(event.currentTarget);

    const name = String(form.get("name") ?? "").trim();
    const email = String(form.get("email") ?? "").trim();
    const organization = String(form.get("organization") ?? "").trim();
    const city = String(form.get("city") ?? "").trim();
    const subject = String(form.get("subject") ?? "").trim();
    const message = String(form.get("message") ?? "").trim();
    const termsAccepted = form.get("terms") === "on";
    const newsletterSubscribed = form.get("newsletter") === "on";

    if (!termsAccepted) {
      setError("Devi accettare i Termini e Condizioni per poter inviare.");
      return;
    }

    const resolvedSubject = subject || "Contact from GlemWebsite";

    const body = `Name: ${name || "-"}%0D%0AEmail: ${email || "-"}%0D%0AOrganization: ${
      organization || "-"
    }%0D%0ACity: ${city || "-"}%0D%0ASubject: ${resolvedSubject}%0D%0AMessage:%0D%0A${
      message || "-"
    }%0D%0A%0D%0ANewsletter: ${newsletterSubscribed ? "Yes" : "No"}%0D%0ATerms accepted: ${
      termsAccepted ? "Yes" : "No"
    }`;

    // Using mailto keeps the feature lightweight (no backend endpoint required).
    window.location.href = `mailto:${encodeURIComponent(to)}?subject=${encodeURIComponent(
      resolvedSubject
    )}&body=${body}`;
    setStatus("ready");
  };

  return (
    <div className={isDark ? "p-6 text-white" : "rounded-lg border border-neutral-900/10 bg-white p-6"}>
      <h2 className={`text-xl font-semibold tracking-tight ${isDark ? "text-white" : "text-neutral-900"}`}>CONTATTACI</h2>

      <form className="mt-6 space-y-5" onSubmit={handleSubmit}>
        <div className="space-y-1">
          <label className={`block text-xs font-semibold tracking-[0.12em] ${isDark ? "text-white/90" : "text-neutral-900"}`} htmlFor="name">
            NAME*
          </label>
          <input
            id="name"
            name="name"
            required
            className={fieldInputClass}
            placeholder=""
          />
        </div>

        <div className="space-y-1">
          <label className={`block text-xs font-semibold tracking-[0.12em] ${isDark ? "text-white/90" : "text-neutral-900"}`} htmlFor="email">
            EMAIL*
          </label>
          <input
            id="email"
            name="email"
            type="email"
            required
            className={fieldInputClass}
            placeholder=""
          />
        </div>

        <div className="space-y-1">
          <label className={`block text-xs font-semibold tracking-[0.12em] ${isDark ? "text-white/90" : "text-neutral-900"}`} htmlFor="organization">
            ORGANIZATION
          </label>
          <input
            id="organization"
            name="organization"
            className={fieldInputClass}
            placeholder=""
          />
        </div>

        <div className="space-y-1">
          <label className={`block text-xs font-semibold tracking-[0.12em] ${isDark ? "text-white/90" : "text-neutral-900"}`} htmlFor="city">
            CITY
          </label>
          <input
            id="city"
            name="city"
            className={fieldInputClass}
            placeholder=""
          />
        </div>

        <div className="space-y-1">
          <label className={`block text-xs font-semibold tracking-[0.12em] ${isDark ? "text-white/90" : "text-neutral-900"}`} htmlFor="subject">
            SUBJECT
          </label>
          <select
            id="subject"
            name="subject"
            required
            defaultValue=""
            className={fieldSelectClass}
          >
            <option value="" disabled>
              Select an option
            </option>
            <option value="Project inquiry">Project inquiry</option>
            <option value="Collaboration">Collaboration</option>
            <option value="Other">Other</option>
          </select>
        </div>

        <div className="space-y-1">
          <label className={`block text-xs font-semibold tracking-[0.12em] ${isDark ? "text-white/90" : "text-neutral-900"}`} htmlFor="message">
            MESSAGE
          </label>
          <textarea
            id="message"
            name="message"
            required
            rows={6}
            className={fieldTextAreaClass}
            placeholder=""
          />
        </div>

        <div className="space-y-3">
          <label className={`flex items-start gap-3 text-xs ${isDark ? "text-white/90" : "text-neutral-900"}`}>
            <input
              id="terms"
              name="terms"
              type="checkbox"
              className={`mt-0.5 h-4 w-4 ${isDark ? "accent-white" : "accent-black"}`}
              required
            />
            <span>
              I have read and agreed to the{" "}
              <span className="font-semibold underline underline-offset-2">Terms and Conditions</span>.
            </span>
          </label>

          <label className={`flex items-start gap-3 text-xs ${isDark ? "text-white/90" : "text-neutral-900"}`}>
            <input
              id="newsletter"
              name="newsletter"
              type="checkbox"
              className={`mt-0.5 h-4 w-4 ${isDark ? "accent-white" : "accent-black"}`}
            />
            <span>I want to subscribe to the newsletter.</span>
          </label>
        </div>

        {error ? <p className="text-xs text-red-600">{error}</p> : null}

        <button
          type="submit"
          className="w-full border border-white/10 bg-neutral-900 py-4 text-sm font-semibold text-white transition hover:bg-neutral-800"
        >
          SEND MESSAGE
        </button>

        {status === "ready" ? (
          <p className={`text-xs ${isDark ? "text-white/60" : "text-neutral-500"}`}>Si aprirà il tuo client email per completare l’invio.</p>
        ) : null}
      </form>
    </div>
  );
}

