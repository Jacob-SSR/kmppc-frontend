"use client";

import { Fragment } from "react";
import { cn } from "@/lib/utils";

const URL_SPLIT_RE = /(https?:\/\/[^\s<>"]+)/g;

/** แสดงข้อความโดยแปลง URL เป็นลิงก์ที่กดได้ (เปิดแท็บใหม่) */
export function RichText({
  text,
  className,
  linkClassName,
}: {
  text: string;
  className?: string;
  linkClassName?: string;
}) {
  const parts = text.split(URL_SPLIT_RE);
  return (
    <span className={className}>
      {parts.map((part, i) =>
        part.startsWith("http://") || part.startsWith("https://") ? (
          <a
            key={i}
            href={part}
            target="_blank"
            rel="noopener noreferrer"
            className={cn(
              "break-all underline underline-offset-2",
              linkClassName ?? "text-primary hover:opacity-80",
            )}
          >
            {part}
          </a>
        ) : (
          <Fragment key={i}>{part}</Fragment>
        ),
      )}
    </span>
  );
}
