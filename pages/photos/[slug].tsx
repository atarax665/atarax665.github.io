import React from "react";
import { GetStaticPaths, GetStaticProps } from "next";
import MainLayout from "../../layouts/MainLayout";
import PhotoLayout from "../../layouts/PhotoLayout";
import { getSidebarData, getPhotos, getPhotoBySlug } from "../../utils/content";
import { SidebarData } from "../../components/Sidebar";
import { Photo } from "../../layouts/PhotoLayout";

export const getStaticPaths: GetStaticPaths = async () => {
  const photos = await getPhotos();

  const paths = photos.map((photo) => ({
    params: { slug: photo.meta.slug },
  }));

  return {
    paths,
    fallback: false,
  };
};

export const getStaticProps: GetStaticProps = async ({ params }) => {
  const slug = params?.slug as string;

  try {
    const [sidebarData, photo] = await Promise.all([
      getSidebarData(),
      getPhotoBySlug(slug),
    ]);

    return {
      props: {
        sidebarData,
        photo,
      },
    };
  } catch (error) {
    return {
      notFound: true,
    };
  }
};

export default function PhotoPage({
  sidebarData,
  photo,
}: {
  sidebarData: SidebarData;
  photo: Photo;
}) {
  return (
    <MainLayout sidebarData={sidebarData}>
      <PhotoLayout photo={photo} />
    </MainLayout>
  );
}
