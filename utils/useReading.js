import { useEffect } from "react";
import useSWR from "swr";
import { supabase } from "./supabaseClient";

// The key for SWR to cache and identify this data
const SWR_KEY = "readings";

// The fetcher function for SWR. It uses the Supabase client to get the data.
// SWR fetcher function for a single reading
const fetcher = async (key) => {
  const slug = key.split("/").pop();

  // console.log("fetcher slug", slug);
  if (!slug) return null;

  const { data, error } = await supabase
    .from("readings")
    .select("id, status, reading, title, subtitle, reading_category, slug")
    .eq("slug", slug)
    .single();

  if (error) {
    console.error("Error fetching reading data:", error);
    throw error;
  }
  return data;
};

export const useCompatibilityReading = (slug) => {
  // Use the SWR hook to fetch data.
  // `data`, `error`, and `mutate` are returned from useSWR.
  const { data, error, mutate } = useSWR(slug, fetcher);

  // Set up the realtime subscription.
  useEffect(() => {
    // This is the callback function that will be executed when a change happens.
    const handleDatabaseChange = (payload) => {
      console.log("Database change received!", payload);
      // We received a change, so we tell SWR to re-fetch the data.
      // The `mutate` function will trigger a re-validation (re-fetch).
      mutate(payload.new);
    };

    // Subscribe to the 'readings' table
    const subscription = supabase
      .channel(`db-readings-slug-eq-${slug}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "readings",
          filter: `slug=eq.${slug}`,
        },
        handleDatabaseChange
      )
      .subscribe();
    // we need to unsubscribe from the channel.
    return () => {
      // console.log("Unsubscribing from realtime readings updates.");
      supabase.removeChannel(subscription);
    };
  }, [slug, mutate]); // We include `mutate` in the dependency array

  return {
    reading: data, // Rename `data` to `readings` for clarity
    isLoading: !error && !data,
    error: error,
  };
};
