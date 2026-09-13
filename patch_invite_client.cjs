const fs = require('fs');

// 1. Update services/apiBackend.ts
const apiPath = './services/apiBackend.ts';
let apiContent = fs.readFileSync(apiPath, 'utf8');

const apiMethods = `
  async inviteUser(user: any) {
    const res = await fetch(\`\${API_URL}/admin/invite-user\`, {
      method: 'POST',
      headers: this.getAuthHeaders(),
      body: JSON.stringify(user)
    });
    if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to invite user');
    }
    return res.json();
  },

  async setupAccount(data: any) {
    const res = await fetch(\`\${API_URL}/onboarding/setup-account\`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    if (!res.ok) throw new Error('Failed to setup account');
    return res.json();
  },
`;

if (!apiContent.includes('inviteUser(user: any)')) {
    apiContent = apiContent.replace("async deleteUser(id: string) {", apiMethods + "\n  async deleteUser(id: string) {");
    fs.writeFileSync(apiPath, apiContent);
}

// 2. Update context/DataContext.tsx
const dataPath = './context/DataContext.tsx';
let dataContent = fs.readFileSync(dataPath, 'utf8');

const ctxInterfaceTarget = "addAdvisor: (data: Partial<User>) => void;";
if (!dataContent.includes("inviteAdvisor: (data: Partial<User>) => Promise<void>;")) {
    dataContent = dataContent.replace(ctxInterfaceTarget, ctxInterfaceTarget + "\n  inviteAdvisor: (data: Partial<User>) => Promise<void>;");
}

const ctxImplTarget = "const addAdvisor = (data: Partial<User>) => {";
const ctxImpl = `const inviteAdvisor = async (data: Partial<User>) => {
    await Backend.inviteUser(data);
    // Optimistic update
    const newUser: User = { id: crypto.randomUUID(), name: data.name || 'New Advisor', email: data.email || 'advisor@nhfg.com', role: data.role || UserRole.ADVISOR, category: data.category || AdvisorCategory.INSURANCE, onboardingCompleted: false, ...data } as User;
    setAllUsers(prev => [...prev, newUser]);
  };
  `;
if (!dataContent.includes("const inviteAdvisor = async")) {
    dataContent = dataContent.replace(ctxImplTarget, ctxImpl + ctxImplTarget);
}

const ctxExportTarget = "addAdvisor, deleteAdvisor";
if (!dataContent.includes("inviteAdvisor, addAdvisor")) {
    dataContent = dataContent.replace(ctxExportTarget, "inviteAdvisor, " + ctxExportTarget);
}

fs.writeFileSync(dataPath, dataContent);
