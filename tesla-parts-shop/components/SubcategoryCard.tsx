import React from 'react';
import { Subcategory } from '../types';
import { ChevronRight, Folder } from 'lucide-react';

interface SubcategoryCardProps {
    subcategory: Subcategory;
    onClick: () => void;
}

const SubcategoryCard: React.FC<SubcategoryCardProps> = ({ subcategory, onClick }) => {
    return (
        <div
            onClick={onClick}
            className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-gray-100 dark:border-slate-700 hover:-translate-y-1 hover:shadow-lg transition-all duration-300 cursor-pointer group overflow-hidden flex flex-col p-4 select-none h-full"
            style={{ WebkitTapHighlightColor: 'transparent' }}
        >
            <div className="w-full aspect-[16/10] bg-gray-50 dark:bg-slate-900 flex-shrink-0 overflow-hidden mb-4 flex items-center justify-center rounded-lg">
                    <img 
                        src="https://www.tesla.com/ownersmanual/images/GUID-EE2A1356-1432-4B7F-86BB-7AB3569937C8-online-en-US.png" 
                        alt={subcategory.name} 
                        className="w-full h-full object-contain xl:group-hover:scale-105 transition-transform p-4 bg-white dark:bg-slate-900" 
                    />
            </div>

            <div className="flex-grow flex flex-col justify-between">
                <div>
                    <h3 className="font-bold text-base sm:text-lg text-gray-900 dark:text-white active:text-blue-600 xl:group-hover:text-blue-600 dark:xl:group-hover:text-blue-400 transition-colors leading-tight mb-2">
                        {subcategory.name}
                    </h3>
                    {subcategory.code && (
                        <span className="text-xs text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-slate-700 px-2 py-0.5 rounded inline-block">
                            {subcategory.code}
                        </span>
                    )}
                </div>
                
                <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-50 dark:border-slate-700">
                    <span className="text-xs font-semibold text-blue-600 dark:text-blue-400 uppercase tracking-wider">Переглянути</span>
                    <div className="text-gray-400 dark:text-slate-500 active:text-blue-600 xl:group-hover:text-blue-600 dark:xl:group-hover:text-blue-400 transition-colors">
                        <ChevronRight size={20} />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SubcategoryCard;