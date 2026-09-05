import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, Outlet, useLocation } from 'react-router-dom';
import { DataProvider, useData } from './context/DataContext';
import { SoftphoneProvider } from './context/SoftphoneContext';
import { ThemeProvider } from './components/ThemeProvider';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { Home } from './pages/website/Home';
import { Services } from './pages/website/Services';
import { LifeInsurance } from './pages/website/LifeInsurance';
import { RealEstate } from './pages/website/RealEstate';
import { HomeRepair } from './pages/website/HomeRepair';
import { Mortgage } from './pages/website/Mortgage';
import { BusinessInsurance } from './pages/website/BusinessInsurance';
import { AutoInsurance } from './pages/website/AutoInsurance';
import { LogisticsHub as PublicLogistics } from './pages/website/LogisticsHub';

import { GroupBenefits } from './pages/website/GroupBenefits';
import { InvestmentShowcase } from './pages/website/InvestmentShowcase';
import { Securities } from './pages/website/Securities';
import { Advisors } from './pages/website/Advisors';
import { About } from './pages/website/About';
import { DeveloperPortal } from './pages/website/DeveloperPortal';
import { Partnership } from './pages/website/Partnership';
import { CampaignLandingPage } from './pages/website/CampaignLandingPage';
import { Resources } from './pages/website/Resources';
import { Contact } from './pages/website/Contact';
import { BookingPage } from './pages/website/BookingPage';
import { SecuritiesPortfolio } from './pages/website/SecuritiesPortfolio';
import { RealEstateIntelligence } from './pages/website/RealEstateIntelligence';
import { ExploreSolutions } from './pages/website/ExploreSolutions';
import { AnnualReport } from './pages/website/AnnualReport';
import { PressReleases } from './pages/website/PressReleases';
import { Login } from './pages/Login';
import { Signup } from './pages/Signup';
import { ForgotPassword } from './pages/ForgotPassword';
import { ClientPortal } from './pages/client/ClientPortal';
import { CRMLayout } from './components/CRMData';
import { Dashboard } from './pages/crm/Dashboard';
import { Leads } from './pages/crm/Leads';
import { LeadIntake } from './pages/crm/LeadIntake';
import { Clients } from './pages/crm/Clients';
import { Commissions } from './pages/crm/Commissions';
const Calendar = React.lazy(() => import('./pages/crm/Calendar').then(m => ({ default: m.Calendar })));
import { Inbox } from './pages/crm/Inbox';
import { ProfileSettings } from './pages/crm/ProfileSettings';
import { AdminUsers } from './pages/admin/AdminUsers';
import { WebsiteSettings } from './pages/admin/WebsiteSettings';
import { AnnualReportAdmin } from './pages/admin/AnnualReportAdmin';
import { PressReleaseAdmin } from './pages/admin/PressReleaseAdmin';
import { CarrierAssignment } from './pages/admin/CarrierAssignment';
import { UserRole } from './types';
import { AdvisorMicrosite } from './pages/website/AdvisorMicrosite';
import { AdminTestimonials } from './pages/admin/AdminTestimonials';
import { EmailSignature } from './pages/admin/EmailSignature';
import { MarketingIntegrations } from './pages/admin/MarketingIntegrations';
import { JoinTeam } from './pages/website/JoinTeam';
import { LoadTracking } from './pages/public/LoadTracking';
import { Onboarding } from './pages/crm/Onboarding';
import { AdvisorOnboardingFlow } from './pages/crm/AdvisorOnboardingFlow';
import { TelephonyHub } from './pages/crm/TelephonyHub';
import { SecuritiesWealth } from './pages/crm/SecuritiesWealth';
import { LegalCompliance } from './pages/crm/LegalCompliance';
import { PrivacyPolicy } from './pages/website/PrivacyPolicy';
import { TermsOfUse } from './pages/website/TermsOfUse';
import {
  PoliciesApps,
  CommercialQuotes,
  PoliciesRenewals,
  AutoQuotes,
  FleetManager,
  Claims
} from './pages/crm/insurance/InsurancePages';
import {
  PropertyPipeline,
  TransactionsEscrow
} from './pages/crm/real-estate/RealEstatePages';
import {
  PortfolioMgmt,
  ComplianceDocs,
  AdvisoryFees
} from './pages/crm/securities/SecuritiesPages';
import { LogisticsHub as CRMLogisticsHub } from './pages/crm/logistics/LogisticsHub';
import {
  LoanApplications,
  RateTools,
  RefinanceCalc
} from './pages/crm/mortgage/MortgagePages';
import { BookingPage as PublicBookingPage } from './pages/public/BookingPage';
import { AutomationStudio } from './pages/crm/AutomationStudio';
import { BankVerification } from './pages/crm/BankVerification';
import ClientVerify from './pages/verify/ClientVerify';
import { RealEstateAdmin } from './pages/admin/RealEstateAdmin';
import { RealEstateCms } from './pages/admin/RealEstateCms';
import { ProductCms } from './pages/admin/ProductCms';
import { AdminAnalytics } from './pages/admin/AdminAnalytics';
import { CommissionRecon } from './pages/admin/CommissionRecon';
import { LandingPageBuilder } from './pages/admin/LandingPageBuilder';
import AdvisorRoutingPage from './pages/admin/AdvisorRoutingPage';
import { AnalyticsTracker } from './components/AnalyticsTracker';
import AdvisorApplication from './pages/onboarding/AdvisorApplication';
import AdminOnboarding from './pages/admin/AdminOnboarding';
import ActivateAccount from './pages/onboarding/ActivateAccount';
import { SEO } from './components/SEO';
import { AccessLogs } from './pages/admin/AccessLogs';
import { LoadPostingTerminal } from './pages/crm/logistics/LoadPostingTerminal';
import { CampaignManager } from './pages/crm/MarketingCampaigns';
import { InsuranceQuoteFunnel } from './pages/public/InsuranceQuoteFunnel';
import { LifeInsuranceFunnel } from './pages/public/LifeInsuranceFunnel';
import { SystemStatus } from './components/SystemStatus';


