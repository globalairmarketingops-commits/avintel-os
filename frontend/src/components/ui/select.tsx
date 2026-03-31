import * as React from "react";
import { cn } from "@/lib/utils";

interface SelectProps {
  value?: string;
  onValueChange?: (value: string) => void;
  defaultValue?: string;
  children: React.ReactNode;
}

const SelectContext = React.createContext<{ value: string; onValueChange: (v: string) => void; open: boolean; setOpen: (o: boolean) => void }>({
  value: "",
  onValueChange: () => {},
  open: false,
  setOpen: () => {},
});

function Select({ value, onValueChange, defaultValue, children }: SelectProps) {
  const [internal, setInternal] = React.useState(defaultValue ?? "");
  const [open, setOpen] = React.useState(false);
  const current = value ?? internal;
  const change = onValueChange ?? setInternal;
  return (
    <SelectContext.Provider value={{ value: current, onValueChange: change, open, setOpen }}>
      <div style={{ position: "relative", display: "inline-block" }}>{children}</div>
    </SelectContext.Provider>
  );
}

function SelectTrigger({ className, children, ...props }: React.HTMLAttributes<HTMLButtonElement>) {
  const ctx = React.useContext(SelectContext);
  return (
    <button
      className={cn(
        "flex h-9 w-full items-center justify-between rounded-md border border-gray-200 bg-transparent px-3 py-2 text-sm shadow-sm placeholder:text-gray-500",
        className
      )}
      onClick={() => ctx.setOpen(!ctx.open)}
      {...props}
    >
      {children}
      <span style={{ marginLeft: 8, fontSize: 10 }}>&#9660;</span>
    </button>
  );
}

function SelectValue({ placeholder }: { placeholder?: string }) {
  const ctx = React.useContext(SelectContext);
  return <span>{ctx.value || placeholder || ""}</span>;
}

function SelectContent({ className, children, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  const ctx = React.useContext(SelectContext);
  if (!ctx.open) return null;
  return (
    <div
      className={cn("absolute z-50 mt-1 min-w-[8rem] overflow-hidden rounded-md border bg-white shadow-md", className)}
      {...props}
    >
      <div style={{ padding: 4 }}>{children}</div>
    </div>
  );
}

interface SelectItemProps extends React.HTMLAttributes<HTMLDivElement> {
  value: string;
}

function SelectItem({ value, className, children, ...props }: SelectItemProps) {
  const ctx = React.useContext(SelectContext);
  return (
    <div
      className={cn(
        "cursor-pointer select-none rounded-sm px-2 py-1.5 text-sm hover:bg-gray-100",
        ctx.value === value && "bg-gray-100 font-medium",
        className
      )}
      onClick={() => { ctx.onValueChange(value); ctx.setOpen(false); }}
      {...props}
    >
      {children}
    </div>
  );
}

export { Select, SelectTrigger, SelectValue, SelectContent, SelectItem };
