export type ProjectItem = {
  slug: string;
  title: string;
  cover: string;
  gallery: string[];
};

export type ProjectPreviewItem = {
  slug: string;
  title: string;
  cover: string;
};

export const foldersMap = {
  home: "/assets/01.Home",
  about: "/assets/02.About us",
  projects: "/assets/03.Project",
  events: "/assets/04.Events",
  contacts: "/assets/05.Contacts"
} as const;

export const homeData = {
  folder: foldersMap.home,
  heroVideo: "",
  heroImages: [] as string[],
  introTitle: "We are GLEMWEBSITE",
  introFallback:
    "Design, ricerca e sperimentazione multidisciplinare per creare esperienze spaziali contemporanee."
};

export const aboutData = {
  folder: foldersMap.about,
  description: "",
  images: [] as string[]
};

export const projectsData: ProjectItem[] = [
  {
    slug: "22.Lubica22-Y",
    title: "22 Lubica22 Y",
    cover: "/assets/03.Project/22.Lubica22-Y/COP/Gabriele Giussani (4).jpg",
    gallery: [
      "/assets/03.Project/22.Lubica22-Y/DEV/01.PercorsoParole.png",
      "/assets/03.Project/22.Lubica22-Y/DEV/02.PercorsoParole (2).png",
      "/assets/03.Project/22.Lubica22-Y/DEV/03.Gabriele Giussani (16).jpg",
      "/assets/03.Project/22.Lubica22-Y/DEV/04.Gabriele Giussani (17).jpg"
    ]
  },
  {
    slug: "22.MDW22-Y",
    title: "22 MDW22 Y",
    cover: "",
    gallery: []
  },
  {
    slug: "23.MDW23-AIGen",
    title: "23 MDW23 AIGen",
    cover: "/assets/03.Project/23.MDW23-AIGen/COP/00_GenAI_Video.mp4",
    gallery: [
      "/assets/03.Project/23.MDW23-AIGen/DEV/01.ExternalBuilding.mp4",
      "/assets/03.Project/23.MDW23-AIGen/DEV/02.InteriorPatio.mp4",
      "/assets/03.Project/23.MDW23-AIGen/DEV/03.FacadeBuildinding.mp4"
    ]
  },
  {
    slug: "23.MDW23-HumanMovements",
    title: "23 MDW23 Human Movements",
    cover: "/assets/03.Project/23.MDW23-HumanMovements/COP/00_HumanMovements_Video.mp4",
    gallery: []
  },
  {
    slug: "24.Lubica24-CardboardPavillion",
    title: "24 Lubica24 Cardboard Pavillion",
    cover: "",
    gallery: []
  },
  {
    slug: "24.MDW24-Material&Data",
    title: "24 MDW24 Material and Data",
    cover: "",
    gallery: []
  },
  {
    slug: "25.MDW25-MiraConceptAI",
    title: "25 MDW25 Mira Concept AI",
    cover: "",
    gallery: []
  },
  {
    slug: "25.MDW25-MiraProject",
    title: "25 MDW25 Mira Project",
    cover: "",
    gallery: []
  }
];

export const eventsData = {
  folder: foldersMap.events,
  items: [] as Array<{ title: string; image: string; description: string }>
};

export const contactsData = {
  folder: foldersMap.contacts,
  text: ""
};

const VIDEO_EXT = [".mp4", ".webm", ".mov"];
const IMAGE_EXT = [".jpg", ".jpeg", ".png", ".webp", ".gif"];
const TEXT_EXT = [".txt", ".md"];

function humanizeSlug(slug: string) {
  return slug.replace(/[._-]/g, " ").replace(/\s+/g, " ").trim();
}

function withLeadingSlash(filePath: string) {
  const normalized = filePath.replaceAll("\\", "/");
  return normalized.startsWith("/") ? normalized : `/${normalized}`;
}

export async function getHomeHeroAsset() {
  const fs = await import("node:fs/promises");
  const path = await import("node:path");

  const absoluteHome = path.join(process.cwd(), "public", "assets", "01.Home");
  const files = await fs.readdir(absoluteHome).catch(() => []);
  const videoFile = files.find((file) => VIDEO_EXT.some((ext) => file.toLowerCase().endsWith(ext)));
  if (videoFile) {
    return {
      type: "video" as const,
      src: withLeadingSlash(path.posix.join("assets/01.Home", videoFile))
    };
  }

  const imageFile = files.find((file) => IMAGE_EXT.some((ext) => file.toLowerCase().endsWith(ext)));
  if (imageFile) {
    return {
      type: "image" as const,
      src: withLeadingSlash(path.posix.join("assets/01.Home", imageFile))
    };
  }

  return null;
}

export async function getHomeIntroText() {
  const fs = await import("node:fs/promises");
  const path = await import("node:path");

  const absoluteHome = path.join(process.cwd(), "public", "assets", "01.Home");
  const files = await fs.readdir(absoluteHome).catch(() => []);
  const textFile = files.find((file) => TEXT_EXT.some((ext) => file.toLowerCase().endsWith(ext)));
  if (!textFile) return homeData.introFallback;

  const content = await fs.readFile(path.join(absoluteHome, textFile), "utf8").catch(() => "");
  return content.trim() || homeData.introFallback;
}

export async function getProjectPreviewData() {
  const fs = await import("node:fs/promises");
  const path = await import("node:path");

  const absoluteProjects = path.join(process.cwd(), "public", "assets", "03.Project");
  const projectFolders = await fs.readdir(absoluteProjects, { withFileTypes: true }).catch(() => []);

  const mapped = await Promise.all(
    projectFolders
      .filter((entry) => entry.isDirectory())
      .map(async (entry) => {
        const projectName = entry.name;
        const copPath = path.join(absoluteProjects, projectName, "COP");
        const copFiles = await fs.readdir(copPath).catch(() => []);
        const firstImage = copFiles.find((file) =>
          IMAGE_EXT.some((ext) => file.toLowerCase().endsWith(ext))
        );
        if (!firstImage) return null;

        return {
          slug: projectName,
          title: humanizeSlug(projectName),
          cover: withLeadingSlash(path.posix.join("assets/03.Project", projectName, "COP", firstImage))
        } satisfies ProjectPreviewItem;
      })
  );

  return mapped.filter((item): item is ProjectPreviewItem => item !== null);
}
