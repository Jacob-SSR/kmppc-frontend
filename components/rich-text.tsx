"use client";

import { Fragment, type ReactNode } from "react";
import { cn } from "@/lib/utils";

const URL_SPLIT_RE = /(https?:\/\/[^\s<>"]+)/g;
// ลิงก์/รูปแบบฝังชื่อ: [ชื่อ](https://...) และ ![ชื่อ](https://...)
const MD_LINK_SPLIT_RE = /(!?\[[^\]\n]*\]\(https?:\/\/[^\s)]+\))/g;
const MD_LINK_RE = /^(!?)\[([^\]\n]*)\]\((https?:\/\/[^\s)]+)\)$/;
// จัดรูปแบบตัวอักษร: **หนา**, __ขีดเส้นใต้__, *เอียง*
const STYLE_SPLIT_RE = /(\*\*[^*\n]+\*\*|__[^_\n]+__|\*[^*\n]+\*)/g;
// ขนาดหัวข้อ: "# ", "## ", "### " ต้นบรรทัด
const HEADING_RE = /^(#{1,3})\s+(.*)$/;

const headingClass: Record<number, string> = {
  1: "block text-2xl font-bold leading-snug",
  2: "block text-xl font-bold leading-snug",
  3: "block text-lg font-semibold leading-snug",
};

/** URL เปล่า → ลิงก์ */
function renderUrls(text: string, keyPrefix: string, linkClass: string) {
  return text.split(URL_SPLIT_RE).map((part, i) =>
    part.startsWith("http://") || part.startsWith("https://") ? (
      <a
        key={`${keyPrefix}u${i}`}
        href={part}
        target="_blank"
        rel="noopener noreferrer"
        className={linkClass}
      >
        {part}
      </a>
    ) : (
      <Fragment key={`${keyPrefix}u${i}`}>{part}</Fragment>
    ),
  );
}

/** **หนา** / *เอียง* / __ขีดเส้นใต้__ + URL เปล่า */
function renderStyled(text: string, keyPrefix: string, linkClass: string) {
  return text.split(STYLE_SPLIT_RE).map((part, i) => {
    const key = `${keyPrefix}s${i}`;
    if (part.startsWith("**") && part.endsWith("**") && part.length > 4) {
      return <strong key={key}>{renderUrls(part.slice(2, -2), key, linkClass)}</strong>;
    }
    if (part.startsWith("__") && part.endsWith("__") && part.length > 4) {
      return <u key={key}>{renderUrls(part.slice(2, -2), key, linkClass)}</u>;
    }
    if (part.startsWith("*") && part.endsWith("*") && part.length > 2) {
      return <em key={key}>{renderUrls(part.slice(1, -1), key, linkClass)}</em>;
    }
    return <Fragment key={key}>{renderUrls(part, key, linkClass)}</Fragment>;
  });
}

/** ลิงก์/รูปฝังชื่อ → จากนั้นจัดรูปแบบตัวอักษรในส่วนที่เหลือ */
function renderInline(text: string, keyPrefix: string, linkClass: string) {
  return text.split(MD_LINK_SPLIT_RE).map((chunk, i) => {
    const key = `${keyPrefix}m${i}`;
    const md = chunk.match(MD_LINK_RE);
    if (md) {
      if (md[1] === "!") {
        return (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            key={key}
            src={md[3]}
            alt={md[2]}
            className="my-2 max-h-96 w-auto max-w-full rounded-lg border border-border"
          />
        );
      }
      return (
        <a
          key={key}
          href={md[3]}
          target="_blank"
          rel="noopener noreferrer"
          className={linkClass}
        >
          {md[2]}
        </a>
      );
    }
    return <Fragment key={key}>{renderStyled(chunk, key, linkClass)}</Fragment>;
  });
}

/**
 * แสดงข้อความจัดรูปแบบ: # หัวข้อ, **หนา**, *เอียง*, __ขีดเส้นใต้__,
 * ![รูป](url), [ชื่อลิงก์](url) และ URL เปล่า — ใช้ร่วมกันทั้งบทความ
 * ความคิดเห็น กระทู้ และแชท
 */
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
  const lines = text.split("\n");

  return (
    <span className={className}>
      {lines.map((line, i): ReactNode => {
        const heading = line.match(HEADING_RE);
        if (heading) {
          return (
            <span key={i} className={headingClass[heading[1].length]}>
              {renderInline(heading[2], `l${i}`, linkClass)}
            </span>
          );
        }
        return (
          <Fragment key={i}>
            {renderInline(line, `l${i}`, linkClass)}
            {i < lines.length - 1 ? "\n" : null}
          </Fragment>
        );
      })}
    </span>
  );
}
