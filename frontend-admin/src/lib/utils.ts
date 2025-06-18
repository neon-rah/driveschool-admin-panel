import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export const timeSince = (date: string | Date, max: number = 7): string => {
  const now = new Date();
  const pastDate = new Date(date);
  const secondsPast = Math.floor((now.getTime() - pastDate.getTime()) / 1000);
  const maximum = max * 24 * 3600;

  if (secondsPast < 60) {
    return `il y a ${secondsPast} secondes`;
  }
  if (secondsPast < 3600) {
    return `il y a ${Math.floor(secondsPast / 60)} minutes`;
  }
  if (secondsPast < 86400) {
    return `il y a ${Math.floor(secondsPast / 3600)} heures`;
  }
  if (secondsPast < maximum) {
    return `il y a ${Math.floor(secondsPast / 86400)} jours`;
  }

  return pastDate.toLocaleString("fr-FR", {
    month: "long",
    day: "2-digit",
    year: "numeric",
  });
};
