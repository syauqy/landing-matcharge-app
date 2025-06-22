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
              The Story Behind Your Javanese Soul Signs
            </h1>
            <section className="">
              <p className="leading-relaxed text-gray-700 h-[28rem] flex justify-center items-center text-lg ">
                Ever wondered if your birthdate holds a deeper meaning? In
                Javanese culture, it unlocks a rich tapestry of personality
                insights and potential life paths in the form of Weton and Wuku.
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
              The Story Behind Your Javanese Soul Signs
            </h1>
            <section className="">
              <p className="leading-relaxed text-gray-700 h-[28rem] flex justify-center items-center text-lg">
                These ancient systems are more than just dates; they are keys to
                understanding your unique self and the energies that shape your
                life. Used for centuries, they offer a profound way to
                understand oneself and the subtle energies of time.
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
              Weton, The Rhythm of Your Birth
            </h1>
            <section className="grow justify-center items-center h-[28rem] flex mt-8">
              <div className="flex flex-col items-center">
                <p className="mt-3 text-gray-700">
                  Your Weton is the special combination of your birth day from
                  the common 7-day week (Saptawara – like Monday, Tuesday) and a
                  specific day from the 5-day Javanese market week (Pancawara –
                  like Kliwon, Legi). This unique pairing, for example,
                  &quot;Monday Kliwon&quot; is the foundation of your personal
                  reading.
                </p>
                <p className="mt-3 text-gray-700">
                  Each day and market day carries a numerical value called
                  &quot;Neptu&quot;. These are added together to create your
                  Weton&apos;s total Neptu, a key number that unlocks deeper
                  interpretations about your innate characteristics, strengths,
                  and potential life journey.
                </p>
                <p className="mt-3 text-gray-700">
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
            <section className="grow justify-center items-center h-[28rem] flex mt-8">
              <div className="flex flex-col items-center">
                <p className="mt-3 text-gray-700">
                  Beyond your Weton, there&apos;s the Wuku. Imagine a grand
                  cosmic calendar of 210 days, called Pawukon, divided into 30
                  different &quot;weeks&quot; or periods, each lasting 7 days.
                  Your birth date also falls into one of these specific Wukus,
                  each with its own distinct name and character.
                </p>
                <p className="mt-3 text-gray-700">
                  Each Wuku is rich in symbolism, protected by a specific
                  Javanese deity (Batara), and associated with a unique bird and
                  tree. These elements aren&apos;t just decorative; they offer
                  further layers of meaning, influencing the general atmosphere,
                  inherent talents, and spiritual inclinations of those born
                  under them.
                </p>
                <p className="mt-3 text-gray-700">
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
                More Than Just Dates
              </h1>
              <section className="grow justify-center items-center h-[28rem] flex ">
                <div className="flex flex-col h-[28rem] justify-center items-center ">
                  <p className="mt-3 text-gray-700">
                    For generations in Javanese culture, <b>Weton</b> and{" "}
                    <b>Wuku</b> have been integral to daily life. They are
                    consulted for everything from determining auspicious dates
                    for marriages, building homes, and planting crops, to
                    understanding family dynamics and personal growth. This
                    knowledge, often recorded in ancient manuscripts called
                    &quot;<b>Primbon</b>&quot; is a treasured part of Indonesian
                    cultural wisdom, passed down through families and spiritual
                    advisors.
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
        defaultInterval={10000}
        stories={stories}
        progressStyles={{ backgroundColor: "#d1b08e", height: "3px" }}
        progressWrapperStyles={{ height: "3px" }}
      ></StoriesLazy>
    </div>
  );
}

