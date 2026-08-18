import { Link } from 'react-router-dom';
import { ChevronLeft } from 'lucide-react';

export default function TermsOfService() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
      <Link to="/" className="mb-6 inline-flex items-center gap-1 text-sm text-gray-500 hover:text-primary-600">
        <ChevronLeft className="h-4 w-4" /> Back to Home
      </Link>

      <h1 className="text-3xl font-bold text-gray-900">Terms of Service</h1>
      <p className="mt-2 text-sm text-gray-500">Effective Date: August 18, 2026 &middot; Last Updated: August 18, 2026</p>

      <div className="prose prose-gray mt-8 max-w-none space-y-8 text-gray-700 leading-relaxed">

        <section>
          <h2 className="text-xl font-semibold text-gray-900">1. Acceptance of Terms</h2>
          <p>
            Welcome to NestFind. These Terms of Service ("Terms") constitute a legally binding agreement between you ("User," "you," or "your") and NestFind ("we," "our," or "us"), governing your access to and use of the NestFind website, mobile application, and all related services (collectively, the "Platform").
          </p>
          <p>
            By accessing or using the Platform, you acknowledge that you have read, understood, and agree to be bound by these Terms. If you do not agree to these Terms, you must not access or use the Platform.
          </p>
          <p>
            These Terms are governed by the laws of the Federal Republic of Nigeria, including the Consumer Protection Act 2018, the Electronic Transactions (General) Regulations 2021, and all applicable Nigerian contract and commercial laws.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-gray-900">2. Eligibility</h2>
          <p>To use NestFind, you must:</p>
          <ul className="list-disc pl-6 space-y-1">
            <li>Be at least 18 years of age or the age of majority in your jurisdiction</li>
            <li>Have the legal capacity to enter into binding agreements under Nigerian law</li>
            <li>Not be barred from using the Platform under any applicable law</li>
            <li>Provide accurate, current, and complete registration information</li>
          </ul>
          <p>
            By creating an account, you represent and warrant that you meet these eligibility requirements and that all information you provide is truthful and accurate.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-gray-900">3. Account Registration and Security</h2>
          <h3 className="text-lg font-medium text-gray-900 mt-3">3.1 Account Creation</h3>
          <p>
            You may create an account as a Guest, Tenant, or Host. Host accounts require additional verification and are subject to separate listing requirements. You agree to provide accurate information during registration and to keep your account information up to date.
          </p>
          <h3 className="text-lg font-medium text-gray-900 mt-3">3.2 Account Security</h3>
          <p>
            You are responsible for maintaining the confidentiality of your account credentials and for all activities that occur under your account. You agree to immediately notify us of any unauthorized use of your account. We are not liable for any loss or damage arising from unauthorized use of your credentials.
          </p>
          <h3 className="text-lg font-medium text-gray-900 mt-3">3.3 Account Termination</h3>
          <p>
            We reserve the right to suspend or terminate your account at our discretion, with or without notice, for conduct that violates these Terms, is harmful to other users, or is detrimental to the Platform.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-gray-900">4. Platform Description</h2>
          <p>NestFind is a real estate technology platform that connects property hosts (landlords/agents) with potential tenants and buyers. Our Platform enables:</p>
          <ul className="list-disc pl-6 space-y-1">
            <li>Property listing and discovery for rent and sale across Nigeria</li>
            <li>Online payment for property rentals and purchases via Flutterwave</li>
            <li>Communication between tenants/buyers and property hosts</li>
            <li>Property reviews and ratings</li>
            <li>Saved property listings and personalized recommendations</li>
          </ul>
          <p className="mt-3">
            <strong>NestFind is a technology platform and not a real estate agency, property manager, or party to any rental or sale transaction.</strong> We do not take possession of, manage, or have custody over any property listed on the Platform.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-gray-900">5. Property Listings and Transactions</h2>
          <h3 className="text-lg font-medium text-gray-900 mt-3">5.1 Host Responsibilities</h3>
          <p>If you list a property on NestFind, you represent and warrant that:</p>
          <ul className="list-disc pl-6 space-y-1">
            <li>You are the legal owner or authorized agent of the property</li>
            <li>You have the right to rent or sell the property in accordance with Nigerian law</li>
            <li>All listing information is accurate, current, and not misleading</li>
            <li>The property complies with all applicable building codes, tenancy laws, and regulations in your state (e.g., Lagos State Tenancy Law 2011, Rivers State Rent Protection Law)</li>
            <li>The property is safe and habitable for the intended use</li>
          </ul>
          <h3 className="text-lg font-medium text-gray-900 mt-3">5.2 Booking and Payment</h3>
          <p>
            When a user makes a booking through NestFind, they are entering into a direct agreement with the Host. Payment processing is handled by Flutterwave. By making a payment through the Platform, you agree to:
          </p>
          <ul className="list-disc pl-6 space-y-1">
            <li>Pay the full amount as displayed at checkout</li>
            <li>Comply with all applicable payment regulations, including the Central Bank of Nigeria (CBN) guidelines</li>
            <li>Acknowledge that service fees may apply and will be disclosed before payment</li>
          </ul>
          <h3 className="text-lg font-medium text-gray-900 mt-3">5.3 Cancellations and Refunds</h3>
          <p>
            Cancellation and refund policies are determined by the Host and may be specified at the time of booking. NestFind does not guarantee refunds. Disputes regarding refunds should be resolved directly with the Host. Where a dispute cannot be resolved, NestFind may, at its sole discretion, mediate but is not obligated to provide refunds.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-gray-900">6. Payments and Fees</h2>
          <h3 className="text-lg font-medium text-gray-900 mt-3">6.1 Payment Processing</h3>
          <p>
            All payments on NestFind are processed through Flutterwave, a PCI DSS Level 1 certified payment processor. By making a payment, you also agree to Flutterwave's Terms of Use and Privacy Policy.
          </p>
          <h3 className="text-lg font-medium text-gray-900 mt-3">6.2 Fees</h3>
          <p>
            NestFind may charge service fees for use of the Platform. All applicable fees will be clearly disclosed before any transaction is completed. We reserve the right to modify our fee structure with 30 days' prior notice.
          </p>
          <h3 className="text-lg font-medium text-gray-900 mt-3">6.3 Taxes</h3>
          <p>
            Users are responsible for all applicable taxes, including but not limited to Value Added Tax (VAT), stamp duties, and other levies imposed by the Federal Inland Revenue Service (FIRS) or State Internal Revenue Services in connection with property transactions.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-gray-900">7. User Conduct</h2>
          <p>You agree not to:</p>
          <ul className="list-disc pl-6 space-y-1">
            <li>Use the Platform for any unlawful purpose or in violation of any Nigerian law or regulation</li>
            <li>Post false, misleading, or fraudulent property listings</li>
            <li>Impersonate another person or entity</li>
            <li>Harass, threaten, or abuse other users</li>
            <li>Attempt to gain unauthorized access to the Platform or other users' accounts</li>
            <li>Use automated systems (bots, scrapers) to access the Platform without our written consent</li>
            <li>Interfere with or disrupt the Platform's infrastructure or servers</li>
            <li>Collect or harvest personal data of other users without their consent</li>
            <li>Circumvent or attempt to circumvent any security measures on the Platform</li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-gray-900">8. Intellectual Property</h2>
          <p>
            All content, trademarks, logos, designs, text, graphics, software, and other materials on the Platform are the exclusive property of NestFind or its licensors and are protected by Nigerian copyright law (Copyright Act, Cap C8, LFN 2004), trademark law, and international intellectual property treaties.
          </p>
          <p>
            You are granted a limited, non-exclusive, non-transferable license to access and use the Platform for personal, non-commercial purposes. You may not reproduce, distribute, modify, create derivative works of, publicly display, or exploit any content from the Platform without our prior written consent.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-gray-900">9. Disclaimers and Limitation of Liability</h2>
          <h3 className="text-lg font-medium text-gray-900 mt-3">9.1 Disclaimer of Warranties</h3>
          <p>
            The Platform is provided on an "as is" and "as available" basis without warranties of any kind, whether express or implied. We do not warrant that the Platform will be uninterrupted, error-free, or free of harmful components. We do not guarantee the accuracy, completeness, or reliability of any property listings or user-generated content.
          </p>
          <h3 className="text-lg font-medium text-gray-900 mt-3">9.2 Limitation of Liability</h3>
          <p>
            To the maximum extent permitted by Nigerian law, NestFind, its directors, employees, and affiliates shall not be liable for any indirect, incidental, special, consequential, or punitive damages arising from your use of or inability to use the Platform. Our total liability to you shall not exceed the amount of fees paid by you to NestFind in the 12 months preceding the claim, or NGN 100,000, whichever is greater.
          </p>
          <h3 className="text-lg font-medium text-gray-900 mt-3">9.3 Indemnification</h3>
          <p>
            You agree to indemnify, defend, and hold harmless NestFind and its officers, directors, employees, and agents from any claims, losses, damages, liabilities, costs, and expenses (including reasonable legal fees) arising from your use of the Platform, violation of these Terms, or infringement of any third-party rights.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-gray-900">10. Dispute Resolution</h2>
          <h3 className="text-lg font-medium text-gray-900 mt-3">10.1 Informal Resolution</h3>
          <p>
            Before initiating any formal proceedings, you agree to first contact us at <a href="mailto:support@nestfind.com" className="text-primary-600 hover:underline">support@nestfind.com</a> and attempt to resolve the dispute informally for a period of at least 30 days.
          </p>
          <h3 className="text-lg font-medium text-gray-900 mt-3">10.2 Governing Law</h3>
          <p>
            These Terms are governed by and construed in accordance with the laws of the Federal Republic of Nigeria. Any dispute arising from these Terms shall be subject to the exclusive jurisdiction of the courts of competent jurisdiction in Lagos State, Nigeria.
          </p>
          <h3 className="text-lg font-medium text-gray-900 mt-3">10.3 Arbitration</h3>
          <p>
            Any dispute that cannot be resolved informally shall be referred to and finally resolved by arbitration under the Arbitration and Mediation Act 2023 of Nigeria. The arbitration shall be conducted in Lagos, Nigeria, in the English language, by a single arbitrator mutually agreed upon by the parties.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-gray-900">11. Force Majeure</h2>
          <p>
            NestFind shall not be liable for any failure or delay in performance due to circumstances beyond our reasonable control, including but not limited to natural disasters, pandemics, government actions, power outages, internet disruptions, strikes, or acts of terrorism.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-gray-900">12. Severability</h2>
          <p>
            If any provision of these Terms is found to be invalid or unenforceable under Nigerian law, the remaining provisions shall continue in full force and effect. The invalid provision shall be modified to the minimum extent necessary to make it valid and enforceable while preserving its original intent.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-gray-900">13. Modifications to Terms</h2>
          <p>
            We reserve the right to modify these Terms at any time. Material changes will be notified to you via email or through a prominent notice on the Platform at least 30 days before the changes take effect. Your continued use of the Platform after the effective date of any changes constitutes your acceptance of the modified Terms.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-gray-900">14. Entire Agreement</h2>
          <p>
            These Terms, together with our Privacy Policy and any other policies referenced herein, constitute the entire agreement between you and NestFind regarding the use of the Platform and supersede all prior agreements and understandings.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-gray-900">15. Contact Information</h2>
          <p>For any questions about these Terms, please contact:</p>
          <div className="mt-3 rounded-xl bg-gray-50 p-4">
            <p className="font-medium text-gray-900">NestFind Support</p>
            <p>Email: <a href="mailto:support@nestfind.com" className="text-primary-600 hover:underline">support@nestfind.com</a></p>
            <p>Legal: <a href="mailto:legal@nestfind.com" className="text-primary-600 hover:underline">legal@nestfind.com</a></p>
            <p>Address: Lagos, Nigeria</p>
          </div>
        </section>

      </div>
    </div>
  );
}
