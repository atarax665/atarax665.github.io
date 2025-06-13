import React from "react";
import MainLayout from "../../layouts/MainLayout";
import BlogCard from "../../components/BlogCard";
import { getSidebarData, getBlogPosts } from "../../utils/content";
import { SidebarData } from "../../components/Sidebar";
import type { BlogPost } from "../../layouts/BlogPost";

export async function getStaticProps() {
  const [sidebarData, blogPosts] = await Promise.all([
    getSidebarData(),
    getBlogPosts(),
  ]);

  return {
    props: {
      sidebarData,
      blogPosts,
    },
  };
}

export default function BlogPage({
  sidebarData,
  blogPosts,
}: {
  sidebarData: SidebarData;
  blogPosts: BlogPost[];
}) {
  return (
    <MainLayout sidebarData={sidebarData}>
      <div className="max-w-4xl">
        <div className="mb-8">
          <h1 className="text-lg text-gray-900 mb-4">Blog</h1>
          <p className="text-sm text-gray-600">
            Thoughts, ideas, and learnings.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {blogPosts.map(({ meta }) => (
            <BlogCard
              key={meta.slug}
              title={meta.title}
              description={meta.description}
              slug={meta.slug}
              photo={meta.photo}
            />
          ))}
        </div>

        {blogPosts.length === 0 && (
          <div className="text-center py-12">
            <p className="text-sm text-gray-500">No blog posts found.</p>
          </div>
        )}
      </div>
    </MainLayout>
  );
}
