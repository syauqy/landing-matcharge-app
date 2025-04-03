import React, { useState } from "react";
import { supabase } from "@/utils/supabaseClient";
import Link from "next/link";
import { useRouter } from "next/router";

export default function Register() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const router = useRouter();

  const handleRegister = async (e) => {
    e.preventDefault();
    setMessage("");
    setError("");
    setLoading(true);

    if (!email || !email.includes('@')) {
      setError("Please enter a valid email address");
      setLoading(false);
      return;
    }

    // Signup with magic link (OTP)
    const { error: signUpError } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: `${window.location.origin}/dashboard`,
        shouldCreateUser: true, // This ensures a new user is created if they don't exist
      },
    });

    if (signUpError) {
      setError(signUpError.message);
    } else {
      setMessage(
        "Check your email for a verification link to complete your registration!"
      );
    }
    setLoading(false);
  };

  const handleGoogleSignUp = async () => {
    setError("");
    setMessage("");
    setLoading(true);
    
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
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

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-md">
        <h1 className="text-2xl font-bold mb-6 text-center">Register</h1>
        
        {error && <p className="mb-4 text-red-600 text-center">{error}</p>}
        {message && <p className="mb-4 text-green-600 text-center">{message}</p>}
        
        <div className="space-y-6">
          {/* Google Signup Button */}
          <button
            onClick={handleGoogleSignUp}
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 bg-white border border-gray-300 p-2 rounded shadow-sm hover:bg-gray-50 transition duration-150 ease-in-out"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 186.69 190.5">
              <g transform="translate(1184.583 765.171)">
                <path clipPath="none" mask="none" d="M-1089.333-687.239v-36.888h51.262c2.251 11.863 1.282 29.545-8.503 40.951-9.498 11.577-24.296 17.649-42.759 17.649-38.859 0-69.176-31.076-69.176-68.487 0-37.413 30.317-68.49 69.176-68.49 18.881 0 32.128 7.337 42.134 16.88l28.352-27.513c-18.646-17.13-44.126-27.56-70.486-27.56-58.345 0-105.071 46.282-105.071 106.683 0 60.4 46.726 106.684 105.071 106.684 30.978 0 54.434-10.138 72.555-29.539 20.979-20.979 27.453-50.475 25.582-71.87z" fill="#4285f4"/>
              </g>
            </svg>
            <span>Sign up with Google</span>
          </button>
          
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-white text-gray-500">Or</span>
            </div>
          </div>
          
          {/* Email Registration Form */}
          <form onSubmit={handleRegister} className="space-y-4">
            <div>
              <label className="block text-gray-700 mb-2" htmlFor="email">
                Email
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
              {loading ? "Sending..." : "Sign up with Email"}
            </button>
          </form>
          
          <p className="text-center text-sm text-gray-600">
            We'll email you a verification link to complete your registration.
          </p>
        </div>
        
        <p className="mt-6 text-center">
          Already have an account?{" "}
          <Link href="/login" className="text-blue-600 hover:underline">
            Login
          </Link>
        </p>
        <p className="mt-2 text-center text-sm text-gray-500">
          By registering, you'll learn about your unique Weton and discover what it reveals about your life path.
        </p>
        <p className="mt-2 text-center">
          <Link href="/" className="text-gray-500 hover:underline text-sm">
            Back to Home
          </Link>
        </p>
      </div>
    </div>
  );
}