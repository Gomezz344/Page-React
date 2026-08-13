import React from 'react';
import {useState, useEffect} from 'react';
import AnimalVideo from '../../assets/videos/video1.mp4';
import image1 from '../../assets/images/tigre.webp';
import image2 from '../../assets/images/img2.jpg';
import image3 from '../../assets/images/img3.jpg'
import image4 from '../../assets/images/img4.jpg'
import image5 from '../../assets/images/img5.jpg'
import image6 from '../../assets/images/img6.jpg'

const slides = [
    {
        type: 'video',
        src: AnimalVideo,
        title: "Galaxy Page",
        description: "A page inspired by the vastness of the galaxy."
    },
    {
        type: 'image',
        src: image1,
        title: "Photos",
        description: "The best photos from NASA's telescopes"
    },
    {
        type: 'image',
        src: image2,
        title: "Information",
        description: "Real photo information"
    },
    {
        type: 'image',
        src: image3,
        
    },
    {
        type: 'image',
        src: image4,
    },
    {
        type: 'image',
        src: image5,
    },
    {
        type: 'image',
        src: image6,
    }

];

export function Carrusel() {
    const [currentSlide, setCurrentSlide] = useState(0);
    const currentSlideData = slides[currentSlide];


    const nextSlide = () => {
        if(currentSlide === slides.length - 1) {
            setCurrentSlide(0);
        } else {
            setCurrentSlide(currentSlide+ 1);
        }
    };

    const prevSlide = () => {
        if(currentSlide === 0) {
            setCurrentSlide(slides.length - 1);
        } else {
            setCurrentSlide(currentSlide - 1)
        }
    };

    useEffect(() => {

    if (currentSlideData.type === "image") {

        const timer = setTimeout(() => {
            nextSlide();
        }, 5000);

        return () => {
            clearTimeout(timer);
        };
    }

    }, [currentSlide]);

    return (
        <div className="relative w-full h-screen overflow-hidden bg-black">

            <div className="w-full h-full relative">

                {/* Top gradient overlay */}
                <div className="absolute top-0 left-0 w-full h-[35%] bg-gradient-to-b from-black/45 to-transparent pointer-events-none z-20" />
                {/* Bottom gradient overlay */}
                <div className="absolute bottom-0 left-0 w-full h-[35%] bg-gradient-to-t from-black/60 to-transparent pointer-events-none z-20" />

                {currentSlideData.type === "image" ? (
                    <img
                        src={currentSlideData.src}
                        alt={currentSlideData.title || ''}
                        className="w-full h-full object-cover block transform scale-[1.01] transition-transform duration-700"
                    />
                ) : (
                    <video
                        src={currentSlideData.src}
                        autoPlay
                        muted
                        playsInline
                        onEnded={nextSlide}
                        className="w-full h-full object-cover block transform scale-[1.01] transition-transform duration-700"
                    />
                )}

                <div
                    className="absolute left-[8%] top-[45%] max-w-[600px] text-white z-30 font-sans"
                    style={{ textShadow: '0 3px 10px rgba(0,0,0,0.5)' }}
                >
                    <h1 className="mb-4 text-[clamp(2.5rem,5vw,5rem)] font-extrabold leading-[1.05] tracking-[-1px]">
                        {currentSlideData.title}
                    </h1>
                    {currentSlideData.description && (
                        <p className="text-[1.1rem] leading-[1.6] text-white/85" style={{ textShadow: '0 2px 8px rgba(0,0,0,0.6)' }}>
                            {currentSlideData.description}
                        </p>
                    )}
                </div>

            </div>

            <button
                onClick={prevSlide}
                className="absolute top-1/2 -translate-y-1/2 left-8 md:left-8 w-10 h-10 md:w-12 md:h-12 border border-white/25 rounded-full bg-black/25 backdrop-blur-md text-white text-2xl font-light flex items-center justify-center z-40 transition duration-300 hover:bg-white/18 hover:border-white/50 hover:scale-105 active:scale-95"
                aria-label="Previous slide"
            >
                ‹
            </button>

            <button
                onClick={nextSlide}
                className="absolute top-1/2 -translate-y-1/2 right-8 md:right-8 w-10 h-10 md:w-12 md:h-12 border border-white/25 rounded-full bg-black/25 backdrop-blur-md text-white text-2xl font-light flex items-center justify-center z-40 transition duration-300 hover:bg-white/18 hover:border-white/50 hover:scale-105 active:scale-95"
                aria-label="Next slide"
            >
                ›
            </button>

            <div className="absolute bottom-7 left-1/2 -translate-x-1/2 flex gap-2 z-40">
                {slides.map((_, index) => (
                    <button
                        key={index}
                        onClick={() => setCurrentSlide(index)}
                        className={`h-[4px] rounded-full transition-all duration-300 ${index === currentSlide ? 'w-[45px] bg-white' : 'w-[28px] bg-white/35 hover:bg-white/70'}`}
                        aria-label={`Go to slide ${index + 1}`}
                    />
                ))}
            </div>

        </div>
    );
}
