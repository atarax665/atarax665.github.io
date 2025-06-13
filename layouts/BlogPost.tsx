import React from "react";
import Image from "next/image";
import Link from "next/link";

export type BlogPostMeta = {
  title: string;
  description: string;
  slug: string;
  date: string;
  photo: string;
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
        className="text-sm text-gray-600 hover:text-gray-900 transition-colors underline"
      >
        ← Back to Blog
      </Link>
    </div>

    {/* Blog Post Header */}
    <div className="mb-8">
      <h1 className="text-lg text-gray-900 mb-4">{blogPost.meta.title}</h1>
      <p className="text-sm text-gray-600 mb-4">{blogPost.meta.description}</p>
      <p className="text-sm text-gray-500">
        {new Date(blogPost.meta.date).toLocaleDateString("en-US", {
          year: "numeric",
          month: "long",
          day: "numeric",
        })}
      </p>
    </div>

    {/* Blog Post Image */}
    <div className="mb-8">
      <Image
        src={blogPost.meta.photo}
        alt={blogPost.meta.title}
        width={800}
        height={400}
        className="w-full h-auto"
        priority
      />
    </div>

    {/* Blog Post Content */}
    <div className="prose prose-gray max-w-none">
      <div dangerouslySetInnerHTML={{ __html: renderedBlogContent }} />
    </div>

    {/* Navigation */}
    <div className="mt-12 pt-8 border-t border-gray-100">
      <Link
        href="/blog"
        className="text-sm text-gray-900 hover:text-gray-600 transition-colors underline"
      >
        ← View all blog posts
      </Link>
    </div>
  </div>
);

export default BlogPostLayout;
