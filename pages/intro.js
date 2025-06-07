import { useEffect } from "react";
import { useRouter } from "next/router";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import Slider from "react-slick";
// Import Slick CSS
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";

export default function IntroPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();

  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/"); // Redirect to login if not authenticated
    }
  }, [user, authLoading, router]);

  const sliderSettings = {
    dots: true,
    infinite: false,
    speed: 500,
    fade: true,
    cssEase: "linear",
    centerMode: true,
    centerPadding: "0px",
    slidesToShow: 1,
    slidesToScroll: 1,
    adaptiveHeight: true,
    arrows: false,
    pauseOnHover: true,
    autoplay: true,
    autoplaySpeed: 5000,
  };

  if (authLoading || !user) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-base-100 text-base-content">
        <span className="loading loading-spinner loading-lg"></span>
        <p className="mt-4">Loading...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-base-200 text-base-content font-sans">
      <main className="p-4 md:p-8 max-w-3xl mx-auto space-y-4 pb-16">
        <header className="text-center py-4">
          <h1 className="text-3xl font-bold text-batik-black">
            The Story Behind Your Javanese Soul Signs
          </h1>
        </header>

        <Slider {...sliderSettings} className="onboarding-slider mb-8">
          <section className="">
            <p className="leading-relaxed text-gray-700 h-[28rem] flex justify-center items-center ">
              Ever wondered if your birthdate holds a deeper meaning? In
              Javanese culture, it unlocks a rich tapestry of personality
              insights and potential life paths in the form of Weton and Wuku.
            </p>
          </section>
          <section className="">
            <p className="leading-relaxed text-gray-700 h-[28rem] flex justify-center items-center">
              These ancient systems are more than just dates; they are keys to
              understanding your unique self and the energies that shape your
              life. Used for centuries, they offer a profound way to understand
              oneself and the subtle energies of time.
            </p>
          </section>
          <section className="grow justify-center items-center h-[28rem] flex">
            <div className="flex flex-col items-center">
              <h2 className="text-lg text-batik-black text-left font-semibold">
                Weton: The Rhythm of Your Birth
              </h2>
              <p className="mt-3 text-sm text-gray-700">
                Your Weton is the special combination of your birth day from the
                common 7-day week (Saptawara – like Monday, Tuesday) and a
                specific day from the 5-day Javanese market week (Pancawara –
                like Kliwon, Legi). This unique pairing, for example,
                &quot;Monday Kliwon&quot; is the foundation of your personal
                reading.
              </p>
              <p className="mt-3 text-sm text-gray-700">
                Each day and market day carries a numerical value called
                &quot;Neptu&quot;. These are added together to create your
                Weton&apos;s total Neptu, a key number that unlocks deeper
                interpretations about your innate characteristics, strengths,
                and potential life journey.
              </p>
              <p className="mt-3 text-sm text-gray-700">
                Traditionally, your Weton offers insights into your personality,
                compatibility with others, favorable timings for important life
                events, and even potential challenges to be aware of, helping
                you navigate life with greater understanding.
              </p>
            </div>
          </section>
          <section className="grow justify-center items-center h-[28rem] flex">
            <div className="flex flex-col items-center">
              <h2 className="text-lg text-batik-black text-left font-semibold">
                Wuku: The Spirit of Your Week
              </h2>
              <p className="mt-3 text-sm text-gray-700">
                Beyond your Weton, there&apos;s the Wuku. Imagine a grand cosmic
                calendar of 210 days, called Pawukon, divided into 30 different
                &quot;weeks&quot; or periods, each lasting 7 days. Your birth
                date also falls into one of these specific Wukus, each with its
                own distinct name and character.
              </p>
              <p className="mt-3 text-sm text-gray-700">
                Each Wuku is rich in symbolism, protected by a specific Javanese
                deity (Batara), and associated with a unique bird and tree.
                These elements aren&apos;t just decorative; they offer further
                layers of meaning, influencing the general atmosphere, inherent
                talents, and spiritual inclinations of those born under them.
              </p>
              <p className="mt-3 text-sm text-gray-700">
                Your Wuku adds another dimension to your profile, painting a
                broader picture of the influences shaping your outlook, the kind
                of environment you might thrive in, and the symbolic energies
                you carry.
              </p>
            </div>
          </section>
          <section className="grow justify-center items-center h-[28rem] flex ">
            <div className="flex flex-col h-[28rem] justify-center items-center ">
              <h2 className="text-lg text-batik-black text-left font-semibold">
                More Than Just Dates
              </h2>
              <p className="mt-3 text-sm text-gray-700">
                For generations in Javanese culture, Weton and Wuku have been
                integral to daily life. They are consulted for everything from
                determining auspicious dates for marriages, building homes, and
                planting crops, to understanding family dynamics and personal
                growth. This knowledge, often recorded in ancient manuscripts
                called &quot;Primbon&quot; is a treasured part of Indonesian
                cultural wisdom, passed down through families and spiritual
                advisors.
              </p>
              <div className="flex justify-center mt-6">
                <button
                  onClick={() =>
                    router.replace("/readings/general-readings/weton-intro")
                  }
                  className="btn bg-base-100 text-batik-black border border-batik-border py-2.5 px-5 rounded-2xl shadow-sm"
                >
                  Explore your Weton details
                </button>
              </div>
            </div>
          </section>
        </Slider>
      </main>
    </div>
  );
}
