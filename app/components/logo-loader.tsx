import { Mark } from "./mark";

export function LogoLoader({ label = "Loading" }: { label?: string }) {
  return (
    <div role="status" aria-label={label} className="fixed inset-0 z-[60] grid place-items-center">
      <span className="logo-loader inline-flex">
        <Mark className="h-16 w-20" />
      </span>
    </div>
  );
}
