/**
 * Storage Service for Revenue Intelligence Inbox
 * Handles persistence in localStorage with fallback to canonical sample dataset.
 * Note: LocalStorage is a client-side, single-browser persistence mechanism.
 */

import sampleData from '../../data/sample_conversations.json';

const STORAGE_KEY = 'volopay_revenue_inbox_v1';
const RULES_KEY = 'volopay_routing_rules_v1';

export const loadStoredConversations = () => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      // Seed with sample data and persist
      localStorage.setItem(STORAGE_KEY, JSON.stringify(sampleData));
      return sampleData;
    }
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : sampleData;
  } catch (err) {
    console.error('Failed to load from localStorage, falling back to sample data:', err);
    return sampleData;
  }
};

export const saveConversations = (conversations) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(conversations));
    return true;
  } catch (err) {
    console.error('Failed to save conversations to localStorage:', err);
    return false;
  }
};

export const resetToSampleData = () => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(sampleData));
    return sampleData;
  } catch (err) {
    console.error('Failed to reset localStorage:', err);
    return sampleData;
  }
};

export const clearAllData = () => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify([]));
    return [];
  } catch (err) {
    console.error('Failed to clear localStorage:', err);
    return [];
  }
};
