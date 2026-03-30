import { useRef } from 'react';

interface AnimatedAnimal {
    id: number;
    src: string;
    alt: string;
}

// THE 4 SPECIFIC IMAGES REQUESTED BY THE USER
const SLIDESHOW_IMAGES = [
    { src: `${import.meta.env.BASE_URL}calf.jpg`, alt: 'Calf' },
    { src: `${import.meta.env.BASE_URL}sheep.jpg`, alt: 'Sheep' },
    { src: `${import.meta.env.BASE_URL}goat.jpg`, alt: 'Goat' },
    { src: `${import.meta.env.BASE_URL}pig.jpg`, alt: 'Pig' },
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
          0% { opacity: 0; z-index: 10; }
          5% { opacity: 1; z-index: 10; }    /* Faded in completely */
          25% { opacity: 1; z-index: 10; }   /* Stays on top */
          25.1% { opacity: 1; z-index: 0; }  /* Drops to back */
          30% { opacity: 1; z-index: 0; }    /* Stays fully opaque in back while next image fades in over it */
          35% { opacity: 0; z-index: 0; }    /* Safely fades out now that it's covered */
          100% { opacity: 0; z-index: 0; }
        }
      `}</style>
        </div>
    );
};

export default DomesticAnimalsBackground;
