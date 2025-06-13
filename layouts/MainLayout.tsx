import React, { useState } from "react";
import Sidebar, { SidebarData } from "../components/Sidebar";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/router";

const MainLayout = ({
  children,
  sidebarData,
}: {
  children: React.ReactNode;
  sidebarData: SidebarData;
}) => {
  const router = useRouter();
  const { personalInfo, navigation } = sidebarData;
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <div className="flex min-h-screen bg-white">
      <Sidebar data={sidebarData} />

      {/* Mobile Header */}
      <div className="lg:hidden fixed top-4 left-4 right-4 bg-white/80 border border-gray-200/30 rounded-2xl p-4 z-20 shadow-lg shadow-black/5">
        <div className="flex items-center justify-between">
          {/* Avatar */}
          <Link href="/" className="flex items-center">
            <div className="w-8 h-8 rounded-full overflow-hidden bg-gray-100 ring-2 ring-white/50">
              <Image
                src={personalInfo.avatar}
                alt={personalInfo.name}
                width={32}
                height={32}
                className="w-full h-full object-cover"
                priority
              />
            </div>
          </Link>

          {/* 3-dot menu */}
          <div className="relative">
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="p-2 text-gray-600 hover:text-gray-900 transition-colors rounded-full hover:bg-white/50"
              aria-label="Menu"
            >
              <svg
                width="20"
                height="20"
                viewBox="0 0 20 20"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <circle cx="10" cy="4" r="1.5" fill="currentColor" />
                <circle cx="10" cy="10" r="1.5" fill="currentColor" />
                <circle cx="10" cy="16" r="1.5" fill="currentColor" />
              </svg>
            </button>

            {/* Dropdown Menu */}
            {isMobileMenuOpen && (
              <>
                {/* Backdrop - positioned to blur everything except header and dropdown */}
                <div
                  className="fixed inset-0 bg-black/20 backdrop-blur-sm z-15"
                  style={{ zIndex: 15 }}
                  onClick={() => setIsMobileMenuOpen(false)}
                />

                {/* Menu */}
                <div className="absolute right-0 top-full mt-3 w-48 bg-white/90 backdrop-blur-xl rounded-2xl shadow-xl border border-gray-200/30 py-3 z-20">
                  {navigation.map((item) => {
                    const isActive =
                      router.pathname === item.href ||
                      (item.href === "/blog" &&
                        router.pathname.startsWith("/blog"));

                    return (
                      <Link
                        key={item.href}
                        href={item.href}
                        className={`block px-4 py-2.5 text-sm transition-colors rounded-lg mx-2 ${
                          isActive
                            ? "text-gray-900 bg-white/60"
                            : "text-gray-600 hover:text-gray-900 hover:bg-white/40"
                        }`}
                        onClick={() => setIsMobileMenuOpen(false)}
                      >
                        {item.name}
                      </Link>
                    );
                  })}

                  {/* Contact Links */}
                  <div className="border-t border-gray-200/30 mt-3 pt-3">
                    <a
                      href={
                        personalInfo.email.startsWith("mailto:")
                          ? personalInfo.email
                          : `mailto:${personalInfo.email}`
                      }
                      className="block px-4 py-2.5 text-sm text-gray-600 hover:text-gray-900 hover:bg-white/40 transition-colors rounded-lg mx-2"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      Email
                    </a>
                    <a
                      href={personalInfo.linkedin}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block px-4 py-2.5 text-sm text-gray-600 hover:text-gray-900 hover:bg-white/40 transition-colors rounded-lg mx-2"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      LinkedIn
                    </a>
                    <a
                      href={personalInfo.github}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block px-4 py-2.5 text-sm text-gray-600 hover:text-gray-900 hover:bg-white/40 transition-colors rounded-lg mx-2"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      GitHub
                    </a>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Main content wrapper to handle backdrop blur */}
      <div
        className={`${
          isMobileMenuOpen ? "lg:blur-0 blur-sm" : ""
        } transition-all duration-200`}
      >
        <main className="flex-1 lg:ml-80 p-4 lg:p-6 pt-24 lg:pt-6">
          {children}
        </main>
      </div>
    </div>
  );
};

export default MainLayout;
