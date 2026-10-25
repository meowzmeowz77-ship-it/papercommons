'use client';
import React from 'react';
import { ShieldCheck, FileText, ArrowLeft, Mail, Lock, CheckCircle2 } from 'lucide-react';

export function LegalPage({ kind }: { kind: 'privacy' | 'terms' }) {
  if (kind === 'privacy') {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-8 py-10 text-slate-300">
        <a href="/" className="inline-flex items-center gap-2 text-xs font-bold text-amber-400 hover:text-amber-300 mb-6">
          <ArrowLeft size={14} />
          <span>Back to PaperVault PRO</span>
        </a>

        <div className="p-8 sm:p-10 rounded-2xl bg-[#0C1222] border-2 border-slate-800 shadow-2xl">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 rounded-xl bg-orange-500/20 border border-orange-500/40 text-orange-400 flex items-center justify-center">
              <ShieldCheck size={26} />
            </div>
            <div>
              <span className="text-xs font-black uppercase tracking-wider text-orange-400 font-mono">
                LEGAL COMPLIANCE &amp; SAFETY
              </span>
              <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
                Student Privacy Policy
              </h1>
            </div>
          </div>

          <p className="text-xs text-slate-400 mb-6">
            Last Updated: October 2026 • Effective for all PaperVault PRO users globally
          </p>

          <div className="space-y-6 text-xs sm:text-sm leading-relaxed">
            <section className="space-y-2">
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <CheckCircle2 size={16} className="text-emerald-400" />
                1. Our Core Privacy Commitment
              </h2>
              <p>
                PaperVault PRO (PaperCommons) was founded to provide secondary school and board exam students with focused, zero-distraction revision resources. We believe educational platforms must protect student safety. We do <strong>not</strong> sell student personal information, track you across the web, or display third-party behavioral advertising.
              </p>
            </section>

            <section className="space-y-2">
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <CheckCircle2 size={16} className="text-emerald-400" />
                2. Information We Collect
              </h2>
              <p>We only collect information necessary to facilitate practice and community collaboration:</p>
              <ul className="list-disc pl-5 space-y-1 text-slate-300">
                <li><strong>Account Information:</strong> Google email address, display name, and avatar when you choose to sign in.</li>
                <li><strong>Academic Preferences:</strong> Selected board (e.g. CBSE, ICSE), grade/class, and preferred subjects to personalize your catalog.</li>
                <li><strong>Usage &amp; Telemetry:</strong> Anonymized question paper views, downloads, search queries, and practice duration to improve search rankings and paper quality.</li>
              </ul>
            </section>

            <section className="space-y-2">
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <CheckCircle2 size={16} className="text-emerald-400" />
                3. Cookie &amp; Authentication Notice
              </h2>
              <p>
                We use secure, strictly necessary HTTP cookies (e.g. <code className="text-orange-300 bg-[#131B2E] px-1.5 py-0.5 rounded font-mono">pc_google_auth</code>) solely to preserve your active session and prevent CSRF attacks. We do not use intrusive third-party cross-site tracking cookies.
              </p>
            </section>

            <section className="space-y-2">
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <CheckCircle2 size={16} className="text-emerald-400" />
                4. Data Protection &amp; Security Standards
              </h2>
              <p>
                All data transmissions are protected using Cloudflare SSL / TLS 1.3 encryption in transit and encrypted storage at rest. Administrative tools are locked down with cryptographic token signatures and restricted solely to verified personnel.
              </p>
            </section>

            <section className="space-y-2">
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <CheckCircle2 size={16} className="text-emerald-400" />
                5. Contact &amp; Data Rights
              </h2>
              <p>
                You may request account deletion, data export, or privacy inquiries at any time by contacting our student privacy officer:
              </p>
              <div className="p-3.5 rounded-xl bg-[#131B2E] border border-slate-700 flex items-center gap-3 text-xs">
                <Mail size={16} className="text-orange-400 shrink-0" />
                <span>
                  Official Privacy Inquiries: <strong className="text-white">privacy@papercommons.org</strong> or <strong className="text-white">vihan.agrawal4@gmail.com</strong>
                </span>
              </div>
            </section>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-8 py-10 text-slate-300">
      <a href="/" className="inline-flex items-center gap-2 text-xs font-bold text-amber-400 hover:text-amber-300 mb-6">
        <ArrowLeft size={14} />
        <span>Back to PaperVault PRO</span>
      </a>

      <div className="p-8 sm:p-10 rounded-2xl bg-[#0C1222] border-2 border-slate-800 shadow-2xl">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-12 h-12 rounded-xl bg-amber-500/20 border border-amber-500/40 text-amber-400 flex items-center justify-center">
            <FileText size={26} />
          </div>
          <div>
            <span className="text-xs font-black uppercase tracking-wider text-amber-400 font-mono">
              USER AGREEMENT &amp; GUIDELINES
            </span>
            <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
              Terms of Service
            </h1>
          </div>
        </div>

        <p className="text-xs text-slate-400 mb-6">
          Last Updated: October 2026 • Please read carefully before using PaperVault PRO
        </p>

        <div className="space-y-6 text-xs sm:text-sm leading-relaxed">
          <section className="space-y-2">
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <CheckCircle2 size={16} className="text-amber-400" />
              1. Acceptance of Terms
            </h2>
            <p>
              By accessing, browsing, or downloading revision materials from PaperVault PRO, you agree to comply with these Terms of Service, academic honesty policies, and all applicable laws. If you do not agree, please discontinue using the platform.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <CheckCircle2 size={16} className="text-amber-400" />
              2. Academic Fair Use &amp; Non-Affiliation Disclaimer
            </h2>
            <p>
              PaperVault PRO is an independent, student-led academic exchange. Examination boards, including CBSE (Central Board of Secondary Education), CISCE, and State Boards, do not sponsor or endorse this repository. Past question papers and syllabus names remain the intellectual property of their respective governing examination bodies and are utilized here under fair use educational archives.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <CheckCircle2 size={16} className="text-amber-400" />
              3. User Uploads &amp; Community Conduct
            </h2>
            <p>
              Students uploading model answers, solved tests, or question papers warrant that:
            </p>
            <ul className="list-disc pl-5 space-y-1 text-slate-300">
              <li>Uploads do not contain confidential live examination leaks or defamatory material.</li>
              <li>Uploads do not contain personally identifiable information of minors without consent.</li>
              <li>Community comments must remain respectful and focused strictly on academic doubt resolution.</li>
            </ul>
          </section>

          <section className="space-y-2">
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <CheckCircle2 size={16} className="text-amber-400" />
              4. Copyright Takedown Procedure (DMCA / Fair Use)
            </h2>
            <p>
              If you are a copyright holder or representative and believe that any uploaded study material infringes upon your copyright, please submit a notice to our moderation team with the paper title and URL. We promptly review and remove verified infringements within 24–48 hours.
            </p>
            <div className="p-3.5 rounded-xl bg-[#131B2E] border border-slate-700 flex items-center gap-3 text-xs">
              <Mail size={16} className="text-amber-400 shrink-0" />
              <span>
                DMCA &amp; Copyright Contact: <strong className="text-white">legal@papercommons.org</strong> or <strong className="text-white">vihan.agrawal4@gmail.com</strong>
              </span>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
