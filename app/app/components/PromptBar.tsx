"use client";

export function PromptBar({ cat, cmd, onExport }: { cat: string; cmd: string; onExport?: () => void }) {
  return (
    <div className="promptbar">
      <div className="prompt">
        <span className="u">resident</span>[<span className="cat">{cat}</span>]
        <span className="host">@USCIS</span> <span className="dollar">$</span>{" "}
        <span className="cmd">{cmd}</span>
        <span className="caret" aria-hidden="true"></span>
      </div>
      {onExport && (
        <button className="share" title="export" onClick={onExport}>
          ⤴
        </button>
      )}
    </div>
  );
}
