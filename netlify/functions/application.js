const json = (statusCode, body) => ({
  statusCode,
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify(body),
});

const requiredFields = [
  "fullName", "email", "phone", "address", "city", "state",
  "zip", "adults", "housing", "lookingFor", "whyWestwind",
];

const labels = {
  fullName: "Name", email: "Email", phone: "Phone", address: "Address",
  city: "City", state: "State", zip: "ZIP", adults: "Adults",
  children: "Children", childAges: "Ages of children",
  hasPets: "Currently owns pets", pets: "Current pets",
  labradorExperience: "Owned a Labrador before",
  dogExperience: "Puppy/training experience", housing: "Own or rent",
  landlordApproval: "Landlord approval", homeType: "Home type",
  fencedYard: "Fenced yard", yardSize: "Yard size",
  dogLocation: "Dog spends most time", activityLevel: "Activity level",
  aloneHours: "Hours alone", activities: "Exercise & activities",
  preferredSex: "Preferred sex", preferredColor: "Preferred color",
  purpose: "Primary interest", vetName: "Veterinarian name",
  vetContact: "Veterinarian contact", lookingFor: "Looking for in a Labrador",
  whyWestwind: "Why Westwind", additional: "Additional information",
};

const escapeHtml = (value) =>
  String(value ?? "").replace(/[&<>"']/g, (c) =>
    ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c])
  );

exports.handler = async (event) => {
  if (event.httpMethod !== "POST") return json(405, { error: "Method not allowed." });

  try {
    const body = JSON.parse(event.body || "{}");

    // Honeypot: accept bot submissions without sending email.
    if (body.website) return json(200, { ok: true });

    for (const key of requiredFields) {
      if (!String(body[key] || "").trim()) {
        return json(400, { error: `Missing required field: ${key}` });
      }
    }

    if (!/^\S+@\S+\.\S+$/.test(String(body.email)) ||
        JSON.stringify(body).length > 30000) {
      return json(400, { error: "Invalid application." });
    }

    const from = process.env.APPLICATION_FROM ||
      "Westwind Labradors <applications@westwindlabradors.com>";
    const to = process.env.APPLICATION_RECIPIENT ||
      "contact@westwindlabradors.com";

    if (!process.env.RESEND_API_KEY) {
      console.error("RESEND_API_KEY is not configured.");
      return json(500, { error: "Email service is not configured." });
    }

    const rows = Object.entries(labels)
      .filter(([key]) => String(body[key] ?? "").trim())
      .map(([key, label]) =>
        `<tr><td style="padding:8px 12px;border:1px solid #ddd;font-weight:600;vertical-align:top;">${escapeHtml(label)}</td><td style="padding:8px 12px;border:1px solid #ddd;">${escapeHtml(body[key])}</td></tr>`
      ).join("");

    const result = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from,
        to: [to],
        reply_to: String(body.email).trim(),
        subject: `New Puppy Application — ${String(body.fullName).trim()}`,
        html: `<div style="font-family:Arial,sans-serif;color:#222"><h1>Westwind Labradors</h1><h2>New Puppy Application</h2><table style="border-collapse:collapse;width:100%;max-width:800px">${rows}</table></div>`,
        text: Object.entries(labels)
          .filter(([key]) => String(body[key] ?? "").trim())
          .map(([key, label]) => `${label}: ${String(body[key]).trim()}`)
          .join("\n"),
      }),
    });

    const responseBody = await result.json().catch(() => ({}));
    if (!result.ok) {
      console.error("Resend error:", result.status, responseBody);
      return json(502, { error: "The email service could not send the application." });
    }

    return json(200, { ok: true, id: responseBody.id });
  } catch (error) {
    console.error("Application function error:", error);
    return json(500, { error: "Unable to submit application." });
  }
};
