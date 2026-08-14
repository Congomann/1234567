
export enum LeadStatus {
  NEW = 'New',
  CONTACTED = 'Contacted',
  UNAVAILABLE = 'Unavailable',
  PROPOSAL = 'Proposal',
  APPROVED = 'Approved',
  CLOSED = 'Closed',
  LOST = 'Lost',
  ASSIGNED = 'Assigned'
}

export enum TaskPriority {
  HIGH = 'High',
  MEDIUM = 'Medium',
  LOW = 'Low'
}

export interface Task {
  id: string;
  title: string;
  priority: TaskPriority;
  completed: boolean;
  order: number;
  dueDate?: string;
  advisorId: string;
}

export enum ProductType {
  LIFE = 'Life Insurance',
  IUL = 'Indexed Universal Life (IUL)',
  REAL_ESTATE = 'Real Estate',
  MORTGAGE = 'Mortgage Lending & Refinance',
  BUSINESS = 'Business Insurance',
  EO = 'E&O Insurance',
  PROPERTY = 'Property Insurance',
  SECURITIES = 'Securities / Series',
  AUTO = 'Auto Insurance',
  COMMERCIAL = 'Commercial Insurance',
  ANNUITY = 'Annuity',
  FINAL_EXPENSE = 'Final Expense',
  INVESTMENT = 'Investment & Retirement Advisory',
  LOGISTICS = 'Logistics & Trucking',
  HOME_REPAIR = 'DSM Property Solutions'
}

export enum UserRole {
  ADMIN = 'Administrator',
  MANAGER = 'Manager',
  SUB_ADMIN = 'Sub-Admin',
  ADVISOR = 'Advisor',
  CLIENT = 'Client',
  EXTERNAL = 'External'
}

export enum AdvisorCategory {
  INSURANCE = 'Insurance & General',
  REAL_ESTATE = 'Real Estate',
  SECURITIES = 'Securities',
  MORTGAGE = 'Mortgage & Lending',
  LOGISTICS = 'Logistics',
  ADMIN = 'Admin'
}

export enum LogisticsNiche {
  TRUCKING = 'Trucking',
  FUEL = 'Fuel',
  FREIGHT_BROKERAGE = 'Freight Brokerage'
}

export interface LogisticsDetails {
  niche: LogisticsNiche;
  mcNumber?: string;
  dotNumber?: string;
  fleetSize?: number;
  gallonsPerMonth?: number;
  fuelType?: string;
  freightVolume?: string;
  lanes?: string;
  equipmentType?: string;
}

export interface MarketingCampaign {
  id: string;
  name: string;
  status: 'Draft' | 'Active' | 'Completed' | 'Paused';
  budget: number;
  spend: number;
  revenueGenerated: number;
  startDate: string;
  endDate?: string;
  audienceId: string;
  leadsGenerated: number;
  dealsClosed: number;
  roi: number;
}

export interface MarketingAudience {
  id: string;
  name: string;
  size: number;
  criteria: any;
  createdAt: string;
}

export interface PaymentTransaction {
  id: string;
  amount: number;
  currency: string;
  status: 'pending' | 'succeeded' | 'failed';
  stripePaymentIntentId?: string;
  campaignId: string;
  date: string;
  approvedBy?: string;
}

export interface CampaignApproval {
  id: string;
  campaignId: string;
  requestedBudget: number;
  status: 'pending' | 'approved' | 'rejected';
  requestedBy: string;
  reviewerId?: string;
  notes?: string;
  dateRequested: string;
  dateReviewed?: string;
}

export interface SocialLink {
  platform: 'LinkedIn' | 'Facebook' | 'Twitter' | 'Instagram' | 'TikTok' | 'X' | 'YouTube' | 'Snapchat';
  url: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  category: AdvisorCategory;
  title?: string;
  yearsOfExperience?: number;
  productsSold?: ProductType[];
  languages?: string[];
  micrositeEnabled?: boolean;
  avatar?: string;
  phone?: string;
  bio?: string;
  address?: string;
  city?: string;
  state?: string;
  socialLinks?: SocialLink[];
  license_state?: string;
  license_states?: string[];
  contractLevel?: number;
  deletedAt?: string;
  calendarUrl?: string;
  onboardingCompleted?: boolean;
  password?: string;
  permissions?: string[];
  lastLogin?: string;
}

