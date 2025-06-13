import React from "react";
import Image from "next/image";
import Link from "next/link";

export type PhotoMeta = {
  title: string;
  slug: string;
  image: string;
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
        className="text-sm text-gray-600 hover:text-gray-900 transition-colors underline"
      >
        ← Back to Home
      </Link>
    </div>

    {/* Photo Header */}
    <div className="mb-8">
      <h1 className="text-lg text-gray-900 mb-4">{photo.meta.title}</h1>
      {photo.meta.description && (
        <p className="text-sm text-gray-600 mb-4">{photo.meta.description}</p>
      )}
      <div className="flex flex-wrap gap-4 text-sm text-gray-500">
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
      <div className="relative w-full bg-gray-100 rounded-lg overflow-hidden flex items-center justify-center min-h-[400px] max-h-[80vh]">
        <Image
          src={photo.meta.image}
          alt={photo.meta.title}
          width={1200}
          height={800}
          className="max-w-full max-h-full w-auto h-auto object-contain"
          priority
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 90vw, 1200px"
        />
      </div>
    </div>

    {/* Photo Content */}
    <div className="prose prose-gray max-w-none mb-8">
      <div dangerouslySetInnerHTML={{ __html: photo.renderedContent }} />
    </div>

    {/* Tags */}
    {photo.meta.tags && photo.meta.tags.length > 0 && (
      <div className="mb-8">
        <div className="flex flex-wrap gap-2">
          {photo.meta.tags.map((tag) => (
            <span
              key={tag}
              className="px-2 py-1 text-sm text-gray-600 bg-gray-100 border border-gray-200"
            >
              {tag}
            </span>
          ))}
        </div>
      </div>
    )}

    {/* Navigation */}
    <div className="mt-12 pt-8 border-t border-gray-100">
      <Link
        href="/"
        className="text-sm text-gray-900 hover:text-gray-600 transition-colors underline"
      >
        ← View all photos
      </Link>
    </div>
  </div>
);

export default PhotoLayout;
