import { Mark } from "./mark";

export function LogoLoader({ label = "Loading", className = "py-10" }: { label?: string; className?: string }) {
  return (
    <div role="status" aria-label={label} className={`flex items-center justify-center ${className}`}>
      <span className="logo-loader inline-flex">
        <Mark className="h-16 w-20" />
      </span>
    </div>
  );
}
