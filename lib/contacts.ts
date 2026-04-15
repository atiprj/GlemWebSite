import path from "node:path";
import fs from "node:fs/promises";

export interface ContactMember {
  name: string;
  role: string;
  email: string;
  linkedin?: string;
}

export interface ContactsContent {
  title: string;
  members: ContactMember[];
}

const FALLBACK_CONTACTS: ContactsContent = {
  title: "ATI PROJECT - R&D DEPARTEMENT",
  members: [
    {
      name: "Mattia Giannetti",
      role: "Head of department R&D",
      email: "mattiagiannetti@atiproject.com"
    }
  ]
};

function isEmail(value: string) {
  return /\S+@\S+\.\S+/.test(value);
}

function compactLine(value: string) {
  return value.replace(/\s+/g, " ").trim();
}

function isLinkedinUrl(value: string) {
  return /^https?:\/\/(www\.)?linkedin\.com\//i.test(value.trim());
}

export async function getContactsContent(): Promise<ContactsContent> {
  try {
    const filePath = path.join(process.cwd(), "public", "assets", "05.Contacts", "Contacts.txt");
    const raw = await fs.readFile(filePath, "utf8");
    const lines = raw
      .replaceAll("\r\n", "\n")
      .split("\n")
      .map((line) => compactLine(line))
      .filter(Boolean);

    if (lines.length === 0) {
      return FALLBACK_CONTACTS;
    }

    const title =
      lines.find((line) => /r&d|departement|department|ati/i.test(line)) ?? FALLBACK_CONTACTS.title;

    const members: ContactMember[] = [];
    for (let index = 0; index < lines.length; index += 1) {
      const line = lines[index];
      if (!isEmail(line)) {
        continue;
      }

      const email = line;
      const roleCandidate = lines[index - 1] ?? "";
      const nameCandidate = lines[index - 2] ?? "";
      const linkedinCandidate = lines[index + 1] ?? "";

      if (!nameCandidate || isEmail(nameCandidate)) {
        continue;
      }

      members.push({
        name: nameCandidate,
        role: roleCandidate && !isEmail(roleCandidate) ? roleCandidate : "",
        email,
        linkedin: isLinkedinUrl(linkedinCandidate) ? linkedinCandidate : undefined
      });
    }

    return {
      title,
      members: members.length > 0 ? members : FALLBACK_CONTACTS.members
    };
  } catch {
    return FALLBACK_CONTACTS;
  }
}
