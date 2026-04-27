"use client";

import ErrorState from "@/components/dashboard/ErrorState";

export default function Error() {
  return (
    <ErrorState
      message="We could not load the users management workspace."
      reset={() => window.location.reload()}
    />
  );
}
