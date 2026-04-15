import type { Metadata } from "next";

import { ArchitecturalArticle } from "@/components/articles/ArchitecturalArticle";

export const metadata: Metadata = {
  title: "Four Frankfurt — Article",
  description: "High-fidelity architectural article layout inspired by Four Frankfurt."
};

export default function FourFrankfurtArticlePage() {
  return (
    <ArchitecturalArticle
      eyebrow="PROJECT / MIXED-USE / 2024"
      title="FOUR FRANKFURT"
      summary="A vertical urban neighborhood that merges living, working, hospitality, and public life into a unified metropolitan destination in the heart of Frankfurt."
      heroImage="https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=1800&q=80"
      narrative={[
        "The project is conceived as a compact city in vertical form. Four towers frame a sequence of public terraces and internal streets, creating continuity between city scale and human scale.",
        "The architectural language balances clarity and softness: precise geometries, disciplined rhythm, and calibrated material transitions. The composition promotes permeability, daylight, and visual connectivity between the urban ground and elevated communal zones.",
        "Sustainability is embedded through mixed-use density, reduced travel demand, and high-performance facade systems that optimize comfort and energy behavior across seasons."
      ]}
      specs={[
        { label: "Location", value: "Frankfurt, Germany" },
        { label: "Program", value: "Mixed-Use High-Rise" },
        { label: "Status", value: "Completed" },
        { label: "Scope", value: "Architecture + Urban Integration" }
      ]}
      quote="A calibrated urban ecosystem where architecture performs as infrastructure for social and environmental value."
      gallery={{
        main: "https://images.unsplash.com/photo-1511818966892-d7d671e672a2?auto=format&fit=crop&w=1600&q=80",
        detail: "https://images.unsplash.com/photo-1460661419201-fd4cecdf8a8b?auto=format&fit=crop&w=1200&q=80",
        skyline: "https://images.unsplash.com/photo-1479839672679-a46483c0e7c8?auto=format&fit=crop&w=1400&q=80"
      }}
      credits={[
        { label: "Client", value: "Urban Development Consortium" },
        { label: "Discipline", value: "Architecture, Public Realm, Sustainability" },
        { label: "Template", value: "Next.js + Tailwind article module" }
      ]}
    />
  );
}
