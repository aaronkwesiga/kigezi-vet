import { useRef } from 'react';

interface AnimatedImage {
    id: number;
    src: string;
    alt: string;
}

// IMAGES FOCUSING ON CONSULTATION: PHONE AND LAPTOP USAGE BY FARMERS/CLIENTS.
const SLIDESHOW_IMAGES = [
    // 1. African Farmer using smartphone
    { src: 'https://images.unsplash.com/photo-1596753177691-62d294025d2c?w=1600&q=90', alt: 'African farmer using smartphone' },
    // 2. African person in digital consultation
    { src: 'https://images.unsplash.com/photo-1590244439192-6644bea15102?w=1600&q=90', alt: 'Digital Consultation' },
    // 3. African team with laptop (agri-tech focus)
    { src: 'https://images.unsplash.com/photo-1579389083046-e3df9c2b3325?w=1600&q=90', alt: 'Agri-tech consultation' },
    // 4. African woman with smartphone in agricultural setting
    { src: 'https://images.unsplash.com/photo-1557800636-894a64c1696f?w=1600&q=90', alt: 'Mobile agricultural support' },
    // 5. Professional consultation / Laptop
    { src: 'https://images.unsplash.com/photo-1595856417222-7773f3242f36?w=1600&q=90', alt: 'Support interaction' },
    // 6. African Vet checking livestock/digital report
    { src: 'https://images.unsplash.com/photo-1628333165842-3232ff307452?w=1600&q=90', alt: 'Veterinary report check' },
    // 7. African poultry farmer with tablet
    { src: 'https://images.unsplash.com/photo-1548550023-2bdb3c5beed7?w=1600&q=90', alt: 'Poultry monitoring' },
    // 8. Remote veterinary assistance
    { src: 'https://images.unsplash.com/photo-1581091226033-d5c48150dbaa?w=1600&q=90', alt: 'Equip management' },
];

const DISPLAY_DURATION = 5; // Seconds per image
const TOTAL_DURATION = DISPLAY_DURATION * SLIDESHOW_IMAGES.length;

const ConsultationBackground = () => {
    const images = useRef<AnimatedImage[]>(
        SLIDESHOW_IMAGES.map((img, i) => ({ ...img, id: i }))
    ).current;

    return (
        <div
            className="absolute inset-0 overflow-hidden pointer-events-none z-0"
            aria-hidden="true"
        >
            {images.map((img, index) => (
                <div
                    key={img.id}
                    className="absolute inset-0"
                    style={{
                        animationName: `consultationSlideshow`,
                        animationDuration: `${TOTAL_DURATION}s`,
                        animationIterationCount: 'infinite',
                        animationDelay: `${index * DISPLAY_DURATION - TOTAL_DURATION}s`,
                        animationFillMode: 'both',
                    }}
                >
                    <img
                        src={img.src}
                        alt={img.alt}
                        className="h-full w-full object-cover"
                        style={{
                            display: 'block',
                            filter: 'brightness(0.7)', // Slightly increased for better visibility
                        }}
                        onError={(e) => {
                            (e.target as HTMLImageElement).style.opacity = '0';
                        }}
                    />
                </div>
            ))}

            <style>{`
        @keyframes consultationSlideshow {
          0% { opacity: 0; }
          2.5% { opacity: 1; }    /* Fade in over 1s (1/40) */
          15% { opacity: 1; }     /* Hold until next is in (5s interval + 1s fade) */
          17.5% { opacity: 0; }   /* Fade out while next is ready */
          100% { opacity: 0; }
        }
      `}</style>
        </div>
    );
};

export default ConsultationBackground;
