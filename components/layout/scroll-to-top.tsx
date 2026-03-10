'use client';

import { useEffect, useState } from 'react';

export function ScrollToTop() {
    const [isVisible, setIsVisible] = useState(false);

    const toggleVisibility = () => {
        if (window.scrollY > 300) {
            setIsVisible(true);
        } else {
            setIsVisible(false);
        }
    };

    const scrollToTop = () => {
        window.scrollTo({
            top: 0,
            behavior: 'smooth',
        });
    };

    useEffect(() => {
        window.addEventListener('scroll', toggleVisibility);
        return () => {
            window.removeEventListener('scroll', toggleVisibility);
        };
    }, []);

    return (
        <button
            onClick={scrollToTop}
            className={`fixed bottom-6 right-6 z-50 p-3 md:p-4 rounded-full bg-vettrack-accent text-white shadow-lg shadow-vettrack-accent/30 hover:bg-vettrack-accent/90 transition-all duration-300 transform flex items-center justify-center focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-vettrack-accent ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-12 opacity-0 pointer-events-none'
                }`}
            aria-label="Voltar ao topo"
        >
            <svg
                className="w-5 h-5 md:w-6 md:h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
            >
                <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={3}
                    d="M5 15l7-7 7 7"
                />
            </svg>
        </button>
    );
}
