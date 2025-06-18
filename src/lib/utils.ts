import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import { toast } from "sonner"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function getConvexSiteUrl() {
  let convexSiteUrl;
  if (process.env.NEXT_PUBLIC_CONVEX_URL!.includes(".cloud")) {
    convexSiteUrl = process.env.NEXT_PUBLIC_CONVEX_URL!.replace(
      /\.cloud$/,
      ".site"
    );
  } else {
    const url = new URL(process.env.NEXT_PUBLIC_CONVEX_URL!);
    url.port = String(Number(url.port) + 1);
    convexSiteUrl = url.toString();
  }
  return convexSiteUrl;
}

export function handleMutationError(err: unknown, context?: string) {
  let errorMsg = (err as { message?: string })?.message || "Something went wrong. Please try again.";
  // Rate limit
  if (errorMsg.includes("Rate limit exceeded")) {
    const match = errorMsg.match(/after ([0-9.]+) hours?/);
    if (match) {
      const hours = parseFloat(match[1]);
      const minutes = Math.round(hours * 60);
      errorMsg = `You've hit the rate limit. Please try again in ${minutes} minutes.`;
    } else {
      errorMsg = "You've hit the rate limit. Please try again later.";
    }
  }
  // Network
  if (errorMsg.includes("Failed to fetch") || errorMsg.includes("NetworkError")) {
    errorMsg = "Network error. Please check your connection.";
  }
  // Log for devs
  if (typeof window !== "undefined" && process.env.NODE_ENV !== "production") {
    console.error(`[${context || "Mutation"} Error]:`, err);
  }
  toast.error(errorMsg);
}