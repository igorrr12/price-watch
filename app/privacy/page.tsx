import Link from "next/link";

export default function PrivacyPage() {
  return (
    <div className="mx-auto max-w-3xl rounded-xl border-2 border-charcoal bg-white p-8 shadow-retro">
      <h1 className="text-3xl font-extrabold uppercase tracking-tight text-charcoal">Privacy Policy</h1>
      <p className="mt-4 text-sm font-medium text-charcoal/60">Last updated: {new Date().toLocaleDateString()}</p>
      
      <div className="mt-8 space-y-6 text-charcoal">
        <section>
          <h2 className="text-xl font-bold uppercase tracking-tight">1. Introduction</h2>
          <p className="mt-2 leading-relaxed">
            Welcome to Price Watch. We are committed to protecting your personal information and your right to privacy. This Privacy Policy explains how we collect, use, and disclose your information when you use our website.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-bold uppercase tracking-tight">2. Information We Collect</h2>
          <p className="mt-2 leading-relaxed">
            We collect personal information that you voluntarily provide to us when you:
          </p>
          <ul className="mt-2 list-inside list-disc space-y-1">
            <li>Register for an account</li>
            <li>Subscribe to price alerts (Email address)</li>
            <li>Contact us or provide feedback</li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-bold uppercase tracking-tight">3. How We Use Your Information</h2>
          <p className="mt-2 leading-relaxed">
            We use your information to:
          </p>
          <ul className="mt-2 list-inside list-disc space-y-1">
            <li>Provide and maintain our service</li>
            <li>Send you price drop alerts via email</li>
            <li>Manage your account and preferences</li>
            <li>Improve our website and user experience</li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-bold uppercase tracking-tight">4. Third-Party Services</h2>
          <p className="mt-2 leading-relaxed">
            We use third-party services like Supabase (for database/auth) and Resend (for emails). These services handle your data according to their own privacy policies. We also use Google AdSense for monetization, which may use cookies to serve ads based on your visits to this and other websites.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-bold uppercase tracking-tight">5. Your Rights</h2>
          <p className="mt-2 leading-relaxed">
            You can request to delete your account and all associated data at any time by contacting us or through your dashboard settings.
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
