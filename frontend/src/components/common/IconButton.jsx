export default function IconButton({ icon: Icon, label, onClick, tone = 'default', className = '', size = 'md', ...rest }) {
  const t = tone === 'danger' ? 'hover:text-error hover:bg-error/10' : 'hover:text-white hover:bg-white/10';
  return (
    <button type="button" onClick={onClick} aria-label={label} title={label} className={`${size === 'sm' ? 'p-1.5' : 'p-2'} rounded-lg text-on-surface-variant transition-colors ${t} ${className}`} {...rest}>
      <Icon className={size === 'sm' ? 'w-4 h-4' : 'w-[18px] h-[18px]'} aria-hidden />
    </button>
  );
}
