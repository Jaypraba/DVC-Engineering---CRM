import type { Metadata } from "next";
import { Container } from "@/components/ui/Container";
import { Eyebrow } from "@/components/ui/Eyebrow";
import { Prose } from "@/components/ui/Prose";
import { site } from "@/lib/site";

export const metadata: Metadata = {
  title: "Privacy",
  description: "How 100mm handles personal data.",
};

/**
 * NOTE: drafted to match what the site actually does technically. It has not
 * been reviewed by a solicitor — get it checked before launch, and update the
 * ICO registration number and effective date below.
 */
const EFFECTIVE = "30 August 2026";

export default function PrivacyPage() {
  return (
    <div className="pb-section pt-16 md:pt-24">
      <Container>
        <Eyebrow>Legal</Eyebrow>
        <h1 className="mt-7 font-display text-display-lg">Privacy</h1>
        <p className="mt-6 text-sm text-grey-500">Effective {EFFECTIVE}</p>

        <div className="mt-14 border-t border-grey-200 pt-14">
          <Prose>
            <p>
              {site.legalName} ({site.name}) is the data controller for personal data collected through this website.
              This notice explains what we collect, why, and what you can ask us to do about it.
            </p>

            <h2>What we collect</h2>
            <ul>
              <li>
                <strong>Site visit bookings.</strong> Your name, email address, telephone number, the address and
                postcode of the property, the project type and anticipated value, your preferred timing and any notes
                you add.
              </li>
              <li>
                <strong>Payment information.</strong> Card details are collected and processed by Stripe. They are
                never sent to, seen by, or stored on our servers. We receive confirmation that a payment succeeded and
                the billing details Stripe passes back.
              </li>
              <li>
                <strong>Correspondence.</strong> Emails and calls you send us, kept as a record of the engagement.
              </li>
            </ul>

            <h2>Why we hold it</h2>
            <p>
              To arrange and carry out the site visit you have paid for, to prepare and send your report, to keep our
              accounting records, and to contact you about your project. Our lawful bases are performance of a contract
              with you and, for accounting records, compliance with a legal obligation.
            </p>
            <p>
              We do not sell your data, and we do not use it for marketing unless you ask us to.
            </p>

            <h2>Who we share it with</h2>
            <ul>
              <li>Stripe, which processes payments on our behalf.</li>
              <li>
                {site.sister.name}, our sister structural engineering consultancy, whose engineer attends the visit and
                contributes to the report.
              </li>
              <li>Our accountants and professional advisers, where required.</li>
              <li>Any authority we are legally obliged to disclose to.</li>
            </ul>

            <h2>How long we keep it</h2>
            <p>
              Booking and project records are kept for six years after the end of the engagement, in line with limitation
              periods and HMRC requirements. Enquiries that never become bookings are deleted after twelve months.
            </p>

            <h2>Your rights</h2>
            <p>
              You can ask us for a copy of the personal data we hold about you, ask us to correct it, ask us to delete
              it where we are not required to keep it, object to processing, or ask us to restrict it. Write to{" "}
              <a href={`mailto:${site.email}`}>{site.email}</a> and we will respond within one month.
            </p>
            <p>
              If you are not satisfied with our response you can complain to the Information Commissioner&rsquo;s Office
              at <a href="https://ico.org.uk">ico.org.uk</a>.
            </p>

            <h2>Cookies</h2>
            <p>
              This site sets no analytics or advertising cookies. Stripe sets cookies on its own checkout pages, which
              are necessary for the payment to work and are governed by Stripe&rsquo;s privacy policy.
            </p>
          </Prose>
        </div>
      </Container>
    </div>
  );
}
