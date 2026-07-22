"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { StaticSeoRecord } from "../types";

interface StaticPageClientProps {
  slug: string;
  initialPage: { title: string; content: string } | null;
  initialSeo?: StaticSeoRecord | null;
  fallbackTitle: string;
}

const StaticPageClient: React.FC<StaticPageClientProps> = ({
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  slug,
  initialPage,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  initialSeo,
  fallbackTitle,
}) => {
  const router = useRouter();

  return (
    <div className="py-12 max-w-2xl mx-auto transition-colors">
      <h1 className="text-3xl font-bold mb-6 text-slate-900 dark:text-white">
        {initialPage?.title || fallbackTitle}
      </h1>

      {initialPage ? (
        <div
          className="text-gray-600 dark:text-slate-300 leading-relaxed prose prose-lg dark:prose-invert max-w-none"
          dangerouslySetInnerHTML={{
            __html: initialPage.content.replace(/\n/g, "<br />"),
          }}
        />
      ) : (
        <p className="text-gray-600 dark:text-slate-400 leading-relaxed">
          Ця сторінка знаходиться в розробці.
        </p>
      )}

      <button
        onClick={() => router.push("/")}
        className="mt-8 text-blue-600 dark:text-blue-400 font-medium hover:underline flex items-center gap-2 group"
      >
        <span className="group-hover:-translate-x-1 transition-transform">
          ←
        </span>{" "}
        Повернутись на головну
      </button>
    </div>
  );
};

export default StaticPageClient;
