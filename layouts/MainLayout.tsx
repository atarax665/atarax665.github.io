import React, { useState } from "react";
import Link from "next/link";
import Sidebar, { SidebarData } from "../components/Sidebar";
import Img from "../components/Img";
import Nav from "../components/Nav";
import ThemeToggle from "../components/ThemeToggle";

const MainLayout = ({
  children,
  sidebarData,
}: {
  children: React.ReactNode;
  sidebarData: SidebarData;
}) => {
  const { personalInfo, navigation, avatarImage } = sidebarData;
  const [menuOpen, setMenuOpen] = useState(false);

  const mailto = personalInfo.email.startsWith("mailto:")
    ? personalInfo.email
    : `mailto:${personalInfo.email}`;

  return (
    <div className="min-h-screen bg-bg">
      <Sidebar data={sidebarData} />

      {/* Mobile header */}
      <header className="fixed inset-x-3 top-3 z-30 rounded-lg border border-line bg-bg/85 px-4 py-3 backdrop-blur-xl lg:hidden">
        <div className="flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5">
            <Img
              record={avatarImage}
              alt={personalInfo.name}
              ratio={false}
              priority
              className="h-8 w-8 rounded-full"
              sizes="32px"
            />
            <span className="font-display text-[16px] text-ink">
              {personalInfo.name}
            </span>
          </Link>

          <div className="flex items-center gap-1">
            <ThemeToggle />
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              aria-label={menuOpen ? "Close menu" : "Open menu"}
              aria-expanded={menuOpen}
              className="flex h-7 w-7 items-center justify-center rounded-full text-muted transition-colors duration-fast ease-out hover:bg-line hover:text-ink"
            >
              <svg width="18" height="18" viewBox="0 0 20 20" fill="none" aria-hidden="true">
                <circle cx="10" cy="4" r="1.5" fill="currentColor" />
                <circle cx="10" cy="10" r="1.5" fill="currentColor" />
                <circle cx="10" cy="16" r="1.5" fill="currentColor" />
              </svg>
            </button>
          </div>
        </div>
      </header>

      {menuOpen && (
        <>
          <div
            className="fixed inset-0 z-20 bg-black/25 backdrop-blur-sm lg:hidden"
            onClick={() => setMenuOpen(false)}
          />
          <div className="fixed right-3 top-[68px] z-30 w-52 rounded-lg border border-line bg-bg/95 py-3 backdrop-blur-xl lg:hidden">
            <Nav
              items={navigation}
              variant="mobile"
              onNavigate={() => setMenuOpen(false)}
            />
            <div className="mx-2 mt-3 border-t border-line pt-3">
              <a
                href={mailto}
                onClick={() => setMenuOpen(false)}
                className="block rounded px-3 py-2 text-sm text-muted transition-colors duration-fast ease-out hover:text-ink"
              >
                Email
              </a>
              <a
                href={personalInfo.github}
                target="_blank"
                rel="noopener noreferrer"
                className="block rounded px-3 py-2 text-sm text-muted transition-colors duration-fast ease-out hover:text-ink"
              >
                GitHub
              </a>
              <a
                href={personalInfo.linkedin}
                target="_blank"
                rel="noopener noreferrer"
                className="block rounded px-3 py-2 text-sm text-muted transition-colors duration-fast ease-out hover:text-ink"
              >
                LinkedIn
              </a>
            </div>
          </div>
        </>
      )}

      <main className="px-4 pb-20 pt-24 lg:ml-72 lg:px-12 lg:pt-12">
        {children}
      </main>
    </div>
  );
};

export default MainLayout;
