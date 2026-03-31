import { useRole } from "../../contexts/RoleContext";
import type { RoleKey } from "../../types";

interface TopbarProps {
  pageTitle: string;
}

export default function Topbar({ pageTitle }: TopbarProps) {
  const { currentRole, setRole } = useRole();

  return (
    <header className="topbar">
      <div className="topbar-left">
        <div className="topbar-page">{pageTitle}</div>
      </div>
      <div className="topbar-right">
        <div className="hdr-role">
          {(["casey", "clay", "jeffrey"] as RoleKey[]).map((role) => (
            <button
              key={role}
              className={`role-btn${currentRole === role ? " active" : ""}`}
              onClick={() => setRole(role)}
            >
              {role.charAt(0).toUpperCase() + role.slice(1)}
            </button>
          ))}
        </div>
        <span className="hdr-date">Mar 30, 2026 · Sprint 1</span>
        <button className="hdr-btn" onClick={() => window.location.reload()}>
          ↻ Refresh
        </button>
      </div>
    </header>
  );
}
