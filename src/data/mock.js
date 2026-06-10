export const agencyClients = [
  { id: 'PE', name: 'Prestige Estates', industry: 'Real Estate', mos: 84, status: 'Healthy', sla: 98, mrr: '₹3.20 L', growth: '+18.4%', leads30d: 142, contract: 'Mar 2027', owner: 'Arjun Sharma', due: 26, completed: 24, avgResponse: '2.1h' },
  { id: 'BT', name: 'boAt', industry: 'Consumer Electronics', mos: 81, status: 'Healthy', sla: 96, mrr: '₹4.50 L', growth: '+14.4%', leads30d: 705, contract: 'Feb 2027', owner: 'Divya Rao', due: 22, completed: 21, avgResponse: '1.8h' },
  { id: 'RP', name: 'Rapido', industry: 'Mobility', mos: 78, status: 'Healthy', sla: 95, mrr: '₹2.80 L', growth: '+12.1%', leads30d: 511, contract: 'Dec 2026', owner: 'Priya Nair', due: 20, completed: 19, avgResponse: '3.2h' },
  { id: 'NY', name: 'Nykaa', industry: 'Beauty', mos: 76, status: 'Healthy', sla: 94, mrr: '₹3.20 L', growth: '+9.8%', leads30d: 612, contract: 'May 2027', owner: 'Priya Nair', due: 24, completed: 22, avgResponse: '2.9h' },
  { id: 'CR', name: 'CRED', industry: 'Fintech', mos: 73, status: 'Healthy', sla: 93, mrr: '₹3.80 L', growth: '+6.2%', leads30d: 296, contract: 'Apr 2027', owner: 'Priya Nair', due: 18, completed: 17, avgResponse: '3.8h' },
  { id: 'ME', name: 'Meesho', industry: 'E-Commerce', mos: 71, status: 'Renewal', sla: 92, mrr: '₹4.20 L', growth: '+8.6%', leads30d: 388, contract: 'Aug 2026', owner: 'Karan Mehta', due: 28, completed: 26, avgResponse: '4.1h' },
  { id: 'ZP', name: 'Zepto', industry: 'Q-Commerce', mos: 67, status: 'Onboarding', sla: 88, mrr: '₹2.40 L', growth: '+22.5%', leads30d: 433, contract: 'Jun 2027', owner: 'Rahul Singh', due: 12, completed: 10, avgResponse: '5.2h' },
  { id: 'LK', name: 'Lenskart', industry: 'Retail', mos: 63, status: 'At risk', sla: 81, mrr: '₹1.80 L', growth: '-2.3%', leads30d: 188, contract: 'Jan 2027', owner: 'Divya Rao', due: 22, completed: 18, avgResponse: '6.8h' },
  { id: 'OY', name: 'OYO', industry: 'Hospitality', mos: 62, status: 'At risk', sla: 79, mrr: '₹2.80 L', growth: '+1.2%', leads30d: 233, contract: 'Nov 2026', owner: 'Karan Mehta', due: 18, completed: 14, avgResponse: '7.2h' },
  { id: 'BP', name: 'BharatPe', industry: 'Fintech', mos: 58, status: 'Churn risk', sla: 74, mrr: '₹2.20 L', growth: '-5.1%', leads30d: 274, contract: 'Jul 2026', owner: 'Rahul Singh', due: 20, completed: 15, avgResponse: '8.1h' },
  { id: 'UC', name: 'Urban Company', industry: 'Services', mos: 55, status: 'Onboarding', sla: 72, mrr: '₹1.40 L', growth: '-3.8%', leads30d: 167, contract: 'May 2027', owner: 'Karan Mehta', due: 16, completed: 11, avgResponse: '9h' },
  { id: 'WF', name: 'Wakefit', industry: 'D2C', mos: 49, status: 'Critical', sla: 62, mrr: '₹1.60 L', growth: '-12.7%', leads30d: 91, contract: 'Jun 2026', owner: 'Arjun Sharma', due: 18, completed: 11, avgResponse: '11.2h' },
];

export const alertsData = [
  { id: 1, client: 'Wakefit', type: 'critical', desc: 'MOS dropped 12 pts this week. SEO traffic down 34%.', time: '20 min ago', action: 'Resolve' },
  { id: 2, client: 'Lenskart', type: 'warning', desc: 'SLA breach: Content deliverable overdue by 3 days.', time: '2 hr ago', action: 'Resolve' },
  { id: 3, client: 'BharatPe', type: 'warning', desc: 'Ad spend 40% over budget. Needs review.', time: '4 hr ago', action: 'Resolve' },
  { id: 4, client: 'Prestige Estates', type: 'success', desc: 'MOS hit all-time high: 84.', time: 'Yesterday', action: 'Resolve' },
  { id: 5, client: 'Meesho', type: 'info', desc: 'New lead batch synced from Google Ads (38 leads).', time: 'Yesterday', action: 'Resolve' },
];

export const executionActivityData = [
  { name: 'SEO Tasks', completed: 420, total: 450 },
  { name: 'Ad Campaigns', completed: 45, total: 60 },
  { name: 'Content Pieces', completed: 110, total: 140 },
  { name: 'Social Posts', completed: 140, total: 180 },
  { name: 'CRM Actions', completed: 280, total: 320 },
];

export const teamUtilisationData = [
  { name: 'Design', value: 20, fill: '#1e293b' },
  { name: 'SEO', value: 35, fill: '#0f172a' },
  { name: 'Paid Media', value: 30, fill: '#334155' },
  { name: 'Content', value: 15, fill: '#cbd5e1' },
];

export const teamCapacityData = [
  { initials: 'AS', name: 'Arjun Sharma', logged: 36, capacity: 40, color: '#ef4444' },
  { initials: 'PN', name: 'Priya Nair', logged: 31, capacity: 40, color: '#f59e0b' },
  { initials: 'KM', name: 'Karan Mehta', logged: 27, capacity: 40, color: '#f59e0b' },
  { initials: 'DR', name: 'Divya Rao', logged: 33, capacity: 40, color: '#10b981' },
  { initials: 'RS', name: 'Rahul Singh', logged: 35, capacity: 40, color: '#10b981' },
];