export interface LifeDetails {
  dob: string;
  street: string;
  city: string;
  state: string;
  zip: string;
  preferredCarrier: string;
  preferredCoverage: number;
  monthlyPremiumTarget: number;
  annualIncome: number;
  smokerStatus: 'Non-Smoker' | 'Smoker' | 'Former Smoker';
  ssn: string;
  netWorth: number;
  healthIssues: string;
  height?: string;
  weight?: string;
}

export interface HomeRepairDetails {
  address: string;
  evaluationTime: string;
  propertyType: 'Residential' | 'Commercial' | string;
  issueDescription: string;
  isEmergency: boolean;
}

export interface RealEstateDetails {
  intent: 'Buy' | 'Sell' | 'Invest' | string;
  timeline: 'ASAP' | '1-3 Months' | '3-6 Months' | '6+ Months' | string;
  budget: string;
  propertyType: 'Single Family' | 'Multi-Family' | 'Commercial' | 'Land' | string;
}

export interface SecuritiesDetails {
  serviceType: 'Portfolio Management' | 'Licensing Support' | 'Retirement Planning' | 'Other' | string;
  investableAssets: string;
  riskTolerance: 'Low' | 'Moderate' | 'High' | string;
}

export interface Lead {
  id: string;
  name: string;
  email: string;
  phone: string;
  interest: ProductType;
  message: string;
  date: string;
  status: LeadStatus | string;
  aiAnalysis?: string;
  score: number;
  qualification: 'Hot' | 'Warm' | 'Cold';
  isSimulated?: boolean;
  assignedTo?: string;
  priority?: 'High' | 'Medium' | 'Low';
  notes?: string;
  source?: string;
  lastContactDate?: string;
  potentialValue?: number;
  campaign?: string;
  adGroup?: string;
  adId?: string;
  platformData?: string;
  lifeDetails?: Partial<LifeDetails>;
  realEstateDetails?: Partial<RealEstateDetails>;
  securitiesDetails?: Partial<SecuritiesDetails>;
  logisticsDetails?: Partial<LogisticsDetails>;
  homeRepairDetails?: Partial<HomeRepairDetails>;
  customDetails?: any;
  isArchived?: boolean;
  deletedAt?: string;
  externalMetadata?: {
    leadId?: string;
    campaignId?: string;
    adGroupId?: string;
    adId?: string;
    formId?: string;
    platform?: string;
  };
  visitor_id?: string;
  browseHistory?: any[];
  assignedAt?: string;
  completedAt?: string;
}

export type InteractionType = 'Call' | 'Email' | 'Meeting' | 'Note' | 'SMS' | 'Status Change';

export interface Interaction {
  id: string;
  leadId?: string;
  clientId?: string;
  authorId: string;
  authorName: string;
  type: InteractionType;
  content: string;
  metadata?: any;
  createdAt: string;
}

export interface AccessLog {
  id: string;
  userId: string;
  userName: string;
  action: string;
  ipAddress?: string;
  userAgent?: string;
  metadata?: any;
  createdAt: string;
}

export interface UserDocument {
  id: string;
  ownerId: string;
  clientId?: string;
  leadId?: string;
  title: string;
  filePath: string;
  fileType: string;
  fileSize: number;
  category: string;
  version: number;
  isEncrypted: boolean;
  accessPermissions: {
    roles: UserRole[];
    users?: string[];
  };
  createdAt: string;
  updatedAt: string;
  deletedAt?: string;
}

export interface UserPreference {
  userId: string;
  emailNotifications: boolean;
  smsAlerts: boolean;
  pushNotifications: boolean;
  theme: 'light' | 'dark' | 'system';
  timezone: string;
  compactView?: boolean;
}

