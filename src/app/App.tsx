import { useState } from "react";

import { LandingPage, type BookingSearchParams } from "./pages/LandingPage";
import { GuestBooking } from "./pages/GuestBooking";
import { GuestPortal } from "./pages/GuestPortal";
import { StaffLogin } from "./pages/StaffLogin";
import { StaffPortal } from "./staff/StaffPortal";
import { clearSession, loadSession, type Session } from "./lib/auth";

type AppPage = "landing" | "guest-book" | "guest-portal" | "staff-login" | "staff-portal";

export default function App() {
  const [session, setSession] = useState<Session | null>(() => loadSession());
  const [page, setPage] = useState<AppPage>(() => (loadSession() ? "staff-portal" : "landing"));
  const [bookingParams, setBookingParams] = useState<BookingSearchParams | undefined>();

  function handleBook(params?: BookingSearchParams) {
    setBookingParams(params);
    setPage("guest-book");
  }

  function handleLogin() {
    setSession(loadSession());
    setPage("staff-portal");
  }

  function handleLogout() {
    clearSession();
    setSession(null);
    setPage("landing");
  }

  switch (page) {
    case "landing":
      return <LandingPage onBook={handleBook} onPortal={() => setPage("guest-portal")} onStaff={() => setPage("staff-login")} />;
    case "guest-book":
      return <GuestBooking initial={bookingParams} onBack={() => setPage("landing")} onDone={() => setPage("guest-portal")} />;
    case "guest-portal":
      return <GuestPortal onBack={() => setPage("landing")} />;
    case "staff-login":
      return <StaffLogin onLogin={handleLogin} onBack={() => setPage("landing")} />;
    case "staff-portal":
      return session ? (
        <StaffPortal role={session.role} onLogout={handleLogout} />
      ) : (
        <StaffLogin onLogin={handleLogin} onBack={() => setPage("landing")} />
      );
    default:
      return <LandingPage onBook={handleBook} onPortal={() => setPage("guest-portal")} onStaff={() => setPage("staff-login")} />;
  }
}
