import React, { useState } from "react";
import { supabase } from "@/utils/supabaseClient";
import { useRouter } from "next/router";
import Link from "next/link";
import Image from "next/image";

export default function Login() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const router = useRouter();

  const [emailSent, setEmailSent] = useState(false);
  const [sentToEmail, setSentToEmail] = useState("");

  const handleMagicLinkLogin = async (e) => {
    e.preventDefault();
    setError("");
    setMessage("");
    setLoading(true);

    if (!email || !email.includes("@")) {
      setError("Please enter a valid email address");
      setLoading(false);
      return;
    }

    const { error: signInError } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: `${window.location.origin}/dashboard`,
      },
    });

    if (signInError) {
      setError(signInError.message);
    } else {
      setSentToEmail(email);
      setEmailSent(true);
      setMessage("Check your email for the login link!");
    }
    setLoading(false);
  };

  const handleChangeEmail = () => {
    setEmailSent(false);
    setError("");
    setMessage("");
  };

  const handleGoogleLogin = async () => {
    setError("");
    setMessage("");
    setLoading(true);

    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/dashboard`,
      },
    });

    if (error) {
      setError(error.message);
      setLoading(false);
    }
    // No need to set loading to false on success as we're redirecting to Google
  };

  const goBack = () => {
    router.push("/");
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-100">
      {/* Navigation Bar */}
      <div className="bg-white shadow-sm w-full">
        <div className="max-w-md mx-auto px-4 py-3 flex items-center justify-between relative">
          <button
            onClick={goBack}
            className="p-2 rounded-full hover:bg-gray-100 transition-colors absolute left-2"
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
          <h1 className="text-lg font-medium mx-auto">Login</h1>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-grow flex items-center justify-center p-4">
        <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-md">
          <h1 className="text-2xl font-bold mb-6 text-center">
            Get your Weton Readings
          </h1>

          {error && <p className="mb-4 text-red-600 text-center">{error}</p>}
          {message && (
            <p className="mb-4 text-green-600 text-center">{message}</p>
          )}

          <div className="space-y-6">
            {/* Google Login Button */}
            <button
              onClick={handleGoogleLogin}
              disabled={loading}
              className="w-full flex items-center justify-center gap-3 bg-white border border-gray-300 py-2.5 px-3 rounded shadow-sm hover:bg-gray-50 transition duration-150 ease-in-out"
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

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-gray-500">Or</span>
              </div>
            </div>

            {/* Magic Link Login Section */}
            {!emailSent ? (
              /* Email Input Form */
              <form onSubmit={handleMagicLinkLogin} className="space-y-4">
                <div>
                  <label className="block text-gray-700 mb-2" htmlFor="email">
                    Continue with Email
                  </label>
                  <input
                    type="email"
                    id="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-3 py-2 border rounded focus:outline-none focus:ring focus:border-blue-300"
                    required
                    placeholder="your@email.com"
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 disabled:bg-blue-300 transition duration-150 ease-in-out"
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
                <div className="bg-blue-50 p-4 rounded border border-blue-100">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                    className="w-8 h-8 text-blue-500 mx-auto mb-2"
                  >
                    <path d="M1.5 8.67v8.58a3 3 0 0 0 3 3h15a3 3 0 0 0 3-3V8.67l-8.928 5.493a3 3 0 0 1-3.144 0L1.5 8.67Z" />
                    <path d="M22.5 6.908V6.75a3 3 0 0 0-3-3h-15a3 3 0 0 0-3 3v.158l9.714 5.978a1.5 1.5 0 0 0 1.572 0L22.5 6.908Z" />
                  </svg>
                  <h3 className="font-medium text-blue-700 mb-1">
                    Check your inbox
                  </h3>
                  <p className="text-sm text-blue-600">
                    We&apos;ve sent a login link to:
                  </p>
                  <p className="font-medium text-blue-800 mt-1">
                    {sentToEmail}
                  </p>
                </div>

                <p className="text-sm text-gray-600">
                  Click the link in your email to sign in. If you don&apos;t see
                  it, check your spam folder.
                </p>

                <button
                  onClick={handleChangeEmail}
                  className="text-blue-600 hover:underline text-sm font-medium"
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
        <div className="max-w-md mx-auto text-center text-xs text-gray-500">
          <p>
            By continuing, you agree to our{" "}
            <Link href="/terms" className="text-blue-600 hover:underline">
              Terms of Service
            </Link>{" "}
            and{" "}
            <Link href="/privacy" className="text-blue-600 hover:underline">
              Privacy Policy
            </Link>
          </p>
        </div>
      </footer>
    </div>
  );
}
