import { Link } from "react-router";
import { Header } from "~/components/header";

export default function Privacy() {
  return (
    <>
      <Header />
      <div className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              Privacy Policy
            </h1>
            <p className="text-lg text-gray-600">
              Last updated: January 5, 2025
            </p>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-8 space-y-8">
            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                Overview
              </h2>
              <p className="text-gray-600 leading-relaxed">
                Money Wrapped is committed to protecting your privacy. This
                Privacy Policy explains how we collect, use, and safeguard your
                information when you use our service.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                Information We Collect
              </h2>
              <div className="space-y-4">
                <p className="text-gray-600 leading-relaxed">
                  When you use Money Wrapped, we collect:
                </p>
                <ul className="list-disc list-outside text-gray-600 space-y-2">
                  <li>Transaction data from your linked financial accounts</li>
                  <li>
                    Account balances and financial institution information
                  </li>
                  <li>
                    Categories and metadata associated with your transactions
                  </li>
                  <li>
                    Anonymised usage data and analytics about how you interact
                    with the website - we don't record any of your financial
                    data while doing so.
                  </li>
                </ul>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                How We Use Your Information
              </h2>
              <div className="space-y-4">
                <p className="text-gray-600 leading-relaxed">
                  We use your information to:
                </p>
                <ul className="list-disc list-inside text-gray-600 space-y-2">
                  <li>Generate your personalized Money Wrapped report</li>
                  <li>Analyze your spending patterns and provide insights</li>
                  <li>Ensure the security and integrity of our platform</li>
                </ul>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                Data Security
              </h2>
              <p className="text-gray-600 leading-relaxed">
                We implement industry-standard security measures to protect your
                data. Your financial information is encrypted in transit. We
                never store your bank credentials directly - all financial
                connections are managed securely through our trusted partner,
                Akahu.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                Data Retention
              </h2>
              <p className="text-gray-600 leading-relaxed">
                We retain your transaction data only during the duration needed
                to generate your Money Wrapped report. It gets deleted after the
                the report is generated, leaving a copy on your machine which
                you can delete at any time.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                Contact Us
              </h2>
              <p className="text-gray-600 leading-relaxed">
                If you have any questions about this Privacy Policy or our data
                practices, please contact us on discord at
                <a
                  href="https://discord.gg/hjC3mZ4hsz"
                  className="text-blue-600 hover:text-blue-800"
                >
                  #money-wrapped
                </a>
              </p>
            </section>

            <div className="pt-8 border-t border-gray-200">
              <Link
                to="/"
                className="inline-flex items-center text-blue-600 hover:text-blue-800"
              >
                ← Back to Home
              </Link>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