export const strategyOkrs = [
  { id: 1, title: 'Become #1 organic brand for premium real estate in South India', client: 'Prestige Estates - owned by Arjun Sharma', progress: 72, status: 'On Track', stats: [{label: 'Non-brand organic sessions', val: '184k / 250k', pct: 73}, {label: 'Top 3 rankings on commercial KWs', val: '62 / 85', pct: 72}, {label: 'MQLs from organic', val: '892 / 1,200', pct: 74}] },
  { id: 2, title: 'Scale paid acquisition with CAC under ₹420', client: 'Rapido - owned by Priya Nair', progress: 58, status: 'On Track', stats: [{label: 'Blended CAC', val: '₹480 / ₹420', pct: 60}, {label: 'New rider signups / mo', val: '38k / 55k', pct: 69}, {label: 'ROAS (Meta + Google)', val: '3.1x / 4.2x', pct: 73}] },
  { id: 3, title: 'Recover Wakefit organic traffic post-algo update', client: 'Wakefit - owned by Arjun Sharma', progress: 24, status: 'Behind', stats: [{label: 'Indexed pages restored', val: '1,240 / 4,200', pct: 29}, {label: 'Top-10 KWs recovered', val: '184 / 620', pct: 29}, {label: 'Organic revenue / mo', val: '₹14L / ₹45L', pct: 31}] },
];

export const radarData = [
  { subject: 'SEO', A: 85, B: 45, fullMark: 100 },
  { subject: 'Paid', A: 65, B: 30, fullMark: 100 },
  { subject: 'Content', A: 80, B: 55, fullMark: 100 },
  { subject: 'Social', A: 75, B: 20, fullMark: 100 },
  { subject: 'Lifecycle', A: 60, B: 35, fullMark: 100 },
];

export const roadmapData = [
  { initiative: 'Topic cluster: home loans (42 pages)', client: 'Prestige Estates', channel: 'SEO', owner: 'Karan Mehta', phase: 'Build', timeline: 'Jun 02 - Jul 10', deps: 2, status: 'IN PROGRESS' },
  { initiative: 'Meta CAPI + offline conversions upload', client: 'Rapido', channel: 'PAID', owner: 'Priya Nair', phase: 'Build', timeline: 'Jun 05 - Jun 28', deps: 1, status: 'IN PROGRESS' },
  { initiative: 'Programmatic city landing pages (180)', client: 'Lenskart', channel: 'SEO', owner: 'Arjun Sharma', phase: 'Plan', timeline: 'Jun 22 - Aug 30', deps: 3, status: 'PLANNING' },
  { initiative: 'WhatsApp re-engagement journeys', client: 'Nykaa', channel: 'LIFECYCLE', owner: 'Rahul Singh', phase: 'Launch', timeline: 'Jun 15 - Jun 24', deps: 0, status: 'IN PROGRESS' },
  { initiative: 'GEO content rewrite - top 50 pages', client: 'boAt', channel: 'CONTENT', owner: 'Karan Mehta', phase: 'Build', timeline: 'Jun 01 - Jul 05', deps: 1, status: 'AT RISK' },
];

export const investmentData = [
  { name: 'Jun', SEO: 25, Paid: 45, Content: 15, Social: 10, Lifecycle: 5 },
  { name: 'Jul', SEO: 30, Paid: 50, Content: 20, Social: 15, Lifecycle: 8 },
  { name: 'Aug', SEO: 35, Paid: 55, Content: 20, Social: 15, Lifecycle: 10 },
  { name: 'Sep', SEO: 40, Paid: 60, Content: 25, Social: 20, Lifecycle: 15 },
];

export const slaTrendData = [
  { name: 'Jan', val: 92 }, { name: 'Feb', val: 91 }, { name: 'Mar', val: 93 }, { name: 'Apr', val: 89 }, { name: 'May', val: 88 }, { name: 'Jun', val: 89 },
];

export const leadsData = [
  { id: '1', name: 'Acme Corp', contact: 'John Doe', source: 'Organic', status: 'New', value: '$5,000', mos: 60, stage: 'Lead', owner: 'Arjun' },
  { id: '2', name: 'Global Tech', contact: 'Jane Smith', source: 'Referral', status: 'Contacted', value: '$12,000', mos: 80, stage: 'Meeting', owner: 'Priya' },
  { id: '3', name: 'StartUp Inc', contact: 'Mike Johnson', source: 'AdWords', status: 'Qualified', value: '$3,500', mos: 40, stage: 'Proposal', owner: 'Karan' },
];

export const pipelineData = {
  columns: [
    { id: 'lead', title: 'Lead', count: 120 },
    { id: 'meeting', title: 'Meeting', count: 45 },
    { id: 'proposal', title: 'Proposal', count: 28 },
    { id: 'negotiation', title: 'Negotiation', count: 12 },
    { id: 'closed', title: 'Closed Won', count: 8 }
  ],
  items: []
};

// --- NEW WORKSPACE DATA ---

export const seoKeywords = [
  { id: 1, keyword: 'prestige properties', pos: 1, prev: 1, change: 0, volume: '12.0K', difficulty: 'Low', featured: true, intent: 'Brand' },
  { id: 2, keyword: 'prestige southern star', pos: 2, prev: 3, change: 1, volume: '8.4K', difficulty: 'Low', featured: true, intent: 'Brand' },
  { id: 3, keyword: 'luxury apartments bangalore', pos: 3, prev: 5, change: 2, volume: '8.1K', difficulty: 'Hard', featured: true, intent: 'Commercial' },
  { id: 4, keyword: 'prestige group bangalore', pos: 4, prev: 4, change: 0, volume: '6.8K', difficulty: 'Medium', featured: true, intent: 'Brand' },
  { id: 5, keyword: 'apartments for sale bangalore', pos: 7, prev: 9, change: 2, volume: '14.2K', difficulty: 'Hard', featured: false, intent: 'Commercial' },
  { id: 6, keyword: '3 bhk flats whitefield', pos: 8, prev: 12, change: 4, volume: '4.4K', difficulty: 'Medium', featured: false, intent: 'Commercial' },
  { id: 7, keyword: 'buy villa bangalore', pos: 14, prev: 18, change: 4, volume: '2.9K', difficulty: 'Hard', featured: false, intent: 'Commercial' },
  { id: 8, keyword: '2 bhk apartments electronic city', pos: 19, prev: 25, change: 6, volume: '2.8K', difficulty: 'Medium', featured: false, intent: 'Commercial' },
  { id: 9, keyword: 'real estate investment bangalore', pos: 22, prev: 20, change: -2, volume: '6.6K', difficulty: 'Hard', featured: false, intent: 'Informational' },
  { id: 10, keyword: 'luxury villas south bangalore', pos: 31, prev: 38, change: 7, volume: '3.2K', difficulty: 'Hard', featured: false, intent: 'Commercial' },
  { id: 11, keyword: 'nri property investment bangalore', pos: 44, prev: 44, change: 0, volume: '2.1K', difficulty: 'Medium', featured: false, intent: 'Informational' },
  { id: 12, keyword: 'prestige smart city review', pos: 58, prev: 52, change: -6, volume: '4.8K', difficulty: 'Low', featured: false, intent: 'Informational' },
];

