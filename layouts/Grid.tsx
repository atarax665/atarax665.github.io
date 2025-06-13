import React from "react";
import BlogCard from "../components/BlogCard";
import type { BlogPost } from "../layouts/BlogPost";

const Grid = ({ blogPosts }: { blogPosts: BlogPost[] }) => (
  <div className="flex flex-col gap-12 max-w-screen-md mx-auto">
    <h2 className="text-black font-bold text-lg">Articles</h2>
    <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
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
  </div>
);

export default Grid;
