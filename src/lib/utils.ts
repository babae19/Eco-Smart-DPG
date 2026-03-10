
import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  // Filter out undefined, null, and empty values before passing to clsx
  const filteredInputs = inputs.filter(input => input !== undefined && input !== null && input !== "");
  return twMerge(clsx(filteredInputs));
}

// Add the missing getRandomInt function
export function getRandomInt(min: number, max: number): number {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min + 1)) + min;
}
