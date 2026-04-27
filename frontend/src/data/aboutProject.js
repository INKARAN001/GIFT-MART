/**
 * About page: institution, module, and team credentials.
 * Replace placeholder names and student IDs with your group’s real details.
 */
export const projectMeta = {
  projectTitle: 'Gift Mart',
  tagline: 'Elevated gifting — curated products, wishlists, and reminders.',
  description:
    'Gift Mart is a responsive e‑commerce web application built as part of our Human–Computer Interaction and software engineering coursework. It supports guest and registered shopping, product discovery, cart checkout, user profiles, wishlists, gift reminders, and an admin panel for catalogue management.',
  institution: 'Sri Lanka Institute of Information Technology (SLIIT)',
  faculty: 'Faculty of Computing',
  department: 'Department of Software Engineering',
  module: 'Human–Computer Interaction (HCI) / integrated project',
  academicYear: '2026',
  supervisor: '—',
  repositoryNote: 'Source code and documentation are maintained by the project group.',
};

/** @type {{ name: string; studentId: string; contribution: string }[]} */
export const teamMembers = [
  { name: 'Team member 1', studentId: 'ITXXXXXXXX', contribution: 'Frontend, UX research' },
  { name: 'Team member 2', studentId: 'ITXXXXXXXX', contribution: 'Backend / API' },
  { name: 'Team member 3', studentId: 'ITXXXXXXXX', contribution: 'Admin panel, database' },
  { name: 'Team member 4', studentId: 'ITXXXXXXXX', contribution: 'HCI documentation, testing' },
];

export const techStack = [
  { label: 'Frontend', value: 'React 18, Vite 5, React Router 6' },
  { label: 'Styling', value: 'Tailwind CSS' },
  { label: 'API', value: 'REST (see project backend)' },
];
