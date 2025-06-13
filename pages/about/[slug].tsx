import React from "react";
import { GetStaticPaths, GetStaticProps } from "next";
import MainLayout from "../../layouts/MainLayout";
import PageLayout from "../../layouts/PageLayout";
import { getSidebarData, getPageContent, Page } from "../../utils/content";
import { SidebarData } from "../../components/Sidebar";

export const getStaticPaths: GetStaticPaths = async () => {
  // For now, we only have the main about page
  // In the future, you could add more about-related pages like "experience", "skills", etc.
  const paths = [{ params: { slug: "index" } }];

  return {
    paths,
    fallback: false,
  };
};

export const getStaticProps: GetStaticProps = async ({ params }) => {
  const slug = params?.slug as string;

  // Map slug to actual page content
  const pageSlug = slug === "index" ? "about" : slug;

  try {
    const [sidebarData, pageContent] = await Promise.all([
      getSidebarData(),
      getPageContent(pageSlug),
    ]);

    return {
      props: {
        sidebarData,
        pageContent,
      },
    };
  } catch (error) {
    return {
      notFound: true,
    };
  }
};

export default function AboutPage({
  sidebarData,
  pageContent,
}: {
  sidebarData: SidebarData;
  pageContent: Page;
}) {
  return (
    <MainLayout sidebarData={sidebarData}>
      <PageLayout page={pageContent} />
    </MainLayout>
  );
}
