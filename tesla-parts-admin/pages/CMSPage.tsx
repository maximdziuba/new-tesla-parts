import React, { useState } from 'react';
import { PagesManager } from '../components/PagesManager';
import { FileText } from 'lucide-react';

export const CMSPage: React.FC = () => {
    const [activeTab] = useState<'pages'>('pages');

    return (
        <div className="animate-fade-in">
            <div className="flex items-center gap-3 mb-8">
                <div className="w-1.5 h-6 bg-blue-600 rounded-full"></div>
                <h1 className="text-xl font-black uppercase tracking-widest text-slate-900 leading-none">Управління контентом</h1>
            </div>
            {activeTab === 'pages' && <PagesManager />}
        </div>
    );
};

export default CMSPage;
