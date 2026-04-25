import React from 'react';
import { FeedbackManager } from '../components/FeedbackManager';

export const FeedbackPage: React.FC = () => {
    return (
        <div className="animate-fade-in">
            <div className="flex items-center gap-3 mb-8">
                <div className="w-1.5 h-6 bg-blue-600 rounded-full"></div>
                <h1 className="text-xl font-black uppercase tracking-widest text-slate-900 leading-none">Управління відгуками</h1>
            </div>
            <FeedbackManager />
        </div>
    );
};

export default FeedbackPage;
