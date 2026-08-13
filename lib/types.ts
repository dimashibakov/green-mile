export type Profile = {
  id: string;
  handle: string | null;
  category: string | null;
  resident_since: string | null; // yyyy-mm-dd
  card_expires: string | null;   // yyyy-mm-dd
  theme?: "dark" | "light";
};

export type Trip = {
  id: string;
  user_id: string;
  country: string;
  city: string | null;
  code: string | null;      // 2-letter ISO
  departed: string;         // yyyy-mm-dd
  returned: string | null;  // null = ongoing
  reason: string | null;
};

export type NewsItem = {
  id: string;
  source: "USCIS" | "DHS";
  category: string | null;
  title: string;
  link: string;
  summary: string | null;
  published_at: string | null;
};
