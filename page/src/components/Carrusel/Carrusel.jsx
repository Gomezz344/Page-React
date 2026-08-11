import React from 'react';
import './Carrusel.css';
import {useState, useEffect} from 'react';
import BlackHole from '../../assets/videos/0806(1).mp4';
import image1 from '../../assets/images/universoImg2.jpg';
import image2 from '../../assets/images/universoImg3.jpeg';
import image3 from '../../assets/images/img3.jpg'
import image4 from '../../assets/images/img4.jpg'
import image5 from '../../assets/images/img5.jpg'
import image6 from '../../assets/images/img6.jpg'

const slides = [
    {
        type: 'video',
        src: BlackHole,
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
    <div className="carousel">

        <div className="carousel-content">

            

            {currentSlideData.type === "image"
                ? (
                    <img
                        src={currentSlideData.src}
                        alt=""
                    />
                )
                : (
                    <video
                        src={currentSlideData.src}
                        autoPlay
                        muted
                        playsInline
                        onEnded={nextSlide}
                    />
                )
            }

            <div className="carousel-text">
                <h1>{currentSlideData.title}</h1>
                <p>{currentSlideData.description}</p>
            </div>

        </div>

        <button
            className="carousel-button previous"
            onClick={prevSlide}
        >
            ‹
        </button>

        <button
            className="carousel-button next"
            onClick={nextSlide}
        >
            ›
        </button>

        <div className="carousel-indicators">
            {
                slides.map((_, index) => (
                    <button
                    key={index}
                    className={index === currentSlide ? "active" : ""}
                    onClick={() => setCurrentSlide(index)}
                    >

                    </button>
                    ) 
                )
            }

        </div>

    </div>
)};