export interface IntegrationLog {
  id: string;
  timestamp: string;
  platform: 'google_ads' | 'meta_ads' | 'tiktok_ads' | 'linkedin_ads';
  event: string;
  status: 'success' | 'failure';
  payload: any;
  error?: string;
}

export interface IntegrationConfig {
  googleAds: {
    enabled: boolean;
    webhookUrl: string;
    developerToken: string;
  };
  metaAds: {
    enabled: boolean;
    verifyToken: string;
    accessToken: string;
  };
  tiktokAds: {
    enabled: boolean;
    webhookUrl: string;
    accessToken: string;
  };
  linkedinAds: {
    enabled: boolean;
    pollingInterval: number;
    accessToken: string;
  };
}

export interface Client {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  street?: string;
  city?: string;
  state?: string;
  zip?: string;
  policyNumber: string;
  premium: number;
  product: ProductType;
  renewalDate: string;
  commissionAmount?: number;
  carrier?: string;
}

export interface CallbackRequest {
  id: string;
  name: string;
  phone: string;
  timeRequested: string;
  resolved: boolean;
}

export interface DashboardMetrics {
  totalRevenue: number;
  activeClients: number;
  pendingLeads: number;
  monthlyPerformance: { month: string; revenue: number; leads: number }[];
  totalCommission: number;
  totalAUM?: number;
  avgPortfolioReturn?: number;
  activePortfolios?: number;
}

export interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'alert';
  timestamp: Date;
  read: boolean;
  relatedId?: string;
  resourceType?: 'lead' | 'client' | 'event' | 'application' | 'job_application';
}

export interface Commission {
  id: string;
  clientId: string;
  clientName: string;
  product: ProductType;
  premium: number;
  rate: number;
  amount: number;
  date: string;
  status?: 'Pending Carrier Payment' | 'Paid' | 'Void';
}

export interface CalendarEvent {
  id: string;
  title: string;
  date: string;
  endDate?: string;
  time: string;
  endTime?: string;
  timezone?: string;
  type: 'meeting' | 'reminder' | 'task' | 'off-day';
  status?: 'scheduled' | 'rescheduled' | 'canceled' | 'completed';
  recordingEnabled?: boolean;
  description?: string;
  hasGoogleMeet?: boolean;
  meetingLink?: string;
  participants?: { name: string; avatar?: string }[];
  creatorId?: string;
  creatorName?: string;
  visibility?: 'public' | 'private';
}

export interface Email {
  id: string;
  from: string;
  subject: string;
  preview: string;
  body: string;
  date: string;
  read: boolean;
  folder: 'inbox' | 'sent' | 'drafts';
  labels: string[];
}

export interface Colleague {
  id: string;
  name: string;
  role: string;
  status: 'online' | 'offline' | 'busy';
  avatar: string;
  isTyping?: boolean;
}

export interface ChatAttachment {
  type: 'image' | 'file' | 'audio';
  url: string;
  name: string;
}

export interface ChatMessage {
  id: string;
  senderId: string;
  receiverId: string;
  text: string;
  timestamp: Date;
  read: boolean;
  isEdited?: boolean;
  attachment?: ChatAttachment;
}

export interface Carrier {
  name: string;
  category: string;
}

export interface AdvisorAssignment {
  id: string;
  advisorId: string;
  carrierName: string;
  category: string;
  assignedBy: string;
  assignedAt: string;
}

export interface ResourceComment {
  id: string;
  user: string;
  avatar?: string;
  text: string;
  date: string;
}

export interface Resource {
  id: string;
  title: string;
  type: 'PDF' | 'Link' | 'Video' | 'Article' | 'Blog' | 'Image' | 'YouTube';
  url: string;
  thumbnail?: string;
  content?: string;
  description?: string;
  dateAdded: string;
  author?: string;
  likes: number;
  dislikes: number;
  shares: number;
  comments: ResourceComment[];
  tags?: string[];
}

export interface RealEstateResourceLink {
  id: string;
  title: string;
  url: string;
  description: string;
  type: 'Buying' | 'Selling' | 'Investing' | 'Legal';
}

