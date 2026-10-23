import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import Sidebar from '../src/components/Sidebar';
import Navbar from '../src/components/Navbar';
import Dashboard from '../src/components/Dashboard';
import sampleData from '../data/sample_conversations.json';

// Mock chart.js components to prevent canvas rendering errors in jsdom
vi.mock('react-chartjs-2', () => ({
  Doughnut: () => <div data-testid="mock-doughnut-chart">Doughnut Chart</div>,
  Bar: () => <div data-testid="mock-bar-chart">Bar Chart</div>,
}));

describe('UI Component Smoke Test Suite', () => {
  it('renders Sidebar with active nav items and badges', () => {
    const counts = { total: 25, needsAttention: 7, unassigned: 4, conflicts: 1, healthScore: 92 };
    render(<Sidebar activeTab="dashboard" setActiveTab={() => {}} counts={counts} />);

    expect(screen.getByText('Revenue Intelligence')).toBeDefined();
    expect(screen.getByText('Dashboard')).toBeDefined();
    expect(screen.getByText('Conversation Inbox')).toBeDefined();
    expect(screen.getByText('Needs Attention')).toBeDefined();
  });

  it('renders Navbar with record count and search input', () => {
    render(
      <Navbar
        searchTerm=""
        setSearchTerm={() => {}}
        onResetData={() => {}}
        totalRecords={25}
        activeTab="dashboard"
        onQuickExport={() => {}}
      />
    );

    expect(screen.getByText('25 Active Records')).toBeDefined();
    expect(screen.getByPlaceholderText('Search account, ID, rep...')).toBeDefined();
  });

  it('renders Dashboard with calculated KPI cards and charts', () => {
    render(
      <Dashboard
        records={sampleData}
        onNavigate={() => {}}
        onSelectRecord={() => {}}
      />
    );

    expect(screen.getByText('Total Conversations')).toBeDefined();
    expect(screen.getByText('Needs Attention')).toBeDefined();
    expect(screen.getByText('Unassigned Leads')).toBeDefined();
    expect(screen.getByText('Closed Won Deals')).toBeDefined();
  });
});
