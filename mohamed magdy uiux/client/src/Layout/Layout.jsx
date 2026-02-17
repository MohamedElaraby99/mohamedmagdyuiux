import React from "react";
import Footer from "../Components/Footer";
import Navbar from "../Components/Navbar";
import Sidebar from "../Components/Sidebar";
import TokenExpirationWarning from "../Components/TokenExpirationWarning";

export default function Layout({ children, hideBar, hideNav, hideFooter }) {
  return (
    <>
    <link href="https://fonts.googleapis.com/css2?family=Playpen+Sans+Arabic:wght@100..800&display=swap" rel="stylesheet"></link>
      <main className="min-h-[100vh] bg-white dark:bg-base-200">
        {/* Token expiration warning */}
        <TokenExpirationWarning />

        {/* navbar */}
        {!hideNav && <Navbar />}

        {/* sidebar - visible on all devices */}
        <Sidebar hideBar={hideBar} />

        {/* main content */}
        {children}

        {/* footer */}
        {!hideFooter && <Footer />}
      </main>
    </>
  );
}