export const organicTrafficSparkline = [
  { val: 20 }, { val: 25 }, { val: 28 }, { val: 24 }, { val: 32 }, { val: 38 }, { val: 45 }, { val: 42 }, { val: 48 }, { val: 55 }, { val: 62 }, { val: 60 }, { val: 68 }, { val: 72 }
];

export const creativeProjects = [
  { id: 1, project: 'Meta Ads Creatives — Q2 2026 (8 creatives)', type: 'Ad Creative', brief: true, assigned: 'DR', due: 'Jun 12', status: 'In Design', approval: 'Pending' },
  { id: 2, project: 'June Instagram Grid — 6 posts', type: 'Social Media', brief: true, assigned: 'DR', due: 'Jun 8', status: 'Approved', approval: 'Approved Jun 8' },
  { id: 3, project: 'Prestige Somerville Launch Brochure', type: 'Print/PDF', brief: true, assigned: 'DR', due: 'Jun 20', status: 'In Review', approval: 'Not sent yet' },
  { id: 4, project: 'Website Hero Banner — A/B Test', type: 'Web Design', brief: true, assigned: 'DR', due: 'Jun 15', status: 'In Design', approval: '-' },
  { id: 5, project: 'Q2 Performance Presentation — Board Deck', type: 'Presentation', brief: true, assigned: 'DR', due: 'Jun 25', status: 'Brief Stage', approval: '-' },
];

export const socialPosts = [
  { id: 1, title: 'Step inside Prestige Somerville — luxury living redefined in Whitefield.', date: 'Jun 6', er: '5.2%', reach: '22.4K', likes: 1620, comments: 94, shares: 212 },
  { id: 2, title: 'Why Bangalore remains India\'s top real estate destination in 2026.', date: 'Jun 4', er: '4.7%', reach: '19.8K', likes: 1040, comments: 76, shares: 240 },
  { id: 3, title: 'Behind the design: Prestige Primrose Hills\' clubhouse reveal.', date: 'Jun 2', er: '5.5%', reach: '24.6K', likes: 2210, comments: 132, shares: 388 },
  { id: 4, title: '5 things every NRI buyer should check before investing.', date: 'May 31', er: '4.1%', reach: '17.8K', likes: 1240, comments: 88, shares: 196 },
  { id: 5, title: 'Sunday open house — Prestige Lakeside Habitat. RSVP in bio.', date: 'May 29', er: '3.8%', reach: '16.2K', likes: 1180, comments: 54, shares: 142 },
  { id: 6, title: 'Whitefield then & now — a 10-year transformation story.', date: 'May 27', er: '4.9%', reach: '20.8K', likes: 1720, comments: 102, shares: 214 },
];

export const performanceAdsCampaigns = [
  { id: 1, campaign: 'Brand Awareness — Bangalore', platform: 'Meta', status: 'Active', budget: '₹2.00L', spend: '₹1.80L', leads: 48, cpl: '₹3,750', roas: '-', ctr: '2.8%', progress: 90 },
  { id: 2, campaign: 'Lead Gen — Luxury Apartments', platform: 'Google', status: 'Active', budget: '₹3.50L', spend: '₹3.10L', leads: 67, cpl: '₹4,627', roas: '4.8x', ctr: '4.1%', progress: 88 },
  { id: 3, campaign: 'Retargeting — Website Visitors', platform: 'Meta', status: 'Active', budget: '₹1.00L', spend: '₹82,000', leads: 27, cpl: '₹3,037', roas: '5.2x', ctr: '3.9%', progress: 82 },
  { id: 4, campaign: 'YouTube Brand — Q2', platform: 'YouTube', status: 'Paused', budget: '₹1.50L', spend: '₹90,000', leads: '-', cpl: '-', roas: '-', ctr: '1.2%', progress: 60 },
];

export const dailyPerformanceAds = [
  { day: 1, leads: 5, spend: 12000, roas: 3.8 }, { day: 2, leads: 4, spend: 11500, roas: 3.9 }, { day: 3, leads: 3, spend: 11000, roas: 4.1 },
  { day: 4, leads: 6, spend: 12500, roas: 4.2 }, { day: 5, leads: 7, spend: 13000, roas: 4.5 }, { day: 6, leads: 5, spend: 11500, roas: 4.0 },
  { day: 7, leads: 4, spend: 10000, roas: 3.8 }, { day: 8, leads: 5, spend: 10500, roas: 3.9 }, { day: 9, leads: 4, spend: 10000, roas: 3.8 },
  { day: 10, leads: 5, spend: 11000, roas: 4.0 }, { day: 11, leads: 4, spend: 10500, roas: 3.9 }, { day: 12, leads: 3, spend: 9500, roas: 3.8 },
  { day: 13, leads: 3, spend: 9000, roas: 3.7 }, { day: 14, leads: 3, spend: 9500, roas: 3.8 }, { day: 15, leads: 4, spend: 10000, roas: 3.9 },
  { day: 16, leads: 5, spend: 11000, roas: 4.0 }, { day: 17, leads: 3, spend: 9000, roas: 3.7 }, { day: 18, leads: 3, spend: 9500, roas: 3.8 },
  { day: 19, leads: 4, spend: 10000, roas: 3.9 }, { day: 20, leads: 4, spend: 10500, roas: 4.0 }, { day: 21, leads: 5, spend: 11500, roas: 4.2 },
  { day: 22, leads: 6, spend: 12500, roas: 4.5 }, { day: 23, leads: 7, spend: 13500, roas: 4.8 }, { day: 24, leads: 6, spend: 13000, roas: 4.6 },
  { day: 25, leads: 8, spend: 14500, roas: 5.2 }, { day: 26, leads: 6, spend: 13000, roas: 4.8 }, { day: 27, leads: 5, spend: 12000, roas: 4.5 },
  { day: 28, leads: 5, spend: 11500, roas: 4.2 }, { day: 29, leads: 5, spend: 11000, roas: 4.0 }, { day: 30, leads: 4, spend: 10500, roas: 3.9 },
];

