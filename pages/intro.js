import React, { useEffect } from "react";
import dynamic from "next/dynamic";
import { useRouter } from "next/router";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
// import Slider from "react-slick";

// Import Slick CSS
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";

const StoriesLazy = dynamic(() => import("react-insta-stories"), {
  loading: () => <p>Loading...</p>,
});

const WithSeeMore = dynamic(() =>
  import("react-insta-stories").then((module) => ({
    default: module.WithSeeMore,
  }))
);

export default function IntroPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();

  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/"); // Redirect to login if not authenticated
    }
  }, [user, authLoading, router]);

  // const sliderSettings = {
  //   dots: true,
  //   infinite: false,
  //   speed: 500,
  //   fade: true,
  //   cssEase: "linear",
  //   centerMode: true,
  //   centerPadding: "0px",
  //   slidesToShow: 1,
  //   slidesToScroll: 1,
  //   adaptiveHeight: true,
  //   arrows: false,
  //   pauseOnHover: true,
  //   autoplay: true,
  //   autoplaySpeed: 5000,
  // };

  if (authLoading || !user) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-base-100 text-base-content">
        <span className="loading loading-spinner loading-lg text-batik-text"></span>
        <p className="mt-4">Loading...</p>
      </div>
    );
  }

  const stories = [
    {
      content: ({ action, isPaused }) => {
        return (
          <div className="text-gray-700 p-5 min-h-screen bg-base-200 text-center">
            <h1 className="text-3xl font-bold text-batik-black py-4">
              Your Birthday is a Secret Map
            </h1>
            <section className="flex flex-col justify-center items-center  h-[28rem]">
              <div className="leading-relaxed text-gray-700 text-xl">
                Ever wondered if your birthdate holds a deeper meaning?
                <p className="mt-3">
                  In ancient Javanese wisdom, your birth date isn't just a
                  number. It's the key to your unique personality, hidden
                  talents, and life's true path.
                </p>
              </div>
            </section>
          </div>
        );
      },
    },
    {
      content: ({ action, isPaused }) => {
        return (
          <div className="text-gray-700 p-5 min-h-screen bg-base-200 text-center">
            <h1 className="text-3xl font-bold text-batik-black py-4">
              Ancient Compass for Life
            </h1>
            <section className="h-[28rem] flex justify-center items-center">
              <p className="leading-relaxed text-gray-700  text-xl space-y-4">
                <p>
                  For centuries, this wisdom has guided everything from royal
                  decisions to personal destinies.
                </p>
                <p>
                  We call these systems{" "}
                  <span className="font-bold text-batik-text">Weton</span> and{" "}
                  <span className="font-bold text-batik-text">Wuku</span>. They
                  are your guide to understanding yourself and the world's
                  rhythm.
                </p>
              </p>
            </section>
          </div>
        );
      },
    },
    {
      content: ({ action, isPaused }) => {
        return (
          <div className="text-gray-700 p-5 min-h-screen bg-base-200 text-center">
            <h1 className="text-3xl font-bold text-batik-black py-4">
              Weton, Your Soul's Code
            </h1>
            <section className="grow justify-center items-center h-[28rem] flex mt-8">
              <div className="flex flex-col items-center text-left text-lg">
                <p className="mt-3 text-gray-700">
                  Your{" "}
                  <span className="font-semibold text-batik-text">Weton</span>{" "}
                  is your personal cosmic signature, created by the meeting of
                  two weekly cycles on your birthday:
                </p>
                <ul className="list-disc list-outside ml-4 mt-2">
                  <li>
                    <span className="font-semibold text-batik-text">Dina</span>:
                    The 7-Day Week (like Monday, Wednesday)
                  </li>
                  <li>
                    <span className="font-semibold text-batik-text">
                      Pasaran
                    </span>
                    : The 5-Day Javanese market Week (Legi, Pahing, Pon, Wage,
                    Kliwon)
                  </li>
                </ul>
                <p className="mt-3 text-gray-700">
                  Their combination creates your{" "}
                  <span className="font-bold text-batik-text">Neptu</span>, a
                  sacred number revealing your core character and strengths.
                </p>
                <div className="divider"></div>
                <p className="mt-3 text-gray-700 text-sm">
                  Traditionally, your Weton offers insights into your
                  personality, compatibility with others, favorable timings for
                  important life events, and even potential challenges to be
                  aware of, helping you navigate life with greater
                  understanding.
                </p>
              </div>
            </section>
          </div>
        );
      },
    },
    {
      content: ({ action, isPaused }) => {
        return (
          <div className="text-gray-700 p-5 min-h-screen bg-base-200 text-center">
            <h1 className="text-3xl font-bold text-batik-black py-4">
              Wuku, The Spirit of Your Week
            </h1>
            <section className="grow justify-center items-center h-[25rem] flex mt-8">
              <div className="flex flex-col items-center">
                <p className="mt-3 text-gray-700 text-lg">
                  Your birth date also falls within a{" "}
                  <span className="font-semibold text-batik-text">Wuku</span>,
                  one of 30{" "}
                  <span className="font-semibold text-batik-text">
                    Cosmic Weeks
                  </span>{" "}
                  in the Javanese calendar.
                </p>
                <p className="mt-3 text-gray-700 text-lg">
                  Each Wuku has its own unique character and energy, influencing
                  the atmosphere and opportunities around you. It adds another
                  layer to your spiritual DNA.
                </p>
                <div className="divider text-batik-border border-batik-border"></div>
                <p className="mt-3 text-gray-700 text-sm">
                  Your Wuku adds another dimension to your profile, painting a
                  broader picture of the influences shaping your outlook, the
                  kind of environment you might thrive in, and the symbolic
                  energies you carry.
                </p>
              </div>
            </section>
          </div>
        );
      },
    },
    {
      content: ({ action, story }) => {
        return (
          <WithSeeMore story={story} action={action}>
            <div className="text-gray-700 p-5 bg-base-200 text-center">
              <h1 className="text-3xl font-bold text-batik-black py-4">
                Unlock Your Path to Harmony
              </h1>
              <section className="grow justify-center items-center h-[20rem] flex ">
                <div className="flex flex-col h-[28rem] justify-center items-center text-xl ">
                  <p className="mt-3 text-gray-700">
                    From finding a harmonious partner to launching a new
                    venture, this wisdom helps you align your actions with the
                    cosmos.
                  </p>
                  <p className="mt-3 text-gray-700">
                    The complete story of your strengths, your path, and your
                    potential is waiting. Are you ready to discover it?
                  </p>
                </div>
              </section>
            </div>
          </WithSeeMore>
        );
      },
      seeMoreCollapsed: ({ toggleMore, action }) => (
        <div className="flex justify-center mt-10 z-50">
          <button
            onClick={() =>
              router.replace("/readings/general_readings/weton-intro")
            }
            className="btn text-lg text-batik-black border bg-batik border-batik-border py-3 px-7 rounded-2xl shadow-sm relative"
          >
            <span className="absolute inline-flex h-full w-1/3 animate-ping rounded-full bg-batik-border-light opacity-50"></span>
            Explore your Weton details
          </button>
        </div>
      ),
      seeMore: ({ close }) => (
        <div
          style={{
            maxWidth: "100%",
            height: "100%",
            padding: 40,
            background: "white",
          }}
        >
          <h2>Just checking the see more feature.</h2>
          <p style={{ textDecoration: "underline" }} onClick={close}>
            Go on, close this popup.
          </p>
        </div>
      ),
    },
  ];

  return (
    <div className="min-h-screen w-full bg-base-200 text-base-content font-sans">
      {/* <main className="p-5 md:p-8 max-w-3xl mx-auto space-y-4 pb-16"> */}
      {/* <header className="text-center py-4">
        <h1 className="text-3xl font-bold text-batik-black">
          The Story Behind Your Javanese Soul Signs
        </h1>
      </header> */}
      {/* <Slider {...sliderSettings} className="onboarding-slider mb-8"> */}
      {/* <section className="">
          <p className="leading-relaxed text-gray-700 h-[28rem] flex justify-center items-center ">
            Ever wondered if your birthdate holds a deeper meaning? In Javanese
            culture, it unlocks a rich tapestry of personality insights and
            potential life paths in the form of Weton and Wuku.
          </p>
        </section>
        <section className="">
          <p className="leading-relaxed text-gray-700 h-[28rem] flex justify-center items-center">
            These ancient systems are more than just dates; they are keys to
            understanding your unique self and the energies that shape your
            life. Used for centuries, they offer a profound way to understand
            oneself and the subtle energies of time.
          </p>
        </section> */}
      {/* <section className="grow justify-center items-center h-[28rem] flex">
          <div className="flex flex-col items-center">
            <h2 className="text-lg text-batik-black text-left font-semibold">
              Weton: The Rhythm of Your Birth
            </h2>
            <p className="mt-3 text-sm text-gray-700">
              Your Weton is the special combination of your birth day from the
              common 7-day week (Saptawara – like Monday, Tuesday) and a
              specific day from the 5-day Javanese market week (Pancawara – like
              Kliwon, Legi). This unique pairing, for example, &quot;Monday
              Kliwon&quot; is the foundation of your personal reading.
            </p>
            <p className="mt-3 text-sm text-gray-700">
              Each day and market day carries a numerical value called
              &quot;Neptu&quot;. These are added together to create your
              Weton&apos;s total Neptu, a key number that unlocks deeper
              interpretations about your innate characteristics, strengths, and
              potential life journey.
            </p>
            <p className="mt-3 text-sm text-gray-700">
              Traditionally, your Weton offers insights into your personality,
              compatibility with others, favorable timings for important life
              events, and even potential challenges to be aware of, helping you
              navigate life with greater understanding.
            </p>
          </div>
        </section> */}
      {/* <section className="grow justify-center items-center h-[28rem] flex ">
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
                  router.replace("/readings/general_readings/weton-intro")
                }
                className="btn bg-base-100 text-batik-black border border-batik-border py-2.5 px-5 rounded-2xl shadow-sm"
              >
                Explore your Weton details
              </button>
            </div>
          </div>
        </section> */}
      {/* </Slider> */}
      {/* </main> */}
      <StoriesLazy
        preloadCount={3}
        width={"100%"}
        height={"100%"}
        storyContainerStyles={{ overflow: "hidden" }}
        defaultInterval={15000}
        stories={stories}
        progressStyles={{ backgroundColor: "#d1b08e", height: "3px" }}
        progressWrapperStyles={{ height: "3px" }}
      ></StoriesLazy>
    </div>
  );
}
