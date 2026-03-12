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
            className="bg-white rounded-xl shadow-sm border border-gray-100 hover:-translate-y-1 hover:shadow-lg transition-all duration-300 cursor-pointer group overflow-hidden flex items-center p-3 sm:p-6 select-none"
            style={{ WebkitTapHighlightColor: 'transparent' }}
        >
            <div className="w-24 h-16 sm:w-48 sm:h-[108px] bg-gray-100 flex-shrink-0 overflow-hidden mr-3 sm:mr-6 flex items-center justify-center">
                    <img 
                        src="https://www.tesla.com/ownersmanual/images/GUID-EE2A1356-1432-4B7F-86BB-7AB3569937C8-online-en-US.png" 
                        alt={subcategory.name} 
                        className="w-full h-full object-contain xl:group-hover:scale-105 transition-transform p-1 bg-white" 
                    />
            </div>

            <div className="flex-grow min-w-0">
                {/* ЗМІНА 5: 
                    - xl:group-hover:text-blue-600 (червоний при наведенні ТІЛЬКИ на ПК)
                    - active:text-blue-600 (червоний при натисканні на мобільному)
                */}
                <h3 className="font-bold text-sm sm:text-lg text-gray-900 active:text-blue-600 xl:group-hover:text-blue-600 transition-colors break-words pr-2 leading-tight">
                    {subcategory.name}
                </h3>
                {subcategory.code && (
                    <span className="text-xs sm:text-sm text-gray-500 bg-gray-100 px-2 py-0.5 rounded inline-block mt-1 sm:mt-2">
                        {subcategory.code}
                    </span>
                )}
            </div>

            {/* ЗМІНА 6: Те саме для стрілочки - тільки active та xl:hover */}
            <div className="text-gray-400 active:text-blue-600 xl:group-hover:text-blue-600 transition-colors flex-shrink-0 ml-2">
                <ChevronRight className="w-5 h-5 sm:w-6 sm:h-6" />
            </div>
        </div>
    );
};

export default SubcategoryCard;