// --- FINAL BATCH MOCK DATA ---

export const crmLeadsFull = {
  new: [
    { id: 1, name: 'Vikram Malhotra', temp: 'HOT', source: 'Google Ads', phone: '+91 98765 43210', project: '4 BHK - Whitefield', budget: '₹2.8 Cr', time: '0d in stage', assignee: 'AS' },
    { id: 2, name: 'Ananya Krishnan', temp: 'WARM', source: 'Meta Ads', phone: '+91 87654 32109', project: '3 BHK - Electronic City', budget: '₹1.2 Cr', time: '0d in stage', assignee: 'PN' },
    { id: 3, name: 'Suresh Patel', temp: 'COLD', source: 'Organic', phone: '+91 76543 21098', project: 'Villa - Sarjapur Road', budget: '-', time: '0d in stage', assignee: 'RS' },
    { id: 4, name: 'Deepa Nair', temp: 'WARM', source: 'WhatsApp', phone: '+91 65432 10987', project: '2 BHK - Marathahalli', budget: '₹95 L', time: '0d in stage', assignee: 'KM' }
  ],
  contacted: [
    { id: 5, name: 'Arjun Mehta', temp: 'HOT', source: 'Google Ads', phone: '+91 98123 45678', project: '4 BHK - Whitefield', budget: '₹3.1 Cr', time: '3d in stage', action: 'Called - 3 hrs ago', assignee: 'AS' },
    { id: 6, name: 'Sunita Reddy', temp: 'WARM', source: 'Meta Ads', phone: '+91 87234 56789', project: 'Villa - Devanahalli', budget: '₹4.5 Cr', time: '5d in stage', action: 'WhatsApp - Yesterday', assignee: 'PN' },
    { id: 7, name: 'Karthik Iyer', temp: 'WARM', source: 'Organic', phone: '+91 76345 67890', project: '3 BHK - Marathahalli', budget: '₹1.3 Cr', time: '7d in stage', action: 'Email - 2 days ago', assignee: 'RS' }
  ],
  qualified: [
    { id: 8, name: 'Meera Pillai', temp: 'HOT', source: 'Google Ads', phone: '+91 98901 23456', project: '4 BHK - Whitefield', budget: '₹2.8 Cr', time: '4d in stage', assignee: 'AS' },
    { id: 9, name: 'Vivek Sharma', temp: 'HOT', source: 'Referral', phone: '+91 87012 34567', project: 'Villa - Sarjapur', budget: '₹4.2 Cr', time: '6d in stage', assignee: 'PN' },
    { id: 10, name: 'Lakshmi Rao', temp: 'WARM', source: 'Meta Ads', phone: '+91 76123 45678', project: '3 BHK - HSR Layout', budget: '₹1.4 Cr', time: '8d in stage', assignee: 'RS' },
    { id: 11, name: 'Nikhil Joshi', temp: 'WARM', source: 'Google Ads', phone: '+91 65234 56789', project: '2 BHK - Whitefield', budget: '₹1.1 Cr', time: '12d in stage', assignee: 'KM' }
  ],
  siteVisit: [
    { id: 12, name: 'Ramesh Nair', temp: 'HOT', source: 'Google Ads', phone: '+91 98456 78901', project: 'Villa - Devanahalli', budget: '₹3.8 Cr', time: '2d in stage', visitTime: 'Tomorrow 11 AM', assignee: 'AS' },
    { id: 13, name: 'Pooja Krishnamurthy', temp: 'HOT', source: 'Referral', phone: '+91 87567 89012', project: 'Penthouse - Indiranagar', budget: '₹5.4 Cr', time: '4d in stage', visitTime: '12 Jun 3 PM', assignee: 'PN' },
    { id: 14, name: 'Ajay Singh', temp: 'WARM', source: 'Meta Ads', phone: '+91 76678 90123', project: '4 BHK - Whitefield', budget: '₹2.6 Cr', time: '6d in stage', visitTime: '14 Jun 10 AM', assignee: 'AS' }
  ],
  converted: [
    { id: 15, name: 'Ramesh Nair', temp: 'CONVERTED', source: 'Google Ads', phone: '+91 98456 78901', project: 'Villa - Devanahalli', budget: '₹3.8 Cr', time: '18d in stage', assignee: 'AS' },
    { id: 16, name: 'Pooja Krishnamurthy', temp: 'CONVERTED', source: 'Referral', phone: '+91 87567 89012', project: 'Penthouse - Indiranagar', budget: '₹5.4 Cr', time: '22d in stage', assignee: 'PN' },
    { id: 17, name: 'Anil Kumar', temp: 'CONVERTED', source: 'Meta Ads', phone: '+91 87000 11122', project: '4 BHK - Whitefield', budget: '₹2.4 Cr', time: '14d in stage', assignee: 'RS' }
  ]
};

export const activeAutomations = [
  { id: 1, name: 'New Lead → WhatsApp Notify', trigger: 'Form submission', action: 'WhatsApp to sales team', status: 'Active', runs: 142, lastRun: '2 hrs ago', on: true },
  { id: 2, name: 'Lead Follow-up Sequence', trigger: 'Lead not contacted 24h', action: 'Email + WhatsApp sequence (3 days)', status: 'Active', runs: 38, lastRun: '5 hrs ago', on: true },
  { id: 3, name: 'Monthly Report Send', trigger: '1st of month, 9AM', action: 'Generate + email report to client', status: 'Active', runs: 1, lastRun: '1 Jun', on: true },
  { id: 4, name: 'MOS Drop Alert', trigger: 'MOS drops >5 pts', action: 'Slack alert to account manager', status: 'Active', runs: 2, lastRun: '3 days ago', on: true },
  { id: 5, name: 'Invoice Reminder', trigger: '3 days before due', action: 'WhatsApp + email to client billing', status: 'Active', runs: 0, lastRun: '—', on: true },
  { id: 6, name: 'Birthday Greeting', trigger: 'Lead birthday', action: 'Personalised WhatsApp message', status: 'Paused', runs: 0, lastRun: '—', on: false },
];

