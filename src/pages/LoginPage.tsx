import { Link, useNavigate } from "react-router";
import { APP_NAME, CITY_SRC, LOGO_SRC } from "@/lib/brand";

export function LoginPage() {
  const navigate = useNavigate();

  return (
    <div className="flex min-h-dvh w-full flex-col bg-white">
      {/* Header — logo + copy */}
      <div className="flex shrink-0 flex-col items-center px-8 pt-6">
        <img src={LOGO_SRC} alt={APP_NAME} className="h-[72px] w-[72px] object-contain" />
        <p className="mt-1.5 text-[22px] font-extrabold tracking-[0.02em] text-[#111827]">
          {APP_NAME}
        </p>

        <h1 className="mt-2 max-w-[340px] text-center text-[26px] font-bold leading-[1.1] text-[#111827]">
          Smarter Waste Management for{" "}
          <span className="text-[#1B5E20]">Cleaner Cities</span>
        </h1>

        <p className="mt-0.5 max-w-[320px] text-center text-[15px] leading-[1.4] text-[#6B7280]">
          Track trucks in real-time, segregate waste and earn rewards for a cleaner tomorrow.
        </p>
      </div>

      {/* Illustration */}
      <div className="relative -mt-[72px] shrink-0">
        <img
          src={CITY_SRC}
          alt="TRUCKNGO city"
          className="w-full -translate-y-6 object-contain"
        />
      </div>

      {/* Carousel dots — sits on illustration, above bottom card */}
      <div className="relative z-20 -mt-10 mb-1 flex items-center justify-center gap-[10px]">
        {[0, 1, 2, 3].map((i) => (
          <span
            key={i}
            className={`rounded-full transition-all ${
              i === 1
                ? "h-[10px] w-[10px] bg-white shadow-[0_1px_4px_rgba(0,0,0,0.18)]"
                : "h-2 w-2 bg-[#9CA3AF]/55"
            }`}
          />
        ))}
      </div>

      <div className="flex-1 min-h-0" />

      {/* Bottom action card */}
      <div className="relative z-10 -mt-6 rounded-t-[36px] bg-white px-6 pb-10 pt-9 shadow-[0_-16px_48px_rgba(0,0,0,0.07)]">
        <button
          type="button"
          onClick={() => navigate("/resident/register")}
          className="w-full rounded-full bg-[#1B5E20] py-[18px] text-[17px] font-bold text-white shadow-[0_4px_14px_rgba(27,94,32,0.35)]"
        >
          Get Started
        </button>

        <p className="mt-5 text-center text-[15px] text-[#6B7280]">
          Already have an account?{" "}
          <Link to="/resident/signin" className="font-bold text-[#1B5E20] no-underline">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
