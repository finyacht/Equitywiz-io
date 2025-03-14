// Waterfall Calculator Module

// Default data for testing
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

// Calculate detailed waterfall distribution
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
        .sort((a, b) => a.seniority - b.seniority); // Sort by seniority (lower number = higher priority)

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
        // Get all classes sorted by seniority (lower number = higher priority)
        const allClassesBySeniority = [...activeShareClasses].sort((a, b) => a.seniority - b.seniority);
        
        // Calculate the total shares eligible for participation in this round
        let participatingShares = 0;
        
        // First, calculate total participating shares
        for (const sc of allClassesBySeniority) {
            // For preferred shares, only include if they're participating
            if (sc.type === 'preferred' && sc.prefType !== 'participating') {
                continue;
            }
            
            // Get the shares for this class
            const classShares = transactions
                .filter(tx => tx.shareClass === sc.name)
                .reduce((sum, tx) => sum + parseFloat(tx.shares || 0), 0);
                
            participatingShares += classShares;
        }
        
        // Distribute remaining proceeds based on seniority
        for (const sc of allClassesBySeniority) {
            if (remainingProceeds <= 0) break;
            
            // Skip non-participating preferred shares
            if (sc.type === 'preferred' && sc.prefType !== 'participating') {
                continue;
            }
            
            // Calculate the shares for this class
            const classShares = transactions
                .filter(tx => tx.shareClass === sc.name)
                .reduce((sum, tx) => sum + parseFloat(tx.shares || 0), 0);
            
            // Calculate the pro-rata share based on ownership
            const proRataShare = classShares / participatingShares;
            let participationAmount = proRataShare * remainingProceeds;
            
            // For preferred shares, check if there's a cap
            if (sc.type === 'preferred' && sc.cap) {
                const transactionsForClass = transactions.filter(tx => tx.shareClass === sc.name);
                const totalInvestment = transactionsForClass.reduce((sum, tx) => sum + parseFloat(tx.investment || 0), 0);
                
                // Calculate the total cap amount
                const capAmount = totalInvestment * sc.cap;
                
                // Calculate how much has already been received
                const alreadyReceived = results
                    .filter(r => r.shareClass === sc.name)
                    .reduce((sum, r) => sum - r.value, 0);
                
                // Limit to the cap
                participationAmount = Math.min(participationAmount, capAmount - alreadyReceived);
            }
            
            // Ensure we don't distribute more than what's available
            participationAmount = Math.min(participationAmount, remainingProceeds);
            
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
    
    // If there are still remaining proceeds, distribute them to common shareholders
    if (remainingProceeds > 0.01) {
        // Check if there are any common shares
        const commonClasses = activeShareClasses.filter(sc => sc.type === 'common');
        
        if (commonClasses.length > 0) {
            // Calculate total common shares
            let totalCommonShares = 0;
            const commonSharesByClass = {};
            
            for (const sc of commonClasses) {
                const classShares = transactions
                    .filter(tx => tx.shareClass === sc.name)
                    .reduce((sum, tx) => sum + parseFloat(tx.shares || 0), 0);
                
                totalCommonShares += classShares;
                commonSharesByClass[sc.name] = classShares;
            }
            
            // Distribute remaining proceeds to common shareholders based on their ownership
            for (const sc of commonClasses) {
                if (totalCommonShares > 0) {
                    const commonShare = commonSharesByClass[sc.name] / totalCommonShares;
                    const additionalAmount = commonShare * remainingProceeds;
                    
                    if (additionalAmount > 0) {
                        results.push({ 
                            name: `${sc.name} (Additional Distribution)`, 
                            value: -additionalAmount,
                            description: `${sc.name} receives additional distribution of $${additionalAmount.toLocaleString()}`,
                            remainingProceeds,
                            shareClass: sc.name
                        });
                        
                        remainingProceeds -= additionalAmount;
                    }
                }
            }
        } else {
            // If no common shares, then proceeds are retained by company
            results.push({ 
                name: `Retained by Company`, 
                value: -remainingProceeds,
                description: `$${remainingProceeds.toLocaleString()} remains with the company`,
                remainingProceeds,
                isRetained: true
            });
        }
    }

    return results;
}

// Calculate summary waterfall distribution
function calculateSummaryWaterfall(shareClasses, transactions, exitAmount) {
    const detailedResults = calculateDetailedWaterfall(shareClasses, transactions, exitAmount);
    const summaryByClass = {};
    
    // Skip the first "Total Exit Proceeds" entry
    detailedResults.slice(1).forEach(result => {
        if (result.isRetained) {
            // Create a special entry for retained proceeds
            summaryByClass['Retained by Company'] = {
                name: 'Retained by Company',
                payout: Math.abs(result.value),
                components: {
                    'Retained': Math.abs(result.value)
                }
            };
            return;
        }
        
        if (!result.shareClass) return;
        
        // Handle regular distributions
        if (!summaryByClass[result.shareClass]) {
            summaryByClass[result.shareClass] = {
                name: result.shareClass,
                payout: 0,
                components: {
                    'Liquidation Preference': 0,
                    'Participation': 0,
                    'Common Distribution': 0,
                    'Additional Distribution': 0
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
        } else if (result.name.includes('Additional Distribution')) {
            summaryByClass[result.shareClass].components['Additional Distribution'] += amount;
        }
    });
    
    return Object.values(summaryByClass).map(summary => ({
        ...summary,
        percentage: Math.round((summary.payout / exitAmount) * 10000) / 100
    }));
}

// Calculate exit distribution for multiple exit values
function calculateExitDistribution(shareClasses, transactions, maxExitAmount, numPoints = 20) {
    const exitValues = [];
    const distributions = [];
    
    // Generate exit values from 0 to maxExitAmount
    for (let i = 0; i <= numPoints; i++) {
        const exitValue = (maxExitAmount * i) / numPoints;
        exitValues.push(exitValue);
        
        // Calculate distribution for this exit value
        const distribution = calculateSummaryWaterfall(shareClasses, transactions, exitValue);
        distributions.push(distribution);
    }
    
    return {
        exitValues,
        distributions
    };
}

// Format currency
function formatCurrency(value) {
    return '$' + value.toLocaleString();
}

// Get color for share class
function getShareClassColor(className, index, alpha = 1) {
    const colors = {
        'Common': `rgba(168, 85, 247, ${alpha})`, // Purple
        'Series A': `rgba(59, 130, 246, ${alpha})`, // Blue
        'Series B': `rgba(16, 185, 129, ${alpha})`, // Green
        'Series C': `rgba(245, 158, 11, ${alpha})`, // Orange
        'Series D': `rgba(239, 68, 68, ${alpha})`, // Red
        'Retained by Company': `rgba(107, 114, 128, ${alpha})` // Gray
    };
    
    return colors[className] || `hsla(${index * 137.5}, 70%, 50%, ${alpha})`;
}

// Export functions and default data
window.waterfallCalculator = {
    calculateDetailedWaterfall,
    calculateSummaryWaterfall,
    calculateExitDistribution,
    formatCurrency,
    getShareClassColor,
    DEFAULT_SHARE_CLASSES,
    DEFAULT_TRANSACTIONS
}; 