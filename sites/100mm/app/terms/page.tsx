import type { Metadata } from "next";
import { Container } from "@/components/ui/Container";
import { Eyebrow } from "@/components/ui/Eyebrow";
import { Prose } from "@/components/ui/Prose";
import { site, siteVisit, siteVisitPrice } from "@/lib/site";

export const metadata: Metadata = {
  title: "Terms",
  description: "Terms on which 100mm provides the paid site visit and written report.",
};

/**
 * NOTE: drafted to describe how the paid site visit actually works, including
 * the 14-day cancellation right that applies to distance consumer contracts
 * under the Consumer Contracts Regulations 2013. It has NOT been reviewed by a
 * solicitor. Get it checked, and confirm the company number and address, before
 * taking real payments.
 */
const EFFECTIVE = "30 August 2026";

export default function TermsPage() {
  return (
    <div className="pb-section pt-16 md:pt-24">
      <Container>
        <Eyebrow>Legal</Eyebrow>
        <h1 className="mt-7 font-display text-display-lg">Terms</h1>
        <p className="mt-6 text-sm text-grey-500">Effective {EFFECTIVE}</p>

        <div className="mt-14 border-t border-grey-200 pt-14">
          <Prose>
            <p>
              These terms apply to the site visit and written report supplied by {site.legalName}. They do not cover
              design, construction or project management work, which is contracted separately.
            </p>

            <h2>What you are buying</h2>
            <p>
              A single visit to the property you nominate, of approximately two hours, attended by an interior designer,
              a structural engineer and a contractor, followed by a written report issued within {siteVisit.reportDays}{" "}
              working days of the visit.
            </p>
            <p>
              The fee is {siteVisitPrice} {siteVisit.vatNote}, payable in full at the point of booking.
            </p>

            <h2>What it is not</h2>
            <ul>
              <li>It is not a structural calculation package, a building survey, or a condition or valuation report.</li>
              <li>It is not a planning or building control application, and it is not a party wall notice or award.</li>
              <li>
                It is not a fixed-price quotation. Cost figures in the report are bands based on what was visible and
                discussed on the day.
              </li>
              <li>It does not commit either of us to any further engagement.</li>
            </ul>

            <h2>What we need from you</h2>
            <p>
              Access to the property on the agreed date, and the authority to grant it. If you are not the owner, you
              confirm you have the owner&rsquo;s permission. Please give us any drawings, surveys, consents or reports
              you already hold before the visit; the report is only as good as the information available.
            </p>

            <h2>Cancellation and refunds</h2>
            <ul>
              <li>
                <strong>Your statutory right.</strong> As this contract is made at a distance, if you are a consumer you
                may cancel within 14 days of booking and receive a full refund. If you ask us to carry out the visit
                inside that 14-day period and we do so, you lose the right to cancel once the service is fully
                performed, and we may charge for what has been supplied.
              </li>
              <li>
                <strong>Rescheduling.</strong> You can move the visit at no charge with more than five working days&rsquo;
                notice. Inside five working days we may retain up to 50% of the fee, because three diaries have been held.
              </li>
              <li>
                <strong>If we cannot attend.</strong> If we cannot offer you a date that works, or we cancel, you get a
                full refund.
              </li>
              <li>
                <strong>No access on the day.</strong> If we attend and cannot get into the property, the fee is not
                refundable.
              </li>
            </ul>

            <h2>The report</h2>
            <p>
              The report is prepared for you and you may share it with your own advisers or with another contractor. We
              accept no liability to any third party who relies on it. It reflects conditions observed on the day
              without opening up the structure; concealed defects cannot be reported on.
            </p>

            <h2>Liability</h2>
            <p>
              Nothing in these terms limits liability for death or personal injury caused by negligence, for fraud, or
              for anything else that cannot lawfully be limited. Subject to that, our total liability arising from the
              site visit and report is limited to ten times the fee paid.
            </p>
            <p>
              If you are a consumer, your statutory rights under the Consumer Rights Act 2015 — including that the
              service is carried out with reasonable care and skill — are unaffected by these terms.
            </p>

            <h2>Complaints and law</h2>
            <p>
              Write to <a href={`mailto:${site.email}`}>{site.email}</a> and we will respond within ten working days.
              These terms are governed by the law of England and Wales, and the courts of England and Wales have
              exclusive jurisdiction.
            </p>
          </Prose>
        </div>
      </Container>
    </div>
  );
}
