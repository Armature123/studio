
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
    photoUrl: 'https://picsum.photos/seed/lawyer1/400/400',
    specialties: ['Corporate Law', 'M&A', 'Venture Capital'],
    rating: 4.9,
    reviewCount: 120,
    bio: 'Expert in corporate structuring and mergers & acquisitions for startups and established enterprises. Based in Mumbai.',
  },
  {
    id: 2,
    name: 'Adv. Priya Singh',
    photoUrl: 'https://picsum.photos/seed/lawyer2/400/400',
    specialties: ['Contract Law', 'Intellectual Property', 'Litigation'],
    rating: 4.8,
    reviewCount: 95,
    bio: 'Specializes in drafting and negotiating complex commercial contracts and protecting intellectual property rights. Located in Delhi.',
  },
  {
    id: 3,
    name: 'Adv. Arjun Menon',
    photoUrl: 'https://picsum.photos/seed/lawyer3/400/400',
    specialties: ['Startup Law', 'Fundraising', 'Compliance'],
    rating: 4.9,
    reviewCount: 150,
    bio: 'Guides early-stage startups through legal compliance, fundraising rounds (Seed to Series B), and ESOP implementation. Based in Bangalore.',
  },
  {
    id: 4,
    name: 'Adv. Aisha Khan',
    photoUrl: 'https://picsum.photos/seed/lawyer4/400/400',
    specialties: ['Tech Law', 'Data Privacy', 'SaaS Contracts'],
    rating: 4.7,
    reviewCount: 88,
    bio: 'Focuses on the technology sector, advising on data privacy (GDPR, DPDP Act), and negotiating SaaS and software licensing agreements. Pune-based.',
  },
  {
    id: 5,
    name: 'Adv. Vikram Reddy',
    photoUrl: 'https://picsum.photos/seed/lawyer5/400/400',
    specialties: ['Real Estate Law', 'Lease Agreements', 'Property Disputes'],
    rating: 4.8,
    reviewCount: 110,
    bio: 'Experienced in commercial real estate transactions, lease drafting, and property due diligence for businesses. Operates out of Hyderabad.',
  },
  {
    id: 6,
    name: 'Adv. Meera Desai',
    photoUrl: 'https://picsum.photos/seed/lawyer6/400/400',
    specialties: ['E-commerce', 'Consumer Law', 'Fintech'],
    rating: 4.6,
    reviewCount: 75,
    bio: 'Advises e-commerce platforms and fintech startups on regulatory compliance, payment gateway agreements, and consumer protection laws. Chennai.',
  },
  {
    id: 7,
    name: 'Adv. Karan Gupta',
    photoUrl: 'https://picsum.photos/seed/lawyer7/400/400',
    specialties: ['Labor & Employment', 'HR Policies', 'Dispute Resolution'],
    rating: 4.9,
    reviewCount: 130,
    bio: 'Helps companies navigate the complexities of Indian employment law, from drafting HR policies to representing them in disputes. Gurgaon.',
  },
  {
    id: 8,
    name: 'Adv. Sneha Patil',
    photoUrl: 'https://picsum.photos/seed/lawyer8/400/400',
    specialties: ['Tax Law', 'GST', 'Corporate Tax'],
    rating: 4.8,
    reviewCount: 105,
    bio: 'Expert in direct and indirect taxation, helping businesses with GST compliance, tax planning, and representation before tax authorities. Ahmedabad.',
  },
];
