import { lazy, Suspense } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { RoleProvider } from "./contexts/RoleContext";
import Layout from "./components/layout/Layout";

const DashboardPage = lazy(() => import("./pages/DashboardPage"));
const GA4Page = lazy(() => import("./pages/GA4Page"));
const OrganicPage = lazy(() => import("./pages/OrganicPage"));
const PPCPage = lazy(() => import("./pages/PPCPage"));
const SEOPage = lazy(() => import("./pages/SEOPage"));
const EmailPage = lazy(() => import("./pages/EmailPage"));
const SocialPage = lazy(() => import("./pages/SocialPage"));
const EventsPage = lazy(() => import("./pages/EventsPage"));
const ContentPage = lazy(() => import("./pages/ContentPage"));
const CadencePage = lazy(() => import("./pages/CadencePage"));
const HealthPage = lazy(() => import("./pages/HealthPage"));

function PageLoader() {
  return (
    <div style={{ padding: 40, textAlign: "center" }}>
      <div style={{ fontSize: 13, color: "var(--ga-muted)" }}>Loading module...</div>
    </div>
  );
}

export default function App() {
  return (
    <RoleProvider>
      <BrowserRouter>
        <Suspense fallback={<PageLoader />}>
          <Routes>
            <Route element={<Layout />}>
              <Route index element={<DashboardPage />} />
              <Route path="ga4" element={<GA4Page />} />
              <Route path="organic" element={<OrganicPage />} />
              <Route path="ppc" element={<PPCPage />} />
              <Route path="seo" element={<SEOPage />} />
              <Route path="email" element={<EmailPage />} />
              <Route path="social" element={<SocialPage />} />
              <Route path="events" element={<EventsPage />} />
              <Route path="content" element={<ContentPage />} />
              <Route path="cadence" element={<CadencePage />} />
              <Route path="health" element={<HealthPage />} />
            </Route>
          </Routes>
        </Suspense>
      </BrowserRouter>
    </RoleProvider>
  );
}
