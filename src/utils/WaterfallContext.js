import React, { createContext, useContext, useState, useEffect } from 'react';
import { 
  DEFAULT_SHARE_CLASSES, 
  DEFAULT_TRANSACTIONS,
  calculateDetailedWaterfall,
  calculateSummaryWaterfall,
  calculateExitDistribution
} from './waterfallCalculator';

// Create context
const WaterfallContext = createContext();

// Custom hook to use the waterfall context
export const useWaterfall = () => {
  const context = useContext(WaterfallContext);
  if (!context) {
    throw new Error('useWaterfall must be used within a WaterfallProvider');
  }
  return context;
};

// Provider component
export const WaterfallProvider = ({ children }) => {
  // State for share classes and transactions
  const [shareClasses, setShareClasses] = useState(DEFAULT_SHARE_CLASSES);
  const [transactions, setTransactions] = useState(DEFAULT_TRANSACTIONS);
  const [exitAmount, setExitAmount] = useState(10000000);
  
  // Derived state for waterfall analysis
  const [waterfallSteps, setWaterfallSteps] = useState([]);
  const [summaryData, setSummaryData] = useState([]);
  const [exitDistribution, setExitDistribution] = useState({});
  
  // Update waterfall analysis when inputs change
  useEffect(() => {
    const steps = calculateDetailedWaterfall(shareClasses, transactions, exitAmount);
    const summary = calculateSummaryWaterfall(shareClasses, transactions, exitAmount);
    const distribution = calculateExitDistribution(shareClasses, transactions, exitAmount * 2);
    
    setWaterfallSteps(steps);
    setSummaryData(summary);
    setExitDistribution(distribution);
  }, [shareClasses, transactions, exitAmount]);
  
  // Add a new share class
  const addShareClass = (newShareClass) => {
    const id = shareClasses.length > 0 
      ? Math.max(...shareClasses.map(sc => sc.id)) + 1 
      : 1;
    
    setShareClasses([...shareClasses, { ...newShareClass, id }]);
  };
  
  // Update an existing share class
  const updateShareClass = (id, updates) => {
    const updatedClasses = shareClasses.map(sc => 
      sc.id === id ? { ...sc, ...updates } : sc
    );
    
    // Update any transactions that reference this share class if name changed
    if (updates.name) {
      const oldClass = shareClasses.find(sc => sc.id === id);
      if (oldClass && oldClass.name !== updates.name) {
        const updatedTransactions = transactions.map(tx => 
          tx.shareClass === oldClass.name 
            ? { ...tx, shareClass: updates.name } 
            : tx
        );
        setTransactions(updatedTransactions);
      }
    }
    
    setShareClasses(updatedClasses);
  };
  
  // Delete a share class
  const deleteShareClass = (id) => {
    const shareClass = shareClasses.find(sc => sc.id === id);
    const filteredClasses = shareClasses.filter(sc => sc.id !== id);
    
    // Also remove any transactions for this share class
    const filteredTransactions = transactions.filter(
      tx => tx.shareClass !== shareClass.name
    );
    
    setShareClasses(filteredClasses);
    setTransactions(filteredTransactions);
  };
  
  // Add a new transaction
  const addTransaction = (newTransaction) => {
    const id = transactions.length > 0 
      ? Math.max(...transactions.map(tx => tx.id)) + 1 
      : 1;
    
    setTransactions([...transactions, { ...newTransaction, id }]);
  };
  
  // Update an existing transaction
  const updateTransaction = (id, updates) => {
    const updatedTransactions = transactions.map(tx => 
      tx.id === id ? { ...tx, ...updates } : tx
    );
    
    setTransactions(updatedTransactions);
  };
  
  // Delete a transaction
  const deleteTransaction = (id) => {
    const filteredTransactions = transactions.filter(tx => tx.id !== id);
    setTransactions(filteredTransactions);
  };
  
  // Reset to default data
  const resetToDefault = () => {
    setShareClasses(DEFAULT_SHARE_CLASSES);
    setTransactions(DEFAULT_TRANSACTIONS);
    setExitAmount(10000000);
  };
  
  // Context value
  const value = {
    // State
    shareClasses,
    transactions,
    exitAmount,
    waterfallSteps,
    summaryData,
    exitDistribution,
    
    // Actions
    setExitAmount,
    addShareClass,
    updateShareClass,
    deleteShareClass,
    addTransaction,
    updateTransaction,
    deleteTransaction,
    resetToDefault
  };
  
  return React.createElement(
    WaterfallContext.Provider,
    { value },
    children
  );
}; 