import type { ApplicationAnswers } from '../onboarding.ts'

/** What the mock résumé and LinkedIn-screenshot reader "finds"; fresh ids on every read */
export function readMockResume(): Pick<ApplicationAnswers, 'experience' | 'education' | 'skills'> {
  return {
    experience: [
      {
        id: crypto.randomUUID(),
        title: 'Product Designer',
        company: 'Brightline Studio',
        location: 'Remote',
        type: 'full-time',
        startMonth: '05',
        startYear: '2024',
        endMonth: '',
        endYear: '',
        current: true,
        description:
          'Lead design for a B2B analytics product, from research to the design system. Shipped a new onboarding that lifted activation by 18%.',
      },
      {
        id: crypto.randomUUID(),
        title: 'UX Designer',
        company: 'Grayson Labs',
        location: 'Ahmedabad, India',
        type: 'full-time',
        startMonth: '06',
        startYear: '2021',
        endMonth: '04',
        endYear: '2024',
        current: false,
        description:
          'Redesigned a field inspection app used by 2,000 engineers, from audits and interviews to a new component library.',
      },
    ],
    education: [
      {
        id: crypto.randomUUID(),
        school: 'Westbrook Institute of Design',
        degree: 'Bachelor of Design',
        field: 'Interaction Design',
        startYear: '2017',
        endYear: '2021',
      },
    ],
    skills: ['Product design', 'User research', 'Prototyping', 'Design systems', 'Figma', 'Usability testing'],
  }
}
