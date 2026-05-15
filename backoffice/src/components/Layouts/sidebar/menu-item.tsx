import { cn } from "@/lib/utils";
import Link from "next/link";
import { useSidebarContext } from "./sidebar-context";

type BaseProps = {
  className?: string;
  children: React.ReactNode;
  isActive: boolean;
};

type Props = BaseProps &
  ({ as?: "button"; onClick: () => void } | { as: "link"; href: string });

export function MenuItem(props: Props) {
  const { toggleSidebar, isMobile } = useSidebarContext();

  const base = cn(
    "relative flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-[11px] font-bold uppercase tracking-[0.1em] transition-all duration-200 group/item",
    props.isActive
      ? [
          "text-primary",
          "bg-gradient-to-r from-primary/12 to-transparent",
          "border border-primary/20",
          "shadow-[0_2px_12px_rgba(0,166,81,0.08)]",
        ]
      : [
          "text-slate-500 border border-transparent",
          "hover:bg-white/[0.04] hover:text-slate-200 hover:border-white/[0.06]",
        ],
    props.className,
  );

  const content = (
    <>
      {/* Active left indicator */}
      {props.isActive && (
        <span className="absolute left-0 top-1/2 -translate-y-1/2 h-5 w-0.5 bg-primary rounded-r-full shadow-[0_0_6px_rgba(0,166,81,0.6)]" />
      )}
      {props.children}
    </>
  );

  if (props.as === "link") {
    return (
      <Link
        href={props.href}
        onClick={() => isMobile && toggleSidebar()}
        className={base}
      >
        {content}
      </Link>
    );
  }

  return (
    <button
      onClick={props.onClick}
      aria-expanded={props.isActive}
      className={base}
    >
      {content}
    </button>
  );
}
