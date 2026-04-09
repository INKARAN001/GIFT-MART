import { Link } from 'react-router-dom';
import { projectMeta, teamMembers, techStack } from '../data/aboutProject';

export default function AboutUs() {
  return (
    <div className="max-w-4xl mx-auto pb-16">
      <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-900/60 backdrop-blur-sm overflow-hidden shadow-sm">
        <div className="bg-gradient-to-br from-primary/15 via-transparent to-slate-100/50 dark:to-slate-800/50 px-6 sm:px-10 py-12 sm:py-14 border-b border-slate-200/80 dark:border-slate-800">
          <span className="section-label text-primary">About the project</span>
          <h1 className="font-serif text-3xl sm:text-4xl md:text-5xl text-slate-900 dark:text-white mt-2 mb-4">
            {projectMeta.projectTitle}
          </h1>
          <p className="text-lg text-slate-600 dark:text-slate-300 max-w-2xl leading-relaxed">
            {projectMeta.tagline}
          </p>
        </div>

        <div className="px-6 sm:px-10 py-10 space-y-12">
          <section>
            <h2 className="text-sm font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-3">
              Overview
            </h2>
            <p className="text-slate-700 dark:text-slate-300 leading-relaxed">{projectMeta.description}</p>
          </section>

          <section>
            <h2 className="text-sm font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-4">
              Academic credentials
            </h2>
            <dl className="grid gap-3 sm:grid-cols-2 text-sm">
              <div className="rounded-xl border border-slate-200 dark:border-slate-700 p-4 bg-slate-50/80 dark:bg-slate-800/40">
                <dt className="font-semibold text-slate-900 dark:text-white">Institution</dt>
                <dd className="text-slate-600 dark:text-slate-400 mt-1">{projectMeta.institution}</dd>
              </div>
              <div className="rounded-xl border border-slate-200 dark:border-slate-700 p-4 bg-slate-50/80 dark:bg-slate-800/40">
                <dt className="font-semibold text-slate-900 dark:text-white">Faculty</dt>
                <dd className="text-slate-600 dark:text-slate-400 mt-1">{projectMeta.faculty}</dd>
              </div>
              <div className="rounded-xl border border-slate-200 dark:border-slate-700 p-4 bg-slate-50/80 dark:bg-slate-800/40">
                <dt className="font-semibold text-slate-900 dark:text-white">Department</dt>
                <dd className="text-slate-600 dark:text-slate-400 mt-1">{projectMeta.department}</dd>
              </div>
              <div className="rounded-xl border border-slate-200 dark:border-slate-700 p-4 bg-slate-50/80 dark:bg-slate-800/40">
                <dt className="font-semibold text-slate-900 dark:text-white">Module / context</dt>
                <dd className="text-slate-600 dark:text-slate-400 mt-1">{projectMeta.module}</dd>
              </div>
              <div className="rounded-xl border border-slate-200 dark:border-slate-700 p-4 bg-slate-50/80 dark:bg-slate-800/40 sm:col-span-2">
                <dt className="font-semibold text-slate-900 dark:text-white">Academic year</dt>
                <dd className="text-slate-600 dark:text-slate-400 mt-1">{projectMeta.academicYear}</dd>
              </div>
              {projectMeta.supervisor && projectMeta.supervisor !== '—' && (
                <div className="rounded-xl border border-slate-200 dark:border-slate-700 p-4 bg-slate-50/80 dark:bg-slate-800/40 sm:col-span-2">
                  <dt className="font-semibold text-slate-900 dark:text-white">Supervisor</dt>
                  <dd className="text-slate-600 dark:text-slate-400 mt-1">{projectMeta.supervisor}</dd>
                </div>
              )}
            </dl>
            <p className="text-xs text-slate-500 dark:text-slate-500 mt-4">{projectMeta.repositoryNote}</p>
          </section>

          <section>
            <h2 className="text-sm font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-4">
              Project team
            </h2>
            <ul className="grid gap-4 sm:grid-cols-2">
              {teamMembers.map((m) => (
                <li
                  key={`${m.studentId}-${m.name}`}
                  className="rounded-xl border border-slate-200 dark:border-slate-700 p-5 bg-white dark:bg-slate-900/80 shadow-sm"
                >
                  <p className="font-bold text-slate-900 dark:text-white">{m.name}</p>
                  <p className="text-sm font-mono text-primary mt-1">Student ID: {m.studentId}</p>
                  <p className="text-sm text-slate-600 dark:text-slate-400 mt-2">{m.contribution}</p>
                </li>
              ))}
            </ul>
            <p className="text-xs text-slate-500 dark:text-slate-500 mt-4">
              Edit names and IDs in <code className="px-1 rounded bg-slate-100 dark:bg-slate-800">src/data/aboutProject.js</code>.
            </p>
          </section>

          <section>
            <h2 className="text-sm font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-4">
              Technology
            </h2>
            <ul className="space-y-2">
              {techStack.map((row) => (
                <li
                  key={row.label}
                  className="flex flex-col sm:flex-row sm:items-baseline gap-1 sm:gap-4 text-sm border-b border-slate-100 dark:border-slate-800 pb-2 last:border-0"
                >
                  <span className="font-semibold text-slate-900 dark:text-white sm:w-28 shrink-0">{row.label}</span>
                  <span className="text-slate-600 dark:text-slate-400">{row.value}</span>
                </li>
              ))}
            </ul>
          </section>

          <section className="rounded-xl bg-primary/10 dark:bg-primary/15 border border-primary/20 px-6 py-6">
            <h2 className="text-sm font-bold uppercase tracking-wider text-primary mb-2">Studio & contact</h2>
            <p className="text-slate-700 dark:text-slate-300 text-sm leading-relaxed">
              For orders and customer support, use the details in the site footer — e.g.{' '}
              <a href="mailto:contact@giftmart.com" className="font-semibold text-primary hover:underline">
                contact@giftmart.com
              </a>{' '}
              and our studio location in Jaffna.
            </p>
            <Link
              to="/products"
              className="inline-flex items-center gap-2 mt-4 text-sm font-bold text-primary hover:underline"
            >
              Shop collection
              <span className="material-symbols-outlined text-lg">arrow_forward</span>
            </Link>
          </section>
        </div>
      </div>
    </div>
  );
}
