import { Link } from 'react-router-dom';
import { ChevronLeft } from 'lucide-react';

export default function PrivacyPolicy() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
      <Link to="/" className="mb-6 inline-flex items-center gap-1 text-sm text-gray-500 hover:text-primary-600">
        <ChevronLeft className="h-4 w-4" /> Back to Home
      </Link>

      <h1 className="text-3xl font-bold text-gray-900">Privacy Policy</h1>
      <p className="mt-2 text-sm text-gray-500">Effective Date: August 18, 2026 &middot; Last Updated: August 18, 2026</p>

      <div className="prose prose-gray mt-8 max-w-none space-y-8 text-gray-700 leading-relaxed">

        <section>
          <h2 className="text-xl font-semibold text-gray-900">1. Introduction</h2>
          <p>
            NestFind ("we," "our," or "us") is committed to protecting your personal data and privacy in accordance with the <strong>Nigeria Data Protection Regulation (NDPR) 2019</strong>, the <strong>Nigeria Data Protection Act (NDPA) 2023</strong>, and other applicable Nigerian data protection laws and regulations enforced by the <strong>Nigeria Data Protection Commission (NDPC)</strong>.
          </p>
          <p>
            This Privacy Policy explains how we collect, use, disclose, store, and protect your personal information when you use our website, mobile application, and related services (collectively, the "Platform"). By using NestFind, you consent to the practices described in this policy.
          </p>
          <p>
            This policy applies to all users of NestFind, including guests, tenants, property hosts, and visitors, regardless of where you are located in Nigeria or abroad.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-gray-900">2. Data Controller</h2>
          <p>
            The data controller responsible for your personal data is NestFind, a technology platform registered and operating in the Federal Republic of Nigeria. If you have any questions about this Privacy Policy or our data practices, please contact us at:
          </p>
          <ul className="list-disc pl-6 space-y-1">
            <li>Email: <a href="mailto:privacy@nestfind.com" className="text-primary-600 hover:underline">privacy@nestfind.com</a></li>
            <li>Address: Lagos, Nigeria</li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-gray-900">3. Personal Data We Collect</h2>
          <p>We collect the following categories of personal data:</p>

          <h3 className="text-lg font-medium text-gray-900 mt-4">3.1 Data You Provide Directly</h3>
          <ul className="list-disc pl-6 space-y-1">
            <li><strong>Account Information:</strong> Full name, email address, phone number, password, profile avatar, and bio</li>
            <li><strong>Identity Verification:</strong> Government-issued identification details (where required for verification)</li>
            <li><strong>Property Listings:</strong> Property details, descriptions, images, pricing, addresses, and location data</li>
            <li><strong>Communications:</strong> Enquiries, messages, and correspondence sent through the Platform</li>
            <li><strong>Payment Information:</strong> Transaction details processed through Flutterwave (we do not store your full card details)</li>
            <li><strong>Booking Information:</strong> Rental or purchase booking details, lease terms, and payment records</li>
          </ul>

          <h3 className="text-lg font-medium text-gray-900 mt-4">3.2 Data Collected Automatically</h3>
          <ul className="list-disc pl-6 space-y-1">
            <li><strong>Device Information:</strong> Browser type, operating system, device type, and screen resolution</li>
            <li><strong>Usage Data:</strong> Pages visited, search queries, property views, time spent on pages, and navigation patterns</li>
            <li><strong>Log Data:</strong> IP address, access times, referring URLs, and error logs</li>
            <li><strong>Cookies and Similar Technologies:</strong> Session cookies, authentication tokens, and analytics cookies</li>
          </ul>

          <h3 className="text-lg font-medium text-gray-900 mt-4">3.3 Data from Third Parties</h3>
          <ul className="list-disc pl-6 space-y-1">
            <li><strong>Payment Processors:</strong> Transaction confirmations and status from Flutterwave</li>
            <li><strong>Social Login:</strong> If you register using a third-party authentication service</li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-gray-900">4. Legal Basis for Processing</h2>
          <p>Under the NDPA 2023 and NDPR 2019, we process your personal data based on one or more of the following lawful bases:</p>
          <ul className="list-disc pl-6 space-y-2">
            <li><strong>Consent:</strong> Where you have given us explicit consent to process your data for specific purposes (e.g., marketing communications)</li>
            <li><strong>Contractual Necessity:</strong> Where processing is necessary for the performance of a contract with you (e.g., facilitating property bookings and payments)</li>
            <li><strong>Legal Obligation:</strong> Where we are required to process data to comply with Nigerian laws, regulations, or court orders</li>
            <li><strong>Legitimate Interests:</strong> Where processing is necessary for our legitimate business interests (e.g., fraud prevention, platform security, service improvement), provided these interests do not override your fundamental rights</li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-gray-900">5. How We Use Your Data</h2>
          <p>We use your personal data for the following purposes:</p>
          <ul className="list-disc pl-6 space-y-1">
            <li>To provide, maintain, and improve the NestFind Platform</li>
            <li>To create and manage your user account</li>
            <li>To process property bookings, rentals, and purchases</li>
            <li>To process payments through Flutterwave and maintain transaction records</li>
            <li>To send welcome messages, booking confirmations, and transactional notifications</li>
            <li>To facilitate communication between tenants and property hosts</li>
            <li>To personalize your experience and provide property recommendations</li>
            <li>To send marketing communications (only with your consent)</li>
            <li>To detect, prevent, and address fraud, security breaches, and technical issues</li>
            <li>To comply with legal obligations and resolve disputes</li>
            <li>To generate anonymized analytics and aggregate data for platform improvement</li>
            <li>To verify user identity and maintain platform trust and safety</li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-gray-900">6. Data Sharing and Disclosure</h2>
          <p>We may share your personal data with the following categories of recipients:</p>
          <ul className="list-disc pl-6 space-y-2">
            <li><strong>Property Hosts/Tenants:</strong> Relevant information is shared between parties to facilitate bookings (e.g., name, contact details for confirmed bookings)</li>
            <li><strong>Flutterwave:</strong> Payment processing data is shared with Flutterwave to facilitate secure transactions. Flutterwave's use of your data is governed by their own privacy policy</li>
            <li><strong>Service Providers:</strong> Trusted third-party vendors who assist in operating our platform (hosting, analytics, email delivery), bound by data processing agreements</li>
            <li><strong>Legal Authorities:</strong> When required by Nigerian law, court orders, or regulatory requests from the NDPC or other competent authorities</li>
            <li><strong>Business Transfers:</strong> In connection with a merger, acquisition, or sale of assets, with prior notice to you</li>
          </ul>
          <p className="mt-3">We do <strong>not</strong> sell your personal data to third parties for their own marketing purposes.</p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-gray-900">7. International Data Transfers</h2>
          <p>
            Your data is primarily stored and processed within Nigeria. Where data is transferred outside Nigeria (e.g., to cloud hosting providers), we ensure adequate safeguards are in place in compliance with the NDPA 2023, including:
          </p>
          <ul className="list-disc pl-6 space-y-1">
            <li>Ensuring the recipient country has adequate data protection laws</li>
            <li>Implementing appropriate contractual clauses and security measures</li>
            <li>Obtaining your explicit consent where required</li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-gray-900">8. Data Retention</h2>
          <p>We retain your personal data for as long as necessary to fulfill the purposes outlined in this policy:</p>
          <ul className="list-disc pl-6 space-y-1">
            <li><strong>Account Data:</strong> Retained for the duration of your account and for 6 years after account closure (as required by Nigerian law)</li>
            <li><strong>Transaction Data:</strong> Retained for 7 years in compliance with the Companies Income Tax Act (CITA) and financial record-keeping requirements</li>
            <li><strong>Communication Data:</strong> Retained for 3 years from the date of the last communication</li>
            <li><strong>Usage/Analytics Data:</strong> Retained in anonymized form for up to 24 months</li>
          </ul>
          <p>
            Upon expiration of the retention period, data is securely deleted or anonymized so that it can no longer be associated with you.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-gray-900">9. Your Rights Under Nigerian Data Protection Law</h2>
          <p>Under the NDPA 2023 and NDPR 2019, you have the following rights:</p>
          <ul className="list-disc pl-6 space-y-2">
            <li><strong>Right of Access:</strong> You have the right to request confirmation of whether we process your personal data and to obtain a copy of that data</li>
            <li><strong>Right to Rectification:</strong> You have the right to request correction of inaccurate or incomplete personal data</li>
            <li><strong>Right to Erasure:</strong> You have the right to request deletion of your personal data, subject to our legal retention obligations</li>
            <li><strong>Right to Restrict Processing:</strong> You have the right to request that we limit how we use your data in certain circumstances</li>
            <li><strong>Right to Object:</strong> You have the right to object to the processing of your data for direct marketing or where processing is based on legitimate interests</li>
            <li><strong>Right to Data Portability:</strong> You have the right to receive your personal data in a structured, commonly used, machine-readable format</li>
            <li><strong>Right to Withdraw Consent:</strong> Where processing is based on consent, you may withdraw it at any time without affecting the lawfulness of prior processing</li>
            <li><strong>Right to Lodge a Complaint:</strong> You have the right to file a complaint with the Nigeria Data Protection Commission (NDPC) if you believe your rights have been violated</li>
          </ul>
          <p className="mt-3">
            To exercise any of these rights, please contact us at <a href="mailto:privacy@nestfind.com" className="text-primary-600 hover:underline">privacy@nestfind.com</a>. We will respond within 30 days of receiving your request.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-gray-900">10. Data Security</h2>
          <p>We implement appropriate technical and organizational security measures to protect your personal data, including:</p>
          <ul className="list-disc pl-6 space-y-1">
            <li>Encryption of data in transit (TLS/SSL) and at rest</li>
            <li>Secure authentication using JWT (JSON Web Tokens)</li>
            <li>Regular security assessments and vulnerability scanning</li>
            <li>Access controls limiting data access to authorized personnel only</li>
            <li>Secure payment processing through PCI DSS-compliant Flutterwave</li>
            <li>Regular data backups and disaster recovery procedures</li>
          </ul>
          <p className="mt-3">
            While we take all reasonable precautions, no method of transmission or storage is 100% secure. We encourage you to use strong passwords and keep your account credentials confidential.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-gray-900">11. Cookies and Tracking Technologies</h2>
          <p>We use the following types of cookies:</p>
          <ul className="list-disc pl-6 space-y-2">
            <li><strong>Essential Cookies:</strong> Required for platform functionality (authentication, session management)</li>
            <li><strong>Analytics Cookies:</strong> Help us understand how users interact with the platform (e.g., page views, search patterns)</li>
            <li><strong>Preference Cookies:</strong> Remember your settings and preferences</li>
          </ul>
          <p className="mt-3">
            You can control cookies through your browser settings. Disabling essential cookies may affect platform functionality.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-gray-900">12. Children's Privacy</h2>
          <p>
            NestFind is not intended for users under the age of 18. We do not knowingly collect personal data from children. If we become aware that a child has provided us with personal data, we will take steps to delete it promptly. If you believe a child has provided us with data, please contact us immediately.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-gray-900">13. Changes to This Privacy Policy</h2>
          <p>
            We may update this Privacy Policy from time to time to reflect changes in our practices, technology, legal requirements, or other factors. We will notify you of material changes by posting the updated policy on this page with a revised "Last Updated" date and, where appropriate, sending you a notification via email or through the Platform.
          </p>
          <p>
            We encourage you to review this policy periodically. Your continued use of NestFind after changes are posted constitutes your acceptance of the updated policy.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-gray-900">14. Contact Us</h2>
          <p>If you have any questions, concerns, or requests regarding this Privacy Policy or our data practices, please contact:</p>
          <div className="mt-3 rounded-xl bg-gray-50 p-4">
            <p className="font-medium text-gray-900">NestFind Data Protection Team</p>
            <p>Email: <a href="mailto:privacy@nestfind.com" className="text-primary-600 hover:underline">privacy@nestfind.com</a></p>
            <p>Address: Lagos, Nigeria</p>
            <p className="mt-2 text-sm text-gray-500">
              You may also contact the Nigeria Data Protection Commission (NDPC) at{' '}
              <a href="https://ndpc.gov.ng" target="_blank" rel="noopener noreferrer" className="text-primary-600 hover:underline">
                ndpc.gov.ng
              </a>
            </p>
          </div>
        </section>

      </div>
    </div>
  );
}
