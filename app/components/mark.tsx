export function Mark({ tone = "forest", className = "h-9 w-11" }: { tone?: "forest" | "cream"; className?: string }) {
  return (
    <span
      aria-hidden="true"
      className={`inline-block shrink-0 ${tone === "cream" ? "bg-[#F6F1E7]" : "bg-[#1F4D3A]"} ${className}`}
      style={{
        WebkitMaskImage: "url(/mark.png)",
        maskImage: "url(/mark.png)",
        WebkitMaskRepeat: "no-repeat",
        maskRepeat: "no-repeat",
        WebkitMaskPosition: "center",
        maskPosition: "center",
        WebkitMaskSize: "contain",
        maskSize: "contain",
        maskMode: "alpha",
      }}
    />
  );
}
