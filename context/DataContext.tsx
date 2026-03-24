
import React, { createContext, useContext, useState, ReactNode, useEffect, useCallback, useRef } from 'react';
import { Lead, Client, DashboardMetrics, ProductType, LeadStatus, User, UserRole, Notification, CalendarEvent, ChatMessage, AdvisorCategory, CompanySettings, Resource, Carrier, AdvisorAssignment, Testimonial, Application, ApplicationStatus, IntegrationConfig, IntegrationLog, LoanApplication, Colleague, PropertyListing, EscrowTransaction, ClientPortfolio, ComplianceDocument, AdvisoryFee, JobApplication, Workflow, WorkflowTrigger, Task, TaskPriority, AccessLog, UserDocument, Interaction, UserPreference } from '../types';
import { Backend } from '../services/apiBackend';
import { socketService } from '../services/socketService';

interface AutomationMetrics {
  executions: number;
  bandwidthSaved: number; // in minutes
}

interface ProcessingState {
  leadId: string;
  activeNode: string; // 'AI BRIEF' | 'GENERATE REMINDER' | 'DRAFT SMS' | null
}

interface DataContextType {
  user: User | null;
  isLoading: boolean;
  allUsers: User[];
  leads: Lead[];
  clients: Client[];
  tasks: Task[];
  metrics: DashboardMetrics;
  automationMetrics: AutomationMetrics;
  notifications: Notification[];
  chatMessages: ChatMessage[];
  companySettings: CompanySettings;
  resources: Resource[];
  commissions: any[];
  events: CalendarEvent[];
  testimonials: Testimonial[];
  availableCarriers: Carrier[];
  colleagues: Colleague[];
  jobApplications: JobApplication[];
  applications: Application[];
  properties: PropertyListing[];
  transactions: EscrowTransaction[];
  portfolios: ClientPortfolio[];
  complianceDocs: ComplianceDocument[];
  advisoryFees: AdvisoryFee[];
  loanApplications: LoanApplication[];
  integrationLogs: IntegrationLog[];
  integrationConfig: IntegrationConfig;
  workflows: Workflow[];
  processingLeads: ProcessingState[];
  accessLogs: AccessLog[];
  documents: UserDocument[];
  interactions: Interaction[];
  userPreferences: UserPreference | null;

  signup: (email: string, password: string, name: string, role?: UserRole) => Promise<boolean>;
  login: (email: string, password?: string) => Promise<boolean>;
  resetPassword: (email: string) => Promise<boolean>;
  logout: () => void;
  addLead: (lead: Partial<Lead>, assignTo?: string) => void;
  updateLeadStatus: (id: string, status: LeadStatus | string, analysis?: string) => void;
  updateLead: (id: string, data: Partial<Lead>) => void;
  assignLeads: (leadIds: string[], advisorId: string, priority?: string, notes?: string) => void;
  updateClient: (id: string, data: Partial<Client>) => void;
  updateUser: (id: string, data: Partial<User>) => void;
  updateCompanySettings: (settings: CompanySettings) => Promise<boolean>;
  landingPages: any[];
  saveLandingPage: (page: any) => Promise<boolean>;
  markNotificationRead: (id: string) => void;
  clearNotifications: () => void;
  completeOnboarding: (signatureData?: string) => void;
  updateIntegrationConfig: (config: Partial<IntegrationConfig>) => void;
  getAdvisorAssignments: (advisorId: string) => AdvisorAssignment[];
  likeResource: (id: string) => void;
  dislikeResource: (id: string) => void;
  shareResource: (id: string) => void;
  addResourceComment: (id: string, text: string, userName: string) => void;
  addResource: (resource: Partial<Resource>) => void;
  deleteResource: (id: string) => void;
  addTestimonial: (testimonial: Omit<Testimonial, 'id' | 'status' | 'date'>) => void;
  approveTestimonial: (id: string) => void;
  deleteTestimonial: (id: string) => void;
  submitTestimonialEdit: (id: string, edits: Partial<Testimonial>) => void;
  approveTestimonialEdit: (id: string) => void;
  rejectTestimonialEdit: (id: string) => void;
  addCallback: (request: any) => void;
  handleAdvisorLeadAction: (id: string, action: string, reason?: string) => void;

  addEvent: (event: Partial<CalendarEvent>) => void;
  updateEvent: (event: Partial<CalendarEvent>) => void;
  deleteEvent: (id: string) => void;
  addAdvisor: (data: Partial<User>) => void;
  deleteAdvisor: (id: string) => void;
  restoreUser: (id: string) => void;
  permanentlyDeleteUser: (id: string) => void;
  assignCarriers: (advisorIds: string[], carriers: Carrier[]) => void;
  markChatRead: (id: string) => void;
  editChatMessage: (id: string, text: string) => void;
  deleteChatMessage: (id: string) => void;
  sendChatMessage: (receiverId: string, text: string, attachment?: any) => void;
  submitJobApplication: (data: any) => void;
  updateJobApplicationStatus: (id: string, status: string, config?: any) => void;
  updateApplicationStatus: (id: string, status: ApplicationStatus) => void;

  addProperty: (property: Partial<PropertyListing>) => void;
  updateProperty: (id: string, property: Partial<PropertyListing>) => void;
  deleteProperty: (id: string) => void;
  updateTransactionStatus: (id: string, status: 'Open' | 'Closed' | 'Cancelled', stage?: EscrowTransaction['stage']) => void;
  addPortfolio: (data: Partial<ClientPortfolio>) => void;
  updatePortfolio: (id: string, data: Partial<ClientPortfolio>) => void;
  deletePortfolio: (id: string) => void;
  addComplianceDoc: (data: Partial<ComplianceDocument>) => void;
  updateFeeStatus: (id: string, status: string) => void;
  addAdvisoryFee: (data: Partial<AdvisoryFee>) => void;
  updateAdvisoryFee: (id: string, data: Partial<AdvisoryFee>) => void;
  deleteAdvisoryFee: (id: string) => void;
  addLoanApplication: (data: Partial<LoanApplication>) => void;
  updateLoanApplication: (id: string, data: Partial<LoanApplication>) => void;
  deleteLoanApplication: (id: string) => void;

