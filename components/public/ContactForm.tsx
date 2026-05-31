"use client";

import { useActionState, type ReactNode } from "react";
import { useTranslations } from "next-intl";
import { submitContact, type ContactState } from "@/lib/actions/contact";

const initial: ContactState = { status: "idle" };
const fieldClass =
  "mt-1 w-full border-b border-rule bg-transparent py-3 outline-none transition-colors focus:border-fg";

export function ContactForm() {
  const t = useTranslations("contact.form");
  const [state, action, pending] = useActionState(submitContact, initial);

  const err = (key: "name" | "email" | "subject" | "message") =>
    state.errors?.[key] ? t(state.errors[key]!) : undefined;

  return (
    <form action={action} className="grid gap-6 text-left" noValidate>
      {/* Honeypot — hidden from people, tempting to bots. */}
      <input
        type="text"
        name="company"
        tabIndex={-1}
        autoComplete="off"
        aria-hidden
        className="absolute -left-[9999px]"
      />

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
        <Field id="name" label={t("name")} error={err("name")}>
          <input id="name" name="name" className={fieldClass} />
        </Field>
        <Field id="email" label={t("email")} error={err("email")}>
          <input id="email" name="email" type="email" autoComplete="email" className={fieldClass} />
        </Field>
      </div>
      <Field id="subject" label={t("subject")} error={err("subject")}>
        <input id="subject" name="subject" className={fieldClass} />
      </Field>
      <Field id="message" label={t("message")} error={err("message")}>
        <textarea id="message" name="message" rows={5} className={fieldClass} />
      </Field>

      <div className="flex items-center gap-6 pt-2">
        <button
          type="submit"
          disabled={pending}
          className="border border-fg px-8 py-3 text-small uppercase tracking-wider transition-colors hover:bg-fg hover:text-bg disabled:opacity-50"
        >
          {pending ? t("sending") : t("send")}
        </button>
        {state.status === "success" ? (
          <p className="text-small text-fg-muted" role="status">
            {t("success")}
          </p>
        ) : state.status === "error" ? (
          <p className="text-small text-danger" role="alert">
            {t("error")}
          </p>
        ) : null}
      </div>
    </form>
  );
}

function Field({
  id,
  label,
  error,
  children,
}: {
  id: string;
  label: string;
  error?: string | undefined;
  children: ReactNode;
}) {
  return (
    <div>
      <label htmlFor={id} className="text-small uppercase tracking-wider text-fg-muted">
        {label}
      </label>
      {children}
      {error ? <p className="mt-2 text-small text-danger">{error}</p> : null}
    </div>
  );
}
