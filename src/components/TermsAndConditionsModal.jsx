import React, { useState } from "react";

const TermsAndConditionsModal = ({ isOpen, onAccept, onDecline }) => {
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [agreedToLiability, setAgreedToLiability] = useState(false);

  if (!isOpen) return null;

  const canProceed = agreedToTerms && agreedToLiability;

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-[100] p-4 overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-2xl w-full my-8 shadow-2xl">
        {/* Header */}
        <div className="bg-gradient-to-r from-red-600 to-orange-600 text-white p-6 rounded-t-3xl">
          <div className="flex items-center justify-center mb-2">
            <svg
              className="w-12 h-12"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-center">Terms & Conditions</h2>
          <p className="text-center text-red-100 text-sm mt-2">
            Please read carefully before booking
          </p>
        </div>

        {/* Content */}
        <div className="p-6 max-h-[60vh] overflow-y-auto">
          {/* Main Terms */}
          <div className="mb-6">
            <h3 className="text-lg font-bold text-gray-900 mb-3 flex items-center">
              <span className="text-2xl mr-2">📜</span>
              NELA Ride Service Agreement
            </h3>
            <div className="text-sm text-gray-700 space-y-3 bg-gray-50 p-4 rounded-xl">
              <p className="font-semibold">
                By using NELA ride services, you acknowledge and agree to the
                following:
              </p>

              <div className="space-y-2">
                <p>
                  <strong>1. Independent Contractor Relationship:</strong> NELA
                  operates as a platform connecting passengers with independent
                  drivers. Drivers are not employees or agents of NELA.
                </p>

                <p>
                  <strong>2. Service Availability:</strong> NELA does not
                  guarantee ride availability, driver acceptance, or specific
                  arrival times. Estimated times are approximations only.
                </p>

                <p>
                  <strong>3. Pricing:</strong> All prices are estimates and may
                  vary based on actual distance, time, and route taken. Final
                  fare is determined at trip completion.
                </p>

                <p>
                  <strong>4. Payment:</strong> You agree to pay all charges for
                  rides booked through your account. Payment methods must be
                  valid and current.
                </p>

                <p>
                  <strong>5. Cancellation:</strong> Rides may be cancelled by
                  either party. Drivers may cancel without penalty. Passengers
                  may be subject to cancellation fees as posted.
                </p>

                <p>
                  <strong>6. User Conduct:</strong> You agree to behave
                  respectfully, follow driver instructions, and comply with all
                  applicable laws. Inappropriate behavior may result in service
                  termination.
                </p>
              </div>
            </div>
          </div>

          {/* Liability Waiver */}
          <div className="mb-6">
            <h3 className="text-lg font-bold text-red-700 mb-3 flex items-center">
              <span className="text-2xl mr-2">⚠️</span>
              Liability Waiver & Release
            </h3>
            <div className="text-sm text-gray-700 space-y-3 bg-red-50 p-4 rounded-xl border-2 border-red-200">
              <p className="font-bold text-red-900 uppercase">
                IMPORTANT - PLEASE READ CAREFULLY
              </p>

              <div className="space-y-2">
                <p>
                  <strong>ASSUMPTION OF RISK:</strong> You acknowledge that
                  transportation services involve inherent risks including but
                  not limited to: vehicle accidents, traffic incidents, property
                  damage, personal injury, and other unforeseen events.
                </p>

                <p>
                  <strong>RELEASE OF LIABILITY:</strong> To the fullest extent
                  permitted by law, you hereby RELEASE, WAIVE, DISCHARGE, and
                  COVENANT NOT TO SUE NELA, its owners, operators, drivers,
                  employees, agents, and affiliates from ANY AND ALL LIABILITY,
                  claims, demands, actions, and causes of action whatsoever
                  arising out of or related to any loss, damage, injury, or
                  death that may be sustained by you or your property while
                  using NELA services.
                </p>

                <p>
                  <strong>INDEMNIFICATION:</strong> You agree to INDEMNIFY,
                  DEFEND, and HOLD HARMLESS NELA and its affiliates from any
                  claims, liabilities, damages, losses, costs, or expenses
                  (including attorney fees) arising from:
                  <ul className="list-disc ml-6 mt-1">
                    <li>Your use of NELA services</li>
                    <li>Your violation of these terms</li>
                    <li>Your violation of any third-party rights</li>
                    <li>
                      Any acts or omissions by you or others in your party
                    </li>
                  </ul>
                </p>

                <p>
                  <strong>NO WARRANTIES:</strong> NELA services are provided "AS
                  IS" and "AS AVAILABLE" without warranties of any kind, either
                  express or implied. NELA does not warrant that services will
                  be uninterrupted, error-free, or secure.
                </p>

                <p>
                  <strong>LIMITATION OF DAMAGES:</strong> In no event shall NELA
                  be liable for any indirect, incidental, special,
                  consequential, or punitive damages, including but not limited
                  to loss of profits, data, use, goodwill, or other intangible
                  losses.
                </p>

                <p>
                  <strong>MAXIMUM LIABILITY:</strong> NELA's total liability to
                  you for all claims arising from or related to these services
                  shall not exceed the amount you paid for the ride in question,
                  or $100, whichever is less.
                </p>

                <p>
                  <strong>INSURANCE:</strong> You acknowledge that you are
                  responsible for maintaining your own health, travel, and
                  personal property insurance. NELA does not provide insurance
                  coverage for passengers.
                </p>

                <p>
                  <strong>GOVERNING LAW:</strong> These terms shall be governed
                  by the laws of the State of California, without regard to
                  conflict of law principles. Any disputes shall be resolved
                  exclusively in the courts located in Los Angeles County,
                  California.
                </p>

                <p>
                  <strong>SEVERABILITY:</strong> If any provision of these terms
                  is found to be unenforceable, the remaining provisions shall
                  remain in full force and effect.
                </p>

                <p className="font-bold text-red-900 mt-4">
                  BY CHECKING THE BOXES BELOW AND PROCEEDING, YOU ACKNOWLEDGE
                  THAT YOU HAVE READ, UNDERSTOOD, AND AGREE TO BE BOUND BY THESE
                  TERMS, INCLUDING THE WAIVER OF LIABILITY AND RELEASE OF
                  CLAIMS.
                </p>
              </div>
            </div>
          </div>

          {/* Additional Policies */}
          <div className="mb-6">
            <h3 className="text-lg font-bold text-gray-900 mb-3 flex items-center">
              <span className="text-2xl mr-2">🔒</span>
              Privacy & Safety
            </h3>
            <div className="text-sm text-gray-700 space-y-2 bg-blue-50 p-4 rounded-xl">
              <p>
                <strong>Data Collection:</strong> We collect and use your
                personal information (name, phone, email, location) to provide
                ride services and communicate with you.
              </p>

              <p>
                <strong>Data Sharing:</strong> Your information is shared with
                drivers only as necessary to complete your ride.
              </p>

              <p>
                <strong>Safety:</strong> While we strive for safety, you are
                responsible for your own safety decisions. Report any concerns
                immediately.
              </p>

              <p>
                <strong>Age Requirement:</strong> You must be 18+ years old to
                use NELA services. Minors must be accompanied by an adult.
              </p>
            </div>
          </div>

          {/* Emergency Contact */}
          <div className="mb-6 bg-yellow-50 border-2 border-yellow-300 p-4 rounded-xl">
            <h3 className="text-sm font-bold text-yellow-900 mb-2 flex items-center">
              <span className="text-xl mr-2">🚨</span>
              Emergency Information
            </h3>
            <p className="text-xs text-yellow-900">
              <strong>In case of emergency during your ride:</strong>
              <br />
              • Call 911 immediately for medical or safety emergencies
              <br />
              • Contact NELA support: (555) 123-4567
              <br />• Share your ride details with a trusted contact
            </p>
          </div>
        </div>

        {/* Acknowledgment Checkboxes */}
        <div className="px-6 pb-4 space-y-3">
          <label className="flex items-start space-x-3 cursor-pointer group">
            <input
              type="checkbox"
              checked={agreedToTerms}
              onChange={(e) => setAgreedToTerms(e.target.checked)}
              className="w-5 h-5 mt-0.5 rounded border-gray-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
            />
            <span className="text-sm text-gray-700 group-hover:text-gray-900">
              I have read and agree to the <strong>Terms & Conditions</strong>{" "}
              and understand the service agreement.
            </span>
          </label>

          <label className="flex items-start space-x-3 cursor-pointer group">
            <input
              type="checkbox"
              checked={agreedToLiability}
              onChange={(e) => setAgreedToLiability(e.target.checked)}
              className="w-5 h-5 mt-0.5 rounded border-gray-300 text-red-600 focus:ring-red-500 cursor-pointer"
            />
            <span className="text-sm text-gray-700 group-hover:text-gray-900">
              I acknowledge and accept the{" "}
              <strong className="text-red-700">
                Liability Waiver & Release
              </strong>
              , and I will not hold NELA liable for any incidents, accidents,
              injuries, or damages.
            </span>
          </label>
        </div>

        {/* Action Buttons */}
        <div className="px-6 pb-6 flex gap-3">
          <button
            onClick={onDecline}
            className="flex-1 px-6 py-3 bg-gray-200 hover:bg-gray-300 text-gray-800 rounded-2xl font-semibold transition-all"
          >
            Decline
          </button>
          <button
            onClick={onAccept}
            disabled={!canProceed}
            className={`flex-2 px-6 py-3 rounded-2xl font-semibold transition-all ${
              canProceed
                ? "bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white shadow-lg"
                : "bg-gray-300 text-gray-500 cursor-not-allowed"
            }`}
          >
            {canProceed ? "✓ Accept & Continue" : "Please Accept Terms"}
          </button>
        </div>

        {/* Legal Footer */}
        <div className="px-6 pb-6 text-xs text-gray-500 text-center">
          Last updated: {new Date().toLocaleDateString()}
          <br />
          By using NELA services, you agree to these terms in their entirety.
        </div>
      </div>
    </div>
  );
};

export default TermsAndConditionsModal;
