import { cn } from "@/lib/cn";

const control =
  "w-full border-b border-grey-300 bg-transparent py-3 text-ink placeholder:text-grey-400 transition-colors duration-brand ease-brand focus:border-ink focus:outline-none focus:ring-0";

export function Field({
  label,
  htmlFor,
  error,
  hint,
  className,
  children,
}: {
  label: string;
  htmlFor: string;
  error?: string;
  hint?: string;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <div className={cn("flex flex-col", className)}>
      <label htmlFor={htmlFor} className="text-eyebrow uppercase text-grey-500">
        {label}
      </label>
      <div className="mt-2">{children}</div>
      {error ? (
        <p id={`${htmlFor}-error`} role="alert" className="mt-2 text-sm text-ink">
          {error}
        </p>
      ) : hint ? (
        <p className="mt-2 text-sm text-grey-500">{hint}</p>
      ) : null}
    </div>
  );
}

export function Input({ className, ...props }: React.InputHTMLAttributes<HTMLInputElement>) {
  return <input className={cn(control, className)} {...props} />;
}

export function Textarea({ className, ...props }: React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return <textarea className={cn(control, "min-h-28 resize-y", className)} {...props} />;
}

export function Select({ className, children, ...props }: React.SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <select className={cn(control, "appearance-none rounded-none", className)} {...props}>
      {children}
    </select>
  );
}
