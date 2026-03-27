const TEAM_MEMBERS = [
  {
    name: "Mattia Giannetti",
    role: "The Soul",
    email: "mattiagiannetti@atiproject.com"
  },
  {
    name: "Giacomo Marani",
    role: "The Strategists",
    email: "giacomomarani@atiproject.com"
  },
  {
    name: "Luca Ofria",
    role: "The Backbone",
    email: "lucaofria@atiproject.com"
  },
  {
    name: "Erica Scribano",
    role: "The Crew",
    email: "ericascribano@atiproject.com"
  }
];

export function SiteFooter() {
  return (
    <footer id="contacts" className="w-full bg-black px-8 py-12 text-white">
      <div className="mx-auto w-full max-w-6xl">
        <h2 className="mb-8 text-sm tracking-[0.28em]">ATI PROJECT - R&D DEPARTEMENT</h2>
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          {TEAM_MEMBERS.map((member) => (
            <div key={member.email} className="space-y-1 font-light">
              <p className="text-base">{member.name}</p>
              <p className="font-mono text-sm text-white/75">{member.role}</p>
              <p className="font-mono text-sm text-white/90">{member.email}</p>
            </div>
          ))}
        </div>
      </div>
    </footer>
  );
}