export const automationLogs = [
  { id: 1, name: 'New Lead → WhatsApp Notify', trigger: 'Form: contact-page', time: 'Today · 14:32', status: 'Success', records: 1, details: 'Sent to 3 sales reps' },
  { id: 2, name: 'Lead Follow-up Sequence', trigger: 'Lead #1820', time: 'Today · 13:10', status: 'Success', records: 1, details: 'Step 1/3 sent' },
  { id: 3, name: 'MOS Drop Alert', trigger: 'Scheduled scan', time: 'Today · 09:00', status: 'Skipped', records: 0, details: 'No drops detected' },
  { id: 4, name: 'New Lead → WhatsApp Notify', trigger: 'Form: project-enquiry', time: 'Today · 08:42', status: 'Success', records: 1, details: 'Sent' },
  { id: 5, name: 'Lead Follow-up Sequence', trigger: 'Lead #1812', time: 'Yesterday · 22:15', status: 'Failed', records: 0, details: 'WhatsApp API rate-limited' },
  { id: 6, name: 'New Lead → WhatsApp Notify', trigger: 'Form: contact-page', time: 'Yesterday · 19:08', status: 'Success', records: 1, details: 'Sent' },
];

export const taskKanbanData = {
  todo: [
    { id: 1, title: 'Fix Google Ads conversion tracking — BharatPe', client: 'BHARATPE', tag: 'ADS', assignee: 'PN', due: 'Today, Jun 5', sub: '0/3', comments: 2 },
    { id: 2, title: 'Write June blog post — Prestige Estates', client: 'PRESTIGE ESTATES', tag: 'CONTENT', assignee: 'KM', due: '15 Jun', sub: '1/4', comments: 1 },
    { id: 3, title: 'Update Instagram grid plan — Nykaa', client: 'NYKAA', tag: 'SOCIAL', assignee: 'DR', due: '18 Jun', sub: '0/2', comments: 0 }
  ],
  inProgress: [
    { id: 4, title: 'Wakefit emergency SEO audit — fix crawl errors', client: 'WAKEFIT', tag: 'SEO', assignee: 'AS', due: 'Jun 10', sub: '3/7', comments: 4 },
    { id: 5, title: 'Prestige Estates — Meta Ads creative refresh Q2', client: 'PRESTIGE ESTATES', tag: 'ADS', tag2: 'DESIGN', assignee: 'PN', due: 'Jun 12', sub: '2/5', comments: 2 },
    { id: 6, title: 'Meesho Google Ads campaign restructure', client: 'MEESHO', tag: 'ADS', assignee: 'PN', due: 'Jun 14', sub: '1/6', comments: 1 }
  ],
  inReview: [
    { id: 7, title: 'Lenskart SEO keyword research — Q3 2026', client: 'LENSKART', tag: 'SEO', assignee: 'AS', due: 'Jun 11', sub: '5/5', comments: 3 },
    { id: 8, title: 'boAt Instagram reels — June batch (4 reels)', client: 'BOAT', tag: 'SOCIAL', tag2: 'DESIGN', assignee: 'DR', due: 'Jun 13', sub: '4/4', comments: 2 },
    { id: 9, title: 'CRED email campaign copy — welcome sequence', client: 'CRED', tag: 'CONTENT', assignee: 'KM', due: 'Jun 15', sub: '2/2', comments: 1 }
  ],
  done: [
    { id: 10, title: 'Prestige Estates — June performance report', client: 'PRESTIGE ESTATES', tag: 'CLIENT', assignee: 'AS', due: 'Today 10:42 AM', sub: '4/4', comments: 1 },
    { id: 11, title: 'BharatPe Meta Ads — creative upload (8 creatives)', client: 'BHARATPE', tag: 'ADS', tag2: 'DESIGN', assignee: 'PN', due: 'Yesterday', sub: '8/8', comments: 0 },
    { id: 12, title: 'Wakefit — Google Analytics audit', client: 'WAKEFIT', tag: 'SEO', assignee: 'AS', due: 'Jun 7', sub: '5/5', comments: 2 }
  ],
  blocked: [
    { id: 13, title: 'Lenskart website redesign — Phase 1', client: 'LENSKART', tag: 'DESIGN', assignee: 'DR', due: 'Jun 25', sub: '1/5', comments: 6, blockedReason: 'Waiting for client to share new brand assets - Jun 5 (8 days)' },
    { id: 14, title: 'BharatPe WhatsApp API integration', client: 'BHARATPE', tag: 'CLIENT', assignee: 'AS', due: '—', sub: '0/2', comments: 3, blockedReason: 'API credentials not received from client - Jun 7 (2 days)' }
  ]
};

export const allSitesPerformance = [
  { id: 1, site: 'Prestige Estates Main', url: 'prestigeestates.com', visitors: '48,200', conv: '3.8%', speed: 91, seo: 88, updated: '2 days ago', status: 'Live' },
  { id: 2, site: 'Luxury Q2 Campaign', url: '../luxury-q2', visitors: '6,230', conv: '5.2%', speed: 94, seo: 74, updated: '1 week ago', status: 'Live' },
  { id: 3, site: 'Somerville Ph2 Launch', url: '../somerville-ph2', visitors: '2,400', conv: '8.4%', speed: 96, seo: 68, updated: '2 hrs ago', status: 'Live' },
  { id: 4, site: 'Whitefield Launch', url: '../whitefield', visitors: '346', conv: '4.1%', speed: 86, seo: 62, updated: 'Today', status: 'Live' },
  { id: 5, site: 'NRI Investment Page', url: '../nri-invest', visitors: '-', conv: '-', speed: '-', seo: '-', updated: 'Draft', status: 'Draft' },
];

