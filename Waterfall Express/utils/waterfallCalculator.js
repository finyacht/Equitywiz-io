/**
 * Waterfall Calculator
 * 
 * This module contains functions for calculating waterfall distributions
 * based on share classes, transactions, and exit values.
 */

/**
 * Calculate detailed waterfall analysis
 * @param {Array} shareClasses - Array of share class objects
 * @param {Array} transactions - Array of transaction objects
 * @param {number} exitAmount - The exit amount to calculate distributions for
 * @returns {Array} - Detailed waterfall steps
 */
function calculateDetailedWaterfall(shareClasses, transactions, exitAmount) {
  let results = [];
  let remainingProceeds = exitAmount;
  
  // Start with total proceeds
  results.push({
    name: "Total Exit Proceeds",
    value: exitAmount,
    remainingProceeds: remainingProceeds,
    isStarting: true
  });
  
  if (transactions.length === 0) return results;
  
  // Get active share classes with transactions
  const activeShareClasses = shareClasses.filter(sc => 
    transactions.some(tx => tx.shareClass === sc.name)
  );
  
  // Calculate total ownership percentages
  const totalShares = transactions.reduce((sum, tx) => sum + (parseFloat(tx.shares) || 0), 0);
  const ownershipByClass = {};
  
  transactions.forEach(tx => {
    if (!ownershipByClass[tx.shareClass]) {
      ownershipByClass[tx.shareClass] = 0;
    }
    ownershipByClass[tx.shareClass] += (parseFloat(tx.shares) || 0) / totalShares;
  });

  // First Round - Liquidation Preferences (only for preferred shares, in order of seniority)
  const preferredClasses = [...activeShareClasses]
    .filter(sc => sc.type === 'preferred')
    .sort((a, b) => b.seniority - a.seniority);

  // Handle preferred shares liquidation preferences first
  for (const sc of preferredClasses) {
    if (remainingProceeds <= 0) break;
    
    const transactionsForClass = transactions.filter(tx => tx.shareClass === sc.name);
    let totalInvestment = transactionsForClass.reduce((sum, tx) => sum + parseFloat(tx.investment || 0), 0);
    
    // Calculate liquidation preference
    let liquidationPrefAmount = totalInvestment * parseFloat(sc.liquidationPref || 1);
    let prefPayout = Math.min(liquidationPrefAmount, remainingProceeds);
    
    if (prefPayout > 0) {
      results.push({ 
        name: `${sc.name} (Liquidation Preference)`, 
        value: -prefPayout,
        description: `${sc.name} receives liquidation preference of $${prefPayout.toLocaleString()}`,
        remainingProceeds,
        shareClass: sc.name
      });
      
      remainingProceeds -= prefPayout;
    }
  }

  // Second Round - Pro-rata distribution among participating preferred and common
  if (remainingProceeds > 0) {
    // Get participating preferred and common classes
    const participatingClasses = [
      ...preferredClasses.filter(sc => sc.prefType === "participating"),
      ...activeShareClasses.filter(sc => sc.type === "common")
    ];

    // Calculate total participating shares
    const participatingTotal = participatingClasses.reduce((sum, sc) => 
      sum + ownershipByClass[sc.name], 0
    );

    if (participatingTotal > 0) {
      for (const sc of participatingClasses) {
        const proRataShare = ownershipByClass[sc.name] / participatingTotal;
        let participationAmount = proRataShare * remainingProceeds;

        // Apply caps for participating preferred if they exist
        if (sc.type === 'preferred' && sc.cap) {
          const transactionsForClass = transactions.filter(tx => tx.shareClass === sc.name);
          const totalInvestment = transactionsForClass.reduce((sum, tx) => sum + parseFloat(tx.investment || 0), 0);
          const currentPayout = results
            .filter(r => r.shareClass === sc.name)
            .reduce((sum, r) => sum - r.value, 0);
          
          const capAmount = totalInvestment * sc.cap;
          participationAmount = Math.min(participationAmount, capAmount - currentPayout);
        }

        if (participationAmount > 0) {
          const distributionType = sc.type === 'common' ? 'Common Distribution' : 'Participation';
          results.push({ 
            name: `${sc.name} (${distributionType})`, 
            value: -participationAmount,
            description: `${sc.name} receives ${distributionType.toLowerCase()} of $${participationAmount.toLocaleString()}`,
            remainingProceeds,
            shareClass: sc.name
          });
          
          remainingProceeds -= participationAmount;
        }
      }
    }
  }

  // If there are still remaining proceeds and some classes hit their caps,
  // distribute remaining among uncapped classes
  if (remainingProceeds > 0) {
    const uncappedClasses = activeShareClasses.filter(sc => {
      if (sc.type === 'common') return true;
      if (sc.type === 'preferred' && sc.prefType === 'participating') {
        const transactionsForClass = transactions.filter(tx => tx.shareClass === sc.name);
        const totalInvestment = transactionsForClass.reduce((sum, tx) => sum + parseFloat(tx.investment || 0), 0);
        const currentPayout = results
          .filter(r => r.shareClass === sc.name)
          .reduce((sum, r) => sum - r.value, 0);
        if (sc.cap) {
          return currentPayout < (totalInvestment * sc.cap);
        }
        return true;
      }
      return false;
    });

    const uncappedTotal = uncappedClasses.reduce((sum, sc) => 
      sum + ownershipByClass[sc.name], 0
    );

    if (uncappedTotal > 0) {
      for (const sc of uncappedClasses) {
        const proRataShare = ownershipByClass[sc.name] / uncappedTotal;
        const additionalAmount = proRataShare * remainingProceeds;

        if (additionalAmount > 0) {
          const distributionType = sc.type === 'common' ? 'Additional Common' : 'Additional Participation';
          results.push({ 
            name: `${sc.name} (${distributionType})`, 
            value: -additionalAmount,
            description: `${sc.name} receives additional distribution of $${additionalAmount.toLocaleString()}`,
            remainingProceeds,
            shareClass: sc.name
          });
          
          remainingProceeds -= additionalAmount;
        }
      }
    }
  }
  
  return results;
}

