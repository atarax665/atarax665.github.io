import React from "react";
import { GetStaticPaths, GetStaticProps } from "next";
import MainLayout from "../../layouts/MainLayout";
import PageLayout from "../../layouts/PageLayout";
import { getSidebarData, getPageContent, Page } from "../../utils/content";
import { SidebarData } from "../../components/Sidebar";

export const getStaticPaths: GetStaticPaths = async () => {
  // For now, we only have the main workout page
  // In the future, you could add pages like "routine", "progress", "nutrition", etc.
  const paths = [{ params: { slug: "index" } }];

  return {
    paths,
    fallback: false,
  };
};

export const getStaticProps: GetStaticProps = async ({ params }) => {
  const slug = params?.slug as string;

  // Map slug to actual page content
  const pageSlug = slug === "index" ? "workout" : slug;

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

export default function WorkoutPage({
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
