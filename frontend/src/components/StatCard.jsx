import React from 'react';

/**
 * StatCard Component
 * Reusable metric card displaying high-level statistical indicators with loading skeletons
 */
export default function StatCard({
  title,
  value,
  icon: Icon,
  subtitle,
  loading = false,
  trend,
  color = 'cyan',
}) {
  return (
    <div className={`glass-card stat-card border-accent-${color}`}>
      <div className="stat-header">
        <span className="stat-label">{title}</span>
        {Icon && (
          <div className={`stat-icon stat-icon-${color}`}>
            <Icon size={18} />
          </div>
        )}
      </div>

      {loading ? (
        <div className="skeleton skeleton-value" style={{ height: '2rem', width: '60%', margin: '0.5rem 0' }} />
      ) : (
        <div className="stat-value">{value}</div>
      )}

      {loading ? (
        <div className="skeleton skeleton-text" style={{ height: '0.875rem', width: '80%', marginTop: '0.5rem' }} />
      ) : (
        subtitle && (
          <div className="stat-footer">
            {trend && <span className="stat-trend">{trend}</span>}
            <span>{subtitle}</span>
          </div>
        )
      )}
    </div>
  );
}
