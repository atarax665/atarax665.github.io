import React from "react";
import Link from "next/link";
import { useRouter } from "next/router";
import type { NavigationItem } from "./Sidebar";

/**
 * The site's navigation list, shared by the desktop sidebar and the mobile
 * menu. Previously duplicated across Sidebar.tsx and MainLayout.tsx, which
 * meant active-state rules could silently diverge between the two.
 */
export default function Nav({
  items,
  variant = "sidebar",
  onNavigate,
}: {
  items: NavigationItem[];
  variant?: "sidebar" | "mobile";
  onNavigate?: () => void;
}) {
  const router = useRouter();

  const isActive = (href: string) =>
    router.pathname === href ||
    // Section landing pages should stay marked while inside the section.
    (href !== "/" && router.pathname.startsWith(`${href}/`));

  return (
    <nav
      className={variant === "sidebar" ? "flex flex-col gap-0.5" : "flex flex-col"}
      aria-label="Main"
    >
      {items.map((item) => {
        const active = isActive(item.href);

        if (variant === "mobile") {
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={onNavigate}
              aria-current={active ? "page" : undefined}
              className={`mx-2 rounded px-3 py-2.5 text-sm transition-colors duration-fast ease-out ${
                active ? "bg-line text-ink" : "text-muted hover:text-ink"
              }`}
            >
              {item.name}
            </Link>
          );
        }

        return (
          <Link
            key={item.href}
            href={item.href}
            onClick={onNavigate}
            aria-current={active ? "page" : undefined}
            className={`relative py-1.5 text-sm transition-colors duration-fast ease-out ${
              active ? "text-ink" : "text-muted hover:text-ink"
            }`}
          >
            {active && (
              <span
                aria-hidden="true"
                className="absolute -left-3.5 top-1/2 h-1 w-1 -translate-y-1/2 rounded-full bg-accent"
              />
            )}
            {item.name}
          </Link>
        );
      })}
    </nav>
  );
}
