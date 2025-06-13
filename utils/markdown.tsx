import React from "react";
import Link from "next/link";
import * as ReactDOMServer from "react-dom/server";
import ReactMarkdown from "react-markdown";
import rehypeRaw from "rehype-raw";

const Img = ({ ...props }: any) => (
  <img className="rounded-md max-w-screen-lg mx-auto w-full" {...props} />
);

const Text = ({ children, node }: { children: React.ReactNode; node: any }) => {
  if (node.children[0]?.tagName === "img") {
    const image: any = node.children[0];
    return <Img src={image.properties.src} />;
  }

  return (
    <p className="flex-1 flex-grow w-full text-sm leading-7">{children}</p>
  );
};

const Anchor = ({ children, href }: any) => (
  <Link
    href={href}
    className="inline underline hover:text-gray-600 transition-colors"
  >
    {children}
  </Link>
);

const Strong = ({ children }: { children: React.ReactNode }) => (
  <strong className="font-semibold text-gray-900">{children}</strong>
);

const Em = ({ children }: { children: React.ReactNode }) => (
  <em className="italic">{children}</em>
);

const Code = ({ children }: { children: React.ReactNode }) => (
  <code className="bg-gray-100 px-1 py-0.5 rounded text-sm font-mono">
    {children}
  </code>
);

const Del = ({ children }: { children: React.ReactNode }) => (
  <del className="line-through text-gray-500">{children}</del>
);

export const renderMarkdownToHTML = (markup: string) => {
  return ReactDOMServer.renderToStaticMarkup(
    <ReactMarkdown
      rehypePlugins={[rehypeRaw]}
      components={{
        p: Text,
        img: Img,
        a: Anchor,
        strong: Strong,
        em: Em,
        code: Code,
        del: Del,
      }}
    >
      {markup.trim()!}
    </ReactMarkdown>
  );
};
