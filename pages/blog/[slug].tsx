import React from "react";
import { promises as fs } from "fs";
import path from "path";
import matter from "gray-matter";
import MainLayout from "../../layouts/MainLayout";
import BlogPostLayout from "../../layouts/BlogPost";
import { renderMarkdownToHTML } from "../../utils/markdown";
import { getSidebarData } from "../../utils/content";
import { SidebarData } from "../../components/Sidebar";
import type { BlogPost } from "../../layouts/BlogPost";

const BLOGS_DIR = "_blogs";

export async function getStaticProps({ params }: { params: { slug: string } }) {
  const blogsDir = path.join(process.cwd(), BLOGS_DIR);
  const files = await fs.readdir(blogsDir);

  const blogPaths = files.filter((file) => {
    const ext = path.extname(file);
    return ext === ".md";
  });

  const blogPosts = await Promise.all(
    blogPaths.map(async (file: string) => {
      const contents = await fs.readFile(path.join(blogsDir, file), "utf8");
      const parsed = matter(contents);

      return {
        content: parsed.content,
        meta: parsed.data,
      };
    })
  );

  const blogPost = blogPosts.find((p) => p?.meta?.slug === params.slug);

  if (!blogPost) {
    return {
      notFound: true,
    };
  }

  const renderedBlogContent = renderMarkdownToHTML(blogPost.content);
  const sidebarData = await getSidebarData();

  return {
    props: {
      blogPost,
      renderedBlogContent,
      sidebarData,
    },
  };
}

export async function getStaticPaths() {
  const blogsDir = path.join(process.cwd(), BLOGS_DIR);
  const files = await fs.readdir(blogsDir);

  const blogPaths = files.filter((file) => {
    const ext = path.extname(file);
    return ext === ".md";
  });

  const blogPosts = await Promise.all(
    blogPaths.map(async (file: string) => {
      const contents = await fs.readFile(path.join(blogsDir, file), "utf8");
      const parsed = matter(contents);

      return {
        content: parsed.content,
        meta: parsed.data,
      };
    })
  );

  const paths = blogPosts.map((blogPost) => ({
    params: { slug: blogPost?.meta?.slug },
  }));

  return {
    paths,
    fallback: false,
  };
}

const BlogPostPage = ({
  blogPost,
  renderedBlogContent,
  sidebarData,
}: {
  blogPost: BlogPost;
  renderedBlogContent: string;
  sidebarData: SidebarData;
}) => (
  <MainLayout sidebarData={sidebarData}>
    <BlogPostLayout
      blogPost={blogPost}
      renderedBlogContent={renderedBlogContent}
    />
  </MainLayout>
);

export default BlogPostPage;
