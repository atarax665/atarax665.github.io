import React from "react";
import Link from "next/link";
import Img from "../components/Img";
import type { ImageRecord } from "../utils/images";

export type PhotoMeta = {
  title: string;
  slug: string;
  image: string;
  /** Build-time encoded variants for `image`, attached by utils/content.ts */
  imageRecord: ImageRecord | null;
  date: string;
  location?: string;
  camera?: string;
  lens?: string;
  settings?: string;
  description?: string;
  tags?: string[];
};

export type Photo = {
  meta: PhotoMeta;
  content: string;
  renderedContent: string;
};

const PhotoLayout = ({ photo }: { photo: Photo }) => (
  <div className="max-w-4xl">
    {/* Back to Home Link */}
    <div className="mb-8">
      <Link
        href="/"
        className="text-sm text-muted hover:text-ink transition-colors underline"
      >
        ← Back to Home
      </Link>
    </div>

    {/* Photo Header */}
    <div className="mb-8">
      <h1 className="font-display text-[30px] leading-tight text-ink mb-4">{photo.meta.title}</h1>
      {photo.meta.description && (
        <p className="text-sm text-muted mb-4">{photo.meta.description}</p>
      )}
      <div className="flex flex-wrap gap-4 text-sm text-muted">
        <span>
          {new Date(photo.meta.date).toLocaleDateString("en-US", {
            year: "numeric",
            month: "long",
            day: "numeric",
          })}
        </span>
        {photo.meta.location && <span>{photo.meta.location}</span>}
      </div>
    </div>

    {/* Photo Image */}
    <div className="mb-8">
      <Img
        record={photo.meta.imageRecord}
        alt={photo.meta.title}
        priority
        fit="contain"
        className="w-full rounded-lg"
        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 90vw, 1200px"
        style={{ maxHeight: "80vh" }}
      />
    </div>

    {/* Photo Content */}
    <div className="prose max-w-none mb-8">
      <div dangerouslySetInnerHTML={{ __html: photo.renderedContent }} />
    </div>

    {/* Tags */}
    {photo.meta.tags && photo.meta.tags.length > 0 && (
      <div className="mb-8">
        <div className="flex flex-wrap gap-2">
          {photo.meta.tags.map((tag) => (
            <span
              key={tag}
              className="px-2 py-1 text-sm text-muted bg-line border border-line"
            >
              {tag}
            </span>
          ))}
        </div>
      </div>
    )}

    {/* Navigation */}
    <div className="mt-12 pt-8 border-t border-line">
      <Link
        href="/"
        className="text-sm text-ink hover:text-muted transition-colors underline"
      >
        ← View all photos
      </Link>
    </div>
  </div>
);

export default PhotoLayout;
