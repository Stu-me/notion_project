// Uses stable initials instead of external or random image URLs that can fail in production.
function UserAvatar({ name = 'User', className = '' }) {
  const initials = name.split(' ').filter(Boolean).slice(0, 2).map((part) => part[0]).join('').toUpperCase() || 'U'
  return <span aria-label={`${name} avatar`} className={`grid h-10 w-10 shrink-0 place-items-center rounded-full bg-[var(--accent-light)] text-xs font-bold text-[var(--accent)] ${className}`}>{initials}</span>
}

export default UserAvatar
