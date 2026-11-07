export default function AdminPageHeader({ eyebrow, title, description, actions, children }) {
  return (
    <header className="flex flex-wrap items-end justify-between gap-4 mb-6">
      <div className="min-w-0 max-w-2xl">
        {eyebrow && <p className="flex items-center gap-2 label-caps text-[#ff8a80]"><span className="w-1.5 h-1.5 rounded-full bg-primary-container" aria-hidden />{eyebrow}</p>}
        <h1 className="mt-1 font-headline text-headline-lg-mobile md:text-headline-lg font-bold text-white">{title}</h1>
        {description && <p className="mt-1 text-body-md text-on-surface-variant">{description}</p>}
      </div>
      {(actions || children) && <div className="flex flex-wrap items-center gap-3">{children}{actions}</div>}
    </header>
  );
}
