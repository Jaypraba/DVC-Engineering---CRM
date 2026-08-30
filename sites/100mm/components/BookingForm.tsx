"use client";

import { useState } from "react";
import { useSearchParams } from "next/navigation";
import { bookingSchema, type BookingInput } from "@/lib/booking";
import { projectTypes, projectValueBands } from "@/lib/site";
import { Field, Input, Select, Textarea } from "@/components/ui/Field";
import { ButtonAction } from "@/components/ui/Button";

const empty: BookingInput = {
  name: "",
  email: "",
  phone: "",
  postcode: "",
  address: "",
  projectType: projectTypes[0],
  valueBand: projectValueBands[0],
  timing: "",
  notes: "",
};

export function BookingForm({ priceLabel }: { priceLabel: string }) {
  const searchParams = useSearchParams();
  const cancelled = searchParams.get("cancelled") === "1";

  const [values, setValues] = useState<BookingInput>(empty);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  function update<K extends keyof BookingInput>(key: K, value: BookingInput[K]) {
    setValues((current) => ({ ...current, [key]: value }));
    setErrors((current) => {
      if (!current[key as string]) return current;
      const next = { ...current };
      delete next[key as string];
      return next;
    });
  }

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setFormError(null);

    const parsed = bookingSchema.safeParse(values);
    if (!parsed.success) {
      const fieldErrors: Record<string, string> = {};
      for (const issue of parsed.error.issues) {
        const key = String(issue.path[0] ?? "");
        if (key && !fieldErrors[key]) fieldErrors[key] = issue.message;
      }
      setErrors(fieldErrors);
      return;
    }

    setSubmitting(true);
    try {
      const response = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(parsed.data),
      });
      const data = (await response.json()) as { url?: string; error?: string; fieldErrors?: Record<string, string> };

      if (!response.ok || !data.url) {
        if (data.fieldErrors) setErrors(data.fieldErrors);
        setFormError(data.error ?? "Something went wrong. Please try again.");
        setSubmitting(false);
        return;
      }

      window.location.assign(data.url);
    } catch {
      setFormError("We could not reach the payment page. Please check your connection and try again.");
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={onSubmit} noValidate className="max-w-3xl">
      {cancelled ? (
        <p className="mb-10 border-l border-ink py-2 pl-5 text-sm text-grey-600">
          Payment was cancelled, nothing has been charged. Your details are still below if you would like to try again.
        </p>
      ) : null}

      <div className="grid gap-x-10 gap-y-8 sm:grid-cols-2">
        <Field label="Your name" htmlFor="name" error={errors.name}>
          <Input
            id="name"
            name="name"
            autoComplete="name"
            value={values.name}
            aria-invalid={Boolean(errors.name)}
            aria-describedby={errors.name ? "name-error" : undefined}
            onChange={(event) => update("name", event.target.value)}
          />
        </Field>

        <Field label="Email" htmlFor="email" error={errors.email}>
          <Input
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            value={values.email}
            aria-invalid={Boolean(errors.email)}
            aria-describedby={errors.email ? "email-error" : undefined}
            onChange={(event) => update("email", event.target.value)}
          />
        </Field>

        <Field label="Phone" htmlFor="phone" error={errors.phone}>
          <Input
            id="phone"
            name="phone"
            type="tel"
            autoComplete="tel"
            value={values.phone}
            aria-invalid={Boolean(errors.phone)}
            aria-describedby={errors.phone ? "phone-error" : undefined}
            onChange={(event) => update("phone", event.target.value)}
          />
        </Field>

        <Field label="Property postcode" htmlFor="postcode" error={errors.postcode}>
          <Input
            id="postcode"
            name="postcode"
            autoComplete="postal-code"
            value={values.postcode}
            aria-invalid={Boolean(errors.postcode)}
            aria-describedby={errors.postcode ? "postcode-error" : undefined}
            onChange={(event) => update("postcode", event.target.value)}
          />
        </Field>

        <Field label="Property address" htmlFor="address" error={errors.address} className="sm:col-span-2">
          <Input
            id="address"
            name="address"
            autoComplete="street-address"
            value={values.address}
            aria-invalid={Boolean(errors.address)}
            aria-describedby={errors.address ? "address-error" : undefined}
            onChange={(event) => update("address", event.target.value)}
          />
        </Field>

        <Field label="Project type" htmlFor="projectType" error={errors.projectType}>
          <Select
            id="projectType"
            name="projectType"
            value={values.projectType}
            onChange={(event) => update("projectType", event.target.value as BookingInput["projectType"])}
          >
            {projectTypes.map((type) => (
              <option key={type} value={type}>
                {type}
              </option>
            ))}
          </Select>
        </Field>

        <Field label="Anticipated project value" htmlFor="valueBand" error={errors.valueBand}>
          <Select
            id="valueBand"
            name="valueBand"
            value={values.valueBand}
            onChange={(event) => update("valueBand", event.target.value as BookingInput["valueBand"])}
          >
            {projectValueBands.map((band) => (
              <option key={band} value={band}>
                {band}
              </option>
            ))}
          </Select>
        </Field>

        <Field
          label="Preferred timing"
          htmlFor="timing"
          hint="Days of the week or weeks that suit you. We will confirm a slot by email."
          className="sm:col-span-2"
        >
          <Input
            id="timing"
            name="timing"
            value={values.timing}
            onChange={(event) => update("timing", event.target.value)}
          />
        </Field>

        <Field
          label="Anything we should know"
          htmlFor="notes"
          hint="Drawings already prepared, consents in place, access constraints, anything unusual."
          className="sm:col-span-2"
        >
          <Textarea
            id="notes"
            name="notes"
            value={values.notes}
            onChange={(event) => update("notes", event.target.value)}
          />
        </Field>
      </div>

      {formError ? (
        <p role="alert" className="mt-10 border-l border-ink py-2 pl-5 text-sm text-ink">
          {formError}
        </p>
      ) : null}

      <div className="mt-12 flex flex-col gap-5 border-t border-grey-200 pt-8 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm text-grey-500">
          {priceLabel} plus VAT, payable now. Report within five working days of the visit.
        </p>
        <ButtonAction type="submit" disabled={submitting}>
          {submitting ? "Taking you to payment…" : "Continue to payment"}
        </ButtonAction>
      </div>

      <p className="mt-6 text-xs text-grey-400">
        Payment is handled by Stripe. We never see or store your card details.
      </p>
    </form>
  );
}
