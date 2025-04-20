import React, { useEffect, useState } from "react";
import Image from "next/image";
import Slider from "react-slick";
import { useRouter } from "next/router";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/utils/supabaseClient";
import { Capacitor } from "@capacitor/core";

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
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!authLoading && user) {
      // If not loading and user is logged in, redirect to dashboard
      router.push("/home");
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

  const handleAppleLogin = async () => {
    setLoading(true);

    const isNative = Capacitor.isNativePlatform();
    let redirectUrl = "https://wetonai.vercel.app/home";

    if (isNative) {
      redirectUrl += "?native_redirect=true";
    }

    console.log(`Using redirectTo: ${redirectUrl}`);

    const { error } = await supabase.auth.signInWithOAuth({
      provider: "apple",
      options: {
        redirectTo: redirectUrl,
      },
    });

    if (error) {
      console.error("Apple Sign-In Error:", error);
      toast.error(error.message);
      setLoading(false);
    }

    setLoading(false);
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
        {authLoading ? (
          <p>Loading...</p>
        ) : (
          // <button
          //   onClick={goToLogin}
          //   className="w-full bg-batik-border text-white py-3 px-8 rounded-2xl hover:bg-batik-border-hover transition duration-300 font-semibold shadow-md"
          // >
          //   Get your weton reading
          // </button>
          <button
            onClick={handleAppleLogin}
            disabled={loading}
            className="w-full flex items-center justify-center gap-3 bg-black text-white py-2.5 px-3 rounded-2xl shadow-sm hover:bg-gray-800 transition duration-150 ease-in-out"
          >
            <svg
              width="20"
              height="20"
              viewBox="0 0 200 200"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M179.34 152.465C176.381 159.3 172.879 165.592 168.822 171.377C163.291 179.263 158.762 184.721 155.272 187.752C149.862 192.728 144.065 195.276 137.858 195.421C133.402 195.421 128.028 194.153 121.772 191.581C115.496 189.02 109.728 187.752 104.455 187.752C98.9237 187.752 92.9918 189.02 86.6468 191.581C80.2923 194.153 75.1731 195.493 71.2591 195.626C65.3067 195.88 59.3736 193.259 53.4514 187.752C49.6715 184.456 44.9436 178.804 39.2797 170.797C33.2029 162.247 28.2069 152.332 24.293 141.029C20.1013 128.82 18 116.997 18 105.551C18 92.4397 20.8331 81.1314 26.5078 71.6551C30.9676 64.0434 36.9007 58.039 44.3265 53.6311C51.7522 49.2233 59.7757 46.9771 68.4164 46.8333C73.1443 46.8333 79.3443 48.2958 87.049 51.17C94.732 54.0538 99.6652 55.5162 101.828 55.5162C103.445 55.5162 108.925 53.8062 118.216 50.3971C127.001 47.2355 134.416 45.9264 140.49 46.4421C156.951 47.7705 169.317 54.2591 177.541 65.949C162.82 74.8686 155.538 87.3616 155.683 103.388C155.815 115.871 160.344 126.26 169.244 134.508C173.278 138.336 177.782 141.295 182.794 143.396C181.707 146.548 180.56 149.567 179.34 152.465ZM141.589 3.91397C141.589 13.6984 138.015 22.834 130.89 31.2899C122.291 41.3422 111.891 47.1509 100.613 46.2344C100.469 45.0605 100.386 43.8251 100.386 42.5269C100.386 33.1339 104.475 23.0816 111.737 14.8624C115.362 10.7009 119.973 7.24065 125.564 4.48035C131.143 1.76123 136.421 0.257507 141.384 0C141.529 1.30802 141.589 2.61625 141.589 3.91397Z"
                fill="white"
              />
            </svg>

            <span className="font-medium">Continue with Apple</span>
          </button>
        )}
      </div>
    </div>
  );
}