export const websiteTrafficAnalytics = [
  { day: 'May 11', organic: 3000, paid: 2000, direct: 1500, referral: 500 },
  { day: 'May 16', organic: 3500, paid: 2200, direct: 1600, referral: 600 },
  { day: 'May 21', organic: 3200, paid: 2500, direct: 1800, referral: 550 },
  { day: 'May 26', organic: 3800, paid: 2800, direct: 1900, referral: 700 },
  { day: 'May 31', organic: 4000, paid: 3000, direct: 2000, referral: 800 },
  { day: 'Jun 5', organic: 4500, paid: 3200, direct: 2200, referral: 900 },
];

export const topPagesAnalytics = [
  { url: '/properties/prestige-falcon-city', client: 'Prestige Estates', sessions: '38,420', bounce: '32%', avgTime: '3m 18s', conv: 412, convRate: '1.07%' },
  { url: '/blog/best-bluetooth-headphones-2026', client: 'boAt', sessions: '31,280', bounce: '41%', avgTime: '2m 44s', conv: 268, convRate: '0.86%' },
  { url: '/captain/sign-up', client: 'Rapido', sessions: '27,640', bounce: '28%', avgTime: '4m 02s', conv: 1842, convRate: '6.67%' },
  { url: '/beauty/skincare/serums', client: 'Nykaa', sessions: '24,910', bounce: '38%', avgTime: '3m 11s', conv: 524, convRate: '2.10%' },
  { url: '/credit-card-bill-payment', client: 'CRED', sessions: '22,480', bounce: '22%', avgTime: '2m 56s', conv: 1208, convRate: '5.37%' },
];

export const clientPerformanceAnalytics = [
  { name: 'Prestige Estates', lastMonth: 25, thisMonth: 28 },
  { name: 'boAt', lastMonth: 32, thisMonth: 38 },
  { name: 'Rapido', lastMonth: 30, thisMonth: 42 },
  { name: 'Nykaa', lastMonth: 40, thisMonth: 38 },
  { name: 'CRED', lastMonth: 45, thisMonth: 50 },
  { name: 'Meesho', lastMonth: 48, thisMonth: 60 },
  { name: 'Zepto', lastMonth: 52, thisMonth: 54 },
  { name: 'Lenskart', lastMonth: 55, thisMonth: 62 },
  { name: 'OYO', lastMonth: 58, thisMonth: 72 },
  { name: 'BharatPe', lastMonth: 63, thisMonth: 62 },
  { name: 'Urban Company', lastMonth: 62, thisMonth: 70 },
  { name: 'Wakefit', lastMonth: 72, thisMonth: 85 },
];

// ============================================================================
// PHASE 5: INTELLIGENCE & AGENCY OPS MOCK DATA
// ============================================================================

export const scheduledReports = [
  { id: 1, name: 'Prestige Monthly', client: 'Prestige Estates', template: 'Monthly Performance', frequency: 'Monthly', nextSend: '1 Jul 2026', format: 'PDF + Email', status: 'Active' },
  { id: 2, name: 'Rapido Weekly', client: 'Rapido', template: 'Executive Summary', frequency: 'Weekly', nextSend: 'Mon 9AM', format: 'WhatsApp + Email', status: 'Active' },
  { id: 3, name: 'Meesho SEO', client: 'Meesho', template: 'SEO Ranking', frequency: 'Bi-weekly', nextSend: '15 Jun', format: 'PDF', status: 'Active' },
  { id: 4, name: 'Lenskart Ads', client: 'Lenskart', template: 'Paid Media', frequency: 'Monthly', nextSend: '1 Jul 2026', format: 'PDF', status: 'Paused' },
];

export const recentSentReports = [
  { id: 1, name: 'Prestige Monthly — May', client: 'Prestige Estates', sentAt: '1 Jun 2026, 9:02 AM', deliveredTo: 'arvind@prestige.in, +2', opened: 'Opened', pages: 14 },
  { id: 2, name: 'Rapido Weekly — W22', client: 'Rapido', sentAt: '30 May 2026, 9:00 AM', deliveredTo: 'growth@rapido.com', opened: 'Opened', pages: 1 },
  { id: 3, name: 'Meesho SEO — Late May', client: 'Meesho', sentAt: '29 May 2026, 6:14 PM', deliveredTo: 'seo-team@meesho.com', opened: 'Pending', pages: 7 },
  { id: 4, name: 'Nykaa Monthly — May', client: 'Nykaa', sentAt: '28 May 2026, 11:20 AM', deliveredTo: 'ritika@nykaa.com, +3', opened: 'Opened', pages: 16 },
  { id: 5, name: 'BharatPe Executive — May', client: 'BharatPe', sentAt: '27 May 2026, 8:45 AM', deliveredTo: 'ceo-office@bharatpe.com', opened: 'Opened', pages: 1 },
  { id: 6, name: 'Lenskart Ads — April', client: 'Lenskart', sentAt: '1 May 2026, 10:00 AM', deliveredTo: 'marketing@lenskart.com', opened: 'Pending', pages: 9 },
];

export const teamAllocationData = [
  { name: 'Arjun', prestige: 32, boat: 0, rapido: 22, nykaa: 0, cred: 14, meesho: 18, lenskart: 0, bharatpe: 0, others: 58, total: 144 },
  { name: 'Priya', prestige: 28, boat: 24, rapido: 18, nykaa: 20, cred: 18, meesho: 22, lenskart: 0, bharatpe: 0, others: 14, total: 144 },
  { name: 'Karan', prestige: 24, boat: 12, rapido: 16, nykaa: 18, cred: 12, meesho: 14, lenskart: 12, bharatpe: 0, others: 10, total: 118 },
  { name: 'Divya', prestige: 20, boat: 18, rapido: 14, nykaa: 16, cred: 10, meesho: 12, lenskart: 0, bharatpe: 10, others: 32, total: 132 },
  { name: 'Rahul', prestige: 20, boat: 17, rapido: 17, nykaa: 10, cred: 14, meesho: 20, lenskart: 20, bharatpe: 12, others: 20, total: 140 },
];

