// Mock data for AI Sales Automation Dashboard

export interface Lead {
  id: string;
  company: string;
  contact: string;
  email: string;
  phone: string;
  source: 'website' | 'trade_show' | 'referral' | 'google_ads' | 'linkedin';
  timestamp: Date;
  status: 'qualified' | 'in_progress' | 'unqualified' | 'escalated';
  bantScore: {
    budget: number;
    authority: number;
    need: number;
    timeline: number;
  };
  technicalRequirements: string[];
  productCategory: string;
  budgetRange: string;
  nextAction: string;
  assignedRep: string;
  urgency: 'high' | 'medium' | 'low';
  afterHours: boolean;
}

export interface Activity {
  id: string;
  type: 'new_lead' | 'qualification' | 'handoff' | 'response' | 'conversion';
  message: string;
  timestamp: Date;
  leadId?: string;
  company?: string;
}

export interface Conversation {
  id: string;
  leadId: string;
  company: string;
  contact: string;
  timestamp: Date;
  duration: string;
  sentiment: 'positive' | 'neutral' | 'negative';
  escalated: boolean;
  extractedData: {
    budget?: string;
    timeline?: string;
    specs?: string[];
    certifications?: string[];
    moq?: string;
  };
  transcript: Array<{
    role: 'ai' | 'customer';
    message: string;
    timestamp: Date;
  }>;
}

const companies = [
  'Precision Manufacturing Co.', 'TechParts Industries', 'Aerospace Components Inc.',
  'MetalWorks Solutions', 'CNC Masters Ltd.', 'ProCast Foundry', 'SheetMetal Pro',
  'Injection Molding Experts', 'Industrial Parts Direct', 'Custom Fabricators LLC',
  'Advanced Materials Corp.', 'Quality Components Inc.', 'Rapid Prototype Systems',
  'Machining Excellence Ltd.', 'Precision Castings Co.', 'Steel Solutions Group',
  'Aluminum Specialists Inc.', 'ToolCraft Industries', 'Engineering Parts Co.',
  'Manufacturing Partners Ltd.'
];

const contacts = [
  'John Smith', 'Sarah Johnson', 'Michael Chen', 'Emily Davis', 'Robert Wilson',
  'Jennifer Brown', 'David Lee', 'Lisa Anderson', 'James Taylor', 'Maria Garcia',
  'Thomas Moore', 'Patricia Martin', 'Christopher White', 'Amanda Thompson',
  'Daniel Harris', 'Jessica Clark', 'Matthew Lewis', 'Ashley Robinson', 'Andrew Walker',
  'Stephanie Hall'
];

const productCategories = [
  'CNC Machined Parts', 'Injection Molding', 'Sheet Metal Fabrication',
  'Die Casting', 'Investment Casting', 'Precision Grinding', 'EDM Services',
  'Prototype Development', 'Assembly Services', '3D Metal Printing'
];

const certifications = [
  'ISO 9001', 'AS9100', 'ISO 13485', 'IATF 16949', 'NADCAP', 'ISO 14001'
];

const materials = [
  'Aluminum 6061', 'Aluminum 7075', 'Stainless 304', 'Stainless 316',
  'Titanium Grade 5', 'Inconel 718', 'Carbon Steel 1018', 'Brass C360',
  'PEEK', 'Delrin', 'Nylon 6/6'
];

const reps = ['Alex Thompson', 'Sarah Mitchell', 'James Rodriguez', 'Emma Watson', 'Michael Scott'];

const sources: Lead['source'][] = ['website', 'trade_show', 'referral', 'google_ads', 'linkedin'];
const statuses: Lead['status'][] = ['qualified', 'in_progress', 'unqualified', 'escalated'];
const urgencies: Lead['urgency'][] = ['high', 'medium', 'low'];

function randomDate(start: Date, end: Date): Date {
  return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
}

function randomElement<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function generateBudgetRange(): string {
  const ranges = ['$5K - $15K', '$15K - $50K', '$50K - $100K', '$100K - $250K', '$250K - $500K'];
  return randomElement(ranges);
}

