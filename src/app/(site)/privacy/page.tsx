import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy Policy · Onapookkal",
  description:
    "How Onapookkal collects, uses and protects your personal data, compliant with Indian data protection law.",
};

export default function PrivacyPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-14 sm:px-6">
      <h1 className="font-display text-3xl font-semibold sm:text-4xl">Privacy Policy</h1>
      <p className="mt-2 text-sm text-muted">Last updated: August 2026</p>

      <div className="prose-onapookkal mt-8 space-y-6 text-sm leading-relaxed text-muted">
        <section>
          <h2 className="font-display text-lg font-semibold text-ink">1. Who we are</h2>
          <p>
            Onapookkal ("we", "us", "our") is a flower delivery service based in Kannur, Kerala
            (pincode 670643), India. We deliver fresh Onam flowers and pookalam kits. This Privacy
            Policy explains how we collect, use, store and protect your personal data when you use
            our website, onapookkal.store, in accordance with Indian law — including the
            Information Technology Act, 2000 (and its rules) and the Digital Personal Data
            Protection Act, 2023 (DPDP Act).
          </p>
        </section>

        <section>
          <h2 className="font-display text-lg font-semibold text-ink">2. Data we collect</h2>
          <p>When you place an order or contact us, we collect only what is needed to fulfil it:</p>
          <ul className="mt-2 list-disc space-y-1 pl-5">
            <li>Your name</li>
            <li>Your phone number (used for order confirmation and delivery)</li>
            <li>Delivery address, pincode, and (optionally) your shared location</li>
            <li>Order details — the flowers you choose, quantities, and delivery date</li>
            <li>Any notes you add to the order</li>
            <li>Email address, only if you choose to provide it</li>
          </ul>
          <p className="mt-2">
            We do <strong>not</strong> collect payment card numbers or UPI credentials. Payments
            (Razorpay/UPI) are processed by the payment provider's own secure checkout.
          </p>
        </section>

        <section>
          <h2 className="font-display text-lg font-semibold text-ink">3. How we use your data</h2>
          <p>Your personal data is used only for:</p>
          <ul className="mt-2 list-disc space-y-1 pl-5">
            <li>Processing and confirming your order</li>
            <li>Delivering your flowers to the address you provide</li>
            <li>Contacting you about your order (e.g. delivery updates)</li>
            <li>Answering your questions and support requests</li>
            <li>Maintaining order records as required by law</li>
          </ul>
          <p className="mt-2">
            We do not sell your data or use it for unsolicited marketing.
          </p>
        </section>

        <section>
          <h2 className="font-display text-lg font-semibold text-ink">4. Legal basis &amp; consent</h2>
          <p>
            We process your data on the basis of your consent, which you give when you place an
            order, and because it is necessary to perform the contract (delivering what you
            ordered). Under the DPDP Act, 2023, you have the right to withdraw consent at any time
            by contacting us — though we may need to retain certain records where required by law.
          </p>
        </section>

        <section>
          <h2 className="font-display text-lg font-semibold text-ink">5. Data sharing &amp; third parties</h2>
          <p>
            We share your delivery name, address and phone number only with our own delivery
            personnel, and only to the extent needed to deliver your order. If you choose to pay
            online, payment is handled by the payment gateway (Razorpay/UPI), which processes that
            data under its own privacy policy. We do not share your data with any other third
            party for marketing or any other purpose.
          </p>
        </section>

        <section>
          <h2 className="font-display text-lg font-semibold text-ink">6. Data retention</h2>
          <p>
            We keep order records for as long as needed to operate the business and to comply with
            applicable tax and accounting laws. When data is no longer needed, it is deleted.
          </p>
        </section>

        <section>
          <h2 className="font-display text-lg font-semibold text-ink">7. Security</h2>
          <p>
            We take reasonable security measures to protect your data from unauthorised access,
            alteration or disclosure, in line with the "reasonable security practices and
            procedures" required under Section 43A of the Information Technology Act, 2000 and the
            Information Technology (Reasonable Security Practices and Procedures and Sensitive
            Personal Data or Information) Rules, 2011. Data is stored on secured infrastructure and
            access is limited to authorised personnel only.
          </p>
        </section>

        <section>
          <h2 className="font-display text-lg font-semibold text-ink">8. Cookies &amp; tracking</h2>
          <p>
            Our website does not use third-party advertising cookies or cross-site tracking. We
            only use the essential local storage in your browser (e.g. to remember your cart while
            you shop). You can clear this at any time from your browser settings.
          </p>
        </section>

        <section>
          <h2 className="font-display text-lg font-semibold text-ink">9. Your rights</h2>
          <p>
            Under Indian data protection law you have the right to access, correct, update, and
            request deletion of your personal data, and to ask about how it is processed. To
            exercise any of these rights, contact our Grievance Officer below.
          </p>
        </section>

        <section>
          <h2 className="font-display text-lg font-semibold text-ink">10. Grievance Officer</h2>
          <p>
            For any privacy-related query, complaint, or to exercise your rights, contact our
            Grievance Officer:
          </p>
          <p className="mt-2 rounded-xl bg-paper p-4 shadow-soft">
            Name: Aanand AB
            <br />
            Kannur, Kerala — 670643, India
            <br />
            WhatsApp: +91 70340 26295
            <br />
            Email: aanandab44@gmail.com
          </p>
        </section>

        <section>
          <h2 className="font-display text-lg font-semibold text-ink">11. Governing law &amp; jurisdiction</h2>
          <p>
            This policy and any dispute arising from it are governed by the laws of India, and are
            subject to the exclusive jurisdiction of the courts at Kannur, Kerala.
          </p>
        </section>

        <section>
          <h2 className="font-display text-lg font-semibold text-ink">12. Changes to this policy</h2>
          <p>
            We may update this policy from time to time. The latest version will always be
            available on this page, and significant changes will be highlighted here.
          </p>
        </section>

        <section>
          <h2 className="font-display text-lg font-semibold text-ink">13. Contact</h2>
          <p>
            Questions about this policy or your order? Reach us on WhatsApp at +91 70340 26295 or
            via the Contact page.
          </p>
        </section>
      </div>
    </div>
  );
}
