import React from "react";
import Link from "next/link";

/**
 * Served by the service worker when a route is requested that was never
 * visited and the network is unavailable. Deliberately self-contained: no
 * sidebar data, no images, nothing that needs a fetch.
 */
export default function Offline() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-bg px-6">
      <div className="max-w-md text-center">
        <p className="meta mb-4">Offline</p>
        <h1 className="font-display mb-4 text-[30px] leading-tight text-ink">
          You&rsquo;re offline
        </h1>
        <p className="mb-8 text-sm leading-relaxed text-muted">
          This page hasn&rsquo;t been visited before, so there&rsquo;s no cached
          copy to show. Pages you&rsquo;ve already opened are still available.
        </p>
        <Link
          href="/"
          className="text-sm text-accent underline underline-offset-4"
        >
          Go to the home page
        </Link>
      </div>
    </div>
  );
}
