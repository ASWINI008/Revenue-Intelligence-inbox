import React, { useState, useEffect, useMemo } from 'react';
import Sidebar from './components/Sidebar';
import Navbar from './components/Navbar';
import Dashboard from './components/Dashboard';
import Inbox from './components/Inbox';
import NeedsAttention from './components/NeedsAttention';
import RoutingView from './components/RoutingView';
import ImportView from './components/ImportView';
import DataQualityView from './components/DataQualityView';
import ExportView from './components/ExportView';
import SettingsView from './components/SettingsView';
import FindingsView from './components/FindingsView';

import ConversationDetailModal from './components/ConversationDetailModal';
import EditModal from './components/EditModal';
import OverrideModal from './components/OverrideModal';

import {
  loadStoredConversations,
  saveConversations,
  resetToSampleData,
} from './services/storageService';
import { evaluateRouting } from './services/routingEngine';
import { analyzeDataQuality } from './services/dataQualityService';
import {
  toCSVString,
  triggerBrowserDownload,
  sanitizeForExport,
} from './services/exportService';

export default function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [conversations, setConversations] = useState(() => {
    const loaded = loadStoredConversations();
    return loaded.map((rec) => {
      if (!rec.routing_rule_triggered) {
        const evalRes = evaluateRouting(rec);
        return {
          ...rec,
          routing_status: evalRes.routing_status,
          suggested_priority: evalRes.suggested_priority,
          suggested_owner: evalRes.suggested_owner,
          routing_rule_triggered: evalRes.routing_rule_triggered,
          routing_reason: evalRes.routing_reason,
          routing_conflicts: evalRes.routing_conflicts,
        };
      }
      return rec;
    });
  });

  const [searchTerm, setSearchTerm] = useState('');

  // Modals state
  const [detailRecord, setDetailRecord] = useState(null);
  const [editingRecord, setEditingRecord] = useState(null);
  const [overridingRecord, setOverridingRecord] = useState(null);

  // Toast notification state
  const [toastMessage, setToastMessage] = useState(null);

  const showToast = (message, type = 'success') => {
    setToastMessage({ message, type });
    setTimeout(() => {
      setToastMessage(null);
    }, 4500);
  };

  // Synchronize conversations with localStorage
  useEffect(() => {
    saveConversations(conversations);
  }, [conversations]);

  // Derived metrics for Sidebar and Navbar badges
  const counts = useMemo(() => {
    const total = conversations.length;
    const needsAttention = conversations.filter(
      (r) =>
        r.is_escalated ||
        r.outcome === 'Escalated' ||
        r.follow_up_status === 'Overdue' ||
        !r.assigned_owner ||
        r.routing_status === 'Unassigned' ||
        r.routing_status === 'Pending Review'
    ).length;

    const unassigned = conversations.filter(
      (r) => !r.assigned_owner || r.assigned_owner.trim() === ''
    ).length;

    const conflicts = conversations.filter(
      (r) => r.routing_status === 'Pending Review' || (r.routing_conflicts && r.routing_conflicts.length > 0)
    ).length;

    const health = analyzeDataQuality(conversations).healthScore;

    return { total, needsAttention, unassigned, conflicts, healthScore: health };
  }, [conversations]);

  // Handlers for modifying records
  const handleSaveEdit = (updatedRecord) => {
    setConversations((prev) =>
      prev.map((r) => (r.id === updatedRecord.id ? updatedRecord : r))
    );
    setEditingRecord(null);
    if (detailRecord && detailRecord.id === updatedRecord.id) {
      setDetailRecord(updatedRecord);
    }
    showToast(`Record ${updatedRecord.id} updated and audit log recorded.`);
  };

  const handleSaveOverride = (overriddenRecord) => {
    setConversations((prev) =>
      prev.map((r) => (r.id === overriddenRecord.id ? overriddenRecord : r))
    );
    setOverridingRecord(null);
    if (detailRecord && detailRecord.id === overriddenRecord.id) {
      setDetailRecord(overriddenRecord);
    }
    showToast(`Routing override applied to record ${overriddenRecord.id}.`);
  };

  const handleQuickAssign = (record) => {
    setOverridingRecord(record);
  };

  const handleToggleFollowup = (record) => {
    const newStatus = record.follow_up_status === 'Completed' ? 'Pending' : 'Completed';
    const timestamp = new Date().toISOString();
    const updated = {
      ...record,
      follow_up_status: newStatus,
      audit_history: [
        {
          timestamp,
          user: 'Sales Manager',
          action: 'FOLLOW_UP_TOGGLE',
          field: 'follow_up_status',
          oldValue: record.follow_up_status,
          newValue: newStatus,
          reason: `Follow-up toggled to ${newStatus} by Sales Manager`,
        },
        ...(record.audit_history || []),
      ],
    };

    setConversations((prev) =>
      prev.map((r) => (r.id === record.id ? updated : r))
    );
    showToast(`Follow-up status for ${record.id} set to ${newStatus}.`);
  };

  const handleMarkReviewed = (record) => {
    const timestamp = new Date().toISOString();
    const updated = {
      ...record,
      reviewed: true,
      audit_history: [
        {
          timestamp,
          user: 'Sales Manager',
          action: 'REVIEW_ACK',
          field: 'reviewed',
          oldValue: 'false',
          newValue: 'true',
          reason: 'Attention item acknowledged and reviewed by Sales Manager',
        },
        ...(record.audit_history || []),
      ],
    };

    setConversations((prev) =>
      prev.map((r) => (r.id === record.id ? updated : r))
    );
    showToast(`Record ${record.id} marked as reviewed.`);
  };

  const handleSelectRecordById = (recordId) => {
    const found = conversations.find((r) => r.id === recordId);
    if (found) {
      setDetailRecord(found);
    }
  };

  const handleResetData = () => {
    if (window.confirm('Reset all conversations back to canonical baseline sample records? Any unsaved edits will be refreshed.')) {
      const resetRecords = resetToSampleData();
      const evaluated = resetRecords.map((r) => {
        const ev = evaluateRouting(r);
        return {
          ...r,
          routing_status: ev.routing_status,
          suggested_priority: ev.suggested_priority,
          suggested_owner: ev.suggested_owner,
          routing_rule_triggered: ev.routing_rule_triggered,
          routing_reason: ev.routing_reason,
          routing_conflicts: ev.routing_conflicts,
        };
      });
      setConversations(evaluated);
      showToast('Successfully restored canonical ground truth dataset (25 records).', 'info');
    }
  };

  const handleImportSuccess = (newRecords) => {
    setConversations(newRecords);
    showToast(`Import processed successfully. Dataset now contains ${newRecords.length} records.`);
  };

  const handleQuickExport = () => {
    const dataToExport = sanitizeForExport(conversations);
    const csvContent = toCSVString(dataToExport);
    const filename = `quick_export_conversations_${new Date().toISOString().slice(0, 10)}.csv`;
    triggerBrowserDownload(csvContent, filename, 'text/csv;charset=utf-8;');
    showToast(`Exported ${dataToExport.length} records to ${filename}.`);
  };

  return (
    <div className="app-container">
      {/* Sidebar Navigation */}
      <Sidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        counts={counts}
      />

      {/* Main Content Area */}
      <div className="main-content-wrapper">
        <Navbar
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
          onResetData={handleResetData}
          totalRecords={conversations.length}
          activeTab={activeTab}
          onQuickExport={handleQuickExport}
        />

        {/* Toast Notification Alert */}
        {toastMessage && (
          <div
            className={`alert alert-${toastMessage.type === 'info' ? 'primary' : toastMessage.type} alert-dismissible fade show m-3 mb-0 shadow-sm`}
            role="alert"
          >
            <strong>{toastMessage.type === 'success' ? 'Success: ' : 'Notice: '}</strong>
            {toastMessage.message}
            <button
              type="button"
              className="btn-close"
              aria-label="Close"
              onClick={() => setToastMessage(null)}
            />
          </div>
        )}

        <main className="page-content">
          {activeTab === 'dashboard' && (
            <Dashboard
              records={conversations}
              onNavigate={setActiveTab}
              onSelectRecord={setDetailRecord}
              onQuickAssign={handleQuickAssign}
              onMarkReviewed={handleMarkReviewed}
            />
          )}

          {activeTab === 'inbox' && (
            <Inbox
              records={conversations}
              onSelectRecord={setDetailRecord}
              onEditRecord={setEditingRecord}
              onQuickAssign={handleQuickAssign}
              onToggleFollowup={handleToggleFollowup}
              onOpenOverrideModal={setOverridingRecord}
            />
          )}

          {activeTab === 'needs-attention' && (
            <NeedsAttention
              records={conversations}
              onSelectRecord={setDetailRecord}
              onEditRecord={setEditingRecord}
              onQuickAssign={handleQuickAssign}
            />
          )}

          {activeTab === 'routing' && (
            <RoutingView
              records={conversations}
              onSelectRecord={setDetailRecord}
              onOpenOverrideModal={setOverridingRecord}
            />
          )}

          {activeTab === 'import' && (
            <ImportView
              records={conversations}
              onImportSuccess={handleImportSuccess}
              onResetData={handleResetData}
            />
          )}

          {activeTab === 'quality' && (
            <DataQualityView
              records={conversations}
              onSelectRecord={setDetailRecord}
            />
          )}

          {activeTab === 'exports' && (
            <ExportView records={conversations} />
          )}

          {activeTab === 'findings' && (
            <FindingsView
              records={conversations}
              onSelectRecordById={handleSelectRecordById}
            />
          )}

          {activeTab === 'settings' && (
            <SettingsView
              records={conversations}
              onDataUpdated={setConversations}
            />
          )}
        </main>
      </div>

      {/* Modals */}
      {detailRecord && (
        <ConversationDetailModal
          record={detailRecord}
          onClose={() => setDetailRecord(null)}
          onEdit={(rec) => {
            setDetailRecord(null);
            setEditingRecord(rec);
          }}
          onOverride={(rec) => {
            setDetailRecord(null);
            setOverridingRecord(rec);
          }}
        />
      )}

      {editingRecord && (
        <EditModal
          record={editingRecord}
          onClose={() => setEditingRecord(null)}
          onSave={handleSaveEdit}
        />
      )}

      {overridingRecord && (
        <OverrideModal
          record={overridingRecord}
          onClose={() => setOverridingRecord(null)}
          onSaveOverride={handleSaveOverride}
        />
      )}
    </div>
  );
}
