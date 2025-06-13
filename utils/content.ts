import { promises as fs } from "fs";
import path from "path";
import matter from "gray-matter";
import { renderMarkdownToHTML } from "./markdown";
import { PersonalInfo, NavigationItem, SidebarData } from "../components/Sidebar";

const CONTENT_DIR = "_content";
const PAGES_DIR = "_pages";

export type PageMeta = {
  title: string;
  description: string;
  slug: string;
  lastUpdated?: string;
};

export type Page = {
  meta: PageMeta;
  content: string;
  renderedContent: string;
};

export async function getSidebarData(): Promise<SidebarData> {
  const contentDir = path.join(process.cwd(), CONTENT_DIR);

  // Load about.md
  const aboutPath = path.join(contentDir, "about.md");
  const aboutFile = await fs.readFile(aboutPath, "utf8");
  const aboutParsed = matter(aboutFile);
  const aboutContent = renderMarkdownToHTML(aboutParsed.content);

  // Load navigation.md
  const navPath = path.join(contentDir, "navigation.md");
  const navFile = await fs.readFile(navPath, "utf8");
  const navParsed = matter(navFile);

  return {
    personalInfo: aboutParsed.data as PersonalInfo,
    navigation: navParsed.data.navigation as NavigationItem[],
    aboutContent,
  };
}

export async function getPageContent(pageSlug: string): Promise<Page> {
  const pagePath = path.join(process.cwd(), PAGES_DIR, pageSlug, "index.md");

  try {
    const fileContents = await fs.readFile(pagePath, "utf8");
    const parsed = matter(fileContents);
    const renderedContent = renderMarkdownToHTML(parsed.content);

    return {
      meta: parsed.data as PageMeta,
      content: parsed.content,
      renderedContent,
    };
  } catch (error) {
    throw new Error(`Page not found: ${pageSlug}`);
  }
}

export async function getBlogPosts() {
  const blogDir = path.join(process.cwd(), "_blogs");
  const files = await fs.readdir(blogDir);

  const postPaths = files.filter((file) => {
    const ext = path.extname(file);
    return ext === ".md";
  });

  const projects = await Promise.all(
    postPaths.map(async (file: string) => {
      const contents = await fs.readFile(path.join(blogDir, file), "utf8");
      const parsed = matter(contents);

      return {
        content: parsed.content,
        meta: parsed.data,
      };
    })
  );

  // Sort by date (newest first)
  return projects.sort((a, b) =>
    new Date(a.meta.date).getTime() > new Date(b.meta.date).getTime() ? -1 : 1
  );
}

export async function getPhotos() {
  const photosDir = path.join(process.cwd(), "_photos");
  const files = await fs.readdir(photosDir);

  const photoPaths = files.filter((file) => {
    const ext = path.extname(file);
    return ext === ".md";
  });

  const photos = await Promise.all(
    photoPaths.map(async (file: string) => {
      const contents = await fs.readFile(path.join(photosDir, file), "utf8");
      const parsed = matter(contents);

      return {
        content: parsed.content,
        meta: parsed.data,
      };
    })
  );

  // Sort by date (newest first)
  return photos.sort((a, b) =>
    new Date(a.meta.date).getTime() > new Date(b.meta.date).getTime() ? -1 : 1
  );
}

export async function getPhotoBySlug(slug: string) {
  const photoPath = path.join(process.cwd(), "_photos", `${slug}.md`);

  try {
    const fileContents = await fs.readFile(photoPath, "utf8");
    const parsed = matter(fileContents);
    const renderedContent = renderMarkdownToHTML(parsed.content);

    return {
      meta: parsed.data,
      content: parsed.content,
      renderedContent,
    };
  } catch (error) {
    throw new Error(`Photo not found: ${slug}`);
  }
}

export async function getHomeIntro() {
  const introPath = path.join(process.cwd(), PAGES_DIR, "home", "intro.md");

  try {
    const fileContents = await fs.readFile(introPath, "utf8");
    const parsed = matter(fileContents);
    const renderedContent = renderMarkdownToHTML(parsed.content);

    return {
      meta: parsed.data,
      content: parsed.content,
      renderedContent,
    };
  } catch (error) {
    throw new Error(`Home intro not found`);
  }
}
