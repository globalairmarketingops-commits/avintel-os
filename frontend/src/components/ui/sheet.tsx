import * as React from "react";
import { cn } from "@/lib/utils";

interface SheetProps {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  children: React.ReactNode;
}

const SheetContext = React.createContext<{ open: boolean; onOpenChange: (o: boolean) => void }>({
  open: false,
  onOpenChange: () => {},
});

function Sheet({ open = false, onOpenChange, children }: SheetProps) {
  return (
    <SheetContext.Provider value={{ open, onOpenChange: onOpenChange ?? (() => {}) }}>
      {children}
    </SheetContext.Provider>
  );
}

function SheetTrigger({ children, ...props }: React.HTMLAttributes<HTMLButtonElement>) {
  const ctx = React.useContext(SheetContext);
  return <button onClick={() => ctx.onOpenChange(true)} {...props}>{children}</button>;
}

function SheetContent({ className, children, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  const ctx = React.useContext(SheetContext);
  if (!ctx.open) return null;
  return (
    <>
      <div className="fixed inset-0 z-50 bg-black/50" onClick={() => ctx.onOpenChange(false)} />
      <div className={cn("fixed inset-y-0 right-0 z-50 w-96 bg-white shadow-xl p-6 overflow-y-auto", className)} {...props}>
        <button
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-900"
          onClick={() => ctx.onOpenChange(false)}
        >
          &#10005;
        </button>
        {children}
      </div>
    </>
  );
}

function SheetHeader({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("flex flex-col space-y-2 mb-4", className)} {...props} />;
}

function SheetTitle({ className, ...props }: React.HTMLAttributes<HTMLHeadingElement>) {
  return <h3 className={cn("text-lg font-semibold", className)} {...props} />;
}

function SheetDescription({ className, ...props }: React.HTMLAttributes<HTMLParagraphElement>) {
  return <p className={cn("text-sm text-gray-500", className)} {...props} />;
}

export { Sheet, SheetTrigger, SheetContent, SheetHeader, SheetTitle, SheetDescription };
