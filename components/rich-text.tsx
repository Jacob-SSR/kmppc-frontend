"use client";

import { Fragment } from "react";
import { cn } from "@/lib/utils";

const URL_SPLIT_RE = /(https?:\/\/[^\s<>"]+)/g;
// ลิงก์แบบฝังชื่อ: [ชื่อที่แสดง](https://...)
const MD_LINK_SPLIT_RE = /(\[[^\]\n]+\]\(https?:\/\/[^\s)]+\))/g;
const MD_LINK_RE = /^\[([^\]\n]+)\]\((https?:\/\/[^\s)]+)\)$/;

/** แสดงข้อความโดยแปลง [ชื่อ](url) และ URL เปล่าให้เป็นลิงก์ที่กดได้ (เปิดแท็บใหม่) */
export function RichText({
  text,
  className,
  linkClassName,
}: {
  text: string;
  className?: string;
  linkClassName?: string;
}) {
  const linkClass = cn(
    "break-all underline underline-offset-2",
    linkClassName ?? "text-primary hover:opacity-80",
  );

  return (
    <span className={className}>
      {text.split(MD_LINK_SPLIT_RE).map((chunk, i) => {
        const md = chunk.match(MD_LINK_RE);
        if (md) {
          return (
            <a
              key={i}
              href={md[2]}
              target="_blank"
              rel="noopener noreferrer"
              className={linkClass}
            >
              {md[1]}
            </a>
          );
        }
        return (
          <Fragment key={i}>
            {chunk.split(URL_SPLIT_RE).map((part, j) =>
              part.startsWith("http://") || part.startsWith("https://") ? (
                <a
                  key={j}
                  href={part}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={linkClass}
                >
                  {part}
                </a>
              ) : (
                <Fragment key={j}>{part}</Fragment>
              ),
            )}
          </Fragment>
        );
      })}
    </span>
  );
}
