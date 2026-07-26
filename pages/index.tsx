import React, { useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import MainLayout from "../layouts/MainLayout";
import GridItem, { GridItemData } from "../components/GridItem";
import Masonry from "../components/Masonry";
import PhotoModal from "../components/PhotoModal";
import {
  getSidebarData,
  getBlogPosts,
  getPhotos,
  getHomeIntro,
} from "../utils/content";
import { SidebarData } from "../components/Sidebar";
import { BlogPost } from "../layouts/BlogPost";
import { Photo, PhotoMeta } from "../layouts/PhotoLayout";
import { LAYOUT_SPRING } from "../lib/motion";

export async function getStaticProps() {
  const [sidebarData, blogPosts, photos, homeIntro] = await Promise.all([
    getSidebarData(),
    getBlogPosts(),
    getPhotos(),
    getHomeIntro(),
  ]);

  return { props: { sidebarData, blogPosts, photos, homeIntro } };
}

type FilterType = "everything" | "photos" | "articles";

const FILTERS: { key: FilterType; label: string }[] = [
  { key: "everything", label: "Everything" },
  { key: "photos", label: "Photographs" },
  { key: "articles", label: "Writing" },
];

export default function Home({
  sidebarData,
  blogPosts,
  photos,
  homeIntro,
}: {
  sidebarData: SidebarData;
  blogPosts: BlogPost[];
  photos: Photo[];
  homeIntro: { renderedContent: string };
}) {
  const [activeFilter, setActiveFilter] = useState<FilterType>("everything");
  const [selectedPhoto, setSelectedPhoto] = useState<PhotoMeta | null>(null);

  const photoMetas = photos.map((p) => p.meta);

  const photoItems: GridItemData[] = photos.map((photo) => ({
    id: `photo-${photo.meta.slug}`,
    type: "photo" as const,
    image: photo.meta.image,
    imageRecord: photo.meta.imageRecord,
    title: photo.meta.title,
    href: `/photos/${photo.meta.slug}`,
    onClick: () => setSelectedPhoto(photo.meta),
  }));

  const blogItems: GridItemData[] = blogPosts.map((post) => ({
    id: `blog-${post.meta.slug}`,
    type: "blog" as const,
    title: post.meta.title,
    description: post.meta.description,
    date: post.meta.date,
    href: `/blog/${post.meta.slug}`,
  }));

  const items =
    activeFilter === "photos"
      ? photoItems
      : activeFilter === "articles"
        ? blogItems
        : [...blogItems, ...photoItems];

  return (
    <MainLayout sidebarData={sidebarData}>
      <div className="max-w-6xl">
        {/* Opening statement */}
        <section className="mb-20 mt-2 lg:mb-32 lg:mt-10">
          <div
            className="font-display max-w-[680px] text-[24px] leading-[1.45] text-ink lg:text-[27px] [&_a]:text-accent [&_a]:underline [&_a]:underline-offset-4 [&_strong]:font-normal"
            dangerouslySetInnerHTML={{ __html: homeIntro.renderedContent }}
          />
        </section>

        {/* Filters */}
        <div className="mb-6 flex items-baseline justify-between border-b border-line">
          <nav className="no-scrollbar flex gap-6 overflow-x-auto" aria-label="Filter">
            {FILTERS.map(({ key, label }) => (
              <button
                key={key}
                onClick={() => setActiveFilter(key)}
                aria-pressed={activeFilter === key}
                className={`meta relative whitespace-nowrap pb-2.5 transition-colors duration-fast ease-out ${
                  activeFilter === key ? "text-ink" : "hover:text-ink"
                }`}
              >
                {label}
                {activeFilter === key && (
                  // Shared layoutId makes the underline slide between tabs
                  // rather than disappearing and reappearing.
                  <motion.span
                    layoutId="filter-underline"
                    className="absolute inset-x-0 -bottom-px h-px bg-accent"
                    transition={LAYOUT_SPRING}
                  />
                )}
              </button>
            ))}
          </nav>
          <span className="meta hidden sm:block">
            {items.length} {items.length === 1 ? "item" : "items"}
          </span>
        </div>

        <Masonry>
          {(columnWidth) => (
            <AnimatePresence mode="popLayout" initial={false}>
              {items.map((item, index) => (
                <GridItem
                  key={item.id}
                  item={item}
                  columnWidth={columnWidth}
                  // First row is above the fold at every breakpoint.
                  priority={index < 4}
                />
              ))}
            </AnimatePresence>
          )}
        </Masonry>

        {items.length === 0 && (
          <p className="py-16 text-center text-sm text-muted">Nothing here yet.</p>
        )}
      </div>

      <PhotoModal
        photo={selectedPhoto}
        photos={photoMetas}
        onClose={() => setSelectedPhoto(null)}
      />
    </MainLayout>
  );
}
