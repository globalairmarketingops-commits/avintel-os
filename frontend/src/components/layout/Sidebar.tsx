import { NavLink } from "react-router-dom";

const NAV_GROUPS: { label: string; items: { path: string; label: string; end?: boolean }[] }[] = [
  {
    label: "INTELLIGENCE",
    items: [
      { path: "/", label: "Intelligence Dashboard", end: true },
    ],
  },
  {
    label: "ANALYTICS",
    items: [
      { path: "/ga4", label: "GA4 Analytics Hub" },
      { path: "/organic", label: "Organic Intelligence" },
      { path: "/ppc", label: "PPC Intelligence" },
    ],
  },
  {
    label: "STRATEGY",
    items: [
      { path: "/seo", label: "SEO Playbook" },
      { path: "/email", label: "Email Lifecycle" },
      { path: "/social", label: "Social Authority" },
      { path: "/events", label: "Event Revenue" },
    ],
  },
  {
    label: "PERFORMANCE",
    items: [
      { path: "/content", label: "Content & Channel" },
      { path: "/cadence", label: "Execution Cadence" },
    ],
  },
  {
    label: "SYSTEM",
    items: [
      { path: "/health", label: "Data Health" },
    ],
  },
];

export default function Sidebar() {
  return (
    <nav className="sidebar">
      <div className="sidebar-logo">
        <div className="sidebar-logo-text">
          <span className="sidebar-logo-av">Av/</span>
          <span className="sidebar-logo-core">Intel</span>
          <span className="sidebar-logo-os">OS</span>
        </div>
        <div className="sidebar-sub">Intelligence Operating System</div>
      </div>

      {NAV_GROUPS.map((group) => (
        <div key={group.label}>
          <div className="nav-group-label">{group.label}</div>
          {group.items.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              end={item.end}
              className={({ isActive }) => `nav-item${isActive ? " active" : ""}`}
            >
              <span>{item.label}</span>
            </NavLink>
          ))}
        </div>
      ))}

      <div className="sidebar-footer">GlobalAir.com · v2.0</div>
    </nav>
  );
}