export interface ProductListing {
  id: string;
  title: string;
  description: string;
  features: string[];
  image: string;
  icon: string;
  color: string;
  link: string;
  isHidden: boolean;
  order: number;
}

export interface CompanySettings {
  maintenanceMode?: boolean;
  maintenanceMessage?: string;
  phone: string;
  email: string;
  address: string;
  city: string;
  state: string;
  zip: string;
  heroBackgroundType: 'image' | 'video' | 'youtube';
  heroBackgroundUrl: string;
  heroVideoPlaylist?: string[];
  archivedVideos?: { url: string; deletedAt: string }[];
  heroTitle?: string;
  heroSubtitle?: string;
  aboutImageUrl?: string;
  productImages?: Record<string, string>;
  partners?: Record<string, string>;
  partnerMarqueeSpeed?: number;
  hiddenProducts?: string[];
  customProducts?: ProductListing[];
  termsOfUse?: string;
  solicitorAgreement?: string;
  footerDescription?: string;
  socialLinks?: SocialLink[];
  logoUrl?: string;
  hideLogo?: boolean;
  hideStreetAddress?: boolean;
  hideDirectLine?: boolean;

  // Theme & Branding
  themePrimaryColor?: string;
  themeSecondaryColor?: string;
  themeAccentColor?: string;
  themeStructure?: 'default' | 'modern' | 'minimal' | 'bold' | 'ios' | 'macos' | 'material' | 'neumorphic';

  // Plaid Integration 
  plaidClientId?: string;
  plaidSecret?: string;
  plaidEnv?: 'sandbox' | 'development' | 'production';

  // CRM Customization
  leadStatuses?: string[];

  // Real Estate Portal Specifics
  realEstateAbout?: string;
  realEstateContactCta?: string;
  realEstateResources?: RealEstateResourceLink[];

  // System Configuration
  maintenanceModeEnabled?: boolean;
  maintenanceModeText?: string;

  // Annual Report & Transparency
  annualReportData?: {
    isPublished?: boolean;
    metrics?: any;
    audits?: any;
    partnerRevenue?: any;
    quarterlyReports?: any;
  };
}

export interface Testimonial {
  id: string;
  advisorId: string;
  clientName: string;
  rating: number;
  reviewText: string;
  status: 'pending' | 'approved' | 'pending_edit';
  date: string;
  editedClientName?: string;
  editedRating?: number;
  editedReviewText?: string;
}

export interface JobApplication {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  address: string;
  licenseNumber?: string;
  experience: string;
  status: 'Pending' | 'Approved' | 'Rejected';
  date: string;
  resumeName?: string;
}

export enum ApplicationStatus {
  PENDING = 'Pending',
  UNDERWRITING = 'Underwriting',
  APPROVED = 'Approved',
  ISSUED = 'Issued',
  DECLINED = 'Declined'
}

export interface Application {
  id: string;
  leadId: string;
  clientName: string;
  carrier: string;
  policyNumber: string;
  status: ApplicationStatus;
  premium: number;
  commission?: number;
}

export interface PerformanceTargets {
  monthly: number;
  quarterly: number;
  presidentsClub: number;
}

export interface PropertyListing {
  id: string;
  address: string;
  city: string;
  state: string;
  zip: string;
  county?: string;
  price: number;
  type: 'Residential' | 'Commercial' | 'Land' | 'Multi-Family' | 'Acreage';
  status: 'Active' | 'Pending' | 'Sold' | 'Off Market' | 'Pending Approval' | 'Rejected';
  bedrooms?: number;
  bathrooms?: number;
  sqft?: number;
  image: string;
  images?: string[]; // For photo gallery
  videoUrl?: string;
  listedDate: string;
  sellerName: string;
  advisorId: string;

  // Overview
  headline?: string;
  description?: string;
  highlights?: string[]; // e.g., ["Move-in Ready", "Cul-de-Sac"]

