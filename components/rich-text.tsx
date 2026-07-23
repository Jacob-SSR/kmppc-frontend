"use client";

import { Fragment } from "react";
import { cn } from "@/lib/utils";

const URL_SPLIT_RE = /(https?:\/\/[^\s<>"]+)/g;
// ลิงก์/รูปแบบฝังชื่อ: [ชื่อ](https://...) และ ![ชื่อ](https://...)
const MD_LINK_SPLIT_RE = /(!?\[[^\]\n]*\]\(https?:\/\/[^\s)]+\))/g;
const MD_LINK_RE = /^(!?)\[([^\]\n]*)\]\((https?:\/\/[^\s)]+)\)$/;

/** แสดงข้อความโดยแปลง ![รูป](url), [ชื่อ](url) และ URL เปล่าให้กดได้/แสดงรูป */
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
          if (md[1] === "!") {
            return (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                key={i}
                src={md[3]}
                alt={md[2]}
                className="my-2 max-h-96 w-auto max-w-full rounded-lg border border-border"
              />
            );
          }
          return (
            <a
              key={i}
              href={md[3]}
              target="_blank"
              rel="noopener noreferrer"
              className={linkClass}
            >
              {md[2]}
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
