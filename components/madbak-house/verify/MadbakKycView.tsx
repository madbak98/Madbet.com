"use client";

import { useState } from "react";
import type { IdDocumentType, MadbakUser } from "@/lib/auth/types";
import { useAuthStore } from "@/store/useAuthStore";
import { DEMO_COUNTRIES } from "@/lib/auth/validators";

export function MadbakKycView({ user, onNotify }: { user: MadbakUser; onNotify: (msg: string, type?: "success" | "error") => void }) {
  const submitKyc = useAuthStore((s) => s.submitKyc);

  const [fullLegalName, setFullLegalName] = useState(user.kycData?.fullLegalName ?? "");
  const [dateOfBirth, setDateOfBirth] = useState(user.kycData?.dateOfBirth ?? user.dateOfBirth);
  const [nationality, setNationality] = useState(user.kycData?.nationality ?? "");
  const [countryOfResidence, setCountryOfResidence] = useState(user.kycData?.countryOfResidence ?? user.country);
  const [idType, setIdType] = useState<IdDocumentType>(user.kycData?.idType ?? "passport");
  const [idNumber, setIdNumber] = useState(user.kycData?.idNumber ?? "");
  const [address, setAddress] = useState(user.kycData?.address ?? "");
  const [mockIdFront, setMockIdFront] = useState(user.kycData?.mockIdFrontSet ?? false);
  const [mockSelfie, setMockSelfie] = useState(user.kycData?.mockSelfieSet ?? false);
  const [err, setErr] = useState<string | null>(null);

  if (!user.emailVerified) {
    return (
      <div className="mx-auto max-w-2xl rounded-2xl border border-[#2A1D19] bg-[#15110F] p-8">
        <h1 className="font-display text-3xl font-black uppercase italic text-white">Verify account</h1>
        <p className="mt-4 text-sm text-[#BFAF91]">Verify your email before starting identity verification (demo flow).</p>
      </div>
    );
  }

  if (user.kycStatus === "pending_review") {
    return (
      <div className="mx-auto max-w-2xl rounded-2xl border border-[#C9A45C]/40 bg-[#15110F] p-10 text-center">
        <h1 className="font-display text-3xl font-black uppercase italic text-[#C9A45C]">Verification under review</h1>
        <p className="mt-4 text-sm text-[#BFAF91]">
          Your demo KYC submission is queued. An administrator can approve or reject it from the admin dashboard. No documents
          leave this browser in this build.
        </p>
      </div>
    );
  }

  if (user.kycStatus === "approved") {
    return (
      <div className="mx-auto max-w-2xl rounded-2xl border border-[#2d5a2d] bg-[#15110F] p-10 text-center">
        <h1 className="font-display text-3xl font-black uppercase italic text-[#7ddf8a]">Identity approved</h1>
        <p className="mt-4 text-sm text-[#BFAF91]">Demo tier 3 reached. Connect a licensed KYC provider before handling real users.</p>
      </div>
    );
  }

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErr(null);
    const r = submitKyc(user.id, {
      fullLegalName,
      dateOfBirth,
      nationality,
      countryOfResidence,
      idType,
      idNumber,
      address,
      mockIdFrontSet: mockIdFront,
      mockSelfieSet: mockSelfie,
    });
    if (!r.ok) {
      setErr(r.error);
      return;
    }
    onNotify("KYC submitted (demo). Awaiting review.", "success");
  };

  return (
    <div className="mx-auto max-w-3xl space-y-6 px-4 pb-16 md:px-8">
      <div>
        <h1 className="font-display text-4xl font-black uppercase italic text-white">Identity verification</h1>
        <p className="mt-2 text-xs uppercase tracking-widest text-[#BFAF91]">Simulation only — no uploads leave this device</p>
      </div>

      <div className="rounded-xl border border-[#B11226]/30 bg-[#3A0B10]/20 p-4 text-[11px] text-[#F2E3C6]">
        Demo disclaimer: this form mimics a compliance workflow. Production systems must integrate a licensed KYC/AML provider,
        secure document storage, and jurisdictional legal review. Do not use this UI for real identity data without an
        appropriate backend.
      </div>

      <form onSubmit={onSubmit} className="space-y-4 rounded-2xl border border-[#2A1D19] bg-[#15110F] p-6 md:p-8">
        <div className="grid gap-4 md:grid-cols-2">
          <label className="block text-[10px] font-black uppercase tracking-widest text-[#BFAF91]">
            Full legal name
            <input
              value={fullLegalName}
              onChange={(e) => setFullLegalName(e.target.value)}
              className="mt-1 w-full rounded-lg border border-[#2A1D19] bg-[#050505] px-3 py-2 text-sm text-[#F2E3C6] focus:border-[#B11226] focus:outline-none"
            />
          </label>
          <label className="block text-[10px] font-black uppercase tracking-widest text-[#BFAF91]">
            Date of birth
            <input
              type="date"
              value={dateOfBirth}
              onChange={(e) => setDateOfBirth(e.target.value)}
              className="mt-1 w-full rounded-lg border border-[#2A1D19] bg-[#050505] px-3 py-2 text-sm text-[#F2E3C6] focus:border-[#B11226] focus:outline-none"
            />
          </label>
          <label className="block text-[10px] font-black uppercase tracking-widest text-[#BFAF91]">
            Nationality (ISO or country name)
            <input
              value={nationality}
              onChange={(e) => setNationality(e.target.value)}
              className="mt-1 w-full rounded-lg border border-[#2A1D19] bg-[#050505] px-3 py-2 text-sm text-[#F2E3C6] focus:border-[#B11226] focus:outline-none"
              placeholder="e.g. US"
            />
          </label>
          <label className="block text-[10px] font-black uppercase tracking-widest text-[#BFAF91]">
            Country of residence
            <select
              value={countryOfResidence}
              onChange={(e) => setCountryOfResidence(e.target.value)}
              className="mt-1 w-full rounded-lg border border-[#2A1D19] bg-[#050505] px-3 py-2 text-sm text-[#F2E3C6] focus:border-[#B11226] focus:outline-none"
            >
              {DEMO_COUNTRIES.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </label>
        </div>

        <label className="block text-[10px] font-black uppercase tracking-widest text-[#BFAF91]">
          ID type
          <select
            value={idType}
            onChange={(e) => setIdType(e.target.value as IdDocumentType)}
            className="mt-1 w-full rounded-lg border border-[#2A1D19] bg-[#050505] px-3 py-2 text-sm text-[#F2E3C6] focus:border-[#B11226] focus:outline-none"
          >
            <option value="passport">Passport</option>
            <option value="id_card">National ID card</option>
            <option value="driving_license">Driving license</option>
          </select>
        </label>

        <label className="block text-[10px] font-black uppercase tracking-widest text-[#BFAF91]">
          ID number (demo — do not enter real credentials)
          <input
            value={idNumber}
            onChange={(e) => setIdNumber(e.target.value)}
            className="mt-1 w-full rounded-lg border border-[#2A1D19] bg-[#050505] px-3 py-2 text-sm text-[#F2E3C6] focus:border-[#B11226] focus:outline-none"
          />
        </label>

        <label className="block text-[10px] font-black uppercase tracking-widest text-[#BFAF91]">
          Address
          <textarea
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            rows={3}
            className="mt-1 w-full rounded-lg border border-[#2A1D19] bg-[#050505] px-3 py-2 text-sm text-[#F2E3C6] focus:border-[#B11226] focus:outline-none"
          />
        </label>

        <div className="grid gap-4 md:grid-cols-2">
          <MockUpload label="ID document (front)" checked={mockIdFront} onChange={setMockIdFront} />
          <MockUpload label="Selfie with ID" checked={mockSelfie} onChange={setMockSelfie} />
        </div>

        {err && <p className="text-[11px] font-bold text-[#E21B35]">{err}</p>}

        <button
          type="submit"
          className="w-full rounded-xl bg-[#B11226] py-3 text-sm font-black uppercase tracking-wider text-[#F2E3C6] hover:bg-[#E21B35]"
        >
          Submit for review (demo)
        </button>
      </form>
    </div>
  );
}

function MockUpload({
  label,
  checked,
  onChange,
}: {
  label: string;
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <div className="rounded-xl border border-dashed border-[#2A1D19] bg-[#0D0D0D] p-4">
      <p className="text-[10px] font-black uppercase tracking-widest text-[#BFAF91]">{label}</p>
      <p className="mt-1 text-[11px] text-[#BFAF91]/80">No file is uploaded. Toggle to simulate a successful local pick.</p>
      <label className="mt-3 flex cursor-pointer items-center gap-2 text-xs font-bold text-[#F2E3C6]">
        <input type="checkbox" checked={checked} onChange={(e) => onChange(e.target.checked)} className="accent-[#B11226]" />
        Demo file selected
      </label>
    </div>
  );
}
