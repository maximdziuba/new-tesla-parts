'use client';

import React, { useState, useEffect } from 'react';
import { MessageSquare, X, ZoomIn, ChevronLeft, ChevronRight } from 'lucide-react';

interface Feedback {
    id: number;
    image_url: string;
    created_at: string;
}

interface FeedbackClientProps {
    initialFeedback: Feedback[];
}

export default function FeedbackClient({ initialFeedback }: FeedbackClientProps) {
    const [selectedImage, setSelectedImage] = useState<string | null>(null);

    const handlePrevImage = () => {
        if (!selectedImage) return;
        const currentIndex = initialFeedback.findIndex(f => f.image_url === selectedImage);
        const prevIndex = (currentIndex - 1 + initialFeedback.length) % initialFeedback.length;
        setSelectedImage(initialFeedback[prevIndex].image_url);
    };

    const handleNextImage = () => {
        if (!selectedImage) return;
        const currentIndex = initialFeedback.findIndex(f => f.image_url === selectedImage);
        const nextIndex = (currentIndex + 1) % initialFeedback.length;
        setSelectedImage(initialFeedback[nextIndex].image_url);
    };

    useEffect(() => {
        if (!selectedImage) return;
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape') setSelectedImage(null);
            if (e.key === 'ArrowLeft') handlePrevImage();
            if (e.key === 'ArrowRight') handleNextImage();
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [selectedImage]);

    return (
        <div className="mt-8 max-w-6xl mx-auto px-4">
            <div className="flex items-center gap-4 mb-10">
                <div className="w-12 h-12 bg-blue-600 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-blue-200">
                    <MessageSquare size={24} />
                </div>
                <div>
                    <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Відгуки</h1>
                    <p className="text-gray-500 dark:text-slate-400">Дякуємо, що обираєте нас!</p>
                </div>
            </div>

            {initialFeedback.length > 0 ? (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                    {initialFeedback.map((item) => (
                        <div 
                            key={item.id}
                            onClick={() => setSelectedImage(item.image_url)}
                            className="group relative aspect-[3/4] bg-white dark:bg-slate-800 rounded-2xl border border-gray-100 dark:border-slate-700 overflow-hidden cursor-pointer hover:shadow-xl transition-all duration-300"
                        >
                            <img
                                src={item.image_url}
                                alt="Відгук клієнта"
                                className="w-full h-full object-contain p-2 transition-transform duration-500 group-hover:scale-105"
                            />
                            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors flex items-center justify-center">
                                <div className="bg-white/90 backdrop-blur-sm p-3 rounded-full opacity-0 group-hover:opacity-100 transform translate-y-4 group-hover:translate-y-0 transition-all duration-300">
                                    <ZoomIn size={20} className="text-blue-600" />
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="text-center py-20 bg-white dark:bg-slate-800 rounded-3xl border border-dashed border-gray-200 dark:border-slate-700">
                    <MessageSquare size={48} className="mx-auto text-gray-300 mb-4" />
                    <p className="text-gray-500 dark:text-slate-400 font-medium">Відгуків поки немає, але ми над цим працюємо!</p>
                </div>
            )}

            {/* Lightbox */}
            {selectedImage && (
                <div 
                    className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 p-4 backdrop-blur-sm"
                    onClick={() => setSelectedImage(null)}
                >
                    <button 
                        onClick={() => setSelectedImage(null)}
                        className="absolute top-6 right-6 text-white/70 hover:text-white p-2 transition-colors"
                    >
                        <X size={32} />
                    </button>

                    <button 
                        onClick={(e) => { e.stopPropagation(); handlePrevImage(); }}
                        className="absolute left-6 top-1/2 -translate-y-1/2 bg-white/10 hover:bg-white/20 text-white p-4 rounded-full transition-all"
                    >
                        <ChevronLeft size={32} />
                    </button>

                    <button 
                        onClick={(e) => { e.stopPropagation(); handleNextImage(); }}
                        className="absolute right-6 top-1/2 -translate-y-1/2 bg-white/10 hover:bg-white/20 text-white p-4 rounded-full transition-all"
                    >
                        <ChevronRight size={32} />
                    </button>

                    <div 
                        className="max-h-[90vh] max-w-full"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <img 
                            src={selectedImage} 
                            alt="Відгук великий план" 
                            className="max-h-[90vh] w-auto rounded-lg shadow-2xl"
                        />
                    </div>
                </div>
            )}
        </div>
    );
}
