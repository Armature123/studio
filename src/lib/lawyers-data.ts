
export type Lawyer = {
  id: number;
  name: string;
  photoUrl: string;
  specialties: string[];
  rating: number;
  reviewCount: number;
  bio: string;
};

export const lawyers: Lawyer[] = [
  {
    id: 1,
    name: 'Adv. Rohan Sharma',
    photoUrl: 'https://i.ibb.co/ZzdqPmZR/black-circular-icon-featuring-formal-260nw-2650487903.jpg',
    specialties: ['Corporate Law', 'M&A', 'Venture Capital'],
    rating: 4.9,
    reviewCount: 120,
    bio: 'Expert in corporate structuring and mergers & acquisitions for startups and established enterprises. Based in Mumbai.',
  },
  {
    id: 2,
    name: 'Adv. Priya Singh',
    photoUrl: 'https://i.ibb.co/ZzdqPmZR/black-circular-icon-featuring-formal-260nw-2650487903.jpg',
    specialties: ['Contract Law', 'Intellectual Property', 'Litigation'],
    rating: 4.8,
    reviewCount: 95,
    bio: 'Specializes in drafting and negotiating complex commercial contracts and protecting intellectual property rights. Located in Delhi.',
  },
  {
    id: 3,
    name: 'Adv. Arjun Menon',
    photoUrl: 'https://i.ibb.co/ZzdqPmZR/black-circular-icon-featuring-formal-260nw-2650487903.jpg',
    specialties: ['Startup Law', 'Fundraising', 'Compliance'],
    rating: 4.9,
    reviewCount: 150,
    bio: 'Guides early-stage startups through legal compliance, fundraising rounds (Seed to Series B), and ESOP implementation. Based in Bangalore.',
  },
  {
    id: 4,
    name: 'Adv. Aisha Khan',
    photoUrl: 'https://i.ibb.co/ZzdqPmZR/black-circular-icon-featuring-formal-260nw-2650487903.jpg',
    specialties: ['Tech Law', 'Data Privacy', 'SaaS Contracts'],
    rating: 4.7,
    reviewCount: 88,
    bio: 'Focuses on the technology sector, advising on data privacy (GDPR, DPDP Act), and negotiating SaaS and software licensing agreements. Pune-based.',
  },
  {
    id: 5,
    name: 'Adv. Vikram Reddy',
    photoUrl: 'https://i.ibb.co/ZzdqPmZR/black-circular-icon-featuring-formal-260nw-2650487903.jpg',
    specialties: ['Real Estate Law', 'Lease Agreements', 'Property Disputes'],
    rating: 4.8,
    reviewCount: 110,
    bio: 'Experienced in commercial real estate transactions, lease drafting, and property due diligence for businesses. Operates out of Hyderabad.',
  },
  {
    id: 6,
    name: 'Adv. Meera Desai',
    photoUrl: 'https://i.ibb.co/ZzdqPmZR/black-circular-icon-featuring-formal-260nw-2650487903.jpg',
    specialties: ['E-commerce', 'Consumer Law', 'Fintech'],
    rating: 4.6,
    reviewCount: 75,
    bio: 'Advises e-commerce platforms and fintech startups on regulatory compliance, payment gateway agreements, and consumer protection laws. Chennai.',
  },
  {
    id: 7,
    name: 'Adv. Karan Gupta',
    photoUrl: 'https://i.ibb.co/ZzdqPmZR/black-circular-icon-featuring-formal-260nw-2650487903.jpg',
    specialties: ['Labor & Employment', 'HR Policies', 'Dispute Resolution'],
    rating: 4.9,
    reviewCount: 130,
    bio: 'Helps companies navigate the complexities of Indian employment law, from drafting HR policies to representing them in disputes. Gurgaon.',
  },
  {
    id: 8,
    name: 'Adv. Sneha Patil',
    photoUrl: 'https://i.ibb.co/ZzdqPmZR/black-circular-icon-featuring-formal-260nw-2650487903.jpg',
    specialties: ['Tax Law', 'GST', 'Corporate Tax'],
    rating: 4.8,
    reviewCount: 105,
    bio: 'Expert in direct and indirect taxation, helping businesses with GST compliance, tax planning, and representation before tax authorities. Ahmedabad.',
  },
];