/**
 * Calculate summary waterfall distribution
 * @param {Array} shareClasses - Array of share class objects
 * @param {Array} transactions - Array of transaction objects
 * @param {number} exitAmount - The exit amount to calculate distributions for
 * @returns {Array} - Summary of distributions by share class
 */
function calculateSummaryWaterfall(shareClasses, transactions, exitAmount) {
  const detailedResults = calculateDetailedWaterfall(shareClasses, transactions, exitAmount);
  const summaryByClass = {};
  
  // Skip the first "Total Exit Proceeds" entry
  detailedResults.slice(1).forEach(result => {
    if (!result.shareClass) return;
    
    if (!summaryByClass[result.shareClass]) {
      summaryByClass[result.shareClass] = {
        name: result.shareClass,
        payout: 0,
        components: {
          'Liquidation Preference': 0,
          'Participation': 0,
          'Common Distribution': 0
        }
      };
    }
    
    const amount = Math.abs(result.value);
    summaryByClass[result.shareClass].payout += amount;
    
    // Categorize the payment
    if (result.name.includes('Liquidation Preference')) {
      summaryByClass[result.shareClass].components['Liquidation Preference'] += amount;
    } else if (result.name.includes('Participation')) {
      summaryByClass[result.shareClass].components['Participation'] += amount;
    } else if (result.name.includes('Common Distribution')) {
      summaryByClass[result.shareClass].components['Common Distribution'] += amount;
    }
  });
  
  return Object.values(summaryByClass).map(summary => ({
    ...summary,
    percentage: Math.round((summary.payout / exitAmount) * 10000) / 100
  }));
}

