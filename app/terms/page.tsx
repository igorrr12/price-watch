import Link from "next/link";

export default function TermsPage() {
  return (
    <div className="mx-auto max-w-3xl rounded-xl border-2 border-charcoal bg-white p-8 shadow-retro">
      <h1 className="text-3xl font-extrabold uppercase tracking-tight text-charcoal">Terms of Service</h1>
      <p className="mt-4 text-sm font-medium text-charcoal/60">Last updated: {new Date().toLocaleDateString()}</p>
      
      <div className="mt-8 space-y-6 text-charcoal">
        <section>
          <h2 className="text-xl font-bold uppercase tracking-tight">1. Acceptance of Terms</h2>
          <p className="mt-2 leading-relaxed">
            By accessing or using Price Watch, you agree to be bound by these Terms of Service. If you do not agree to all of these terms, do not use our website.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-bold uppercase tracking-tight">2. Description of Service</h2>
          <p className="mt-2 leading-relaxed">
            Price Watch is a tool that allows users to track product prices on supported retailers (Amazon, ASOS, Zara) and receive notifications when prices drop. We do not sell any products directly.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-bold uppercase tracking-tight">3. User Responsibilities</h2>
          <p className="mt-2 leading-relaxed">
            You are responsible for maintaining the confidentiality of your account information and for all activities that occur under your account. You agree to provide accurate and complete information when using our service.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-bold uppercase tracking-tight">4. Prohibited Use</h2>
          <p className="mt-2 leading-relaxed">
            You may not use Price Watch for any illegal or unauthorized purpose. You agree not to:
          </p>
          <ul className="mt-2 list-inside list-disc space-y-1">
            <li>Attempt to bypass any security measures of the site</li>
            <li>Use automated scripts to scrap or interact with the site maliciously</li>
            <li>Provide false email addresses or misleading information</li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-bold uppercase tracking-tight">5. Disclaimer of Warranties</h2>
          <p className="mt-2 leading-relaxed">
            Price Watch is provided "as is" without any warranties. We do not guarantee the accuracy of scraped prices or the delivery of alert emails.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-bold uppercase tracking-tight">6. Limitation of Liability</h2>
          <p className="mt-2 leading-relaxed">
            In no event shall Price Watch be liable for any direct, indirect, incidental, or consequential damages arising out of your use of the website.
          </p>
        </section>
      </div>

      <div className="mt-10 pt-6 border-t-2 border-charcoal/10">
        <Link href="/" className="font-bold text-brand hover:underline">
          &larr; Back to Home
        </Link>
      </div>
    </div>
  );
}
