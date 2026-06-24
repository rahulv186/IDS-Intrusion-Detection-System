export default function StatCard({ title, value, subtitle, icon: Icon, variant = 'default' }) {
  const variantStyles = {
    default: 'text-gray-700 dark:text-gray-300',
    success: 'text-emerald-600 dark:text-emerald-400',
    danger: 'text-red-600 dark:text-red-400',
    warning: 'text-amber-600 dark:text-amber-400',
  }
  const iconStyles = variantStyles[variant] || variantStyles.default

  return (
    <div
      className="
        group relative overflow-hidden rounded-2xl p-6
        bg-white/70 dark:bg-gray-800/70
        backdrop-blur-xl border border-white/20 dark:border-gray-700/50
        shadow-glass dark:shadow-glass-dark
        hover:shadow-xl hover:scale-[1.02] transition-all duration-300
      "
    >
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
            {title}
          </p>
          <p className={`mt-2 text-3xl font-bold ${iconStyles}`}>{value}</p>
          {subtitle && (
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">{subtitle}</p>
          )}
        </div>
        {Icon && (
          <div
            className={`p-3 rounded-xl bg-gray-100/80 dark:bg-gray-700/50 ${iconStyles} opacity-80 group-hover:opacity-100 transition-opacity`}
          >
            <Icon className="w-8 h-8" />
          </div>
        )}
      </div>
    </div>
  )
}
