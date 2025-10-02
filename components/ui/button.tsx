import * as React from "react";

type Props = React.ButtonHTMLAttributes<HTMLButtonElement> & { variant?: "outline" | "secondary" };
export function Button({ variant, className, ...rest }: Props) {
  const base = "inline-flex items-center justify-center rounded-2xl px-4 py-2 text-sm border";
  const style =
    variant === "outline" ? " bg-white hover:bg-gray-50" :
    variant === "secondary" ? " bg-gray-100 hover:bg-gray-200" :
    " bg-white hover:bg-gray-50";
  return <button {...rest} className={[base, style, className].filter(Boolean).join(" ")} />;
}
