import React from "react";

export function ErrorLayout({ error, router }) {
  return (
    <div className="min-h-screen flex flex-col gap-4 items-center justify-center bg-base-100 text-base-content p-4">
      <div className="alert bg-red-50 text-red-500 max-w-md text-center">
        <div className="flex flex-col gap-3 text-center items-center">
          <CircleAlertIcon className="h-10 w-10" />
          <div className="text-center">Error! {error}</div>
        </div>
      </div>
      <button
        onClick={() => router.back()}
        className="p-2 px-4 rounded-full text-lg border border-batik-text hover:bg-batik/80 hover:cursor-pointer inline-flex items-center text-batik-text font-medium"
      >
        <ArrowLeft size={20} className="text-batik-text" />
        <span className="ml-2">Go Back</span>
      </button>
    </div>
  );
}
