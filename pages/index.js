import React from "react";
import Image from "next/image";
import Slider from "react-slick";
import { useRouter } from "next/router";

// Import Slick CSS
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";

// Onboarding data
const onboardingData = [
  {
    id: 1,
    title: "Welcome to Wetonscope",
    description: "Discover your Javanese astrological signature and unlock your life's potential.",
    imageUrl: "/globe.svg",
  },
  {
    id: 2,
    title: "Personalized Readings",
    description: "Get detailed insights about your personality, relationships, and career based on your Weton.",
    imageUrl: "/window.svg",
  },
  {
    id: 3,
    title: "Ancient Wisdom, Modern AI",
    description: "We combine traditional Javanese Primbon knowledge with cutting-edge AI technology.",
    imageUrl: "/file.svg",
  },
  {
    id: 4,
    title: "Start Your Journey",
    description: "Discover what your Weton reveals about your life path by checking your reading today.",
    imageUrl: "/vercel.svg",
  },
];

export default function HomePage() {
  const router = useRouter();

  const goToLogin = () => {
    router.push("/login");
  };

  const sliderSettings = {
    dots: true,
    infinite: false,
    speed: 500,
    slidesToShow: 1,
    slidesToScroll: 1,
    adaptiveHeight: true,
    arrows: false,
    autoplay: true,
    autoplaySpeed: 5000,
    pauseOnHover: true
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 p-4">
      <div className="w-full max-w-md bg-white p-8 rounded-lg shadow-lg">
        <h1 className="text-3xl font-bold mb-4 text-center">Wetonscope</h1>
        
        <Slider {...sliderSettings} className="onboarding-slider mb-8">
          {onboardingData.map((slide) => (
            <div key={slide.id} className="text-center px-4 py-6">
              <div className="mb-6 flex justify-center">
                <Image 
                  src={slide.imageUrl} 
                  alt={slide.title}
                  width={120}
                  height={120}
                  className="mx-auto"
                />
              </div>
              <h2 className="text-2xl font-bold mb-3">{slide.title}</h2>
              <p className="text-gray-600 mb-6">{slide.description}</p>
            </div>
          ))}
        </Slider>
        
        <button 
          onClick={goToLogin}
          className="w-full bg-blue-600 text-white py-3 px-8 rounded-full hover:bg-blue-700 transition duration-300 font-medium text-lg shadow-md"
        >
          Check my readings for free
        </button>
      </div>
    </div>
  );
}