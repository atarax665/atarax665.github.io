import React from "react";
import Link from "next/link";
import Img from "./Img";
import Nav from "./Nav";
import ThemeToggle from "./ThemeToggle";
import type { ImageRecord } from "../utils/images";

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
  /** Build-time encoded variants for personalInfo.avatar */
  avatarImage: ImageRecord | null;
  navigation: NavigationItem[];
  aboutContent: string;
};

const mailto = (email: string) =>
  email.startsWith("mailto:") ? email : `mailto:${email}`;

const Sidebar = ({ data }: { data: SidebarData }) => {
  const { personalInfo, navigation, avatarImage } = data;

  return (
    <aside className="fixed left-0 top-0 hidden h-screen w-72 flex-col justify-between overflow-y-auto border-r border-line bg-bg p-8 lg:flex">
      <div>
        <Link href="/" className="inline-block">
          <Img
            record={avatarImage}
            alt={personalInfo.name}
            ratio={false}
            priority
            className="h-14 w-14 rounded-full"
            sizes="56px"
          />
        </Link>

        <h1 className="font-display mt-4 text-[21px] leading-tight text-ink">
          {personalInfo.name}
        </h1>
        <p className="mt-0.5 text-sm text-muted">{personalInfo.title}</p>
        <p className="meta mt-2">{personalInfo.location}</p>

        <div className="mt-8">
          <Nav items={navigation} />
        </div>
      </div>

      <div className="mt-10 border-t border-line pt-5">
        <div className="flex flex-col gap-1.5">
          <a
            href={mailto(personalInfo.email)}
            className="text-sm text-muted transition-colors duration-fast ease-out hover:text-ink"
          >
            {personalInfo.email}
          </a>
          <div className="flex gap-4">
            <a
              href={personalInfo.github}
              target="_blank"
              rel="noopener noreferrer"
              className="meta transition-colors duration-fast ease-out hover:text-ink"
            >
              GitHub
            </a>
            <a
              href={personalInfo.linkedin}
              target="_blank"
              rel="noopener noreferrer"
              className="meta transition-colors duration-fast ease-out hover:text-ink"
            >
              LinkedIn
            </a>
          </div>
        </div>

        <div className="mt-4">
          <ThemeToggle className="-ml-1.5" />
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