/**
 * DEVELOPER NOTE: App Routing Architecture
 * This file serves as the main gateway for both the public-facing 
 * New Holland website and the private NHFG Advisor Terminal (CRM).
 */

const ProtectedCRMRoute: React.FC = () => {
  const { user, isLoading } = useData();
  const location = useLocation();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-slate-900"></div>
      </div>
    );
  }

  if (!user) return <Navigate to="/login" replace />;

  const allowedRoles = [UserRole.ADMIN, UserRole.MANAGER, UserRole.SUB_ADMIN, UserRole.ADVISOR];
  if (!allowedRoles.includes(user.role)) return <Navigate to="/client-portal" replace />;

  // Force Onboarding completion for all new advisors
  if (user.role === UserRole.ADVISOR && !user.onboardingCompleted && location.pathname !== '/crm/onboarding-flow') {
    return <Navigate to="/crm/onboarding-flow" replace />;
  }

  if (location.pathname === '/crm/onboarding-flow') return <Outlet />;

  return (
    <CRMLayout>
      <React.Suspense fallback={<div className="h-full w-full flex items-center justify-center animate-pulse"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-slate-900"></div></div>}>
        <Outlet />
      </React.Suspense>
    </CRMLayout>
  );
};

const ManagerRoute: React.FC = () => {
  const { user, isLoading } = useData();
  
  if (isLoading) return null;
  // PERMISSIONS: Allows Administrators and Managers to access user management and onboarding.
  if (user?.role !== UserRole.ADMIN && user?.role !== UserRole.MANAGER) return <Navigate to="/crm/dashboard" replace />;
  return <Outlet />;
};

const SuperAdminRoute: React.FC = () => {
  const { user, isLoading } = useData();
  
  if (isLoading) return null;
  // PERMISSIONS: Restricting high-level configuration to Administrators only.
  if (user?.role !== UserRole.ADMIN) return <Navigate to="/crm/dashboard" replace />;
  return <Outlet />;
};

const PublicLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div className="flex flex-col min-h-screen">
    <Navbar />
    <main className="flex-grow">{children}</main>
    <Footer />
  </div>
);

const App: React.FC = () => {
  return (
    <DataProvider>
      <ThemeProvider>
        <SystemStatus />
        <SoftphoneProvider>
        <Router>
          <SEO />
          <AnalyticsTracker />
          <Routes>
            {/* PUBLIC WEBSITE */}
            <Route path="/" element={<PublicLayout><Home /></PublicLayout>} />
            <Route path="/about" element={<PublicLayout><About /></PublicLayout>} />
            <Route path="/developers" element={<PublicLayout><DeveloperPortal /></PublicLayout>} />
            <Route path="/partnership" element={<PublicLayout><Partnership /></PublicLayout>} />
            <Route path="/products" element={<PublicLayout><ExploreSolutions /></PublicLayout>} />
            <Route path="/life-insurance" element={<PublicLayout><LifeInsurance /></PublicLayout>} />
            <Route path="/life-insurance/quote" element={<PublicLayout><LifeInsuranceFunnel /></PublicLayout>} />
            <Route path="/real-estate" element={<PublicLayout><RealEstate /></PublicLayout>} />

            <Route path="/dsm-property-solutions" element={<PublicLayout><HomeRepair /></PublicLayout>} />
            <Route path="/mortgage" element={<PublicLayout><Mortgage /></PublicLayout>} />
            <Route path="/business-insurance" element={<PublicLayout><BusinessInsurance /></PublicLayout>} />
            <Route path="/group-benefits" element={<PublicLayout><GroupBenefits /></PublicLayout>} />
            <Route path="/auto-insurance" element={<PublicLayout><AutoInsurance /></PublicLayout>} />
            <Route path="/insurance/quote" element={<PublicLayout><InsuranceQuoteFunnel /></PublicLayout>} />
            <Route path="/logistics" element={<PublicLayout><PublicLogistics /></PublicLayout>} />
            <Route path="/logistics/loads" element={<PublicLayout><PublicLogistics /></PublicLayout>} />
            <Route path="/logistics/booking" element={<PublicLayout><PublicLogistics /></PublicLayout>} />
            <Route path="/logistics/search" element={<PublicLayout><PublicLogistics /></PublicLayout>} />
            <Route path="/logistics/listing" element={<PublicLayout><PublicLogistics /></PublicLayout>} />
            <Route path="/investments" element={<PublicLayout><InvestmentShowcase /></PublicLayout>} />
            <Route path="/securities" element={<PublicLayout><Securities /></PublicLayout>} />

            <Route path="/advisors" element={<PublicLayout><Advisors /></PublicLayout>} />
            <Route path="/advisor/:slug" element={<PublicLayout><AdvisorMicrosite /></PublicLayout>} />
            <Route path="/campaign/:slug" element={<PublicLayout><CampaignLandingPage /></PublicLayout>} />
            <Route path="/resources" element={<PublicLayout><Resources /></PublicLayout>} />
            <Route path="/contact" element={<PublicLayout><Contact /></PublicLayout>} />
            <Route path="/transparency" element={<PublicLayout><AnnualReport /></PublicLayout>} />
            <Route path="/press" element={<PublicLayout><PressReleases /></PublicLayout>} />
            <Route path="/join" element={<PublicLayout><JoinTeam /></PublicLayout>} />
            <Route path="/book/:id" element={<PublicBookingPage />} />
            <Route path="/track/:token" element={<LoadTracking />} />
            <Route path="/activate/:token" element={<ActivateAccount />} />
            <Route path="/privacy" element={<PublicLayout><PrivacyPolicy /></PublicLayout>} />
            <Route path="/terms" element={<PublicLayout><TermsOfUse /></PublicLayout>} />

            {/* AUTHENTICATION */}
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/client-portal" element={<PublicLayout><ClientPortal /></PublicLayout>} />

            {/* CLIENT BANK VERIFICATION (public — no auth required) */}
            <Route path="/verify/:token" element={<ClientVerify />} />

            {/* PUBLIC BOOKING / SCHEDULING PAGE */}
            <Route path="/schedule" element={<PublicLayout><BookingPage /></PublicLayout>} />

            {/* ADVISOR TERMINAL (CRM) */}
            <Route path="/crm" element={<ProtectedCRMRoute />}>
              <Route index element={<Navigate to="/crm/dashboard" replace />} />
              <Route path="dashboard" element={<Dashboard />} />
              <Route path="onboarding-flow" element={<AdvisorOnboardingFlow />} />
              <Route path="inbox" element={<Inbox />} />
              <Route path="leads" element={<Leads />} />
              <Route path="intake" element={<LeadIntake />} />
              <Route path="clients" element={<Clients />} />
              <Route path="commissions" element={<Commissions />} />
              <Route path="calendar" element={<Calendar />} />
              <Route path="campaigns" element={<CampaignManager />} />
              <Route path="profile" element={<ProfileSettings />} />
              <Route path="legal" element={<LegalCompliance />} />
              <Route path="bank-verification" element={<BankVerification />} />
              <Route path="telephony" element={<TelephonyHub />} />
              <Route path="securities" element={<SecuritiesWealth />} />

              {/* VERTICAL HUBS */}
              <Route path="applications" element={<PoliciesApps />} />
              <Route path="auto-quotes" element={<AutoQuotes />} />
              <Route path="commercial-quotes" element={<CommercialQuotes />} />
              <Route path="fleet" element={<FleetManager />} />
              <Route path="claims" element={<Claims />} />
              <Route path="properties" element={<PropertyPipeline />} />
              <Route path="escrow" element={<TransactionsEscrow />} />
              <Route path="loans" element={<LoanApplications />} />
              <Route path="rates" element={<RateTools />} />
              <Route path="refi-calc" element={<RefinanceCalc />} />
              <Route path="portfolio" element={<PortfolioMgmt />} />
              <Route path="compliance" element={<ComplianceDocs />} />
              <Route path="fees" element={<AdvisoryFees />} />
              <Route path="securities-portfolio" element={<SecuritiesPortfolio />} />
              <Route path="real-estate-intelligence" element={<RealEstateIntelligence />} />
              <Route path="logistics" element={<CRMLogisticsHub />} />
              <Route path="logistics/post-load" element={<LoadPostingTerminal />} />

              {/* ADMIN CONTROL PANEL */}
              <Route element={<ManagerRoute />}>
                <Route path="admin" element={<AdminUsers />} />
                <Route path="onboarding" element={<AdminOnboarding />} />
                <Route path="admin/real-estate" element={<RealEstateAdmin />} />
                <Route path="admin/real-estate-cms" element={<RealEstateCms />} />
              </Route>

              {/* SUPER ADMIN ONLY - Based on screenshot request */}
              <Route element={<SuperAdminRoute />}>
                <Route path="admin/website" element={<WebsiteSettings />} />
                <Route path="website-settings" element={<WebsiteSettings />} />
                <Route path="admin/transparency" element={<AnnualReportAdmin />} />
                <Route path="admin/press" element={<PressReleaseAdmin />} />
                <Route path="admin/products" element={<ProductCms />} />
                <Route path="admin/carriers" element={<CarrierAssignment />} />
                <Route path="admin/testimonials" element={<AdminTestimonials />} />
                <Route path="admin/signature" element={<EmailSignature />} />
                <Route path="admin/marketing" element={<MarketingIntegrations />} />
                <Route path="admin/access-logs" element={<AccessLogs />} />
                <Route path="admin/analytics" element={<AdminAnalytics />} />
                <Route path="admin/commissions" element={<CommissionRecon />} />
                <Route path="admin/landing-pages" element={<LandingPageBuilder />} />
                <Route path="admin/routing" element={<AdvisorRoutingPage />} />
              </Route>
            </Route>
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Router>
        </SoftphoneProvider>
      </ThemeProvider>
    </DataProvider>
  );
};

export default App;
