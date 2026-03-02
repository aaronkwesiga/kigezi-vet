import { useRef } from 'react';

interface AnimatedAnimal {
    id: number;
    src: string;
    alt: string;
}

// EXPANDED SELECTION: HEN, COW, GOAT, SHEEP, DOG, AND VETERINARY MEDICINES.
const SLIDESHOW_IMAGES = [
    // 1. African Cattle Herding
    { src: 'https://images.unsplash.com/photo-1590856029826-c7a73142663e?w=1600&q=90', alt: 'African Cattle Herding' },
    // 2. VETERINARY MEDICINES
    { src: 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=1600&q=90', alt: 'Veterinary Medicines' },
    // 3. African Goats/Farm
    { src: 'https://images.unsplash.com/photo-1601362840469-51e4d8d59085?w=1600&q=90', alt: 'African Livestock Farm' },
    // 4. African Farmer with Sheep/Goats
    { src: 'https://images.unsplash.com/photo-1531053159500-16584281729b?w=1600&q=90', alt: 'African Farmer' },
    // 5. VETERINARY CLINIC / LAB
    { src: 'https://images.unsplash.com/photo-1434494878577-86c23bcb06b9?w=1600&q=90', alt: 'Veterinary Lab' },
    // 6. African Poultry / Farm
    { src: 'https://images.unsplash.com/photo-1548550023-2bdb3c5beed7?w=1600&q=90', alt: 'African Farm Poultry' },
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
                            filter: 'brightness(0.7)', // Increased darkening significantly for better text contrast
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
