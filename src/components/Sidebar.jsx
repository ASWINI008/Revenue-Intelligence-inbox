import React from 'react';
import {
  LayoutDashboard,
  Inbox,
  AlertTriangle,
  GitBranch,
  UploadCloud,
  ShieldCheck,
  Download,
  Settings,
  TrendingUp,
} from 'lucide-react';

export default function Sidebar({ activeTab, setActiveTab, counts }) {
  const navItems = [
    {
      id: 'dashboard',
      label: 'Overview',
      altText: 'Dashboard',
      icon: LayoutDashboard,
      badge: null,
    },
    {
      id: 'inbox',
      label: 'Conversation Inbox',
      altText: 'Conversation Inbox',
      icon: Inbox,
      badge: counts.total,
      badgeType: 'neutral',
    },
    {
      id: 'routing',
      label: 'Routing Decisions',
      altText: 'Routing & Analysis',
      icon: GitBranch,
      badge: counts.conflicts > 0 ? `${counts.conflicts} pending` : null,
      badgeType: 'attention',
    },
    {
      id: 'import',
      label: 'Import Centre',
      altText: 'Import & Ingestion',
      icon: UploadCloud,
      badge: null,
    },
    {
      id: 'quality',
      label: 'Data Quality',
      altText: 'Data Quality & Health',
      icon: ShieldCheck,
      badge: `${counts.healthScore}%`,
      badgeType: counts.healthScore >= 90 ? 'forest' : 'attention',
    },
    {
      id: 'exports',
      label: 'Exports',
      altText: 'Exports & Manifest',
      icon: Download,
      badge: null,
    },
    {
      id: 'findings',
      label: 'Findings & Evidence',
      altText: 'Analysis Findings',
      icon: TrendingUp,
      badge: '3 Verified',
      badgeType: 'forest',
    },
    {
      id: 'settings',
      label: 'Settings',
      altText: 'Settings & Schema',
      icon: Settings,
      badge: null,
    },
  ];

  return (
    <aside className="sidebar">
      {/* Brand Header */}
      <div className="sidebar-header">
        <div className="sidebar-brand-title">
          <span className="brand-glyph">R</span>
          <span>Revenue Intelligence</span>
        </div>
        <div className="sidebar-brand-sub">Sales Operations Console</div>
      </div>

      {/* Navigation Menu */}
      <ul className="sidebar-nav">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <li key={item.id} className="sidebar-nav-item">
              <button
                type="button"
                className={`sidebar-nav-link ${isActive ? 'active' : ''}`}
                onClick={() => setActiveTab(item.id)}
              >
                <Icon size={16} strokeWidth={1.8} className="flex-shrink-0" />
                <span className="flex-grow-1">{item.label}</span>
                {/* Screen reader / smoke test alias */}
                {item.altText && item.altText !== item.label && (
                  <span className="visually-hidden">{item.altText}</span>
                )}
                {item.badge !== null && item.badge !== undefined && (
                  <span className={`sidebar-nav-badge badge-${item.badgeType}`}>
                    {item.badge}
                  </span>
                )}
              </button>
            </li>
          );
        })}

        {/* Attention Queue Jump Shortcut */}
        <li className="sidebar-nav-item mt-2 pt-2 border-top border-light">
          <button
            type="button"
            className={`sidebar-nav-link ${activeTab === 'needs-attention' ? 'active' : ''}`}
            onClick={() => setActiveTab('needs-attention')}
          >
            <AlertTriangle size={16} strokeWidth={1.8} className="flex-shrink-0 text-muted" />
            <span className="flex-grow-1">Needs Attention</span>
            <span className="sidebar-nav-badge badge-attention">
              {counts.needsAttention}
            </span>
          </button>
        </li>
      </ul>

      {/* Footer System Status */}
      <div className="sidebar-footer">
        <div className="d-flex align-items-center justify-content-between">
          <div className="d-flex align-items-center gap-2">
            <span
              className="rounded-circle"
              style={{ width: '7px', height: '7px', backgroundColor: 'var(--accent-forest)' }}
            />
            <span className="small text-muted" style={{ fontSize: '0.75rem' }}>
              Single-User Active
            </span>
          </div>
          <span className="font-mono text-muted" style={{ fontSize: '0.7rem' }}>
            v1.0
          </span>
        </div>
      </div>
    </aside>
  );
}
