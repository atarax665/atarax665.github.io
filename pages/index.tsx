import React, { useState } from "react";
import MainLayout from "../layouts/MainLayout";
import GridItem, { GridItemData } from "../components/GridItem";
import {
  getSidebarData,
  getBlogPosts,
  getPhotos,
  getHomeIntro,
} from "../utils/content";
import { SidebarData } from "../components/Sidebar";
import { BlogPost } from "../layouts/BlogPost";
import { Photo } from "../layouts/PhotoLayout";
import Link from "next/link";

export async function getStaticProps() {
  const [sidebarData, blogPosts, photos, homeIntro] = await Promise.all([
    getSidebarData(),
    getBlogPosts(),
    getPhotos(),
    getHomeIntro(),
  ]);

  return {
    props: {
      sidebarData,
      blogPosts,
      photos,
      homeIntro,
    },
  };
}

type FilterType = "everything" | "photos" | "articles";

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

  // Create photo items from markdown data
  const photoItems: GridItemData[] = photos.map((photo, index) => ({
    id: `photo-${photo.meta.slug}`,
    type: "photo" as const,
    image: photo.meta.image,
    title: photo.meta.title,
    href: `/photos/${photo.meta.slug}`,
    size: index === 0 ? ("medium" as const) : ("small" as const),
  }));

  // Create blog items
  const blogItems: GridItemData[] = blogPosts.map((post, index) => ({
    id: `blog-${index}`,
    type: "blog" as const,
    title: post.meta.title,
    description: post.meta.description,
    date: post.meta.date,
    href: `/blog/${post.meta.slug}`,
    size: index === 0 ? ("medium" as const) : ("small" as const),
  }));

  // Filter items based on active filter
  const getFilteredItems = () => {
    switch (activeFilter) {
      case "photos":
        return photoItems;
      case "articles":
        return blogItems;
      default:
        // Better mixing algorithm to prevent overlapping
        const allItems = [...photoItems, ...blogItems];
        // Sort by size to place medium items strategically
        return allItems.sort((a, b) => {
          // Place medium items first, then small items
          if (a.size === "medium" && b.size !== "medium") return -1;
          if (b.size === "medium" && a.size !== "medium") return 1;
          return 0;
        });
    }
  };

  const filteredItems = getFilteredItems();

  return (
    <MainLayout sidebarData={sidebarData}>
      <div className="max-w-6xl">
        {/* Introduction Section */}
        <div className="mb-8 lg:mb-[200px] mt-4 lg:mt-[50px]">
          <div
            className="text-sm text-gray-900 w-full lg:w-[700px]"
            dangerouslySetInnerHTML={{ __html: homeIntro.renderedContent }}
          />
        </div>

        {/* Navigation Tabs */}
        <div className="mb-6">
          <nav className="flex space-x-4 lg:space-x-6 overflow-x-auto">
            {[
              { key: "everything" as const, label: "Everything" },
              { key: "photos" as const, label: "Photos" },
              { key: "articles" as const, label: "Articles" },
            ].map(({ key, label }) => (
              <button
                key={key}
                onClick={() => setActiveFilter(key)}
                className={`text-sm transition-colors whitespace-nowrap ${
                  activeFilter === key
                    ? "text-gray-900 border-b border-gray-900"
                    : "text-gray-600 hover:text-gray-900"
                } pb-2`}
              >
                {label}
              </button>
            ))}
          </nav>
        </div>

        {/* Grid Section */}
        <div className="grid grid-cols-2 lg:grid-cols-4 xl:grid-cols-6 gap-3 lg:gap-4">
          {filteredItems.map((item, index) => (
            <GridItem key={item.id} item={item} />
          ))}
        </div>

        {filteredItems.length === 0 && (
          <div className="text-center py-12">
            <p className="text-sm text-gray-500">No items found.</p>
          </div>
        )}
      </div>
    </MainLayout>
  );
}
