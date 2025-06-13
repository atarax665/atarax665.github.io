import React from "react";
import Image from "next/image";
import Link from "next/link";

const BlogCard = ({
  title,
  description,
  slug,
  photo,
}: {
  title: string;
  description: string;
  slug: string;
  photo: string;
}) => (
  <Link href={`/blog/${slug}`}>
    <div className="flex flex-col gap-3 hover:opacity-75 transition-opacity">
      <Image
        src={photo}
        alt={title}
        width="0"
        height="0"
        sizes="100vw"
        className="w-full h-auto aspect-square object-cover"
        priority
      />
      <div>
        <h3 className="text-sm text-gray-900 mb-1">{title}</h3>
        <p className="text-sm text-gray-600">{description}</p>
      </div>
    </div>
  </Link>
);

export default BlogCard;
