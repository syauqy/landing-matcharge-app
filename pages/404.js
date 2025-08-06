import Link from "next/link";
import { DashboardNavbar } from "@/components/layouts/dashboard-navbar";
import { Menubar } from "@/components/layouts/menubar";

export default function NotFoundPage() {
  return (
    <div className="h-[100svh] flex flex-col bg-base relative">
      <DashboardNavbar />
      <div className="flex flex-col items-center justify-center flex-grow py-12 px-5">
        <div className="bg-base-100 border border-[var(--color-batik-border)] rounded-2xl shadow-md p-8 flex flex-col items-center">
          <h1 className="text-5xl font-bold text-batik-black mb-2">404</h1>
          <h2 className="text-2xl font-semibold text-batik-black mb-4">
            Page Not Found
          </h2>
          <p className="text-base-content text-center mb-6">
            Sorry, the page you&apos;re looking for doesn&apos;t exist.
            <br />
            Let&apos;s get you back to your journey.
          </p>
          <Link
            href="/home"
            className="btn border-batik-border text-batik-text rounded-2xl px-6 py-2 font-semibold"
          >
            Go to Home
          </Link>
        </div>
      </div>
      <Menubar page="home" />
    </div>
  );
}