/**
 * Calculate distribution for multiple exit values
 * @param {Array} shareClasses - Array of share class objects
 * @param {Array} transactions - Array of transaction objects
 * @param {number} maxExitAmount - The maximum exit amount to calculate distributions for
 * @param {number} numPoints - Number of points to calculate (default: 20)
 * @returns {Object} - Distribution data for chart
 */
function calculateExitDistribution(shareClasses, transactions, maxExitAmount, numPoints = 20) {
  // Generate exit values from 0 to maxExitAmount
  const exitValues = Array.from({length: numPoints + 1}, (_, i) => (maxExitAmount * i) / numPoints);
  
  // Get all unique share classes
  const activeShareClasses = [...new Set(
    shareClasses
      .filter(sc => transactions.some(tx => tx.shareClass === sc.name))
      .map(sc => sc.name)
  )];
  
  // Calculate distributions for each exit value
  const distributions = exitValues.map(exitValue => {
    const dist = calculateSummaryWaterfall(shareClasses, transactions, exitValue);
    return activeShareClasses.map(className => {
      const shareData = dist.find(d => d.name === className);
      return shareData ? shareData.payout : 0;
    });
  });

  return {
    exitValues,
    activeShareClasses,
    distributions
  };
}

/**
 * Format currency for display
 * @param {number} value - The value to format
 * @returns {string} - Formatted currency string
 */
function formatCurrency(value) {
  return '$' + value.toLocaleString();
}

/**
 * Get color for a share class
 * @param {string} className - The name of the share class
 * @param {number} index - Fallback index for color generation
 * @param {number} alpha - Alpha transparency value
 * @returns {string} - CSS color string
 */
function getShareClassColor(className, index, alpha = 1) {
  const colors = {
    'Common': `rgba(168, 85, 247, ${alpha})`, // Purple
    'Series A': `rgba(59, 130, 246, ${alpha})`, // Blue
    'Series B': `rgba(16, 185, 129, ${alpha})`, // Green
    'Series C': `rgba(245, 158, 11, ${alpha})`, // Orange
    'Series D': `rgba(239, 68, 68, ${alpha})`, // Red
  };
  
  return colors[className] || `hsla(${index * 137.5}, 70%, 50%, ${alpha})`;
}

/**
 * Get color for a distribution type
 * @param {string} type - The distribution type
 * @param {number} alpha - Alpha transparency value
 * @returns {string} - CSS color string
 */
function getDistributionTypeColor(type, alpha = 1) {
  // Use consistent colors for each distribution type
  const colors = {
    'Liquidation Preference': `rgba(59, 130, 246, ${alpha})`, // Blue for liquidation preferences
    'Participation': `rgba(16, 185, 129, ${alpha})`, // Green for participation
    'Common Distribution': `rgba(107, 114, 128, ${alpha})` // Gray for common
  };
  return colors[type] || `rgba(107, 114, 128, ${alpha})`;
}

// Default data for testing and initial state
const DEFAULT_SHARE_CLASSES = [
  { id: 1, name: "Series A", type: "preferred", seniority: 1, liquidationPref: 1, prefType: "participating", cap: null },
  { id: 2, name: "Series B", type: "preferred", seniority: 2, liquidationPref: 1.5, prefType: "participating", cap: 3 },
  { id: 3, name: "Common", type: "common", seniority: 3, liquidationPref: 1, prefType: "non-participating", cap: null }
];

const DEFAULT_TRANSACTIONS = [
  { id: 1, shareClass: "Series A", shares: 1000000, investment: 1000000 },
  { id: 2, shareClass: "Series B", shares: 2000000, investment: 2000000 },
  { id: 3, shareClass: "Common", shares: 750000, investment: 0 }
];

module.exports = {
  calculateDetailedWaterfall,
  calculateSummaryWaterfall,
  calculateExitDistribution,
  formatCurrency,
  getShareClassColor,
  getDistributionTypeColor,
  DEFAULT_SHARE_CLASSES,
  DEFAULT_TRANSACTIONS
}; 