  // Key Facts
  yearBuilt?: number;
  heating?: string;
  cooling?: string;
  parking?: string;
  hoa?: boolean;
  hoaFee?: number;
  pricePerSqft?: number;

  // Interior
  flooring?: string;
  basement?: string;
  appliances?: string;
  laundry?: string;
  interiorFeatures?: string;

  // Property & Exterior
  levels?: string;
  stories?: number;
  exteriorFeatures?: string;
  fencing?: string;
  patioPorch?: string;
  poolSpa?: string;

  // Lot
  lotSize?: string; // e.g. "6.44 acres / 280,526 Sq. Ft."
  lotDimensions?: string;
  lotFeatures?: string;
  roadSurface?: string;

  // Construction
  architecturalStyle?: string;
  foundation?: string;
  roof?: string;
  materials?: string;
  condition?: string;

  // Utilities & Green Energy
  water?: string;
  sewer?: string;
  electric?: string;
  gas?: string;
  energyFeatures?: string;

  // Added missing properties from linter
  fullBathrooms?: number;
  mainLevelBedrooms?: number;
  totalStructureArea?: number;
  totalInteriorLivableArea?: number;
  homeType?: string;
  propertySubtype?: string;
  region?: string;
  cumulativeDaysOnMarket?: number;
  roadSurfaceType?: string;
  sourceName?: string;
  mlsNumber?: string;
  mlsName?: string;
  sourceLogo?: string;

  // Community & HOA
  hoaIncludes?: string;
  associationName?: string;
  communityFeatures?: string;
  subdivision?: string;
  schoolDistrict?: string;

  // Tax & History
  taxAmount?: number;
  taxAssessedValue?: number;
  priceHistory?: { date: string; price: number; event: string }[];

  // Neighborhood
  walkScore?: number;
  nearbySchools?: string[];
  nearbyAmenities?: string[];
  neighborhoodDescription?: string;

  // Metadata
  parcelNumber?: string;
  zoning?: string;
  mlsId?: string;
  listingTerms?: string;
  daysOnMarket?: number;

  // Other
  restrictions?: string;
  inclusions?: string;
  directions?: string;
  source?: string;
}

export interface EscrowTransaction {
  id: string;
  propertyId: string;
  propertyAddress: string;
  clientName: string;
  role: 'Buyer' | 'Seller';
  amount: number;
  status: 'Open' | 'Closed' | 'Cancelled';
  stage: 'Offer Accepted' | 'Inspection' | 'Appraisal' | 'Loan Contingency' | 'Final Walkthrough' | 'Closing' | 'Due Diligence';
  closingDate: string;
  earnestMoney: number;
  advisorId: string;
}

export interface PortfolioHolding {
  id: string;
  ticker: string;
  name: string;
  shares: number;
  price: number;
  value: number;
  allocation: number;
  assetClass: 'Equity' | 'Fixed Income' | 'Cash' | 'Alternative';
}

export interface ClientPortfolio {
  id: string;
  clientId: string;
  clientName: string;
  totalValue: number;
  ytdReturn: number;
  riskProfile: 'Conservative' | 'Moderate' | 'Aggressive' | 'Growth';
  holdings: PortfolioHolding[];
  lastRebalanced: string;
  advisorId: string;
}

export interface ComplianceDocument {
  id: string;
  title: string;
  type: 'Form ADV' | 'KYC' | 'Risk Assessment' | 'Trade Blotter' | 'IPS' | 'Annual Review';
  clientName?: string;
  uploadDate: string;
  status: 'Valid' | 'Expired' | 'Pending Review';
  url: string;
  advisorId: string;
}

export interface AdvisoryFee {
  id: string;
  clientId: string;
  clientName: string;
  aum: number;
  feeRate: number;
  billingPeriod: 'Q1' | 'Q2' | 'Q3' | 'Q4';
  amount: number;
  status: 'Invoiced' | 'Paid' | 'Overdue';
  dueDate: string;
  advisorId: string;
}

export enum AccountType {
  ASSET = 'Asset',
  LIABILITY = 'Liability',
  EQUITY = 'Equity',
  REVENUE = 'Revenue',
  EXPENSE = 'Expense'
}

