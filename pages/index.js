import React, { useEffect } from "react";
import Image from "next/image";
import Slider from "react-slick";
import { useRouter } from "next/router";
import { useAuth } from "@/context/AuthContext";

// Import Slick CSS
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import {
  SelfDiscovery,
  Insight,
  Love,
  New,
  Door,
} from "@/components/illustrations";

// Onboarding data
const onboardingData = [
  {
    id: 1,
    title: "Discover Your Inner Self",
    description:
      "Unlock a unique path to self-discovery using an ancient Javanese system for understanding your personality and potential.",
    imageUrl: <SelfDiscovery />, // Consider a more universal symbol of self-discovery
  },
  {
    id: 2,
    title: "Beyond the Zodiac",
    description:
      "Go beyond traditional astrology. Wetonscope offers a fresh perspective on your personal traits, strengths, and life's journey.",
    imageUrl: <Insight />, // Consider an icon representing a new perspective or insight
  },
  {
    id: 3,
    title: "Love and Life",
    description:
      "Explore your compatibility with others and gain insights into your relationships, career, and life path using the wisdom of Weton.",
    imageUrl: <Love />, // Consider an icon representing relationships or life paths
  },
  {
    id: 4,
    title: "Start Your Weton Journey",
    description:
      "Embark on a unique journey of self-discovery. Get your free Weton reading today and unlock the secrets within.",
    imageUrl: <Door />, // Consider an icon representing a journey or path
  },
];

export default function HomePage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth(); // Get user and loading state

  useEffect(() => {
    if (!authLoading && user) {
      // If not loading and user is logged in, redirect to dashboard
      router.push("/dashboard");
    }
  }, [user, authLoading, router]);

  const goToLogin = () => {
    router.push("/login");
  };

  const sliderSettings = {
    dots: true,
    infinite: true,
    speed: 500,
    slidesToShow: 1,
    slidesToScroll: 1,
    adaptiveHeight: true,
    arrows: false,
    autoplay: true,
    autoplaySpeed: 5000,
    pauseOnHover: true,
  };

  return (
    <div className="h-[100svh] flex flex-col items-center justify-center bg-batik p-4">
      <div className="w-full h-[100%] max-w-md px-4  py-8 rounded-lg">
        <h1 className="text-4xl font-bold mb-4 text-center h-[10%] text-batik-black">
          Wetonscope
        </h1>

        <Slider {...sliderSettings} className="onboarding-slider mb-8 h-[70%]">
          {onboardingData.map((slide) => (
            <div key={slide.id} className="text-center py-6 h-[100%]">
              <div className="mb-10 flex justify-center">
                {slide.imageUrl}
                {/* <Image
                  src={slide.imageUrl}
                  alt={slide.title}
                  width={180}
                  height={180}
                  className="mx-auto"
                /> */}
              </div>
              <h2 className="text-2xl font-bold mb-3">{slide.title}</h2>
              <p className="text-gray-700 mb-6 text-sm">{slide.description}</p>
            </div>
          ))}
        </Slider>
      </div>
      {authLoading ? (
        <p>Loading...</p>
      ) : (
        <button
          onClick={goToLogin}
          className="w-full bg-batik-border text-white py-3 px-8 rounded-2xl hover:bg-batik-border-hover transition duration-300 font-semibold shadow-md"
        >
          Get your free reading
        </button>
      )}
    </div>
  );
}
