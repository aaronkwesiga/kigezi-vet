import { useRef } from 'react';

interface FloatingItem {
    id: number;
    src: string;
    alt: string;
    startX: number;
    startY: number;
    size: number;
    duration: number;
    delay: number;
    opacity: number;
    rotate: number;
}

// Verified Unsplash images: veterinary drugs + domestic animals
// NO LIONS, NO TIGERS!
const IMAGES = [
    // Domestic Animals
    { src: 'https://images.unsplash.com/photo-1546445317-29f4545e9d53?w=200&q=80', alt: 'cow' },
    { src: 'https://images.unsplash.com/photo-1570042225831-d98fa7577f1e?w=200&q=80', alt: 'goat' },
    { src: 'https://images.unsplash.com/photo-1548550023-2bdb3c5beed7?w=200&q=80', alt: 'hen' },
    { src: 'https://images.unsplash.com/photo-1508726096737-5ac7ca26345f?w=200&q=80', alt: 'dog' },
    { src: 'https://images.unsplash.com/photo-1601758124510-52d02ddb7cbd?w=200&q=80', alt: 'cat' },
    { src: 'https://images.unsplash.com/photo-1415369629372-26f2fe60c7c3?w=200&q=80', alt: 'sheep' },
    // Veterinary / Medicine
    { src: 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=200&q=80', alt: 'medicine' },
    { src: 'https://images.unsplash.com/photo-1559757148-5c350d0d3c56?w=200&q=80', alt: 'pills drugs' },
    { src: 'https://images.unsplash.com/photo-1576671081837-49000212a370?w=200&q=80', alt: 'syringe' },
    { src: 'https://images.unsplash.com/photo-1587854692152-cbe660dbde88?w=200&q=80', alt: 'veterinary' },
    { src: 'https://images.unsplash.com/photo-1434494878577-86c23bcb06b9?w=200&q=80', alt: 'lab' },
];

const random = (min: number, max: number) => Math.random() * (max - min) + min;

const generateItems = (): FloatingItem[] =>
    IMAGES.map((img, i) => ({
        id: i,
        src: img.src,
        alt: img.alt,
        startX: random(2, 85),
        startY: random(2, 85),
        size: random(130, 200),
        duration: random(18, 32),
        delay: random(0, 10),
        opacity: random(0.45, 0.70),
        rotate: random(-15, 15),
    }));

const AnimatedBackground = () => {
    const items = useRef<FloatingItem[]>(generateItems()).current;

    return (
        <div
            style={{
                position: 'absolute',
                inset: 0,
                overflow: 'hidden',
                pointerEvents: 'none',
                zIndex: 0,
            }}
            aria-hidden="true"
        >
            {items.map((item) => (
                <div
                    key={item.id}
                    style={{
                        position: 'absolute',
                        left: `${item.startX}%`,
                        top: `${item.startY}%`,
                        animationName: 'bgFloat',
                        animationDuration: `${item.duration}s`,
                        animationDelay: `${item.delay}s`,
                        animationTimingFunction: 'ease-in-out',
                        animationIterationCount: 'infinite',
                        animationDirection: 'alternate',
                        willChange: 'transform',
                    }}
                >
                    <img
                        src={item.src}
                        alt={item.alt}
                        width={item.size}
                        height={item.size}
                        style={{
                            width: item.size,
                            height: item.size,
                            opacity: item.opacity,
                            borderRadius: '24px',
                            objectFit: 'cover',
                            filter: 'drop-shadow(0 8px 24px rgba(0,0,0,0.18))',
                            transform: `rotate(${item.rotate}deg)`,
                            display: 'block',
                        }}
                        onError={(e) => {
                            (e.target as HTMLImageElement).style.opacity = '0';
                        }}
                    />
                </div>
            ))}

            <style>{`
        @keyframes bgFloat {
          0%   { transform: translate(0px,   0px)   scale(1);    }
          25%  { transform: translate(22px, -30px)  scale(1.04); }
          50%  { transform: translate(-15px, 25px)  scale(0.97); }
          75%  { transform: translate(30px,  12px)  scale(1.03); }
          100% { transform: translate(-20px, -40px) scale(1);    }
        }
      `}</style>
        </div>
    );
};

export default AnimatedBackground;
