import React, { useEffect, useState } from "react";
import Image from "next/image";
import Slider from "react-slick";
import { useRouter } from "next/router";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/utils/supabaseClient";
import { Capacitor } from "@capacitor/core";
import { Toaster, toast } from "sonner";
import { openBrowser, closeBrowser } from "@/utils/native-browser";
import Link from "next/link";
import { Abhaya_Libre } from "next/font/google";
import clsx from "clsx";

// Import Slick CSS
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import { SelfDiscovery, Insight, Love, Door } from "@/components/illustrations";

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

const abhaya = Abhaya_Libre({
  weight: "800",
  subsets: ["latin"],
});

export default function HomePage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth(); // Get user and loading state
  const [loading, setLoading] = useState(false);
  const isNative = Capacitor.isNativePlatform();

  // console.log("user", user);

  // console.log("Login Page: isNative:", isNative, user);
  let redirectUrl = isNative
    ? "wetonscope://home"
    : process.env.NODE_ENV === "production"
    ? "https://app.wetonscope.com/home"
    : "http://localhost:3000/home";

  useEffect(() => {
    // console.log("Auth loading:", authLoading, "User:", user);
    if (!authLoading && user) {
      console.log("User is logged in:", user);
      // If not loading and user is logged in, redirect to dashboard
      router.push("/page-router");
    }
  }, [user, authLoading, router]);

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

    try {
      console.log(`Attempting Apple Sign-In with redirectTo: ${redirectUrl}`);

      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: "apple",
        options: {
          skipBrowserRedirect: true,
          redirectTo: redirectUrl,
          queryParams: {
            access_type: "offline",
            prompt: "consent",
          },
        },
      });

      if (error) {
        console.error("Apple Sign-In Error:", error);
        toast.error(error.message);
        setLoading(false);
      }

      await openBrowser(data.url);
    } catch (error) {
      console.error("Error during Apple login:", error);
      toast.error("An error occurred during login. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setLoading(true);
    try {
      console.log(`Attempting Google Sign-In with redirectTo: ${redirectUrl}`);

      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          skipBrowserRedirect: true,
          redirectTo: redirectUrl,
          queryParams: {
            access_type: "offline",
            prompt: "consent",
          },
        },
      });

      if (error) {
        toast.error(error.message);
        setLoading(false);
      }

      await openBrowser(data.url);
    } catch {
      console.error("Error during Google login:", error);
      toast.error("An error occurred during login. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleSupportButton = async (link) => {
    await openBrowser(link);
  };

  return (
    <div className="h-[100svh] flex flex-col items-center justify-center bg-base-100 p-5">
      <Toaster />
      <div className="w-full h-[100%] max-w-md px-4 py-8 rounded-lg">
        <h1
          className={clsx(
            "text-5xl font-bold mb-4 text-center h-[10%] text-batik-black tracking-wide",
            abhaya.className
          )}
        >
          Wetonscope
        </h1>
        {/* <div>{JSON.stringify(user, null, 2)}</div> */}

        <Slider {...sliderSettings} className="onboarding-slider mb-8 h-[70%]">
          {onboardingData.map((slide) => (
            <div key={slide.id} className="text-center py-6 h-[100%]">
              <div className="mb-10 flex justify-center">{slide.imageUrl}</div>
              <h2 className="text-2xl font-bold mb-3">{slide.title}</h2>
              <p className="text-gray-700 mb-6 text-sm">{slide.description}</p>
            </div>
          ))}
        </Slider>

        <div className="space-y-2">
          <button
            onClick={handleAppleLogin}
            disabled={loading}
            className="w-full flex items-center justify-center gap-3 bg-black disabled:bg-black/25 text-white disabled:text-white/25 py-2.5 px-3 rounded-2xl shadow-sm hover:bg-gray-800 transition duration-150 ease-in-out"
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
          <button
            onClick={handleGoogleLogin}
            disabled={loading}
            className="w-full flex items-center justify-center gap-3 bg-base-100 text-batik-black border border-batik-border py-2.5 px-3 rounded-2xl shadow-sm hover:bg-gray-50 transition duration-150 ease-in-out"
          >
            <svg
              width="20"
              height="20"
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 48 48"
            >
              <path
                fill="#EA4335"
                d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"
              />
              <path
                fill="#4285F4"
                d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"
              />
              <path
                fill="#FBBC05"
                d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"
              />
              <path
                fill="#34A853"
                d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"
              />
            </svg>
            <span className="font-medium">Continue with Google</span>
          </button>
        </div>
      </div>
      <footer className="w-full py-4 px-4 bg-transparent">
        <div className="max-w-md mx-auto text-center text-xs text-slate-600">
          <div>
            By continuing, you agree to our{" "}
            <span
              onClick={() =>
                handleSupportButton("https://wetonscope.com/terms")
              }
              href="/terms"
              className="text-batik-text hover:underline font-medium"
            >
              Terms of Service
            </span>{" "}
            and{" "}
            <span
              onClick={() =>
                handleSupportButton("https://wetonscope.com/privacy")
              }
              href="/privacy"
              className="text-batik-text hover:underline font-medium"
            >
              Privacy Policy
            </span>
          </div>
        </div>
      </footer>
    </div>
  );
}
