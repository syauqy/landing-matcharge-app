import React, { useState } from "react";
import { supabase } from "@/utils/supabaseClient";
import { useRouter } from "next/router";
import Link from "next/link";
import { Toaster, toast } from "sonner";

export default function Login() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const [emailSent, setEmailSent] = useState(false);
  const [sentToEmail, setSentToEmail] = useState("");

  const handleMagicLinkLogin = async (e) => {
    e.preventDefault();
    setLoading(true);

    if (!email || !email.includes("@")) {
      toast.error("Please enter a valid email address");
      setLoading(false);
      return;
    }

    const { error: signInError } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: `${window.location.origin}/home`,
      },
    });

    if (signInError) {
      toast.error(signInError.message);
    } else {
      setSentToEmail(email);
      setEmailSent(true);
      toast.success("Check your email for the login link!");
    }
    setLoading(false);
  };

  const handleChangeEmail = () => {
    setEmailSent(false);
  };

  const handleGoogleLogin = async () => {
    setLoading(true);

    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/home`,
      },
    });

    if (error) {
      toast.error(error.message);
      setLoading(false);
    }
    // No need to set loading to false on success as we're redirecting to Google
  };

  const handleAppleLogin = async () => {
    setLoading(true);

    const { error } = await supabase.auth.signInWithOAuth({
      provider: "apple",
      options: {
        redirectTo: `${window.location.origin}/home`,
      },
    });

    if (error) {
      toast.error(error.message);
      setLoading(false);
    }
    // No need to set loading to false on success as we're redirecting to Apple
  };

  const goBack = () => {
    router.push("/");
  };

  return (
    <div className="h-[100svh] flex flex-col bg-batik py-8">
      <Toaster richColors />
      {/* Navigation Bar */}
      <div className="bg-batik shadow-sm w-full">
        <div className="max-w-md mx-auto px-4 py-3 flex items-center justify-between relative">
          <button
            onClick={goBack}
            className="p-2 rounded-full hover:bg-gray-100 transition-colors absolute left-2 cursor-pointer"
            aria-label="Go back"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="currentColor"
              width="20"
              height="20"
            >
              <path
                fillRule="evenodd"
                d="M7.72 12.53a.75.75 0 0 1 0-1.06l7.5-7.5a.75.75 0 1 1 1.06 1.06L9.31 12l6.97 6.97a.75.75 0 1 1-1.06 1.06l-7.5-7.5Z"
                clipRule="evenodd"
              />
            </svg>
          </button>
          <h1 className="text-lg font-semibold mx-auto">Login</h1>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-grow flex items-center justify-center p-4">
        <div className="bg-offwhite p-8 rounded-lg shadow-md w-full max-w-md">
          <h1 className="text-2xl font-bold mb-6 text-center">
            Get Your Reading
          </h1>

          <div className="space-y-6">
            {/* Google Login Button */}
            <button
              onClick={handleGoogleLogin}
              disabled={loading}
              className="w-full flex items-center justify-center gap-3 bg-offwhite text-batik-black border border-batik-border py-2.5 px-3 rounded-2xl shadow-sm hover:bg-gray-50 transition duration-150 ease-in-out"
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

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t-2 border-batik-border-light"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-batik  text-slate-700">Or</span>
              </div>
            </div>

            {/* Magic Link Login Section */}
            {!emailSent ? (
              /* Email Input Form */
              <form onSubmit={handleMagicLinkLogin} className="space-y-4">
                <div>
                  <label
                    className="block text-gray-700 mb-2 text-sm"
                    htmlFor="email"
                  >
                    Continue with Email
                  </label>
                  <input
                    type="email"
                    id="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full mt-0 block border-0 border-b-2 border-batik-border-light px-0.5 py-2 text-lg focus:border-indigo-600 focus:outline-hidden "
                    required
                    placeholder="your@email.com"
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-batik-border text-white font-semibold py-2 px-4 rounded-2xl hover:bg-batik-border-hover transition duration-150 ease-in-out cursor-pointer disabled:cursor-not-allowed disabled:bg-slate-300 disabled:text-slate-400"
                >
                  {loading ? "Sending..." : "Get login link"}
                </button>
                <p className="text-center text-sm text-gray-600">
                  We&apos;ll email you a magic link for a password-free sign in.
                </p>
              </form>
            ) : (
              /* Success Message and Change Email Option */
              <div className="space-y-4 text-center">
                <div className="bg-offwhite p-4 rounded border border-batik-border">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                    className="w-8 h-8 text-batik-text mx-auto mb-2"
                  >
                    <path d="M1.5 8.67v8.58a3 3 0 0 0 3 3h15a3 3 0 0 0 3-3V8.67l-8.928 5.493a3 3 0 0 1-3.144 0L1.5 8.67Z" />
                    <path d="M22.5 6.908V6.75a3 3 0 0 0-3-3h-15a3 3 0 0 0-3 3v.158l9.714 5.978a1.5 1.5 0 0 0 1.572 0L22.5 6.908Z" />
                  </svg>
                  <h3 className="font-medium text-batik-text mb-1">
                    Check your inbox
                  </h3>
                  <p className="text-sm text-batik-text">
                    We&apos;ve sent a login link to:
                  </p>
                  <p className="font-semibold text-batik-text mt-1">
                    {sentToEmail}
                  </p>
                </div>

                <p className="text-sm text-gray-600">
                  Click the link in your email to sign in. If you don&apos;t see
                  it, check your spam folder.
                </p>

                <button
                  onClick={handleChangeEmail}
                  className="text-batik-text hover:underline text-sm font-medium"
                >
                  Use a different email address
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Privacy Policy & Terms of Service Footer */}
      <footer className="w-full py-4 px-4 bg-transparent">
        <div className="max-w-md mx-auto text-center text-xs text-slate-600">
          <p>
            By continuing, you agree to our{" "}
            <Link
              href="/terms"
              className="text-batik-text hover:underline font-medium"
            >
              Terms of Service
            </Link>{" "}
            and{" "}
            <Link
              href="/privacy"
              className="text-batik-text hover:underline font-medium"
            >
              Privacy Policy
            </Link>
          </p>
        </div>
      </footer>
    </div>
  );
}
