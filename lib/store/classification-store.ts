/**
 * Zustand Store for Classification State Management
 * 
 * Manages all classification-related state including:
 * - Form inputs (item description, origin country, CIF value)
 * - Classification results (single item and invoice)
 * - UI state (loading, errors, mode)
 * - File upload state
 */

import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';
import type { HSCodeClassification, InvoiceClassification } from '@/lib/ai/types';

// Storage adapter for Next.js (handles SSR)
const storage = {
  getItem: (name: string): string | null => {
    if (typeof window === 'undefined') return null;
    try {
      return localStorage.getItem(name);
    } catch {
      return null;
    }
  },
  setItem: (name: string, value: string): void => {
    if (typeof window === 'undefined') return;
    try {
      localStorage.setItem(name, value);
    } catch {
      // Ignore localStorage errors
    }
  },
  removeItem: (name: string): void => {
    if (typeof window === 'undefined') return;
    try {
      localStorage.removeItem(name);
    } catch {
      // Ignore localStorage errors
    }
  },
};

// Form state
interface FormState {
  itemDescription: string;
  originCountry: string;
  cifValue: number;
  mode: 'single' | 'invoice';
  invoiceText: string;
}

// Classification results state
interface ResultsState {
  singleItemResult: HSCodeClassification | null;
  invoiceResult: InvoiceClassification | null;
  lastClassificationTime: number | null;
}

// UI state
interface UIState {
  isLoading: boolean;
  error: string | null;
  activeTab: 'text' | 'file';
  showResults: boolean;
}

// File upload state
interface FileState {
  uploadedFile: File | null;
  extractedText: string | null;
  fileType: 'pdf' | 'image' | null;
  extractedCountry: string | null;
  extractedCifValue: number | null;
}

// Combined store state
interface ClassificationStore extends FormState, ResultsState, UIState, FileState {
  // Form actions
  setItemDescription: (description: string) => void;
  setOriginCountry: (country: string) => void;
  setCifValue: (value: number) => void;
  setMode: (mode: 'single' | 'invoice') => void;
  setInvoiceText: (text: string) => void;
  
  // Results actions
  setSingleItemResult: (result: HSCodeClassification | null) => void;
  setInvoiceResult: (result: InvoiceClassification | null) => void;
  clearResults: () => void;
  
  // UI actions
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  setActiveTab: (tab: 'text' | 'file') => void;
  setShowResults: (show: boolean) => void;
  
  // File actions
  setUploadedFile: (file: File | null) => void;
  setExtractedText: (text: string | null) => void;
  setFileType: (type: 'pdf' | 'image' | null) => void;
  setExtractedCountry: (country: string | null) => void;
  setExtractedCifValue: (value: number | null) => void;
  clearFile: () => void;
  
  // Utility actions
  reset: () => void;
  resetForm: () => void;
}

// Initial state
const initialState = {
  // Form
  itemDescription: '',
  originCountry: 'India',
  cifValue: 0,
  mode: 'single' as const,
  invoiceText: '',
  
  // Results
  singleItemResult: null,
  invoiceResult: null,
  lastClassificationTime: null,
  
  // UI
  isLoading: false,
  error: null,
  activeTab: 'text' as const,
  showResults: false,
  
  // File
  uploadedFile: null,
  extractedText: null,
  fileType: null,
  extractedCountry: null,
  extractedCifValue: null,
};

// Create store
export const useClassificationStore = create<ClassificationStore>()(
  devtools(
    persist(
      (set) => ({
        ...initialState,
        
        // Form actions
        setItemDescription: (description) => set({ itemDescription: description }),
        setOriginCountry: (country) => set({ originCountry: country }),
        setCifValue: (value) => set({ cifValue: value }),
        setMode: (mode) => set({ mode }),
        setInvoiceText: (text) => set({ invoiceText: text }),
        
        // Results actions
        setSingleItemResult: (result) => set({ 
          singleItemResult: result,
          lastClassificationTime: Date.now(),
          showResults: true,
        }),
        setInvoiceResult: (result) => set({ 
          invoiceResult: result,
          lastClassificationTime: Date.now(),
          showResults: true,
        }),
        clearResults: () => set({ 
          singleItemResult: null, 
          invoiceResult: null,
          showResults: false,
        }),
        
        // UI actions
        setLoading: (loading) => set({ isLoading: loading }),
        setError: (error) => set({ error }),
        setActiveTab: (tab) => set({ activeTab: tab }),
        setShowResults: (show) => set({ showResults: show }),
        
        // File actions
        setUploadedFile: (file) => set({ uploadedFile: file }),
        setExtractedText: (text) => set({ extractedText: text }),
        setFileType: (type) => set({ fileType: type }),
        setExtractedCountry: (country) => set({ extractedCountry: country }),
        setExtractedCifValue: (value) => set({ extractedCifValue: value }),
        clearFile: () => set({ 
          uploadedFile: null, 
          extractedText: null, 
          fileType: null,
          extractedCountry: null,
          extractedCifValue: null,
        }),
        
        // Utility actions
        reset: () => set(initialState),
        resetForm: () => set({
          itemDescription: '',
          invoiceText: '',
          cifValue: 0,
          error: null,
        }),
      }),
      {
        name: 'tariffagent-classification-store',
        storage: storage as typeof storage,
        // Only persist form state, not results or UI state
        partialize: (state) => ({
          itemDescription: state.itemDescription,
          originCountry: state.originCountry,
          cifValue: state.cifValue,
          mode: state.mode,
          invoiceText: state.invoiceText,
        }),
      }
    ),
    { name: 'ClassificationStore' }
  )
);

// Selectors for optimized re-renders
export const useFormState = () => useClassificationStore((state) => ({
  itemDescription: state.itemDescription,
  originCountry: state.originCountry,
  cifValue: state.cifValue,
  mode: state.mode,
  invoiceText: state.invoiceText,
}));

export const useResults = () => useClassificationStore((state) => ({
  singleItemResult: state.singleItemResult,
  invoiceResult: state.invoiceResult,
  lastClassificationTime: state.lastClassificationTime,
}));

export const useUIState = () => useClassificationStore((state) => ({
  isLoading: state.isLoading,
  error: state.error,
  activeTab: state.activeTab,
  showResults: state.showResults,
}));

