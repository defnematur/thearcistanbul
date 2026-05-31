"use server";

export type ContactErrors = Partial<Record<"name" | "email" | "subject" | "message", string>>;
export type ContactState = { status: "idle" | "success" | "error"; errors?: ContactErrors };

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function submitContact(
  _prev: ContactState,
  formData: FormData,
): Promise<ContactState> {
  // Honeypot: bots fill the hidden field. Silently succeed.
  if (String(formData.get("company") ?? "").trim()) return { status: "success" };

  const name = String(formData.get("name") ?? "").trim();
  const email = String(formData.get("email") ?? "").trim();
  const subject = String(formData.get("subject") ?? "").trim();
  const message = String(formData.get("message") ?? "").trim();

  const errors: ContactErrors = {};
  if (!name) errors.name = "required";
  if (!EMAIL.test(email)) errors.email = "invalidEmail";
  if (!subject) errors.subject = "required";
  if (message.length < 10) errors.message = "tooShort";
  if (Object.keys(errors).length > 0) return { status: "error", errors };

  // Email delivery (Resend) is wired in a later plan. For now, record server-side
  // so the form works end-to-end without secrets.
  console.info("[contact]", { name, email, subject, message });
  return { status: "success" };
}
