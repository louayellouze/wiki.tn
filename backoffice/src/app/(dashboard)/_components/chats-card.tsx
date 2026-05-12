import { DotIcon } from "@/assets/icons";
import { formatMessageTime } from "@/lib/format-message-time";
import { cn } from "@/lib/utils";
import Image from "next/image";
import Link from "next/link";
import { getChatsData } from "../fetch";

export async function ChatsCard() {
  const data = await getChatsData();

  return (
    <div className="glass-premium rounded-2xl py-6 shadow-card-2">
      <div className="flex items-center justify-between px-7.5 mb-6">
        <div className="flex items-center gap-2">
            <h2 className="text-body-2xlg font-bold text-white uppercase tracking-wider">
                Flux d'activité
            </h2>
            <span className="rounded-full bg-blue-500/20 px-2 py-0.5 text-[10px] font-bold text-blue-400 uppercase tracking-widest">
                Real-time
            </span>
        </div>
      </div>

      <ul className="space-y-1">
        {data.slice(0, 5).map((chat, key) => (
          <li key={key} className="relative">
            <Link
              href="/"
              className="flex items-center gap-4.5 px-7.5 py-4 outline-none transition-all hover:bg-white/5 group"
            >
              <div className="relative shrink-0">
                <Image
                  src={chat.profile}
                  width={48}
                  height={48}
                  className="size-12 rounded-full object-cover border-2 border-indigo-500/20 group-hover:border-indigo-500/50 transition-all shadow-lg"
                  alt={"Avatar for " + chat.name}
                />
                
                <span
                  className={cn(
                    "absolute bottom-0 right-0 size-3 rounded-full ring-2 ring-[#010409]",
                    chat.isActive ? "bg-emerald-500" : "bg-orange-light",
                  )}
                />
              </div>

              <div className="relative flex-grow min-w-0">
                <div className="flex justify-between items-start mb-0.5">
                    <h3 className="font-bold text-white text-sm truncate pr-2">
                      {chat.name}
                    </h3>
                    <time
                      className="text-[10px] font-bold text-gray-500 uppercase shrink-0"
                      dateTime={chat.lastMessage.timestamp}
                    >
                      {formatMessageTime(chat.lastMessage.timestamp)}
                    </time>
                </div>

                <p className="text-xs font-medium text-gray-400 truncate leading-relaxed">
                    {chat.lastMessage.content}
                </p>

                {!!chat.unreadCount && (
                  <div className="absolute -right-1 top-1/2 -translate-y-1/2 h-2 w-2 rounded-full bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.8)]"></div>
                )}
              </div>
            </Link>
          </li>
        ))}
      </ul>

      <div className="px-7.5 mt-6">
        <Link 
            href="/" 
            className="flex items-center justify-center w-full py-3 rounded-xl bg-white/5 border border-white/5 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] hover:bg-white/10 hover:text-white transition-all"
        >
            Journal Complet
            <svg className="ml-2 w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
        </Link>
      </div>
    </div>
  );
}