export interface Account {
  id: string;
  code: string;
  name: string;
  type: AccountType;
  category: string;
  normalBalance: 'debit' | 'credit';
  balance: number;
}

export interface JournalLine {
  id: string;
  accountId: string;
  debit: number;
  credit: number;
  description: string;
  advisorId?: string;
}

export interface JournalEntry {
  id: string;
  date: string;
  description: string;
  reference?: string;
  lines: JournalLine[];
  createdAt: string;
  status: 'draft' | 'posted';
}

export interface TaxConfig {
  id: string;
  name: string;
  rate: number;
  liabilityAccountId: string;
  expenseAccountId: string;
  state: string;
}

export interface BankAccount {
  id: string;
  userId: string;
  institutionName: string;
  accountName: string;
  mask: string;
  type: string;
  balance: number;
  lastSynced: string;
  status: 'active' | 'disconnected';
}

export interface BankTransaction {
  id: string;
  bankAccountId: string;
  date: string;
  merchant: string;
  amount: number;
  category: string;
  status: 'pending' | 'reconciled';
  isRuleMatch?: boolean;
  matchedRuleId?: string;
}

export interface ExpenseCategory {
  id: string;
  name: string;
  glAccountId: string;
  taxDeductible: boolean;
  keywords: string[];
}

export interface BankRuleCondition {
  field: 'merchant' | 'amount';
  operator: 'contains' | 'equals';
  value: string;
}

export interface BankRule {
  id: string;
  name: string;
  conditions: BankRuleCondition[];
  assignCategory: string;
  userId: string;
}

export interface LoanApplication {
  id: string;
  clientName: string;
  loanAmount: number;
  loanType: 'Purchase' | 'Refinance' | 'HELOC' | 'Cash-Out Refi';
  status: 'Applied' | 'Processing' | 'Underwriting' | 'Approved' | 'Closed' | 'Declined';
  interestRate: number;
  currentRate?: number;
  propertyValue: number;
  ltv: number;
  creditScore: number;
  advisorId: string;
  createdAt: string;
  strategicGoal?: 'Lower Payment' | 'Equity Access' | 'Debt Consolidation' | 'Wealth Building';
  monthlySavings?: number;
  lifetimeInterestSavings?: number;
}

export enum WorkflowTrigger {
  LEAD_INGESTION = 'LEAD INGESTION',
  POLICY_EXPIRATION = 'POLICY EXPIRATION',
  CLIENT_BIRTHDAY = 'CLIENT BIRTHDAY',
  MANUAL_TRIGGER = 'MANUAL TRIGGER'
}

export interface Workflow {
  id: string;
  name: string;
  description: string;
  trigger: WorkflowTrigger | string;
  actions: string[];
  status: 'active' | 'paused';
  impact: 'HIGH' | 'MEDIUM';
  category: 'LEAD NURTURE' | 'COMPLIANCE' | 'OPERATIONS' | 'SOCIAL AUTOMATION' | string;
  executionsYTD: number;
  createdAt: string;
}

export enum TrailerType {
  VAN = 'Dry Van',
  REEFER = 'Reefer',
  FLATBED = 'Flatbed',
  STEP_DECK = 'Step-Deck',
  HAZMAT = 'Hazmat',
  HEAVY_HAUL = 'Heavy Haul / RGN'
}

export interface FreightLoad {
  id: string;
  brokerId: string;
  brokerName: string;
  origin: string; // Point A
  destination: string; // Point D
  distance: number; // Total Miles
  totalRate: number; // Total Cost
  pickupDate: string;
  deliveryDate: string;
  trailerType: TrailerType;
  requirements: {
    cleanTrailer: boolean;
    onTimeGuarantee: boolean;
    trackingRequired: boolean;
    tarpRequired?: boolean;
    hazmatCertified?: boolean;
  };
  description: string;
  status: 'Available' | 'Assigned' | 'In Transit' | 'Delivered';
  createdAt: string;
}
