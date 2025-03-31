import Link from "next/link";

export default function HomePage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center">
      <h1 className="text-3xl font-bold mb-4">Wetonscope</h1>
      <h2 className="text-lg font-semibold">
        Discover your Weton, a unique Javanese astrological signature that
        reveals your personality, potential, and life path.
      </h2>
      <div className="space-x-4">
        <Link href="/login" className="text-blue-600 hover:underline">
          Login
        </Link>
        <Link href="/register" className="text-blue-600 hover:underline">
          Register
        </Link>
      </div>
    </div>
  );
}
