const users = [
  { name: 'Internal Admin', email: 'info@newhollandfinancial.com', role: 'Administrator' },
  { name: 'James Manager', email: 'manager@nhfg.com', role: 'Manager' },
  { name: 'David Insurance', email: 'insurance@nhfg.com', role: 'Advisor' },
  { name: 'Sarah RealEstate', email: 'realestate@nhfg.com', role: 'Advisor' },
  { name: 'Marcus Mortgage', email: 'mortgage@nhfg.com', role: 'Advisor' },
  { name: 'Sophia Securities', email: 'securities@nhfg.com', role: 'Advisor' },
  { name: 'Jordan SubAdmin', email: 'subadmin@nhfg.com', role: 'Sub-Admin' },
  { name: 'New Recruits', email: 'newbie@nhfg.com', role: 'Advisor' },
  { name: 'Bima Yamaisha', email: 'bimayamaisha@gmail.com', role: 'Administrator' }
];

async function registerAll() {
  for (const u of users) {
    try {
      const res = await fetch('http://localhost:3333/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: u.email, password: 'password', name: u.name, role: u.role })
      });
      const data = await res.json();
      console.log(`Registered ${u.email}:`, res.status === 201 ? 'Success' : data.error);
    } catch (err) {
      console.error(`Failed ${u.email}:`, err.message);
    }
  }
}

registerAll();