export const recentTimeEntries = [
  { id: 1, date: 'Today', member: 'Arjun Sharma', memberInit: 'AS', client: 'Prestige Estates', module: 'SEO', task: 'Keyword research - luxury apts cluster', hours: 2.5, billable: true },
  { id: 2, date: 'Today', member: 'Priya Nair', memberInit: 'PN', client: 'Rapido', module: 'Ads', task: 'Meta campaign optimization Q3 push', hours: 3.0, billable: true },
  { id: 3, date: 'Today', member: 'Karan Mehta', memberInit: 'KM', client: 'Meesho', module: 'Content', task: 'Blog: Top 10 seller tips for festive', hours: 4.0, billable: true },
  { id: 4, date: 'Today', member: 'Divya Rao', memberInit: 'DR', client: 'Lenskart', module: 'Social', task: 'Reel storyboards - creator briefs', hours: 2.5, billable: true },
  { id: 5, date: 'Yesterday', member: 'Rahul Singh', memberInit: 'RS', client: 'BharatPe', module: 'Strategy', task: 'QBR prep deck v2', hours: 3.5, billable: true },
  { id: 6, date: 'Yesterday', member: 'Arjun Sharma', memberInit: 'AS', client: 'Wakefit', module: 'SEO', task: 'Technical audit - core web vitals fixes', hours: 2.0, billable: true },
  { id: 7, date: 'Yesterday', member: 'Priya Nair', memberInit: 'PN', client: 'Prestige Estates', module: 'Ads', task: 'Google search RSAs A/B test setup', hours: 2.5, billable: true },
  { id: 8, date: 'Yesterday', member: 'Karan Mehta', memberInit: 'KM', client: 'Rapido', module: 'Content', task: 'Driver onboarding video script', hours: 3.0, billable: true },
];

export const mosScoreClients = [
  { client: 'Prestige Estates', overall: 84, website: 88, seo: 81, social: 78, ads: 86, leads: 83, rev: 78, cx: 80, mom: '+3' },
  { client: 'boAt', overall: 81, website: 82, seo: 78, social: 88, ads: 84, leads: 79, rev: 80, cx: 78, mom: '+2' },
  { client: 'Rapido', overall: 78, website: 78, seo: 74, social: 82, ads: 79, leads: 81, rev: 76, cx: 76, mom: '+1' },
  { client: 'Nykaa', overall: 76, website: 79, seo: 72, social: 86, ads: 74, leads: 77, rev: 72, cx: 76, mom: '—' },
  { client: 'CRED', overall: 73, website: 74, seo: 78, social: 70, ads: 72, leads: 74, rev: 71, cx: 75, mom: '-1' },
  { client: 'Meesho', overall: 71, website: 72, seo: 68, social: 74, ads: 73, leads: 76, rev: 68, cx: 67, mom: '+2' },
  { client: 'Zepto', overall: 67, website: 65, seo: 66, social: 71, ads: 68, leads: 72, rev: 63, cx: 65, mom: '+4' },
  { client: 'Lenskart', overall: 63, website: 61, seo: 67, social: 68, ads: 58, leads: 66, rev: 62, cx: 62, mom: '-3' },
  { client: 'OYO', overall: 62, website: 60, seo: 58, social: 64, ads: 63, leads: 61, rev: 66, cx: 62, mom: '-2' },
  { client: 'BharatPe', overall: 58, website: 56, seo: 60, social: 54, ads: 46, leads: 62, rev: 59, cx: 60, mom: '-4' },
  { client: 'Urban Company', overall: 55, website: 58, seo: 52, social: 56, ads: 54, leads: 58, rev: 48, cx: 56, mom: '-2' },
  { client: 'Wakefit', overall: 48, website: 44, seo: 42, social: 52, ads: 46, leads: 48, rev: 54, cx: 50, mom: '-8' },
];

export const mosTrendData = [
  { month: 'Jul', val: 56 }, { month: 'Aug', val: 57 }, { month: 'Sep', val: 59 },
  { month: 'Oct', val: 62 }, { month: 'Nov', val: 61 }, { month: 'Dec', val: 60 },
  { month: 'Jan', val: 63 }, { month: 'Feb', val: 65 }, { month: 'Mar', val: 66 },
  { month: 'Apr', val: 65 }, { month: 'May', val: 67 }, { month: 'Jun', val: 68 },
];

// ============================================================================
// PHASE 6: AGENCY OPS & SETTINGS MOCK DATA
// ============================================================================

export const invoicesList = [
  { id: 'INV-2026-062', client: 'Prestige Estates', amount: '₹3,20,000', due: '10 Jun', status: 'PAID', method: 'UPI', link: '—' },
  { id: 'INV-2026-061', client: 'boAt', amount: '₹4,50,000', due: '10 Jun', status: 'PAID', method: 'Card', link: '—' },
  { id: 'INV-2026-060', client: 'Rapido', amount: '₹2,80,000', due: '10 Jun', status: 'PAID', method: 'UPI', link: '—' },
  { id: 'INV-2026-059', client: 'Nykaa', amount: '₹3,20,000', due: '10 Jun', status: 'PAID', method: 'UPI', link: '—' },
  { id: 'INV-2026-058', client: 'CRED', amount: '₹3,80,000', due: '10 Jun', status: 'PAID', method: 'Card', link: '—' },
  { id: 'INV-2026-057', client: 'Meesho', amount: '₹4,20,000', due: '10 Jun', status: 'PAID', method: 'Netbanking', link: '—' },
  { id: 'INV-2026-056', client: 'Zepto', amount: '₹2,40,000', due: '10 Jun', status: 'PENDING', method: 'Not paid', link: 'Not sent' },
  { id: 'INV-2026-055', client: 'Lenskart', amount: '₹1,80,000', due: '10 Jun', status: 'PENDING', method: 'Not paid', link: 'Not sent' },
  { id: 'INV-2026-054', client: 'OYO', amount: '₹2,80,000', due: '10 Jun', status: 'PAID', method: 'Card', link: '—' },
  { id: 'INV-2026-053', client: 'BharatPe', amount: '₹2,20,000', due: '10 Jun', status: 'PAID', method: 'UPI', link: '—' },
  { id: 'INV-2026-052', client: 'Urban Company', amount: '₹1,40,000', due: '10 Jun', status: 'PAID', method: 'Bank Transfer', link: '—' },
  { id: 'INV-2026-051', client: 'Wakefit', amount: '₹1,60,000', due: '10 Jun', status: 'PAID', method: 'Bank Transfer', link: '—' },
];

