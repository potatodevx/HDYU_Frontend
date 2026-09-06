export function cn(...classes: (string | false | null | undefined)[]): string {
  return classes.filter(Boolean).join(" ");
}

export function shortAddress(address: string, chars = 4): string {
  if (address.length <= chars * 2 + 3) return address;
  return `${address.slice(0, chars)}…${address.slice(-chars)}`;
}

export function formatHdyu(amount: number): string {
  return amount.toLocaleString("en-US", { maximumFractionDigits: 4 });
}

export function formatDate(value: string | Date): string {
  return new Date(value).toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function generateHdyuUserId(): string {
  const digits = Math.floor(100000 + Math.random() * 900000);
  return `HDYU-${digits}`;
}

export const ACTIVITY_CATEGORIES = [
  { value: "GREEN_ACTIVITY", label: "Green / Environmental Activity" },
  { value: "GARDENING", label: "Home & Terrace Gardening" },
  { value: "FARMING", label: "Organic / Natural Farming" },
  { value: "GREEN_PURCHASE", label: "Sustainable Product Purchase" },
  { value: "TRAVEL", label: "Travel Activity / Promotion" },
  { value: "REFERRAL", label: "Referral / Promotional Reward" },
  { value: "CAMPAIGN", label: "Ecosystem Campaign" },
] as const;

export function categoryLabel(value: string): string {
  return ACTIVITY_CATEGORIES.find((c) => c.value === value)?.label ?? value;
}
