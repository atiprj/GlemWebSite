"use client";

import { useState } from "react";
import type { ProjectItem } from "@/data/content";
import Image from "next/image";

type Props = {
  project: ProjectItem;
};

function isVideo(file: string) {
  return file.toLowerCase().endsWith(".mp4") || file.toLowerCase().endsWith(".webm");
}

export function ProjectModal({ project }: Props) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button className="card" onClick={() => setOpen(true)} type="button">
        {project.cover && !isVideo(project.cover) ? (
          <Image src={project.cover} alt={project.title} width={1200} height={800} />
        ) : null}
        {project.cover && isVideo(project.cover) ? (
          <video src={project.cover} muted loop playsInline />
        ) : null}
        <strong>{project.title}</strong>
      </button>
      {open ? (
        <div className="modal-backdrop" onClick={() => setOpen(false)}>
          <article className="modal" onClick={(event) => event.stopPropagation()}>
            <h3>{project.title}</h3>
            <div className="grid">
              {project.gallery.length ? (
                project.gallery.map((item) => (
                  isVideo(item) ? (
                    <video key={item} src={item} controls playsInline />
                  ) : (
                    <Image key={item} src={item} alt={project.title} width={1200} height={800} />
                  )
                ))
              ) : (
                <p className="muted">Nessun contenuto aggiuntivo nel progetto.</p>
              )}
            </div>
          </article>
        </div>
      ) : null}
    </>
  );
}
