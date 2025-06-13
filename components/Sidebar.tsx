import React from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/router";

export type PersonalInfo = {
  name: string;
  title: string;
  location: string;
  email: string;
  linkedin: string;
  github: string;
  twitter: string;
  avatar: string;
};

export type NavigationItem = {
  name: string;
  href: string;
  icon: string;
};

export type SidebarData = {
  personalInfo: PersonalInfo;
  navigation: NavigationItem[];
  aboutContent: string;
};

const Sidebar = ({ data }: { data: SidebarData }) => {
  const router = useRouter();
  const { personalInfo, navigation } = data;

  return (
    <div className="hidden lg:block w-80 min-h-screen bg-white p-8 flex flex-col gap-8 fixed left-0 top-0 overflow-y-auto border-r border-gray-100">
      {/* Personal Info */}
      <div className="flex flex-col gap-4">
        <Link
          href="/"
          className="w-16 h-16 rounded-full overflow-hidden bg-gray-100"
        >
          <Image
            src={personalInfo.avatar}
            alt={personalInfo.name}
            width={64}
            height={64}
            className="w-full h-full object-cover"
            priority
          />
        </Link>
        <div>
          <h1 className="text-sm text-gray-900">{personalInfo.name}</h1>
          <p className="text-sm text-gray-600">{personalInfo.title}</p>
          <p className="text-sm text-gray-500">{personalInfo.location}</p>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex flex-col gap-1 mt-4">
        {navigation.map((item) => {
          const isActive =
            router.pathname === item.href ||
            (item.href === "/blog" && router.pathname.startsWith("/blog"));

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`py-2 text-sm transition-colors ${
                isActive
                  ? "text-gray-900 underline"
                  : "text-gray-600 hover:text-gray-900"
              }`}
            >
              {item.name}
            </Link>
          );
        })}
      </nav>

      {/* Contact Links */}
      <div className="flex flex-col gap-1 pt-4 border-t border-gray-100">
        <a
          href={
            personalInfo.email.startsWith("mailto:")
              ? personalInfo.email
              : `mailto:${personalInfo.email}`
          }
          className="text-sm text-gray-600 hover:text-gray-900 transition-colors"
        >
          {personalInfo.email}
        </a>
        <a
          href={personalInfo.linkedin}
          target="_blank"
          rel="noopener noreferrer"
          className="text-sm text-gray-600 hover:text-gray-900 transition-colors"
        >
          LinkedIn
        </a>
        <a
          href={personalInfo.github}
          target="_blank"
          rel="noopener noreferrer"
          className="text-sm text-gray-600 hover:text-gray-900 transition-colors"
        >
          GitHub
        </a>
      </div>
    </div>
  );
};

export default Sidebar;
