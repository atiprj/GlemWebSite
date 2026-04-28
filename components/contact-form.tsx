"use client";

import { useMemo, useState } from "react";

interface ContactFormProps {
  toEmail: string;
  locale?: "it" | "en";
}

type SubmitStatus = "idle" | "success" | "error";

export default function ContactForm({ toEmail, locale = "en" }: ContactFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [status, setStatus] = useState<SubmitStatus>("idle");
  const [errorMessage, setErrorMessage] = useState("");

  const recipient = useMemo(() => toEmail.trim(), [toEmail]);

  const inputClass =
    "h-12 w-full rounded-sm border border-white/30 bg-[#1a1a1a] px-3 text-sm text-white outline-none transition focus:border-white/60 focus:ring-1 focus:ring-white/30";
  const labelClass = "block text-xs font-semibold tracking-[0.14em] text-white/90";
  const isItalian = locale === "it";
  const ui = {
    title: isItalian ? "Contattaci" : "Get in touch",
    name: isItalian ? "NOME*" : "NAME*",
    email: "EMAIL*",
    organization: isItalian ? "ORGANIZZAZIONE" : "ORGANIZATION",
    city: isItalian ? "CITTA'" : "CITY",
    subject: isItalian ? "OGGETTO" : "SUBJECT",
    message: isItalian ? "MESSAGGIO*" : "MESSAGE*",
    subjectPlaceholder: isItalian ? "Seleziona un'opzione" : "Select an option",
    subjectProjectInquiry: isItalian ? "Richiesta progetto" : "Project inquiry",
    subjectCollaboration: isItalian ? "Collaborazione" : "Collaboration",
    subjectOther: isItalian ? "Altro" : "Other",
    terms: isItalian
      ? "Ho letto e accetto i Termini e Condizioni."
      : "I have read and agreed to the Terms and Conditions.",
    newsletter: isItalian ? "Voglio iscrivermi alla newsletter." : "I want to subscribe to the newsletter.",
    submitIdle: isItalian ? "INVIA MESSAGGIO" : "SEND MESSAGE",
    submitLoading: isItalian ? "INVIO..." : "SENDING...",
    submitSuccess: isItalian
      ? "Il tuo client email e' stato aperto per completare l'invio."
      : "Your email client has been opened to complete the submission.",
    submitErrorFallback: isItalian ? "Impossibile inviare. Riprova." : "Unable to submit. Please try again.",
    termsValidation: isItalian ? "Devi accettare i Termini e Condizioni." : "You must accept Terms and Conditions.",
    defaultSubject: isItalian ? "Richiesta contatto dal sito" : "Contact request from website",
    yes: isItalian ? "Si" : "Yes",
    no: isItalian ? "No" : "No",
    emailLabel: isItalian ? "Email" : "Email",
    nameLabel: isItalian ? "Nome" : "Name",
    organizationLabel: isItalian ? "Organizzazione" : "Organization",
    cityLabel: isItalian ? "Citta'" : "City",
    newsletterLabel: isItalian ? "Newsletter" : "Newsletter",
    messageLabel: isItalian ? "Messaggio:" : "Message:"
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsSubmitting(true);
    setStatus("idle");
    setErrorMessage("");

    try {
      const form = new FormData(event.currentTarget);
      const name = String(form.get("name") ?? "").trim();
      const email = String(form.get("email") ?? "").trim();
      const organization = String(form.get("organization") ?? "").trim();
      const city = String(form.get("city") ?? "").trim();
      const subject = String(form.get("subject") ?? "").trim();
      const message = String(form.get("message") ?? "").trim();
      const termsAccepted = form.get("terms") === "on";
      const newsletter = form.get("newsletter") === "on";

      if (!termsAccepted) {
        throw new Error(ui.termsValidation);
      }

      const finalSubject = subject || ui.defaultSubject;
      const body = [
        `${ui.nameLabel}: ${name || "-"}`,
        `${ui.emailLabel}: ${email || "-"}`,
        `${ui.organizationLabel}: ${organization || "-"}`,
        `${ui.cityLabel}: ${city || "-"}`,
        `${ui.newsletterLabel}: ${newsletter ? ui.yes : ui.no}`,
        "",
        ui.messageLabel,
        message || "-"
      ].join("\r\n");

      window.location.href = `mailto:${encodeURIComponent(recipient)}?subject=${encodeURIComponent(finalSubject)}&body=${encodeURIComponent(body)}`;
      setStatus("success");
      event.currentTarget.reset();
    } catch (error) {
      setStatus("error");
      setErrorMessage(error instanceof Error ? error.message : ui.submitErrorFallback);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold tracking-tight text-white">{ui.title}</h2>

      <form className="space-y-5" onSubmit={handleSubmit}>
        <div className="space-y-1">
          <label htmlFor="name" className={labelClass}>
            {ui.name}
          </label>
          <input id="name" name="name" required className={inputClass} />
        </div>

        <div className="space-y-1">
          <label htmlFor="email" className={labelClass}>
            {ui.email}
          </label>
          <input id="email" name="email" type="email" required className={inputClass} />
        </div>

        <div className="space-y-1">
          <label htmlFor="organization" className={labelClass}>
            {ui.organization}
          </label>
          <input id="organization" name="organization" className={inputClass} />
        </div>

        <div className="space-y-1">
          <label htmlFor="city" className={labelClass}>
            {ui.city}
          </label>
          <input id="city" name="city" className={inputClass} />
        </div>

        <div className="space-y-1">
          <label htmlFor="subject" className={labelClass}>
            {ui.subject}
          </label>
          <select
            id="subject"
            name="subject"
            defaultValue=""
            className="h-12 w-full rounded-full border border-white/30 bg-[#1a1a1a] px-4 text-sm text-white outline-none transition focus:border-white/60 focus:ring-1 focus:ring-white/30"
          >
            <option value="" disabled>
              {ui.subjectPlaceholder}
            </option>
            <option value="Project inquiry">{ui.subjectProjectInquiry}</option>
            <option value="Collaboration">{ui.subjectCollaboration}</option>
            <option value="Other">{ui.subjectOther}</option>
          </select>
        </div>

        <div className="space-y-1">
          <label htmlFor="message" className={labelClass}>
            {ui.message}
          </label>
          <textarea
            id="message"
            name="message"
            rows={6}
            required
            className="w-full resize-none rounded-sm border border-white/30 bg-[#1a1a1a] px-3 py-3 text-sm text-white outline-none transition focus:border-white/60 focus:ring-1 focus:ring-white/30"
          />
        </div>

        <label className="flex items-start gap-3 text-xs text-white/90">
          <input id="terms" name="terms" type="checkbox" className="mt-0.5 h-4 w-4 accent-white" required />
          <span>{ui.terms}</span>
        </label>

        <label className="flex items-start gap-3 text-xs text-white/90">
          <input id="newsletter" name="newsletter" type="checkbox" className="mt-0.5 h-4 w-4 accent-white" />
          <span>{ui.newsletter}</span>
        </label>

        {status === "error" ? <p className="text-xs text-red-300">{errorMessage}</p> : null}
        {status === "success" ? (
          <p className="text-xs text-emerald-300">{ui.submitSuccess}</p>
        ) : null}

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full border border-white/20 bg-black px-4 py-4 text-sm font-semibold text-white transition hover:bg-neutral-900 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isSubmitting ? ui.submitLoading : ui.submitIdle}
        </button>
      </form>
    </div>
  );
}

