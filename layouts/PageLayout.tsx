import React from "react";
import { Page } from "../utils/content";

const PageLayout = ({ page }: { page: Page }) => (
  <div className="max-w-2xl">
    <div className="prose max-w-none">
      <div dangerouslySetInnerHTML={{ __html: page.renderedContent }} />
    </div>

    {page.meta.lastUpdated && (
      <div className="mt-8 pt-4 border-t border-line">
        <p className="text-sm text-muted">
          Last updated:{" "}
          {new Date(page.meta.lastUpdated).toLocaleDateString("en-US", {
            year: "numeric",
            month: "long",
            day: "numeric",
          })}
        </p>
      </div>
    )}
  </div>
);

export default PageLayout;
