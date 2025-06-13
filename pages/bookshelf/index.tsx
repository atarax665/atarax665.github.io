import React from "react";
import MainLayout from "../../layouts/MainLayout";
import PageLayout from "../../layouts/PageLayout";
import { getSidebarData, getPageContent, Page } from "../../utils/content";
import { SidebarData } from "../../components/Sidebar";

export async function getStaticProps() {
  const [sidebarData, pageContent] = await Promise.all([
    getSidebarData(),
    getPageContent("bookshelf"),
  ]);

  return {
    props: {
      sidebarData,
      pageContent,
    },
  };
}

export default function Bookshelf({
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
