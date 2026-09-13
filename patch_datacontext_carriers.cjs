const fs = require('fs');
const path = './context/DataContext.tsx';
let content = fs.readFileSync(path, 'utf8');

// 1. Add useState for availableCarriers
const stateTarget = `  const [userPreferences, setUserPreferences] = useState<UserPreference | null>(null);`;
const stateReplacement = `  const [userPreferences, setUserPreferences] = useState<UserPreference | null>(null);\n  const [availableCarriers, setAvailableCarriers] = useState<Carrier[]>([]);`;
content = content.replace(stateTarget, stateReplacement);

// 2. Add to fetch wrapper
const fetchTarget = `      wrapped(() => Backend.getAccessLogs(), setAccessLogs);
    }
  }, [user]);`;
const fetchReplacement = `      wrapped(() => Backend.getAccessLogs(), setAccessLogs);\n      wrapped(() => Backend.getCarriers(), setAvailableCarriers);\n    }\n  }, [user]);`;
content = content.replace(fetchTarget, fetchReplacement);

// 3. Remove hardcoded array in Provider
const providerTarget = `      availableCarriers: [
  { name: 'National Life Group', category: 'Life Insurance' },
  { name: 'Transamerica', category: 'Life Insurance' },
  { name: 'Mutual of Omaha', category: 'Life Insurance' },
  { name: 'Corebridge Financial', category: 'Life Insurance' },
  { name: 'UnitedHealthcare', category: 'Health' },
  { name: 'BlueCross BlueShield', category: 'Health' },
  { name: 'Aetna', category: 'Health' },
  { name: 'Root Insurance', category: 'Auto & Commercial' },
  { name: 'Progressive', category: 'Auto & Commercial' },
  { name: 'Travelers', category: 'Auto & Commercial' },
  { name: 'Allianz', category: 'Annuities' },
  { name: 'Athene', category: 'Annuities' }
],`;
const providerReplacement = `      availableCarriers,`;
content = content.replace(providerTarget, providerReplacement);

fs.writeFileSync(path, content);
