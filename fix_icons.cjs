const fs = require('fs');
let content = fs.readFileSync('pages/crm/insurance/InsurancePages.tsx', 'utf8');

content = content.replace(
  "import { FileText, CheckCircle, Hourglass, XCircle, Briefcase, Car, Truck, AlertTriangle, RefreshCw, Plus, Search, Filter, Send } from 'lucide-react';",
  "import { FileText, CheckCircle, Hourglass, XCircle, Briefcase, Car, Truck, AlertTriangle, RefreshCw, Plus, Search, Filter, Send, Activity, CheckCircle2, Clock, CreditCard, FileSignature, X } from 'lucide-react';"
);

fs.writeFileSync('pages/crm/insurance/InsurancePages.tsx', content);
console.log('Fixed Icons');