function generateTechnicalRequirements(): string[] {
  const count = Math.floor(Math.random() * 4) + 1;
  const reqs: string[] = [];
  
  // Add some certifications
  if (Math.random() > 0.3) {
    reqs.push(randomElement(certifications));
  }
  
  // Add materials
  for (let i = 0; i < count; i++) {
    const material = randomElement(materials);
    if (!reqs.includes(material)) {
      reqs.push(material);
    }
  }
  
  // Add tolerances
  if (Math.random() > 0.5) {
    reqs.push(`±0.00${Math.floor(Math.random() * 5) + 1}" tolerance`);
  }
  
  return reqs;
}

export function generateLeads(count: number): Lead[] {
  const leads: Lead[] = [];
  const now = new Date();
  const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  
  for (let i = 0; i < count; i++) {
    const timestamp = randomDate(weekAgo, now);
    const isAfterHours = timestamp.getHours() < 8 || timestamp.getHours() > 18;
    
    leads.push({
      id: `lead-${i + 1}`,
      company: randomElement(companies),
      contact: randomElement(contacts),
      email: `contact${i + 1}@company.com`,
      phone: `+1 (${Math.floor(Math.random() * 900) + 100}) ${Math.floor(Math.random() * 900) + 100}-${Math.floor(Math.random() * 9000) + 1000}`,
      source: randomElement(sources),
      timestamp,
      status: randomElement(statuses),
      bantScore: {
        budget: Math.floor(Math.random() * 30) + 70,
        authority: Math.floor(Math.random() * 40) + 60,
        need: Math.floor(Math.random() * 25) + 75,
        timeline: Math.floor(Math.random() * 35) + 65,
      },
      technicalRequirements: generateTechnicalRequirements(),
      productCategory: randomElement(productCategories),
      budgetRange: generateBudgetRange(),
      nextAction: randomElement(['Schedule demo', 'Send quote', 'Technical review', 'Follow up call', 'Await RFQ']),
      assignedRep: randomElement(reps),
      urgency: randomElement(urgencies),
      afterHours: isAfterHours,
    });
  }
  
  return leads.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
}

export function generateActivities(leads: Lead[]): Activity[] {
  const activities: Activity[] = [];
  const types: Activity['type'][] = ['new_lead', 'qualification', 'handoff', 'response', 'conversion'];
  const now = new Date();
  
  for (let i = 0; i < 20; i++) {
    const type = randomElement(types);
    const lead = randomElement(leads);
    let message = '';
    
    switch (type) {
      case 'new_lead':
        message = `New inquiry received from ${lead.company}`;
        break;
      case 'qualification':
        message = `AI qualified lead from ${lead.company} - BANT score: ${Math.floor((lead.bantScore.budget + lead.bantScore.authority + lead.bantScore.need + lead.bantScore.timeline) / 4)}%`;
        break;
      case 'handoff':
        message = `Lead handed off to ${lead.assignedRep} for ${lead.company}`;
        break;
      case 'response':
        message = `AI responded to ${lead.contact} at ${lead.company} in 47 seconds`;
        break;
      case 'conversion':
        message = `${lead.company} converted to opportunity - ${lead.budgetRange}`;
        break;
    }
    
    activities.push({
      id: `activity-${i + 1}`,
      type,
      message,
      timestamp: new Date(now.getTime() - Math.random() * 2 * 60 * 60 * 1000),
      leadId: lead.id,
      company: lead.company,
    });
  }
  
  return activities.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
}

