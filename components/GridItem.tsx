import React from "react";
import Image from "next/image";
import Link from "next/link";

export type GridItemType = "photo" | "blog" | "text" | "link";

export type GridItemData = {
  id: string;
  type: GridItemType;
  title?: string;
  description?: string;
  image?: string;
  href?: string;
  content?: string;
  date?: string;
  size?: "small" | "medium" | "large";
};

const GridItem = ({ item }: { item: GridItemData }) => {
  const sizeClasses = {
    small: "col-span-1",
    medium: "col-span-2",
    large: "col-span-2 md:col-span-3",
  };

  const aspectClasses = {
    small: "aspect-square",
    medium: "aspect-[4/3]",
    large: "aspect-[4/3]",
  };

  const baseClasses = `${sizeClasses[item.size || "small"]} ${
    aspectClasses[item.size || "small"]
  } hover:opacity-75 transition-opacity relative z-10`;

  const content = (
    <div className="w-full h-full flex flex-col relative overflow-hidden rounded-lg">
      {item.type === "photo" && item.image && (
        <div className="relative w-full h-full">
          <Image
            src={item.image}
            alt={item.title || "Photo"}
            fill
            className="object-cover"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />
          {item.title && (
            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-3 pt-6">
              <p className="text-sm text-white font-medium">{item.title}</p>
            </div>
          )}
        </div>
      )}

      {item.type === "blog" && (
        <div className="p-4 bg-gray-50 h-full flex flex-col justify-between relative z-10">
          <div>
            <h3 className="text-sm text-gray-900 mb-2 line-clamp-2 font-medium">
              {item.title}
            </h3>
            <p className="text-sm text-gray-600 mb-2 line-clamp-3">
              {item.description}
            </p>
          </div>
          {item.date && (
            <p className="text-xs text-gray-500 mt-auto">
              {new Date(item.date).toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
              })}
            </p>
          )}
        </div>
      )}

      {item.type === "text" && (
        <div className="p-4 bg-white border border-gray-100 h-full flex flex-col justify-center relative z-10">
          {item.title && (
            <h3 className="text-sm text-gray-900 mb-2 font-medium">
              {item.title}
            </h3>
          )}
          {item.content && (
            <p className="text-sm text-gray-600 line-clamp-4">{item.content}</p>
          )}
        </div>
      )}

      {item.type === "link" && (
        <div className="p-4 bg-gray-900 text-white h-full flex flex-col justify-center relative z-10">
          <h3 className="text-sm mb-1 font-medium">{item.title}</h3>
          {item.description && (
            <p className="text-sm opacity-75">{item.description}</p>
          )}
        </div>
      )}
    </div>
  );

  if (item.href) {
    return (
      <Link href={item.href} className={baseClasses}>
        {content}
      </Link>
    );
  }

  return <div className={baseClasses}>{content}</div>;
};

export default GridItem;
