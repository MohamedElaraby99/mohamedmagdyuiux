import React from "react";
import { FOOTER, getCurrentYear } from "../Constants/LayoutConfig";

export default function Footer() {
  const year = getCurrentYear();

  return (
    <footer
      className="font-['Almarai']"
      style={{ backgroundColor: "#080E1E" }}
    >
      <div
        className="flex flex-col gap-8 sm:flex-row sm:items-start sm:justify-between sm:gap-6"
        style={{ padding: "80px 10%" }}
      >
        <div className="min-w-0 flex-1">
          <p className="text-lg font-bold text-white md:text-xl">
            {FOOTER.companyName}
          </p>
          <p
            className="mt-3 max-w-xl text-sm leading-relaxed md:text-[15px]"
            style={{ color: "#94a3b8" }}
          >
            {FOOTER.tagline}
          </p>
        </div>
        <p
          className="shrink-0 text-sm sm:text-right md:text-[15px]"
          style={{ color: "#94a3b8" }}
        >
          © {year} {FOOTER.companyName}. {FOOTER.copyrightText}.
        </p>
      </div>
    </footer>
  );
}
