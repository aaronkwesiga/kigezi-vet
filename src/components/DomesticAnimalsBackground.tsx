import { useRef } from 'react';

interface AnimatedAnimal {
    id: number;
    src: string;
    alt: string;
}

// THE 4 SPECIFIC IMAGES REQUESTED BY THE USER
const SLIDESHOW_IMAGES = [
    { src: '/calf.jpg', alt: 'Calf' },
    { src: '/sheep.jpg', alt: 'Sheep' },
    { src: '/goat.jpg', alt: 'Goat' },
    { src: '/pig.jpg', alt: 'Pig' },
];

const DISPLAY_DURATION = 5; // Seconds per image
const TOTAL_DURATION = DISPLAY_DURATION * SLIDESHOW_IMAGES.length;

const DomesticAnimalsBackground = () => {
    const images = useRef<AnimatedAnimal[]>(
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
                        animationName: `expandedSlideshow`,
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
                            // Removed color overlay filter to keep only natural pictures
                        }}
                        onError={(e) => {
                            (e.target as HTMLImageElement).style.opacity = '0';
                        }}
                    />
                </div>
            ))}

            <style>{`
        @keyframes expandedSlideshow {
          0% { opacity: 0; }
          3.33% { opacity: 1; }       /* Fade in over 1s (1/30) */
          20% { opacity: 1; }         /* Hold until next is in (5s interval + 1s fade) */
          23.33% { opacity: 0; }      /* Fade out while next is ready */
          100% { opacity: 0; }
        }
      `}</style>
        </div>
    );
};

export default DomesticAnimalsBackground;
