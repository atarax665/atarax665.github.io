import React from "react";
import Link from "next/link";
import Img from "./Img";
import type { ImageRecord } from "../utils/images";

const BlogCard = ({
  title,
  description,
  slug,
  imageRecord,
}: {
  title: string;
  description: string;
  slug: string;
  imageRecord: ImageRecord | null;
}) => (
  <Link href={`/blog/${slug}`} className="group flex flex-col gap-3">
    <Img
      record={imageRecord}
      alt={title}
      ratio={false}
      className="aspect-square w-full rounded-lg"
      imgClassName="transition-transform duration-500 ease-out group-hover:scale-[1.03]"
      sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
    />
    <div>
      <h3 className="mb-1 text-sm text-ink">{title}</h3>
      <p className="text-sm text-muted">{description}</p>
    </div>
  </Link>
);

export default BlogCard;
