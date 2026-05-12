import Image from "next/image";

export function Logo() {
  return (
    <div className="relative h-12 max-w-[14rem]">
      <Image
        src="/images/logo/logo-wiki.svg"
        fill
        alt="Wiki Logo"
        role="presentation"
        priority
      />
    </div>
  );
}
