"use client";

import {
  Dropdown,
  DropdownContent,
  DropdownTrigger,
} from "@/components/ui/dropdown";
import { useIsMobile } from "@/hooks/use-mobile";
import { cn } from "@/lib/utils";
import Image from "next/image";
import Link from "next/link";
import { useState, useEffect } from "react";
import { BellIcon } from "./icons";
import { getUnreadNotifications, markAsRead, markAllAsRead, NotificationResponse } from "@/services/notification.service";

export function Notification() {
  const [isOpen, setIsOpen] = useState(false);
  const isMobile = useIsMobile();
  const [notifications, setNotifications] = useState<NotificationResponse[]>([]);

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 30000); // Poll every 30s
    return () => clearInterval(interval);
  }, []);

  const fetchNotifications = async () => {
    try {
      const data = await getUnreadNotifications();
      setNotifications(data);
    } catch (err) {
      console.error("Failed to fetch notifications", err);
    }
  };

  const handleMarkAsRead = async (id: number) => {
    try {
      await markAsRead(id);
      setNotifications(prev => prev.filter(n => n.id !== id));
    } catch (err) {
      console.error(err);
    }
  };

  const handleMarkAllAsRead = async () => {
      try {
          await markAllAsRead();
          setNotifications([]);
          setIsOpen(false);
      } catch (err) {
          console.error(err);
      }
  };

  return (
    <Dropdown
      isOpen={isOpen}
      setIsOpen={setIsOpen}
    >
      <DropdownTrigger
        className="grid size-12 place-items-center rounded-full border bg-gray-2 text-dark outline-none hover:text-primary focus-visible:border-primary focus-visible:text-primary dark:border-dark-4 dark:bg-dark-3 dark:text-white dark:focus-visible:border-primary"
        aria-label="View Notifications"
      >
        <span className="relative">
          <BellIcon />

          {notifications.length > 0 && (
            <span
              className={cn(
                "absolute right-0 top-0 z-1 size-2 rounded-full bg-red-light ring-2 ring-gray-2 dark:ring-dark-3",
              )}
            >
              <span className="absolute inset-0 -z-1 animate-ping rounded-full bg-red-light opacity-75" />
            </span>
          )}
        </span>
      </DropdownTrigger>

      <DropdownContent
        align={isMobile ? "end" : "center"}
        className="border border-stroke bg-white px-3.5 py-3 shadow-md dark:border-dark-3 dark:bg-gray-dark min-[350px]:min-w-[20rem]"
      >
        <div className="mb-1 flex items-center justify-between px-2 py-1.5">
          <span className="text-lg font-medium text-dark dark:text-white">
            Notifications
          </span>
          <span className="rounded-md bg-primary px-[9px] py-0.5 text-xs font-medium text-white">
            {notifications.length} actus
          </span>
        </div>

        <ul className="mb-3 max-h-[23rem] space-y-1.5 overflow-y-auto">
          {notifications.length === 0 ? (
              <li className="text-center py-4 text-sm text-gray-500">Aucune notification en attente.</li>
          ) : (
            notifications.map((item) => (
              <li key={item.id} role="menuitem">
                <div
                  onClick={() => handleMarkAsRead(item.id)}
                  className="flex items-center gap-4 cursor-pointer rounded-lg px-2 py-1.5 outline-none hover:bg-gray-2 focus-visible:bg-gray-2 dark:hover:bg-dark-3 dark:focus-visible:bg-dark-3"
                >
                  <div className="shrink-0 size-12 bg-primary/10 rounded-full flex items-center justify-center text-primary font-bold">
                    !
                  </div>

                  <div>
                    <strong className="block text-sm font-medium text-dark dark:text-white">
                      {item.type === 'NEW_CLIENT' ? 'Nouveau Client !' : 
                       item.type === 'ORDER_SUR_COMMANDE' ? 'Commande Spéciale !' : item.type}
                    </strong>

                    <span className="text-xs font-medium text-dark-5 dark:text-dark-6 line-clamp-2">
                      {item.message}
                    </span>
                    <span className="text-[10px] text-gray-400 mt-1 block">
                      {new Date(item.createdAt).toLocaleString('fr-FR')}
                    </span>
                  </div>
                </div>
              </li>
            ))
          )}
        </ul>

        {notifications.length > 0 && (
          <button
            onClick={handleMarkAllAsRead}
            className="w-full block rounded-lg border border-primary p-2 text-center text-sm font-medium tracking-wide text-primary outline-none transition-colors hover:bg-blue-light-5 focus:bg-blue-light-5 focus:text-primary focus-visible:border-primary dark:border-dark-3 dark:text-dark-6 dark:hover:border-dark-5 dark:hover:bg-dark-3 dark:hover:text-dark-7 dark:focus-visible:border-dark-5 dark:focus-visible:bg-dark-3 dark:focus-visible:text-dark-7"
          >
            Tout marquer comme lu
          </button>
        )}
      </DropdownContent>
    </Dropdown>
  );
}
