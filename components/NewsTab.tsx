'use client';

type NewsItem = {
  id: string;
  source: 'USCIS' | 'DHS';
  category: string | null;
  title: string;
  link: string;
  summary: string | null;
  published_at: string | null;
};

const fmt = (d: string | null) => (d ? new Date(d).toISOString().slice(0, 10) : '');

export default function NewsTab({ items }: { items: NewsItem[] }) {
  if (!items?.length) {
    return (
      <div className="block">
        <div className="bhead green">📰 news</div>
        <div className="row">
          <span className="sub">no items yet — the gateway runs daily.</span>
        </div>
      </div>
    );
  }
  return (
    <div className="block">
      <div className="bhead green">
        📰 news <span className="count">{items.length}</span>
      </div>
      {items.map((n) => (
        <div key={n.id} className="alert">
          <div
            className="ahead"
            style={{ color: n.source === 'USCIS' ? 'var(--green)' : 'var(--blue)' }}
          >
            [{n.source}] {n.category}
            <span style={{ marginLeft: 'auto', color: 'var(--dim)', fontWeight: 400 }}>
              {fmt(n.published_at)}
            </span>
          </div>
          <a
            href={n.link}
            target="_blank"
            rel="noopener noreferrer"
            style={{ color: 'var(--text)', fontWeight: 500, textDecoration: 'none' }}
          >
            {n.title}
          </a>
          {n.summary && <div className="abody">{n.summary}</div>}
        </div>
      ))}
    </div>
  );
}
