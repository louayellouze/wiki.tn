"use client";

import { Logo } from "@/components/logo";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { NAV_DATA } from "./data";
import { ArrowLeftIcon, ChevronUp } from "./icons";
import { MenuItem } from "./menu-item";
import { useSidebarContext } from "./sidebar-context";
import { getUserRole } from "@/services/auth.service";

export function Sidebar() {
  const pathname = usePathname();
  const { setIsOpen, isOpen, isMobile, toggleSidebar } = useSidebarContext();
  const [expandedItems, setExpandedItems] = useState<string[]>([]);
  const [userRole, setUserRole] = useState<string | null>(null);

  useEffect(() => {
    setUserRole(getUserRole());
  }, []);

  const toggleExpanded = (title: string) => {
    setExpandedItems((prev) => (prev.includes(title) ? [] : [title]));
  };

  useEffect(() => {
    NAV_DATA.some((section) =>
      section.items.some((item) => {
        const subItems = item.items as Array<{ title: string; url: string }>;
        return subItems.some((subItem) => {
          if (subItem.url === pathname && !expandedItems.includes(item.title)) {
            toggleExpanded(item.title);
            return true;
          }
          return false;
        });
      }),
    );
  }, [pathname]);

  return (
    <>
      {isMobile && isOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm"
          onClick={() => setIsOpen(false)}
          aria-hidden="true"
        />
      )}

      <aside
        className={cn(
          "max-w-[260px] overflow-hidden transition-[width] duration-300 ease-in-out z-50",
          "border-r border-white/[0.05]",
          "bg-gradient-to-b from-[#040d18] via-[#030812] to-[#020610]",
          isMobile ? "fixed bottom-0 top-0" : "sticky top-0 h-screen",
          isOpen ? "w-full" : "w-0",
        )}
        aria-label="Navigation principale"
      >
        <div className="flex h-full flex-col gap-6 px-4 py-6">

          {/* Logo */}
          <div className="flex items-center justify-between px-2">
            <Link href="/" onClick={() => isMobile && toggleSidebar()}>
              <Logo />
            </Link>
            {isMobile && (
              <button onClick={toggleSidebar} className="p-2 rounded-lg hover:bg-white/5 text-slate-500">
                <ArrowLeftIcon className="size-5" />
              </button>
            )}
          </div>

          {/* Navigation */}
          <nav className="flex-1 overflow-y-auto no-scrollbar space-y-6">
            {NAV_DATA.map((section) => {
              const role = (userRole || "").toUpperCase();

              const filtered = section.items.filter((item) => {
                if (item.title === "Utilisateurs" || item.title === "Historique") {
                  return role.includes("ADMIN");
                }
                return true;
              });

              if (!filtered.length) return null;

              return (
                <div key={section.label}>
                  <p className="section-header px-3 mb-2">{section.label}</p>
                  <ul className="space-y-0.5">
                    {filtered.map((item) =>
                      item.items.length ? (
                        <li key={item.title}>
                          <MenuItem
                            isActive={(item.items as Array<{url:string}>).some(({ url }) => url === pathname)}
                            onClick={() => toggleExpanded(item.title)}
                          >
                            <item.icon className="size-4 shrink-0" />
                            <span>{item.title}</span>
                            <ChevronUp
                              className={cn(
                                "ml-auto size-3 rotate-180 transition-transform duration-200",
                                expandedItems.includes(item.title) && "rotate-0",
                              )}
                            />
                          </MenuItem>

                          {expandedItems.includes(item.title) && (
                            <ul className="ml-7 mt-0.5 space-y-0.5 border-l border-white/[0.05] pl-3">
                              {(item.items as Array<{title:string; url:string}>).map((sub) => (
                                <li key={sub.title}>
                                  <MenuItem as="link" href={sub.url} isActive={pathname === sub.url}>
                                    <span>{sub.title}</span>
                                  </MenuItem>
                                </li>
                              ))}
                            </ul>
                          )}
                        </li>
                      ) : (
                        <li key={item.title}>
                          <MenuItem
                            as="link"
                            href={(item as any).url ?? "/" + item.title.toLowerCase().replace(/\s+/g, "-")}
                            isActive={pathname === ((item as any).url ?? "/")}
                          >
                            <item.icon className="size-4 shrink-0" />
                            <span>{item.title}</span>
                          </MenuItem>
                        </li>
                      ),
                    )}
                  </ul>
                </div>
              );
            })}
          </nav>

          {/* Footer */}
          <div className="px-2 py-3 border-t border-white/[0.05]">
            <div className="flex items-center gap-2">
              <div className="live-dot"><span /><span /></div>
              <span className="section-header">v2.0 — Wiki Admin</span>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}
