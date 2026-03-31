import { createContext, useContext, useState, useCallback, type ReactNode } from "react";
import type { RoleKey, ConfidenceLevel, RoleConfig } from "../types";

const ROLES: Record<RoleKey, RoleConfig> = {
  casey: { label: "Casey Jones", title: "Head of Marketing", showAll: true, hideProbable: false },
  clay: { label: "Clay Martin", title: "COO", showAll: true, hideProbable: false },
  jeffrey: { label: "Jeffrey Carrithers", title: "CEO", showAll: false, hideProbable: true },
};

interface RoleContextType {
  currentRole: RoleKey;
  roleConfig: RoleConfig;
  setRole: (role: RoleKey) => void;
  shouldShow: (confidence: ConfidenceLevel) => boolean;
  filterByConfidence: <T extends { confidence_level?: ConfidenceLevel; _confidence?: ConfidenceLevel }>(rows: T[]) => T[];
}

const RoleContext = createContext<RoleContextType | null>(null);

export function RoleProvider({ children }: { children: ReactNode }) {
  const [currentRole, setCurrentRole] = useState<RoleKey>("casey");

  const roleConfig = ROLES[currentRole];

  const shouldShow = useCallback(
    (confidence: ConfidenceLevel) => {
      if (roleConfig.showAll) return true;
      return confidence === "CONFIRMED";
    },
    [roleConfig]
  );

  const filterByConfidence = useCallback(
    <T extends { confidence_level?: ConfidenceLevel; _confidence?: ConfidenceLevel }>(rows: T[]): T[] => {
      if (roleConfig.showAll) return rows;
      return rows.filter((row) => {
        const c = row.confidence_level ?? row._confidence;
        return !c || c === "CONFIRMED";
      });
    },
    [roleConfig]
  );

  const setRole = useCallback((role: RoleKey) => {
    if (ROLES[role]) setCurrentRole(role);
  }, []);

  return (
    <RoleContext.Provider value={{ currentRole, roleConfig, setRole, shouldShow, filterByConfidence }}>
      {children}
    </RoleContext.Provider>
  );
}

export function useRole() {
  const ctx = useContext(RoleContext);
  if (!ctx) throw new Error("useRole must be used within RoleProvider");
  return ctx;
}

export { ROLES };
