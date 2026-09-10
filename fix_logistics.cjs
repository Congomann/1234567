const fs = require('fs');

let file = 'pages/crm/logistics/LogisticsHub.tsx';
let data = fs.readFileSync(file, 'utf8');

const regexMock = /const mockDeals: Record<LogisticsNiche, Record<string, KanbanDeal\[\]>> = {[\s\S]*?};/;
data = data.replace(regexMock, '');

data = data.replace(/mockDeals\[activeNiche\]/g, 'deals[activeNiche]');
data = data.replace(/getFreightDeals\(\)/g, 'getDeals()');

// Instead of mockDeals, let's create `deals` from `loads`
const dealsCode = `
  const getDeals = () => {
    const deals: Record<LogisticsNiche, Record<string, KanbanDeal[]>> = {
      [LogisticsNiche.TRUCKING]: { 'Dispatched': [], 'En Route': [], 'Delivered': [] },
      [LogisticsNiche.FUEL]: { 'Contract Sent': [], 'Delivered': [], 'Paid': [] },
      [LogisticsNiche.FREIGHT_BROKERAGE]: { 'available': [], 'booked': [], 'in_transit': [], 'delivered': [] }
    };

    loads.forEach(load => {
      const niche = load.niche || LogisticsNiche.FREIGHT_BROKERAGE;
      const stage = load.status || (niche === LogisticsNiche.FREIGHT_BROKERAGE ? 'available' : niche === LogisticsNiche.TRUCKING ? 'Dispatched' : 'Contract Sent');
      if (deals[niche] && deals[niche][stage]) {
        deals[niche][stage].push({
          id: (niche === LogisticsNiche.FREIGHT_BROKERAGE ? 'LD-' : niche === LogisticsNiche.TRUCKING ? 'TRK-' : 'FUL-') + load.id.substring(0, 5).toUpperCase(),
          realId: load.id,
          title: load.origin + ' to ' + load.destination,
          value: load.totalRate || load.rate_usd || 0,
          client: load.client || 'NH Transport',
          nicheSpecificField: load.trailerType || load.equipment_type || 'Dry Van',
          status: stage,
          trackingToken: load.tracking_token,
          driverPhone: load.carrier_driver_phone,
          driverEmail: load.carrier_driver_email
        });
      }
    });
    return deals;
  };

  const deals = getDeals();
`;
data = data.replace(/const getFreightDeals[\s\S]*?};/, dealsCode);

fs.writeFileSync(file, data);