export function generateConversations(leads: Lead[]): Conversation[] {
  return leads.slice(0, 15).map((lead, index) => ({
    id: `conv-${index + 1}`,
    leadId: lead.id,
    company: lead.company,
    contact: lead.contact,
    timestamp: lead.timestamp,
    duration: `${Math.floor(Math.random() * 10) + 2}:${Math.floor(Math.random() * 60).toString().padStart(2, '0')}`,
    sentiment: randomElement(['positive', 'neutral', 'negative'] as const),
    escalated: lead.status === 'escalated',
    extractedData: {
      budget: lead.budgetRange,
      timeline: randomElement(['Immediate', '30 days', '60 days', 'Q2 2024', 'Q3 2024']),
      specs: lead.technicalRequirements.slice(0, 2),
      certifications: lead.technicalRequirements.filter(r => certifications.includes(r)),
      moq: `${Math.floor(Math.random() * 900) + 100} units`,
    },
    transcript: [
      {
        role: 'customer',
        message: `Hi, I'm looking for ${lead.productCategory} services. We need parts made from ${randomElement(materials)}.`,
        timestamp: new Date(lead.timestamp.getTime()),
      },
      {
        role: 'ai',
        message: `Hello! Thank you for reaching out. I'd be happy to help you with ${lead.productCategory}. Could you tell me more about your quantity requirements and timeline?`,
        timestamp: new Date(lead.timestamp.getTime() + 47000),
      },
      {
        role: 'customer',
        message: `We need about ${Math.floor(Math.random() * 500) + 100} units, and we're looking to have them within ${randomElement(['30', '60', '90'])} days.`,
        timestamp: new Date(lead.timestamp.getTime() + 120000),
      },
      {
        role: 'ai',
        message: `That timeline works well for us. What certifications do you require? We're certified for ${certifications.slice(0, 3).join(', ')}.`,
        timestamp: new Date(lead.timestamp.getTime() + 167000),
      },
    ],
  }));
}

// Pipeline data
export const pipelineData = [
  { stage: 'Leads', count: 847, value: 2450000 },
  { stage: 'Qualified', count: 423, value: 1890000 },
  { stage: 'Opportunities', count: 156, value: 1240000 },
  { stage: 'Proposals', count: 89, value: 890000 },
  { stage: 'Closed Won', count: 34, value: 456000 },
];

// Response time data (hourly over 24 hours)
export const responseTimeData = Array.from({ length: 24 }, (_, i) => ({
  hour: `${i.toString().padStart(2, '0')}:00`,
  aiResponse: Math.floor(Math.random() * 60) + 30, // 30-90 seconds
  humanResponse: Math.floor(Math.random() * 120) + 60, // 1-3 minutes
}));

// Lead volume data (daily over 30 days)
export const leadVolumeData = Array.from({ length: 30 }, (_, i) => {
  const date = new Date();
  date.setDate(date.getDate() - (29 - i));
  return {
    date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    leads: Math.floor(Math.random() * 30) + 20,
    qualified: Math.floor(Math.random() * 25) + 15,
    converted: Math.floor(Math.random() * 10) + 3,
  };
});

// Comparison data
export const comparisonData = {
  responseTime: { before: 1440, after: 2 }, // minutes
  adminWorkload: { before: 65, after: 33 }, // percentage
  lostOpportunities: { before: 23, after: 5 }, // percentage
  qualificationAccuracy: { before: 67, after: 95 }, // percentage
  costPerLead: { before: 45, after: 12 }, // dollars
};

// Lead source performance
export const leadSourceData = [
  { source: 'Website', leads: 312, qualified: 287, rate: 92 },
  { source: 'Google Ads', leads: 245, qualified: 218, rate: 89 },
  { source: 'Trade Shows', leads: 156, qualified: 148, rate: 95 },
  { source: 'Referrals', leads: 89, qualified: 86, rate: 97 },
  { source: 'LinkedIn', leads: 45, qualified: 38, rate: 84 },
];

// CRM integrations
export const crmIntegrations = [
  { name: 'Salesforce', status: 'connected', lastSync: new Date(Date.now() - 5 * 60000), accuracy: 99.2 },
  { name: 'HubSpot', status: 'connected', lastSync: new Date(Date.now() - 2 * 60000), accuracy: 98.8 },
  { name: 'Dynamics 365', status: 'pending', lastSync: null, accuracy: null },
];
