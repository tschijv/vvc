import Link from "next/link";
import { sections as allSections, type PveSection, type PveRow, type Prio, type Status } from "./pve-data";

/* ── Link-icoon SVG ── */
function DemoLink({ href, title }: { href: string; title?: string }) {
  return (
    <Link href={href} className="demo-link" title={title || "Bekijk demo"}>
      <svg viewBox="0 0 20 20" fill="currentColor"><path d="M12.232 4.232a2.5 2.5 0 0 1 3.536 3.536l-1.225 1.224a.75.75 0 0 0 1.061 1.06l1.224-1.224a4 4 0 0 0-5.656-5.656l-3 3a4 4 0 0 0 .225 5.865.75.75 0 0 0 .977-1.138 2.5 2.5 0 0 1-.142-3.667l3-3Z" /><path d="M11.603 7.963a.75.75 0 0 0-.977 1.138 2.5 2.5 0 0 1 .142 3.667l-3 3a2.5 2.5 0 0 1-3.536-3.536l1.225-1.224a.75.75 0 0 0-1.061-1.06l-1.224 1.224a4 4 0 1 0 5.656 5.656l3-3a4 4 0 0 0-.225-5.865Z" /></svg>
    </Link>
  );
}

const prioLabel: Record<Prio, [string, string]> = {
  eis: ["Eis", "tag-eis"],
  wens: ["Wens", "tag-wens"],
  could: ["Could", "tag-could"],
  nvt: ["n.v.t.", "tag-nvt"],
};

const statusIcon: Record<Status, string> = {
  yes: "\u2705",
  partial: "\u26A0",
  no: "\u274C",
  nvt: "",
  extra: "\uD83D\uDE80",
};

/* ── Render helpers ── */
function PveTable({ rows, header }: { rows: PveRow[]; header?: string }) {
  return (
    <table className="detail">
      <thead>
        <tr>
          <th>ID</th>
          <th>{header || "Functionaliteit"}</th>
          <th>Prio</th>
          <th>Status</th>
          <th>Toelichting</th>
          <th aria-label="Demo" title="Link naar demo"></th>
        </tr>
      </thead>
      <tbody>
        {rows.map((r) => {
          const [label, cls] = r.status === "extra" ? ["Extra", "tag-extra"] : prioLabel[r.prio];
          const icon = r.status === "nvt"
            ? <span className="tag tag-nvt">n.v.t.</span>
            : r.status === "extra"
            ? <span title="Extra gerealiseerd">{statusIcon.extra}</span>
            : statusIcon[r.status];
          return (
            <tr key={r.id}>
              <td>{r.id}</td>
              <td>{r.naam}</td>
              <td><span className={`tag ${cls}`}>{label}</span></td>
              <td>{icon}</td>
              <td className="toelichting">
                {r.toelichting}
                {r.peter && <span className="peter">{"\uD83D\uDCCC"} {r.peter}</span>}
              </td>
              <td>{r.link ? <DemoLink href={r.link} title={r.linkTitle} /> : null}</td>
            </tr>
          );
        })}
      </tbody>
    </table>
  );
}

export default function PveDetailTables({ sections: sectionsProp }: { sections?: PveSection[] }) {
  const sections = sectionsProp ?? allSections;
  return (
    <>
      {sections.map((s, i) => (
        <div key={i}>
          {s.title && <h2 className="section-title">{s.title}</h2>}
          {s.subtitle && <h3 className="section-subtitle">{s.subtitle}</h3>}
          <PveTable
            rows={s.rows}
            header={s.title === "12. Non-functionele Eisen" ? "Categorie" : undefined}
          />
        </div>
      ))}
    </>
  );
}
