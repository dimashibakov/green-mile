import { NextResponse } from "next/server";
import { XMLParser } from "fast-xml-parser";
import { createClient } from "@supabase/supabase-js";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 60;

type Src = { source: "USCIS" | "DHS"; category: string; url: string };
const SOURCES: Src[] = [
  { source: "USCIS", category: "News Release", url: "https://www.uscis.gov/rss-news/1/1125" },
  { source: "USCIS", category: "Alert", url: "https://www.uscis.gov/rss-news/5/1125" },
  { source: "DHS", category: "Press Release", url: process.env.DHS_FEED_URL ?? "" },
];

const parser = new XMLParser({ ignoreAttributes: false, attributeNamePrefix: "@_" });
const stripHtml = (s: string) => s.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();

async function fetchFeed(url: string): Promise<string> {
  const target = process.env.FEED_FETCH_PROXY
    ? process.env.FEED_FETCH_PROXY + encodeURIComponent(url)
    : url;
  const res = await fetch(target, {
    headers: {
      "User-Agent":
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36",
      Accept: "application/rss+xml, application/xml, text/xml;q=0.9, */*;q=0.8",
      "Accept-Language": "en-US,en;q=0.9",
    },
    cache: "no-store",
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.text();
}

function toItems(xml: string) {
  const doc = parser.parse(xml);
  const rss = doc?.rss?.channel?.item;
  if (rss) {
    const arr = Array.isArray(rss) ? rss : [rss];
    return arr.map((it: Record<string, unknown>) => ({
      title: String(it.title ?? "").trim(),
      link: typeof it.link === "string" ? it.link : String((it.link as Record<string, string>)?.["@_href"] ?? ""),
      summary: stripHtml(String(it.description ?? "")).slice(0, 600),
      published_at: it.pubDate ? new Date(String(it.pubDate)).toISOString() : null,
      guid: String(
        ((it.guid as Record<string, string>)?.["#text"] ?? it.guid ?? it.link ?? it.title) || ""
      ).trim(),
    }));
  }
  const atom = doc?.feed?.entry;
  if (atom) {
    const arr = Array.isArray(atom) ? atom : [atom];
    return arr.map((e: Record<string, unknown>) => {
      const linkRaw = e.link;
      let link = "";
      if (Array.isArray(linkRaw)) {
        const found = linkRaw.find((l: Record<string, string>) => l["@_rel"] !== "self");
        link = String(found?.["@_href"] ?? (linkRaw[0] as Record<string, string>)?.["@_href"] ?? "");
      } else if (linkRaw && typeof linkRaw === "object") {
        link = String((linkRaw as Record<string, string>)["@_href"] ?? "");
      }
      const title = e.title;
      const titleText =
        typeof title === "object" && title !== null
          ? String((title as Record<string, string>)["#text"] ?? "")
          : String(title ?? "");
      const summaryRaw = e.summary ?? e.content;
      const summaryText =
        typeof summaryRaw === "object" && summaryRaw !== null
          ? String((summaryRaw as Record<string, string>)["#text"] ?? "")
          : String(summaryRaw ?? "");
      return {
        title: titleText.trim(),
        link,
        summary: stripHtml(summaryText).slice(0, 600),
        published_at: e.updated
          ? new Date(String(e.updated)).toISOString()
          : e.published
            ? new Date(String(e.published)).toISOString()
            : null,
        guid: String(e.id ?? link ?? titleText ?? "").trim(),
      };
    });
  }
  return [];
}

export async function GET(request: Request) {
  const auth = request.headers.get("authorization");
  if (!process.env.CRON_SECRET || auth !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { persistSession: false } }
  );

  const report: Record<string, unknown>[] = [];
  for (const s of SOURCES) {
    if (!s.url) {
      report.push({ source: s.source, category: s.category, skipped: "no url" });
      continue;
    }
    try {
      const items = toItems(await fetchFeed(s.url)).filter((i) => i.title && i.link && i.guid);
      if (items.length) {
        const rows = items.map((i) => ({
          ...i,
          source: s.source,
          category: s.category,
          fetched_at: new Date().toISOString(),
        }));
        const { error } = await supabase.from("news").upsert(rows, { onConflict: "source,guid" });
        if (error) throw error;
      }
      report.push({ source: s.source, category: s.category, ok: true, count: items.length });
    } catch (e: unknown) {
      report.push({
        source: s.source,
        category: s.category,
        ok: false,
        error: String(e instanceof Error ? e.message : e),
      });
    }
  }
  return NextResponse.json({ ranAt: new Date().toISOString(), report });
}
