import React from "react";
import Link from "next/link";
import Img from "../components/Img";
import type { ImageRecord } from "../utils/images";

export type BlogPostMeta = {
  title: string;
  description: string;
  slug: string;
  date: string;
  photo: string;
  /** Build-time encoded variants for `photo`, attached by utils/content.ts */
  imageRecord: ImageRecord | null;
};

export type BlogPost = {
  meta: BlogPostMeta;
  content: string;
};

const BlogPostLayout = ({
  blogPost,
  renderedBlogContent,
}: {
  blogPost: BlogPost;
  renderedBlogContent: string;
}) => (
  <div className="max-w-2xl">
    {/* Back to Blog Link */}
    <div className="mb-8">
      <Link
        href="/blog"
        className="text-sm text-muted hover:text-ink transition-colors underline"
      >
        ← Back to Blog
      </Link>
    </div>

    {/* Blog Post Header */}
    <div className="mb-8">
      <h1 className="font-display text-[30px] leading-tight text-ink mb-4">{blogPost.meta.title}</h1>
      <p className="text-sm text-muted mb-4">{blogPost.meta.description}</p>
      <p className="text-sm text-muted">
        {new Date(blogPost.meta.date).toLocaleDateString("en-US", {
          year: "numeric",
          month: "long",
          day: "numeric",
        })}
      </p>
    </div>

    {/* Blog Post Image */}
    <div className="mb-8">
      <Img
        record={blogPost.meta.imageRecord}
        alt={blogPost.meta.title}
        priority
        className="w-full rounded-lg"
        sizes="(max-width: 768px) 100vw, 672px"
      />
    </div>

    {/* Blog Post Content */}
    <div className="prose max-w-none">
      <div dangerouslySetInnerHTML={{ __html: renderedBlogContent }} />
    </div>

    {/* Navigation */}
    <div className="mt-12 pt-8 border-t border-line">
      <Link
        href="/blog"
        className="text-sm text-ink hover:text-muted transition-colors underline"
      >
        ← View all blog posts
      </Link>
    </div>
  </div>
);

export default BlogPostLayout;
