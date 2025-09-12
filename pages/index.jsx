import React from "react";
import Image from "next/image";
import { Abhaya_Libre } from "next/font/google";
import { NextSeo } from "next-seo";
import clsx from "clsx";
import { SelfDiscovery, Insight, Love, Door } from "@/components/illustrations";
import { AppStore } from "@/components/icons";
import { WaitlistForm } from "@/components/WaitlistForm";
import { Navbar } from "@/components/layouts/navbar";
import { Footer } from "@/components/layouts/footer";

const abhaya = Abhaya_Libre({
  weight: "800",
  subsets: ["latin"],
});

export default function HomePage() {
  return (
    <div className="min-h-screen bg-base-100">
      <NextSeo
        title="Wetonscope - Beyond Horoscope"
        description="Discover your soul's blueprint with Wetonscope, a modern guide to ancient Javanese wisdom. Get personalized daily readings, relationship compatibility insights, and deep self-discovery through traditional Weton calculations."
        openGraph={{
          type: "website",
          locale: "en_US",
          url: "https://wetonscope.com/",
          siteName: "Wetonscope",
          title: "Wetonscope - Beyond Horoscope",
          description:
            "Discover your soul's blueprint with Wetonscope. Get personalized daily readings and relationship insights based on ancient Javanese wisdom.",
          images: [
            {
              url: "/wetonscope-app-hero.png",
              width: 1200,
              height: 630,
              alt: "Wetonscope App Preview",
            },
          ],
        }}
        additionalMetaTags={[
          {
            name: "keywords",
            content:
              "weton calculator, javanese astrology, horoscope, birth date calculator, relationship compatibility, daily reading, self discovery, primbon jawa, astrology",
          },
          {
            name: "application-name",
            content: "Wetonscope",
          },
        ]}
      />
      <Navbar bg={"bg-batik"} />
      {/* Hero Section */}
      <section className="relative bg-gradient-to-b from-batik to-white py-20">
        <div className="container mx-auto px-4 flex flex-col lg:flex-row items-center">
          <div className="lg:w-1/2 text-center lg:text-left mb-10 lg:mb-0">
            <h1
              className={clsx(
                "text-6xl mb-6 text-batik-black",
                abhaya.className
              )}
            >
              Go Beyond Your Horoscope
            </h1>
            <p className="text-xl mb-8 text-gray-600">
              Discover your soul's blueprint with Wetonscope, a modern guide to
              the ancient Javanese art of self-discovery. Get the clarity you've
              been looking for.
            </p>
            <div className="flex flex-col gap-3 justify-center md:justify-start mt-4">
              <div className="text-xs md:text-sm text-gray-500 w-2/3 justify-center md:justify-start mx-auto lg:mx-0">
                Wetonscope is coming soon. Join our waitlist to get exclusive
                early access and a special founder's gift on launch day.
              </div>
              <WaitlistForm position={"left"} />
            </div>
          </div>
          <div className="lg:w-1/2">
            <Image
              src="/app-mockup.png"
              alt="Wetonscope App"
              width={500}
              height={1000}
              className="mx-auto"
              priority
            />
          </div>
        </div>
      </section>

      {/* Problem & Promise Section */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-4xl font-bold mb-6">
            Feeling like your horoscope is missing something?
          </h2>
          <div className="max-w-3xl mx-auto">
            <p className="text-xl text-gray-600 mb-8">
              You are more than just your sun sign. Standard astrology only
              shows a small piece of your story. Wetonscope unlocks a system of
              wisdom that is deeply personal, nuanced, and tuned to your unique
              energetic signature.
            </p>
          </div>
        </div>
      </section>

      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <h2 className="text-4xl font-bold text-center mb-12">
            What is Weton?
          </h2>
          <div className="grid md:grid-cols-3 gap-6">
            <div className="bg-white rounded-lg p-5 md:p-3 lg:p-5 text-center">
              <SelfDiscovery className="mx-auto mb-6" />
              <h3 className="text-xl font-bold mb-4">Your Cosmic Blueprint</h3>
              <p className="text-gray-600 text-sm">
                Weton is a unique system from Javanese tradition that reveals
                your personal energetic blueprint. It goes deeper than your
                zodiac sign, offering a more nuanced understanding of your
                soul's signature, rooted in centuries of wisdom.
              </p>
            </div>
            <div className="bg-white rounded-lg p-5 md:p-3 lg:p-5 text-center">
              <Insight className="mx-auto mb-6" />
              <h3 className="text-xl font-bold mb-4">Your Personal Life Map</h3>
              <p className="text-gray-600 text-sm">
                Think of Weton as your personal map. It highlights your innate
                strengths and challenges, helping you navigate your career,
                relationships, and personal growth by aligning your actions with
                your true nature and core values.
              </p>
            </div>
            <div className="bg-white rounded-lg p-5 md:p-3 lg:p-5 text-center">
              <Door className="mx-auto mb-6" />
              <h3 className="text-xl font-bold mb-4">
                Guidance for Today's World
              </h3>
              <p className="text-gray-600 text-sm">
                Wetonscope makes this profound wisdom accessible for everyone.
                Whether you're seeking clarity, connection, or purpose, Weton
                offers practical guidance for navigating today's fast-paced and
                diverse world.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          <h2 className="text-4xl font-bold text-center mb-16">
            Your Journey Starts in 3 Simple Steps
          </h2>
          <div className="grid md:grid-cols-3 gap-6">
            {[
              {
                title: "Share Your Birth Details",
                description:
                  "Enter your birth date and time to create your unique energetic profile. Your data is private and secure.",
                icon: "🗓️",
              },
              {
                title: "Discover Your Archetype",
                description:
                  "We calculate your unique Weton, your soul's blueprint and reveal your personal archetype.",
                icon: "✨",
              },
              {
                title: "Receive Daily Guidance",
                description:
                  "Get daily, monthly, and deep personal readings that are tailored specifically to you.",
                icon: "⭐",
              },
            ].map((step, index) => (
              <div key={index} className="text-center p-6 md:p-2 lg:p-5">
                <div className="text-5xl mb-4">{step.icon}</div>
                <h3 className="text-xl font-bold mb-3">{step.title}</h3>
                <p className="text-gray-600">{step.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <h2 className="text-4xl font-bold text-center mb-16">
            A Toolkit for a More Aligned Life
          </h2>
          <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
            <div className="bg-white rounded-3xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow">
              <div className="h-80 bg-gray-200">
                <Image
                  src="/features/landing-feature-1.jpg"
                  alt="Daily Clarity"
                  width={500}
                  height={600}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="p-5">
                <h3 className="text-2xl font-bold mb-4">Your Daily Clarity</h3>
                <p className="text-gray-600">
                  Go beyond passive readings. Use daily insights as a prompt for
                  your private journal and set clear intentions to navigate your
                  day with purpose.
                </p>
              </div>
            </div>

            <div className="bg-white rounded-3xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow">
              <div className="h-80 bg-gray-200">
                <Image
                  src="/features/landing-feature-2.jpg"
                  alt="Deeper Connections"
                  width={500}
                  height={600}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="p-5">
                <h3 className="text-2xl font-bold mb-4">
                  Understand Your Connections
                </h3>
                <p className="text-gray-600">
                  Discover the energetic blueprint between you and anyone in
                  your life. Get a practical guide to better communication in
                  love and friendship.
                </p>
              </div>
            </div>

            <div className="bg-white rounded-3xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow">
              <div className="h-80 bg-gray-200">
                <Image
                  src="/features/landing-feature-3.jpg"
                  alt="Purposeful Career"
                  width={500}
                  height={600}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="p-5">
                <h3 className="text-2xl font-bold mb-4">
                  Align Your Career Path
                </h3>
                <p className="text-gray-600">
                  Uncover your professional superpowers and ideal work style.
                  Find the path that honors your natural energy and leads to
                  true fulfillment.
                </p>
              </div>
            </div>

            <div className="bg-white rounded-3xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow">
              <div className="h-80 bg-gray-200">
                <Image
                  src="/features/landing-feature-4.jpg"
                  alt="Your Soul's Blueprint"
                  width={500}
                  height={600}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="p-5">
                <h3 className="text-2xl font-bold mb-4">
                  Discover Your Full Blueprint
                </h3>
                <p className="text-gray-600">
                  Explore the deep layers of your being. Understand your karmic
                  themes, elemental nature (Laku), and the core values that
                  guide your soul's journey.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      {/* <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <h2 className="text-4xl font-bold text-center mb-16">
            Don't Just Take Our Word For It
          </h2>
          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            <div className="bg-gray-50 p-8 rounded-lg">
              <div className="text-yellow-400 mb-4">⭐⭐⭐⭐⭐</div>
              <p className="text-gray-600 mb-4">
                "I've always been into astrology, but this is on another level.
                The readings feel so personal and accurate, it's spooky. It's
                become my daily ritual."
              </p>
              <p className="font-bold">— Jessica M.</p>
            </div>
            <div className="bg-gray-50 p-8 rounded-lg">
              <div className="text-yellow-400 mb-4">⭐⭐⭐⭐⭐</div>
              <p className="text-gray-600 mb-4">
                "The friendship compatibility feature is a game-changer. It gave
                my best friend and me so much clarity on why we work so well
                together. Highly recommend!"
              </p>
              <p className="font-bold">— David L.</p>
            </div>
          </div>
        </div>
      </section> */}

      {/* Final CTA Section */}
      <section className="py-20 bg-gradient-to-b from-white to-batik">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-4xl font-bold mb-6">
            Ready to Discover Your True Self?
          </h2>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            Your journey to clarity, purpose, and deeper self-understanding is
            just a tap away. Download Wetonscope and start living a more aligned
            life today.
          </p>
          <div className="flex flex-col gap-3 justify-center lg:justify-start mt-4">
            <div className="text-xs md:text-sm text-gray-500 w-2/3 justify-center lg:justify-start mx-auto">
              Wetonscope is coming soon. Join our waitlist to get exclusive
              early access and a special founder's gift on launch day.
            </div>
            <WaitlistForm />
          </div>
        </div>
      </section>

      {/* Footer */}
      <Footer bg={"bg-batik"} />
    </div>
  );
}
