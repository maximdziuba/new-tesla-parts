import React from "react";
import { PagesManager } from "../components/PagesManager";

export const CMSPage: React.FC = () => {
  return (
    <div className="animate-fade-in">
      <div className="flex items-center gap-3 mb-8">
        <div className="w-1.5 h-6 bg-blue-600 rounded-full"></div>
        <h1 className="text-xl font-black uppercase tracking-widest text-slate-900 leading-none">
          Управління сторінками
        </h1>
      </div>
      <PagesManager />
    </div>
  );
};

export default CMSPage;