  addWorkflow: (workflow: Partial<Workflow>) => void;
  toggleWorkflow: (id: string) => void;
  triggerPulse: () => void;

  addTask: (task: Omit<Task, 'id' | 'order'>) => void;
  toggleTask: (id: string) => void;
  deleteTask: (id: string) => void;
  reorderTasks: (sourceIndex: number, targetIndex: number) => void;

  // New platform methods
  logInteraction: (data: Partial<Interaction>) => Promise<void>;
  fetchInteractions: (leadId?: string, clientId?: string) => Promise<void>;
  saveDoc: (doc: Partial<UserDocument>) => Promise<void>;
  updatePreferences: (prefs: Partial<UserPreference>) => Promise<void>;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

export const useData = () => {
  const context = useContext(DataContext);
  if (!context) throw new Error('useData must be used within a DataProvider');
  return context;
};

const INITIAL_USERS: User[] = [
  { id: 'admin-main', name: 'Internal Admin', email: 'info@newhollandfinancial.com', role: UserRole.ADMIN, category: AdvisorCategory.ADMIN, avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&q=80&w=200', onboardingCompleted: true },
  { id: '2', name: 'James Manager', email: 'manager@nhfg.com', role: UserRole.MANAGER, category: AdvisorCategory.ADMIN, avatar: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&q=80&w=200', onboardingCompleted: true },
  { id: '4', name: 'David Insurance', email: 'insurance@nhfg.com', phone: '(555) 123-4567', role: UserRole.ADVISOR, category: AdvisorCategory.INSURANCE, productsSold: [ProductType.LIFE, ProductType.IUL, ProductType.ANNUITY], onboardingCompleted: true, micrositeEnabled: true },
  { id: '5', name: 'Sarah RealEstate', email: 'realestate@nhfg.com', phone: '(555) 987-6543', role: UserRole.ADVISOR, category: AdvisorCategory.REAL_ESTATE, productsSold: [ProductType.REAL_ESTATE], onboardingCompleted: true, micrositeEnabled: true },
  { id: '6', name: 'Marcus Mortgage', email: 'mortgage@nhfg.com', phone: '(555) 444-3333', role: UserRole.ADVISOR, category: AdvisorCategory.MORTGAGE, productsSold: [ProductType.MORTGAGE], onboardingCompleted: true, micrositeEnabled: true },
  { id: '7', name: 'Sophia Securities', email: 'securities@nhfg.com', phone: '(555) 777-8888', role: UserRole.ADVISOR, category: AdvisorCategory.SECURITIES, productsSold: [ProductType.SECURITIES, ProductType.INVESTMENT], onboardingCompleted: true, micrositeEnabled: true },
  { id: '8', name: 'Jordan SubAdmin', email: 'subadmin@nhfg.com', role: UserRole.SUB_ADMIN, category: AdvisorCategory.ADMIN, onboardingCompleted: true },
  { id: '9', name: 'New Recruits', email: 'newbie@nhfg.com', role: UserRole.ADVISOR, category: AdvisorCategory.INSURANCE, onboardingCompleted: false },
  { id: '10', name: 'Bima Yamaisha', email: 'bimayamaisha@gmail.com', role: UserRole.ADMIN, category: AdvisorCategory.ADMIN, onboardingCompleted: true }
];

const MOCK_TASKS: Task[] = [
  { id: 't1', title: 'Call Smith regarding IUL proposal', priority: TaskPriority.HIGH, completed: false, order: 0, advisorId: '1' },
  { id: 't2', title: 'Verify property appraisal at 123 Main St', priority: TaskPriority.MEDIUM, completed: false, order: 1, advisorId: '1' },
  { id: 't3', title: 'Email signature approval for Sarah', priority: TaskPriority.LOW, completed: false, order: 2, advisorId: '1' },
  { id: 't4', title: 'Compliance audit: Q1 Disclosures', priority: TaskPriority.HIGH, completed: false, order: 3, advisorId: '1' },
];

export const DataProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [allUsers, setAllUsers] = useState<User[]>(INITIAL_USERS);
  const [leads, setLeads] = useState<Lead[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [tasks, setTasks] = useState<Task[]>(MOCK_TASKS);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [jobApplications, setJobApplications] = useState<JobApplication[]>([]);
  const [landingPages, setLandingPages] = useState<any[]>([]);
  const bootstrapFinished = useRef(false);
  const [applications, setApplications] = useState<Application[]>([]);
  const [properties, setProperties] = useState<PropertyListing[]>([]);
  const [transactions, setTransactions] = useState<EscrowTransaction[]>([]);
  const [portfolios, setPortfolios] = useState<ClientPortfolio[]>([]);
  const [complianceDocs, setComplianceDocs] = useState<ComplianceDocument[]>([]);
  const [advisoryFees, setAdvisoryFees] = useState<AdvisoryFee[]>([]);
  const [loanApplications, setLoanApplications] = useState<LoanApplication[]>([]);
  const [integrationConfig, setIntegrationConfig] = useState<IntegrationConfig>({ googleAds: { enabled: true, webhookUrl: '', developerToken: '' }, metaAds: { enabled: false, verifyToken: '', accessToken: '' }, tiktokAds: { enabled: false, webhookUrl: '', accessToken: '' }, linkedinAds: { enabled: false, pollingInterval: 300, accessToken: '' } });
  const [integrationLogs, setIntegrationLogs] = useState<IntegrationLog[]>([]);
  const [workflows, setWorkflows] = useState<Workflow[]>([]);
  const [resources, setResources] = useState<Resource[]>([]);
  const [processingLeads, setProcessingLeads] = useState<ProcessingState[]>([]);
  const [accessLogs, setAccessLogs] = useState<AccessLog[]>([]);
  const [documents, setDocuments] = useState<UserDocument[]>([]);
  const [interactions, setInteractions] = useState<Interaction[]>([]);
  const [userPreferences, setUserPreferences] = useState<UserPreference | null>(null);
  const idleTimerRef = useRef<NodeJS.Timeout | null>(null);

  const logout = useCallback(async () => {
    try {
        await Backend.logout();
    } catch (e) {}
    localStorage.removeItem('nhfg_mock_user_id');
    setUser(null);
    window.location.href = '/login';
  }, []);

  const resetInactivityTimer = useCallback(() => {
    if (idleTimerRef.current) clearTimeout(idleTimerRef.current);
    
    idleTimerRef.current = setTimeout(() => {
      console.log("[Auth] Inactivity timeout reached. Logging out.");
      logout();
    }, 10 * 60 * 1000); 
  }, [logout]);

  useEffect(() => {
    if (!user) return;
    const events = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart', 'click'];
    const handleActivity = () => resetInactivityTimer();
    events.forEach(ev => window.addEventListener(ev, handleActivity));
    resetInactivityTimer();
    return () => {
      events.forEach(ev => window.removeEventListener(ev, handleActivity));
      if (idleTimerRef.current) clearTimeout(idleTimerRef.current);
    };
  }, [user, resetInactivityTimer]);

  const [automationMetrics, setAutomationMetrics] = useState<AutomationMetrics>({
    executions: 2087,
    bandwidthSaved: 521 * 60
  });

  const [companySettings, setCompanySettings] = useState<CompanySettings>({
    phone: '(800) 555-0199', email: 'contact@newholland.com', address: '123 Finance Way', city: 'New York', state: 'NY', zip: '10001', hideStreetAddress: false,
    heroBackgroundType: 'image', heroBackgroundUrl: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&q=80&w=2070',
    heroTitle: 'Securing Your Future', heroSubtitle: 'Comprehensive financial solutions for every stage of life.',
    footerDescription: 'Providing tailored insurance solutions that secure financial peace of mind for individuals, families, and businesses.',
    socialLinks: [{ platform: 'Facebook', url: '#' }, { platform: 'LinkedIn', url: '#' }, { platform: 'X', url: '#' }, { platform: 'Instagram', url: '#' }, { platform: 'YouTube', url: '#' }, { platform: 'TikTok', url: '#' }],
    termsOfUse: '', solicitorAgreement: '', heroVideoPlaylist: [],
    realEstateAbout: "Our entire team of agents with years of combined experience represents the gold standard in real estate. We don't just sell properties; we build communities and secure legacies.",
    realEstateContactCta: "Ready to start your real estate journey? Our team is standing by to provide expert guidance tailored to your specific goals.",
    realEstateResources: [
      { id: '1', title: 'Home Buying Guide 2024', url: '#', description: 'Comprehensive roadmap for first-time buyers.', type: 'Buying' },
      { id: '2', title: 'Market Trends Report', url: '#', description: 'Analysis of residential market shifts.', type: 'Investing' }
    ],
    customProducts: [
      { id: 'life', title: 'Life Insurance', description: "Ensure your family's financial security with our comprehensive life insurance plans.", features: ['Term Life', 'Whole Life', 'Universal Life', 'Final Expense'], image: "https://picsum.photos/600/400?random=1", icon: 'ShieldCheck', color: 'blue', link: '/life-insurance', isHidden: false, order: 0 },
      { id: 'real-estate', title: 'Real Estate', description: "Specialized coverage for real estate investors, landlords, and property managers.", features: ['Loss of Rent', 'Vacant Property', 'Multi-family Dwelling', 'Renovation Risk'], image: "https://picsum.photos/600/400?random=3", icon: 'HomeIcon', color: 'amber', link: '/real-estate', isHidden: false, order: 1 },
      { id: 'mortgage', title: 'Mortgage Lending & Refinance', description: "Transform your mortgage into a strategic financial tool with personalized lending and refinance solutions.", features: ['Lower Monthly Payments', 'Cash-Out Refinance', 'Debt Consolidation', 'Strategic Mortgage Planning'], image: "https://images.unsplash.com/photo-1560518883-ce09059eeffa?ixlib=rb-1.2.1&auto=format&fit=crop&w=1600&q=80", icon: 'Landmark', color: 'cyan', link: '/mortgage', isHidden: false, order: 2 },
      { id: 'business', title: 'Business & Professional Liability', description: "Protect your business assets, operations, and professional reputation with tailored commercial and E&O packages.", features: ['General Liability', "Worker's Comp", 'Professional Liability (E&O)', 'Cyber Liability'], image: "https://picsum.photos/600/400?random=2", icon: 'Briefcase', color: 'purple', link: '/business-insurance', isHidden: false, order: 3 },
      { id: 'auto', title: 'Auto Insurance', description: "Comprehensive auto coverage for personal vehicles and commercial fleets to keep you moving.", features: ['Personal Auto', 'Commercial Fleet', 'Liability Coverage', 'Collision & Comprehensive'], image: "https://picsum.photos/600/400?random=6", icon: 'Truck', color: 'red', link: '/auto-insurance', isHidden: false, order: 4 },
      { id: 'securities', title: 'Securities & Investment Advisory', description: "Navigating financial securities, series licensing, and providing fiduciary retirement planning strategies.", features: ['Series 6, 7, 63 Support', 'Fiduciary Planning', 'Portfolio Management', 'Wealth Management Compliance'], image: "https://images.unsplash.com/photo-1611974765270-ca12586343bb?ixlib=rb-1.2.1&auto=format&fit=crop&w=1600&q=80", icon: 'BarChart3', color: 'emerald', link: '/securities', isHidden: false, order: 5 }
    ],
    partners: {},
    partnerMarqueeSpeed: 30,
    leadStatuses: ['New', 'Contacted', 'Unavailable', 'Proposal', 'Approved', 'Closed', 'Lost', 'Assigned']
  });

  const pushNotification = useCallback((title: string, message: string, type: 'info' | 'success' | 'warning' | 'alert' = 'info', resourceType?: any, relatedId?: string) => {
    const newNotif: Notification = { id: crypto.randomUUID(), title, message, type, timestamp: new Date(), read: false, resourceType, relatedId };
    setNotifications(prev => [newNotif, ...prev]);
  }, []);


  const calculateLeadScore = (lead: Partial<Lead>): number => {
    let score = 30; // Base score
    
    // Source Weighting
    if (lead.source?.includes('Google')) score += 25;
    if (lead.source?.includes('Referral')) score += 40;
    if (lead.source?.includes('LinkedIn')) score += 20;

    // Interest Weighting
    if (lead.interest === ProductType.REAL_ESTATE) score += 15;
    if (lead.interest === ProductType.IUL) score += 10;
    if (lead.interest === ProductType.INVESTMENT) score += 20;

    // Data Completeness
    if (lead.phone && lead.phone !== 'N/A') score += 10;
    if (lead.email && !lead.email.includes('gmail') && !lead.email.includes('outlook')) score += 10;
    if (lead.message && lead.message.length > 50) score += 5;

    return Math.min(score, 100);
  };

  const addLead = useCallback(async (leadData: Partial<Lead>, assignTo?: string) => {
    const score = calculateLeadScore(leadData);
    const newLead: Lead = {
      id: crypto.randomUUID(),
      name: leadData.name || 'Website Inquiry',
      email: leadData.email || 'Not Provided',
      phone: leadData.phone || 'N/A',
      interest: leadData.interest || ProductType.LIFE,
      message: leadData.message || '',
      date: new Date().toISOString(),
      status: assignTo ? LeadStatus.ASSIGNED : LeadStatus.NEW,
      score,
      qualification: score > 80 ? 'Hot' : score > 50 ? 'Warm' : 'Cold',
      source: leadData.source || 'Website',
      assignedTo: assignTo,
      notes: leadData.notes || '',
      isArchived: false,
      priority: score > 75 ? 'High' : 'Medium',
      ...leadData,
    };
    await Backend.saveLead(newLead);
    setLeads(prev => [newLead, ...prev]);
    pushNotification('New Lead Received', `Inquiry from ${newLead.name}. Score: ${score}`, 'success', 'lead', newLead.id);
  }, [pushNotification]);

  const updateLead = useCallback(async (id: string, data: Partial<Lead>) => {
    setLeads(prev => prev.map(l => l.id === id ? { ...l, ...data } : l));
    const found = leads.find(l => l.id === id);
    if (found) await Backend.saveLead({ ...found, ...data });
  }, [leads]);

  // --- Task Operations ---
  const addTask = (taskData: Omit<Task, 'id' | 'order'>) => {
    const newTask: Task = {
      ...taskData,
      id: crypto.randomUUID(),
      order: tasks.length,
    };
    setTasks(prev => [...prev, newTask]);
    pushNotification('Task Created', newTask.title, 'success');
  };

  const toggleTask = (id: string) => {
    setTasks(prev => prev.map(t => t.id === id ? { ...t, completed: !t.completed } : t));
  };

  const deleteTask = (id: string) => {
    setTasks(prev => prev.filter(t => t.id !== id));
  };

  const reorderTasks = (sourceIndex: number, targetIndex: number) => {
    setTasks(prev => {
      const sorted = [...prev].sort((a, b) => a.order - b.order);
      const [removed] = sorted.splice(sourceIndex, 1);
      sorted.splice(targetIndex, 0, removed);
      return sorted.map((item, index) => ({ ...item, order: index }));
    });
  };

  useEffect(() => {
    if (user) {
      socketService.connect();
      const unsubscribe = socketService.subscribe((data) => {
        if (data.type === 'NEW_LEAD') {
          pushNotification('New Lead Ingested', `New lead received from ${data.payload.source}`, 'success', 'lead', data.payload.id);
          Backend.getLeads().then(setLeads);
        } else if (data.type === 'CHAT_MESSAGE') {
          setChatMessages(prev => [...prev, data.payload]);
        } else if (data.type === 'NEW_ADVISOR_APPLICATION') {
          pushNotification('New Advisor Application', `Application received from ${data.payload.full_name}.`, 'info', 'onboarding', data.payload.id);
        }
      });
      return () => { unsubscribe(); socketService.disconnect(); };
    }
  }, [user, pushNotification]);

  useEffect(() => {
    const bootstrap = async () => {
      try {
        // 1. Try to restore Backend session first
        const backendUser = await Backend.getCurrentUser();
        if (backendUser) {
          setUser(backendUser);
        } else {
          // Restore mock session if present
          const mockId = localStorage.getItem('nhfg_mock_user_id');
          if (mockId) {
            const mockUser = INITIAL_USERS.find(u => u.id === mockId);
            if (mockUser) setUser(mockUser);
          }
        }

      const wrapped = async (fn: () => Promise<any>, setter: (val: any) => void) => {
        try {
          const val = await fn();
          if (val) setter(val);
        } catch (e) {
          console.error(`[Bootstrap] Segment failed:`, e);
        }
      };

      await Promise.all([
        wrapped(() => Backend.getLeads(), setLeads),
        wrapped(() => Backend.getUsers(), (users) => setAllUsers(users.length > 0 ? [...INITIAL_USERS, ...users.filter(u => !INITIAL_USERS.find(iu => iu.id === u.id))] : INITIAL_USERS)),
        wrapped(() => Backend.getClients(), setClients),
        wrapped(() => Backend.getSettings(), (s) => s && setCompanySettings(s)),
        wrapped(() => Backend.getWorkflows(), (w) => w && w.length > 0 && setWorkflows(w)),
        wrapped(() => Backend.getEvents(), (e) => e && e.length > 0 && setEvents(e)),
        wrapped(() => Backend.getResources(), setResources),
        wrapped(() => Backend.getTestimonials(), setTestimonials),
        wrapped(() => Backend.getLandingPages(), setLandingPages)
      ]);
      
      // Load user-specific platform modules
      if (user || backendUser) {
        const u = user || backendUser;
        wrapped(() => Backend.getInteractions(), setInteractions);
        wrapped(() => Backend.getDocuments(), setDocuments);
        wrapped(() => Backend.getPreferences(), setUserPreferences);
        if (u?.role === UserRole.ADMIN) {
          wrapped(() => Backend.getAccessLogs(), setAccessLogs);
        }
      }

      console.log("[Bootstrap] Data segments initialized.");
      } catch (err) {
        console.error("Bootstrap error:", err);
      } finally {
        setIsLoading(false);
        bootstrapFinished.current = true;
      }
    };
    bootstrap();
  }, []);


  // --- Inactivity Tracking ---
  useEffect(() => {
    if (!user) return;

    const events = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart', 'click'];
    const handleActivity = () => resetInactivityTimer();

    events.forEach(event => window.addEventListener(event, handleActivity));
    resetInactivityTimer();

    return () => {
      events.forEach(event => window.removeEventListener(event, handleActivity));
      if (idleTimerRef.current) clearTimeout(idleTimerRef.current);
    };
  }, [user, resetInactivityTimer]);


  const updateLeadStatus = useCallback((id: string, status: LeadStatus | string, analysis?: string) => { 
    updateLead(id, { status, aiAnalysis: analysis }); 
    
    // Automation: Create follow-up task when contacted
    if (status.toString().toLowerCase() === 'contacted') {
      const lead = leads.find(l => l.id === id);
      if (lead) {
        addTask({
          title: `Follow-up with ${lead.name} regarding ${lead.interest}`,
          priority: TaskPriority.HIGH,
          completed: false,
          advisorId: lead.assignedTo || 'admin-main',
          dueDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(),
        });
      }
    }
  }, [updateLead, leads]);

  const login = async (email: string, password?: string) => {
    const cleanEmail = email.trim().toLowerCase();

    // 1. ATTEMPT INTERNAL BACKEND LOGIN (Postgres)
    // This handles the new internal admin credentials from User Request 10
    try {
      const backendUser = await Backend.login(cleanEmail, password);
      if (backendUser) {
        setUser(backendUser);
        pushNotification('Neural Terminal Active', `Authenticated internal node: ${backendUser.name}`, 'success');
        return true;
      }
    } catch (e) {
      console.warn("[DataContext] Backend login trace:", e);
    }

    // LEGACY MOCK FALLBACK (Demo/Dev)
    const found = allUsers.find(u => u.email.toLowerCase() === cleanEmail) || INITIAL_USERS.find(u => u.email.toLowerCase() === cleanEmail);
    if (found) {
      console.log("Backend login failed, falling back to mock user:", cleanEmail);
      setUser(found);
      localStorage.setItem('nhfg_mock_user_id', found.id);
      return true;
    }

    pushNotification('Login Error', 'Invalid credentials or API unreachable.', 'alert');
    return false;
  };

  const signup = async (email: string, password: string, name: string, role: UserRole = UserRole.CLIENT) => {
    try {
      const newUser = await Backend.register(email, password, name, role);
      if (newUser) {
        setUser(newUser);
        return true;
      }
      return false;
    } catch (error: any) {
      console.error("Signup failed", error);
      return false;
    }
  };

  const resetPassword = async (email: string) => {
    try {
      await Backend.resetPassword(email);
      return true;
    } catch (error) {
      console.error("Password reset failed", error);
      return false;
    }
  };



  const addEvent = (e: Partial<CalendarEvent>) => {
    const newEvent = { ...e, id: crypto.randomUUID() } as CalendarEvent;
    setEvents(prev => [...prev, newEvent]);
    Backend.saveEvent(newEvent);
  };
  const updateEvent = (e: Partial<CalendarEvent>) => {
    setEvents(prev => {
      const updated = prev.map(ev => ev.id === e.id ? { ...ev, ...e } : ev);
      const found = updated.find(ev => ev.id === e.id);
      if (found) Backend.saveEvent(found);
      return updated;
    });
  };
  const deleteEvent = (id: string) => {
    setEvents(prev => prev.filter(e => e.id !== id));
    Backend.deleteEvent(id);
  };
  const updateUser = (id: string, data: Partial<User>) => {
    setAllUsers(prev => {
      const updated = prev.map(u => u.id === id ? { ...u, ...data } : u);
      const found = updated.find(u => u.id === id);
      if (found) Backend.saveUser(found);
      return updated;
    });
  };
  const updateCompanySettings = async (s: CompanySettings) => { 
    setCompanySettings(s); 
    try {
      await Backend.saveSettings(s); 
      return true;
    } catch (e) {
      console.error("[DataContext] Failed to save settings:", e);
      return false;
    }
  };

  const saveLandingPage = async (page: any) => {
    try {
      await Backend.saveLandingPage(page);
      setLandingPages(prev => {
        const index = prev.findIndex(p => p.slug === page.slug);
        if (index >= 0) {
          const newPages = [...prev];
          newPages[index] = page;
          return newPages;
        }
        return [...prev, page];
      });
      return true;
    } catch (e) {
      console.error("[DataContext] Failed to save landing page:", e);
      return false;
    }
  };
  const markNotificationRead = (id: string) => setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
  const clearNotifications = () => setNotifications([]);
  const completeOnboarding = (signatureData?: string) => { if (user) updateUser(user.id, { onboardingCompleted: true }); };
  const updateIntegrationConfig = (c: Partial<IntegrationConfig>) => setIntegrationConfig(prev => ({ ...prev, ...c }));
  const getAdvisorAssignments = () => [];
  const likeResource = () => { };
  const dislikeResource = () => { };
  const shareResource = () => { };
  const addResourceComment = () => { };
  const addResource = (r: Partial<Resource>) => {
    const newRes = { ...r, id: crypto.randomUUID(), dateAdded: new Date().toISOString(), likes: 0, dislikes: 0, shares: 0, comments: [] } as Resource;
    setResources(prev => [...prev, newRes]);
    Backend.saveResource(newRes);
    pushNotification('Resource Added', `New resource "${newRes.title}" is now available.`, 'success');
  };

  const deleteResource = (id: string) => {
    setResources(prev => prev.filter(r => r.id !== id));
    Backend.deleteResource(id);
  };

  const addTestimonial = (testimonial: Omit<Testimonial, 'id' | 'status' | 'date'>) => {
    const newT = { ...testimonial, id: crypto.randomUUID(), status: 'pending', date: new Date().toISOString() } as Testimonial;
    setTestimonials(prev => [...prev, newT]);
    Backend.saveTestimonial(newT);
  };
  const approveTestimonial = (id: string) => {
    setTestimonials(prev => prev.map(t => t.id === id ? { ...t, status: 'approved' } : t));
    Backend.approveTestimonial(id, 'approved');
  };
  const deleteTestimonial = (id: string) => {
    setTestimonials(prev => prev.filter(t => t.id !== id));
    Backend.deleteTestimonial(id);
  };
  const submitTestimonialEdit = (id: string, edits: Partial<Testimonial>) => {
    setTestimonials(prev => prev.map(t => t.id === id ? {
      ...t,
      status: 'pending_edit',
      editedClientName: edits.clientName || t.editedClientName,
      editedRating: edits.rating || t.editedRating,
      editedReviewText: edits.reviewText || t.editedReviewText
    } : t));
    Backend.requestTestimonialEdit(id, edits);
  };
  const approveTestimonialEdit = (id: string) => {
    setTestimonials(prev => prev.map(t => t.id === id ? {
      ...t,
      status: 'approved',
      clientName: t.editedClientName || t.clientName,
      rating: t.editedRating || t.rating,
      reviewText: t.editedReviewText || t.reviewText,
      editedClientName: undefined,
      editedRating: undefined,
      editedReviewText: undefined
    } : t));
    Backend.approveTestimonial(id, 'approved');
  };
  const rejectTestimonialEdit = (id: string) => {
    setTestimonials(prev => prev.map(t => t.id === id ? {
      ...t,
      status: 'approved',
      editedClientName: undefined,
      editedRating: undefined,
      editedReviewText: undefined
    } : t));
    Backend.approveTestimonial(id, 'approved'); // Reverts to approved by clearing edits
  };

  const addCallback = (r: any) => { };
  const handleAdvisorLeadAction = (id: string, a: string) => { };
  const addAdvisor = (data: Partial<User>) => {
    const newUser: User = { id: crypto.randomUUID(), name: data.name || 'New Advisor', email: data.email || 'advisor@nhfg.com', role: UserRole.ADVISOR, category: AdvisorCategory.INSURANCE, onboardingCompleted: false, ...data } as User;
    setAllUsers(prev => [...prev, newUser]);
    Backend.saveUser(newUser);
  };
  const deleteAdvisor = (id: string) => updateUser(id, { deletedAt: new Date().toISOString() });
  const restoreUser = (id: string) => updateUser(id, { deletedAt: undefined });
  const permanentlyDeleteUser = (id: string) => setAllUsers(prev => prev.filter(u => u.id !== id));
  const assignCarriers = () => { };
  const markChatRead = (id: string) => {
    setChatMessages(prev => prev.map(m => (m.senderId === id || m.receiverId === id) ? { ...m, read: true } : m));
  };
  const editChatMessage = (id: string, text: string) => {
    setChatMessages(prev => prev.map(m => m.id === id ? { ...m, text, isEdited: true } : m));
  };
  const deleteChatMessage = (id: string) => {
    setChatMessages(prev => prev.filter(m => m.id !== id));
  };

  const sendChatMessage = async (receiverId: string, text: string, attachment?: any) => {
    if (!user) return;
    const newMessage: ChatMessage = { id: crypto.randomUUID(), senderId: user.id, receiverId, text, timestamp: new Date(), read: false, attachment };
    setChatMessages(prev => [...prev, newMessage]);
    socketService.send({ type: 'CHAT_MESSAGE', payload: { ...newMessage, senderName: user.name } });

  };

  const submitJobApplication = (data: any) => { setJobApplications(prev => [...prev, { ...data, id: crypto.randomUUID(), date: new Date().toISOString(), status: 'Pending' }]); };
  const updateJobApplicationStatus = (id: string, status: string, config?: any) => {
    setJobApplications(prev => prev.map(app => {
      if (app.id === id) {
        if (status === 'Approved' && app.status !== 'Approved') {
          const newUser: User = { id: crypto.randomUUID(), name: app.fullName, email: app.email, phone: app.phone, role: UserRole.ADVISOR, category: AdvisorCategory.INSURANCE, productsSold: config?.products || [], contractLevel: config?.contractLevel || 50, onboardingCompleted: false, avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(app.fullName)}&background=0D8ABC&color=fff` };
          setAllUsers(users => [...users, newUser]);
          Backend.saveUser(newUser);
        }
        return { ...app, status: status as any };
      }
      return app;
    }));
  };
  const updateApplicationStatus = (id: string, status: ApplicationStatus) => {
    setApplications(prev => prev.map(app => app.id === id ? { ...app, status } : app));
  };
  const addProperty = (p: any) => {
    const newProp: PropertyListing = { id: crypto.randomUUID(), address: '', city: '', state: '', zip: '', price: 0, type: 'Residential', status: 'Pending Approval', listedDate: new Date().toISOString(), sellerName: '', advisorId: user?.id || '', image: '', ...p };
    setProperties(prev => [newProp, ...prev]);
  };
  const updateProperty = (id: string, property: Partial<PropertyListing>) => {
    setProperties(prev => prev.map(p => p.id === id ? { ...p, ...property } : p));
  };
  const deleteProperty = (id: string) => {
    setProperties(prev => prev.filter(p => p.id !== id));
  };
  const updateTransactionStatus = (id: string, status: 'Open' | 'Closed' | 'Cancelled', stage?: EscrowTransaction['stage']) => {
    setTransactions(prev => prev.map(t => t.id === id ? { ...t, status, stage: stage || t.stage } : t));
  };
  const addPortfolio = (p: Partial<ClientPortfolio>) => {
    const newP: ClientPortfolio = {
      id: crypto.randomUUID(),
      advisorId: user?.id || '1',
      lastRebalanced: new Date().toISOString(),
      clientName: p.clientName || 'New Portfolio',
      totalValue: p.totalValue || 0,
      ytdReturn: p.ytdReturn || 0,
      riskProfile: p.riskProfile || 'Moderate',
      holdings: p.holdings || [],
      clientId: p.clientId || 'unknown',
      ...p
    };
    setPortfolios(prev => [...prev, newP]);
  };
  const updatePortfolio = (id: string, data: Partial<ClientPortfolio>) => {
    setPortfolios(prev => prev.map(p => p.id === id ? { ...p, ...data } : p));
  };
  const deletePortfolio = (id: string) => {
    setPortfolios(prev => prev.filter(p => p.id !== id));
  };
  const addComplianceDoc = (data: Partial<ComplianceDocument>) => {
    const newDoc: ComplianceDocument = {
      id: crypto.randomUUID(),
      title: data.title || 'Untitled Doc',
      type: data.type || 'KYC',
      uploadDate: new Date().toISOString(),
      status: 'Pending Review',
      url: data.url || '#',
      advisorId: user?.id || '1',
      ...data
    };
    setComplianceDocs(prev => [...prev, newDoc]);
  };
  const updateFeeStatus = (id: string, status: string) => {
    setAdvisoryFees(prev => prev.map(f => f.id === id ? { ...f, status: status as any } : f));
  };
  const addAdvisoryFee = (data: Partial<AdvisoryFee>) => {
    const newFee: AdvisoryFee = {
      id: crypto.randomUUID(),
      advisorId: user?.id || '1',
      clientName: data.clientName || 'Unnamed Client',
      clientId: data.clientId || 'unknown',
      aum: data.aum || 0,
      feeRate: data.feeRate || 0.01,
      billingPeriod: data.billingPeriod || 'Q1',
      amount: data.amount || 0,
      status: data.status || 'Invoiced',
      dueDate: data.dueDate || new Date().toISOString(),
      ...data
    };
    setAdvisoryFees(prev => [...prev, newFee]);
  };
  const updateAdvisoryFee = (id: string, data: Partial<AdvisoryFee>) => {
    setAdvisoryFees(prev => prev.map(f => f.id === id ? { ...f, ...data } : f));
  };
  const deleteAdvisoryFee = (id: string) => {
    setAdvisoryFees(prev => prev.filter(f => f.id !== id));
  };
  const addLoanApplication = (l: Partial<LoanApplication>) => {
    const newApp: LoanApplication = {
      id: `LOAN-${Math.floor(Math.random() * 10000)}`,
      createdAt: new Date().toISOString(),
      advisorId: user?.id || '1',
      clientName: l.clientName || 'Unnamed Client',
      loanAmount: l.loanAmount || 0,
      loanType: l.loanType || 'Purchase',
      status: 'Applied',
      interestRate: l.interestRate || 6.5,
      propertyValue: l.propertyValue || 0,
      ltv: l.ltv || 80,
      creditScore: l.creditScore || 700,
      ...l
    };
    setLoanApplications(prev => [...prev, newApp]);
  };
  const updateLoanApplication = (id: string, data: Partial<LoanApplication>) => {
    setLoanApplications(prev => prev.map(l => l.id === id ? { ...l, ...data } : l));
  };
  const deleteLoanApplication = (id: string) => {
    setLoanApplications(prev => prev.filter(l => l.id !== id));
  };
  const updateClient = useCallback(async (id: string, data: Partial<Client>) => {
    const client = clients.find(c => c.id === id);
    if (client) {
      const updated = { ...client, ...data };
      await Backend.saveClient(updated);
      setClients(prev => prev.map(c => c.id === id ? updated : c));
    }
  }, [clients]);
  const assignLeads = useCallback(async (leadIds: string[], advisorId: string) => {
    const targetLeads = leads.filter(l => leadIds.includes(l.id));
    for (const lead of targetLeads) {
      const updatedLead: Lead = { ...lead, assignedTo: advisorId, status: LeadStatus.ASSIGNED };
      await Backend.saveLead(updatedLead);
    }
    Backend.getLeads().then(setLeads);
  }, [leads]);
  const addWorkflow = (wf: Partial<Workflow>) => {
    const newWorkflow: Workflow = { id: `wf-${Math.random().toString(36).substr(2, 9)}`, name: wf.name || 'New Workflow', description: wf.description || 'Custom autonomous neural path.', trigger: wf.trigger || WorkflowTrigger.LEAD_INGESTION, actions: wf.actions || [], status: 'active', impact: wf.impact || 'MEDIUM', category: wf.category || 'OPERATIONS', executionsYTD: 0, createdAt: new Date().toISOString() };
    setWorkflows(prev => [newWorkflow, ...prev]);
    Backend.saveWorkflow(newWorkflow);
    pushNotification('Workflow Deployed', `New logic engine node "${newWorkflow.name}" is now operational.`, 'success');
  };

  const logInteraction = async (data: Partial<Interaction>) => {
    await Backend.saveInteraction(data);
    Backend.getInteractions(data.leadId, data.clientId).then(setInteractions);
  };

  const fetchInteractions = async (leadId?: string, clientId?: string) => {
    const data = await Backend.getInteractions(leadId, clientId);
    setInteractions(data);
  };

  const saveDoc = async (doc: Partial<UserDocument>) => {
    const newDoc = { ...doc, id: doc.id || crypto.randomUUID(), createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() } as UserDocument;
    await Backend.saveDocument(newDoc);
    Backend.getDocuments(doc.clientId).then(setDocuments);
    pushNotification('Document Secured', `File "${newDoc.title}" uploaded successfully.`, 'success');
  };

  const updatePreferences = async (prefs: Partial<UserPreference>) => {
    const updated = { ...userPreferences, ...prefs } as UserPreference;
    setUserPreferences(updated);
    await Backend.savePreferences(updated);
  };

  const toggleWorkflow = (id: string) => {
    setWorkflows(prev => prev.map(wf => {
      if (wf.id === id) {
        const nextStatus = wf.status === 'active' ? 'paused' : 'active';
        const updated = { ...wf, status: nextStatus as any };
        Backend.saveWorkflow(updated);
        return updated;
      }
      return wf;
    }));
  };

  const triggerPulse = useCallback(() => {
    pushNotification('Global Pulse Initiated', 'Recalibrating all neural chain nodes...', 'warning');

    // Simulate a system-wide recalibration
    setProcessingLeads(prev => {
      const activeLeads = leads.filter(l => l.status === LeadStatus.NEW || l.status === LeadStatus.ASSIGNED).slice(0, 3);
      return activeLeads.map(l => ({ leadId: l.id, activeNode: 'SYSTEM SYNC' }));
    });

    setTimeout(() => {
      setProcessingLeads([]);
      pushNotification('Pulse Complete', 'All nodes synchronized and operational.', 'success');
      setAutomationMetrics(prev => ({
        ...prev,
        executions: prev.executions + 15,
        bandwidthSaved: prev.bandwidthSaved + 60
      }));
    }, 3000);
  }, [leads, pushNotification]);

  return (
    <DataContext.Provider value={{
      user, isLoading, allUsers, leads, clients, tasks, metrics: { totalRevenue: 1250000, activeClients: 450, pendingLeads: 12, monthlyPerformance: [], totalCommission: 85000 },
      automationMetrics, workflows, processingLeads,
      notifications, chatMessages, companySettings, resources, commissions: [], events, testimonials,
      availableCarriers: [], colleagues: [], jobApplications, applications, portfolios, complianceDocs, advisoryFees, loanApplications, integrationLogs, integrationConfig,
      accessLogs, documents, interactions, userPreferences,
      login, logout, signup, resetPassword, addLead, updateLeadStatus, updateLead, assignLeads, updateClient, updateUser, updateCompanySettings,
      markNotificationRead, clearNotifications, completeOnboarding, updateIntegrationConfig,
      getAdvisorAssignments, likeResource, dislikeResource, shareResource, addResourceComment, addResource, deleteResource,
      addTestimonial, approveTestimonial, deleteTestimonial, submitTestimonialEdit, approveTestimonialEdit, rejectTestimonialEdit,
      landingPages, saveLandingPage,
      addCallback, handleAdvisorLeadAction, addEvent, updateEvent, deleteEvent, addAdvisor, deleteAdvisor, restoreUser, permanentlyDeleteUser,
      assignCarriers, markChatRead, editChatMessage, deleteChatMessage, sendChatMessage, submitJobApplication, updateJobApplicationStatus,
      updateApplicationStatus, updateTransactionStatus, addPortfolio, updatePortfolio, deletePortfolio, addComplianceDoc,
      updateFeeStatus, addAdvisoryFee, updateAdvisoryFee, deleteAdvisoryFee, addLoanApplication, updateLoanApplication, deleteLoanApplication,
      addProperty, updateProperty, deleteProperty, addWorkflow, toggleWorkflow, triggerPulse, properties, transactions,
      addTask, toggleTask, deleteTask, reorderTasks,
      logInteraction, fetchInteractions, saveDoc, updatePreferences
    }}>
      {children}
    </DataContext.Provider>
  );
};