const stories = [
  {
    content: ({ action, story }) => {
      return (
        // <Suspense>
        <WithSeeMore story={story} action={action}>
          <div className="text-gray-700 p-5 bg-base-200 text-center">
            <h1 className="text-3xl font-bold text-batik-black py-4">
              More Than Just Dates
            </h1>
            <section className="grow justify-center items-center h-[28rem] flex ">
              <div className="flex flex-col h-[28rem] justify-center items-center ">
                <p className="mt-3 text-gray-700">
                  For generations in Javanese culture, Weton and Wuku have been
                  integral to daily life. They are consulted for everything from
                  determining auspicious dates for marriages, building homes,
                  and planting crops, to understanding family dynamics and
                  personal growth. This knowledge, often recorded in ancient
                  manuscripts called &quot;Primbon&quot; is a treasured part of
                  Indonesian cultural wisdom, passed down through families and
                  spiritual advisors.
                </p>
              </div>
            </section>
          </div>
        </WithSeeMore>
        // </Suspense>
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
          <span class="absolute inline-flex h-full w-1/3 animate-ping rounded-full bg-batik-border-light opacity-50"></span>
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
  {
    content: ({ action, isPaused }) => {
      return (
        <div className="text-gray-700 p-5 min-h-screen bg-base-200 text-center">
          <h1 className="text-3xl font-bold text-batik-black py-4">
            The Story Behind Your Javanese Soul Signs
          </h1>
          <section className="">
            <p className="leading-relaxed text-gray-700 h-[28rem] flex justify-center items-center text-lg ">
              Ever wondered if your birthdate holds a deeper meaning? In
              Javanese culture, it unlocks a rich tapestry of personality
              insights and potential life paths in the form of Weton and Wuku.
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
            The Story Behind Your Javanese Soul Signs
          </h1>
          <section className="">
            <p className="leading-relaxed text-gray-700 h-[28rem] flex justify-center items-center text-lg">
              These ancient systems are more than just dates; they are keys to
              understanding your unique self and the energies that shape your
              life. Used for centuries, they offer a profound way to understand
              oneself and the subtle energies of time.
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
            Weton, The Rhythm of Your Birth
          </h1>
          <section className="grow justify-center items-center h-[28rem] flex mt-8">
            <div className="flex flex-col items-center">
              <p className="mt-3 text-gray-700">
                Your Weton is the special combination of your birth day from the
                common 7-day week (Saptawara – like Monday, Tuesday) and a
                specific day from the 5-day Javanese market week (Pancawara –
                like Kliwon, Legi). This unique pairing, for example,
                &quot;Monday Kliwon&quot; is the foundation of your personal
                reading.
              </p>
              <p className="mt-3 text-gray-700">
                Each day and market day carries a numerical value called
                &quot;Neptu&quot;. These are added together to create your
                Weton&apos;s total Neptu, a key number that unlocks deeper
                interpretations about your innate characteristics, strengths,
                and potential life journey.
              </p>
              <p className="mt-3 text-gray-700">
                Traditionally, your Weton offers insights into your personality,
                compatibility with others, favorable timings for important life
                events, and even potential challenges to be aware of, helping
                you navigate life with greater understanding.
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
          <section className="grow justify-center items-center h-[28rem] flex mt-8">
            <div className="flex flex-col items-center">
              <p className="mt-3 text-gray-700">
                Beyond your Weton, there&apos;s the Wuku. Imagine a grand cosmic
                calendar of 210 days, called Pawukon, divided into 30 different
                &quot;weeks&quot; or periods, each lasting 7 days. Your birth
                date also falls into one of these specific Wukus, each with its
                own distinct name and character.
              </p>
              <p className="mt-3 text-gray-700">
                Each Wuku is rich in symbolism, protected by a specific Javanese
                deity (Batara), and associated with a unique bird and tree.
                These elements aren&apos;t just decorative; they offer further
                layers of meaning, influencing the general atmosphere, inherent
                talents, and spiritual inclinations of those born under them.
              </p>
              <p className="mt-3 text-gray-700">
                Your Wuku adds another dimension to your profile, painting a
                broader picture of the influences shaping your outlook, the kind
                of environment you might thrive in, and the symbolic energies
                you carry.
              </p>
            </div>
          </section>
        </div>
      );
    },
  },
  {
    content: ({ action, story, isPaused }) => {
      return (
        <div className="text-gray-700 p-5 min-h-screen bg-base-200 text-center">
          <h1 className="text-3xl font-bold text-batik-black py-4">
            More Than Just Dates
          </h1>
          <section className="grow justify-center items-center h-[28rem] flex ">
            <div className="flex flex-col h-[28rem] justify-center items-center ">
              <p className="mt-3 text-gray-700">
                For generations in Javanese culture, Weton and Wuku have been
                integral to daily life. They are consulted for everything from
                determining auspicious dates for marriages, building homes, and
                planting crops, to understanding family dynamics and personal
                growth. This knowledge, often recorded in ancient manuscripts
                called &quot;Primbon&quot; is a treasured part of Indonesian
                cultural wisdom, passed down through families and spiritual
                advisors.
              </p>
            </div>
          </section>
        </div>
      );
    },
    seeMore: ({ close, action }) => {
      return (
        <div className="flex justify-center mt-10 z-50">
          <button
            onClick={() =>
              router.replace("/readings/general_readings/weton-intro")
            }
            className="btn text-lg text-batik-black border bg-batik border-batik-border py-3 px-7 rounded-2xl shadow-sm relative"
          >
            <span class="absolute inline-flex h-full w-1/3 animate-ping rounded-full bg-batik-border-light opacity-50"></span>
            Explore your Weton details
          </button>
        </div>
      );
    },
    seeMore: ({ close }) => {
      return <div onClick={close}>Hello, click to close this.</div>;
    },
  },
];
