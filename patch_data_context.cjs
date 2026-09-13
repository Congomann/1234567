const fs = require('fs');
const path = './context/DataContext.tsx';
let content = fs.readFileSync(path, 'utf8');

const target = `  const inviteAdvisor = async (data: Partial<User>) => {
    await Backend.inviteUser(data);
    // Optimistic update
    const newUser: User = { id: crypto.randomUUID(), name: data.name || 'New Advisor', email: data.email || 'advisor@nhfg.com', role: data.role || UserRole.ADVISOR, category: data.category || AdvisorCategory.INSURANCE, onboardingCompleted: false, ...data } as User;
    setAllUsers(prev => [...prev, newUser]);
  };`;

const replacement = `  const inviteAdvisor = async (data: Partial<User>) => {
    const res = await Backend.inviteUser(data);
    // Optimistic update
    const newUser: User = { id: crypto.randomUUID(), name: data.name || 'New Advisor', email: data.email || 'advisor@nhfg.com', role: data.role || UserRole.ADVISOR, category: data.category || AdvisorCategory.INSURANCE, onboardingCompleted: false, ...data } as User;
    setAllUsers(prev => [...prev, newUser]);
    return res;
  };`;

content = content.replace(target, replacement);

const interfaceTarget = `inviteAdvisor: (data: Partial<User>) => Promise<void>;`;
const interfaceReplacement = `inviteAdvisor: (data: Partial<User>) => Promise<any>;`;
content = content.replace(interfaceTarget, interfaceReplacement);

fs.writeFileSync(path, content);