export const clientProfitabilityData = [
  { client: 'Prestige Estates', revenue: '₹3,20,000', teamCost: '₹1,48,000', vendorCost: '₹22,000', totalCost: '₹1,70,000', grossProfit: '₹1,50,000', margin: 46.9, hours: 124, effRate: '₹1,210', trend: 'up' },
  { client: 'Rapido', revenue: '₹2,80,000', teamCost: '₹1,62,000', vendorCost: '₹18,000', totalCost: '₹1,80,000', grossProfit: '₹1,00,000', margin: 35.7, hours: 98, effRate: '₹1,020', trend: 'neutral' },
  { client: 'Meesho', revenue: '₹4,20,000', teamCost: '₹2,44,000', vendorCost: '₹38,000', totalCost: '₹2,82,000', grossProfit: '₹1,38,000', margin: 32.8, hours: 86, effRate: '₹1,605', trend: 'up' },
  { client: 'Lenskart', revenue: '₹1,80,000', teamCost: '₹1,42,000', vendorCost: '₹12,000', totalCost: '₹1,54,000', grossProfit: '₹26,000', margin: 14.4, hours: 74, effRate: '₹351', trend: 'down' },
  { client: 'BharatPe', revenue: '₹2,20,000', teamCost: '₹1,88,000', vendorCost: '₹24,000', totalCost: '₹2,12,000', grossProfit: '₹8,000', margin: 3.6, hours: 68, effRate: '₹118', trend: 'down' },
  { client: 'Wakefit', revenue: '₹1,60,000', teamCost: '₹1,34,000', vendorCost: '₹16,000', totalCost: '₹1,50,000', grossProfit: '₹10,000', margin: 6.3, hours: 52, effRate: '₹192', trend: 'down' },
];

export const newBusinessPipelineData = {
  lead: [
    { name: 'HealthKart', category: 'Health & Wellness', value: '₹2.8L / mo', rep: 'Amit Jain', date: 'Added 3 Jun', ownerInit: 'AS' },
    { name: 'Swiggy Instamart', category: 'Q-Commerce', value: '₹3.2L / mo', rep: 'Neha Kapoor', date: 'Added 5 Jun', ownerInit: 'PN' },
    { name: 'Mamaearth', category: 'D2C Beauty', value: '₹2.4L / mo', rep: 'Varun Alagh', date: 'Added 8 Jun', ownerInit: 'KM' }
  ],
  qualified: [
    { name: 'Ather Energy', category: 'EV / Mobility', value: '₹3.8L / mo', rep: 'Tarun Mehta', date: 'Qualified 28 May', ownerInit: 'AS' },
    { name: 'Sugar Cosmetics', category: 'D2C Beauty', value: '₹2.2L / mo', rep: 'Vineeta Singh', date: 'Qualified 1 Jun', ownerInit: 'PN' }
  ],
  proposal: [
    { name: 'Noise', category: 'Consumer Electronics', value: '₹3.4L / mo', rep: 'Amit Khatri', date: 'Sent 2 Jun', ownerInit: 'KM', follow: '12 Jun' },
    { name: 'DealShare', category: 'E-Commerce', value: '₹2.6L / mo', rep: 'Vineet Rao', date: 'Sent 5 Jun', ownerInit: 'AS', follow: '15 Jun' }
  ],
  negotiation: [
    { name: 'Pepperfry', category: 'Home Furnishing', value: '₹4.2L / mo', rep: 'Ambareesh M.', date: 'Decision 15 Jun', ownerInit: 'PN' }
  ]
};

export const activeProposals = [
  { company: 'Noise', mrr: '₹3.4L', sent: '2 Jun', val: '₹40.8L / yr', follow: '12 Jun', status: 'Awaiting Response' },
  { company: 'DealShare', mrr: '₹2.6L', sent: '5 Jun', val: '₹31.2L / yr', follow: '15 Jun', status: 'Reviewed' },
  { company: 'Pepperfry', mrr: '₹4.2L', sent: '20 May', val: '₹50.4L / yr', follow: '15 Jun', status: 'In Negotiation' },
];

export const mrrGrowthData = [
  { month: 'Jul', actual: 30, forecast: null, growth: null },
  { month: 'Aug', actual: 32, forecast: null, growth: 6.6 },
  { month: 'Sep', actual: 33, forecast: null, growth: 3.1 },
  { month: 'Oct', actual: 34, forecast: null, growth: 3.0 },
  { month: 'Nov', actual: 34, forecast: null, growth: 0 },
  { month: 'Dec', actual: 32, forecast: null, growth: -5.8 },
  { month: 'Jan', actual: 36, forecast: null, growth: 12.5 },
  { month: 'Feb', actual: 38, forecast: null, growth: 5.5 },
  { month: 'Mar', actual: 40, forecast: null, growth: 5.2 },
  { month: 'Apr', actual: 41, forecast: null, growth: 2.5 },
  { month: 'May', actual: 42, forecast: null, growth: 2.4 },
  { month: 'Jun', actual: 42.8, forecast: null, growth: 1.9 },
  { month: 'Jul (F)', actual: null, forecast: 44.2, growth: 3.3 },
  { month: 'Aug (F)', actual: null, forecast: 45.8, growth: 3.6 },
  { month: 'Sep (F)', actual: null, forecast: 47.8, growth: 4.3 },
];

export const cohortData = [
  { cohort: 'Q1 2024', m0: 100, m1: 100, m2: 95, m3: 92, m4: 88, m5: 85 },
  { cohort: 'Q2 2024', m0: 100, m1: 98, m2: 95, m3: 91, m4: 88, m5: null },
  { cohort: 'Q3 2024', m0: 100, m1: 100, m2: 96, m3: 93, m4: null, m5: null },
  { cohort: 'Q4 2024', m0: 100, m1: 98, m2: 95, m3: null, m4: null, m5: null },
  { cohort: 'Q1 2025', m0: 100, m1: 97, m2: null, m3: null, m4: null, m5: null },
];
