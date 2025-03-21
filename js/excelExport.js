// Waterfall Analysis Excel Exporter

document.addEventListener('DOMContentLoaded', function() {
    // Add click event listener to the export button
    const exportButton = document.getElementById('exportExcelBtn');
    if (exportButton) {
        exportButton.addEventListener('click', exportToExcel);
    }
});

/**
 * Parse number with commas (duplicated from main.js for safety)
 */
function parseNumberWithCommas(str) {
    if (!str) return 0;
    return parseFloat(str.toString().replace(/,/g, '')) || 0;
}

/**
 * Exports the waterfall analysis data to an Excel file
 */
function exportToExcel() {
    try {
        // Get current data
        const currentExitAmount = parseNumberWithCommas(document.getElementById('exitAmount').value);
        const filename = `Waterfall_Analysis_${currentExitAmount.toLocaleString()}`;
        
        // Access global variables
        const shareClasses = window.shareClasses || [];
        const transactions = window.transactions || [];
        
        // Create workbook with multiple sheets
        const wb = XLSX.utils.book_new();
        
        // Add sheets
        addShareClassesSheet(wb, shareClasses);
        addTransactionsSheet(wb, transactions);
        addSummarySheet(wb, currentExitAmount, shareClasses, transactions);
        addDetailedWaterfallSheet(wb, currentExitAmount, shareClasses, transactions);
        addExitDistributionSheet(wb, shareClasses, transactions);
        
        // Save workbook
        XLSX.writeFile(wb, `${filename}.xlsx`);
        
    } catch (error) {
        console.error('Error exporting to Excel:', error);
        alert('There was an error exporting to Excel. Please try again.');
    }
}

/**
 * Adds the Share Classes sheet to the workbook
 */
function addShareClassesSheet(wb, shareClasses) {
    // Create header row
    const headers = ['Class Name', 'Type', 'Seniority', 'Liquidation Preference', 'Preference Type', 'Participation Cap'];
    
    // Create data rows
    const data = shareClasses.map(sc => [
        sc.name,
        sc.type.charAt(0).toUpperCase() + sc.type.slice(1), // Capitalize type
        sc.seniority,
        sc.liquidationPref + 'x',
        sc.prefType.charAt(0).toUpperCase() + sc.prefType.slice(1).replace('-', ' '), // Format pref type
        sc.cap ? sc.cap + 'x' : 'N/A'
    ]);
    
    // Combine headers and data
    const wsData = [headers, ...data];
    
    // Create worksheet and add to workbook
    const ws = XLSX.utils.aoa_to_sheet(wsData);
    XLSX.utils.book_append_sheet(wb, ws, 'Share Classes');
    
    // Set column widths
    const cols = [
        { wch: 15 }, // Class Name
        { wch: 12 }, // Type
        { wch: 10 }, // Seniority
        { wch: 20 }, // Liquidation Preference
        { wch: 20 }, // Preference Type
        { wch: 16 }  // Participation Cap
    ];
    ws['!cols'] = cols;
}

/**
 * Adds the Transactions sheet to the workbook
 */
function addTransactionsSheet(wb, transactions) {
    // Create header row
    const headers = ['Share Class', 'Shares', 'Investment ($)'];
    
    // Create data rows
    const data = transactions.map(tx => [
        tx.shareClass,
        parseInt(tx.shares.toString().replace(/,/g, '')),
        parseInt(tx.investment.toString().replace(/,/g, ''))
    ]);
    
    // Combine headers and data
    const wsData = [headers, ...data];
    
    // Create worksheet and add to workbook
    const ws = XLSX.utils.aoa_to_sheet(wsData);
    XLSX.utils.book_append_sheet(wb, ws, 'Transactions');
    
    // Set column widths
    const cols = [
        { wch: 15 }, // Share Class
        { wch: 15 }, // Shares
        { wch: 15 }  // Investment
    ];
    ws['!cols'] = cols;
}

/**
 * Adds the Summary sheet to the workbook
 */
function addSummarySheet(wb, exitAmount, shareClasses, transactions) {
    // Calculate summary data
    const summaryData = waterfallCalculator.calculateSummaryWaterfall(shareClasses, transactions, exitAmount);
    
    // Create header row
    const headers = ['Share Class', 'Total Amount ($)', 'Percentage', 'Liquidation Preference ($)', 
                     'Participation ($)', 'Common Distribution ($)', 'Additional Distribution ($)'];
    
    // Create data rows
    const data = Object.values(summaryData).map(entry => {
        const percentage = (entry.payout / exitAmount * 100).toFixed(2) + '%';
        return [
            entry.name,
            entry.payout,
            percentage,
            entry.components['Liquidation Preference'] || 0,
            entry.components['Participation'] || 0,
            entry.components['Common Distribution'] || 0,
            entry.components['Additional Distribution'] || 0
        ];
    });
    
    // Add total row
    const totalPayout = Object.values(summaryData).reduce((sum, entry) => sum + entry.payout, 0);
    const totalRow = [
        'TOTAL',
        totalPayout,
        '100.00%',
        Object.values(summaryData).reduce((sum, entry) => sum + (entry.components['Liquidation Preference'] || 0), 0),
        Object.values(summaryData).reduce((sum, entry) => sum + (entry.components['Participation'] || 0), 0),
        Object.values(summaryData).reduce((sum, entry) => sum + (entry.components['Common Distribution'] || 0), 0),
        Object.values(summaryData).reduce((sum, entry) => sum + (entry.components['Additional Distribution'] || 0), 0)
    ];
    
    // Combine headers, data, and total
    const wsData = [headers, ...data, totalRow];
    
    // Create worksheet and add to workbook
    const ws = XLSX.utils.aoa_to_sheet(wsData);
    XLSX.utils.book_append_sheet(wb, ws, 'Distribution Summary');
    
    // Set column widths
    const cols = [
        { wch: 15 }, // Share Class
        { wch: 18 }, // Total Amount
        { wch: 12 }, // Percentage
        { wch: 22 }, // Liquidation Preference
        { wch: 18 }, // Participation
        { wch: 22 }, // Common Distribution
        { wch: 22 }  // Additional Distribution
    ];
    ws['!cols'] = cols;
}

/**
 * Adds the Detailed Waterfall sheet to the workbook
 */
function addDetailedWaterfallSheet(wb, exitAmount, shareClasses, transactions) {
    // Calculate detailed waterfall
    const detailedData = waterfallCalculator.calculateDetailedWaterfall(shareClasses, transactions, exitAmount);
    
    // Create header row
    const headers = ['Step', 'Description', 'Amount ($)', 'Remaining Proceeds ($)'];
    
    // Create data rows
    const data = detailedData.map((step, index) => [
        index === 0 ? 'Starting Amount' : `Step ${index}`,
        step.name,
        step.isStarting ? step.value : (step.value < 0 ? Math.abs(step.value) : -Math.abs(step.value)),
        step.remainingProceeds
    ]);
    
    // Combine headers and data
    const wsData = [headers, ...data];
    
    // Create worksheet and add to workbook
    const ws = XLSX.utils.aoa_to_sheet(wsData);
    XLSX.utils.book_append_sheet(wb, ws, 'Detailed Waterfall');
    
    // Set column widths
    const cols = [
        { wch: 15 }, // Step
        { wch: 40 }, // Description
        { wch: 15 }, // Amount
        { wch: 20 }  // Remaining Proceeds
    ];
    ws['!cols'] = cols;
}

/**
 * Adds the Exit Distribution sheet to the workbook
 */
function addExitDistributionSheet(wb, shareClasses, transactions) {
    // Calculate exit distribution across different exit values
    const maxExitAmount = parseNumberWithCommas(document.getElementById('exitAmount').value) * 2;
    const distributionData = waterfallCalculator.calculateExitDistribution(shareClasses, transactions, maxExitAmount);
    
    // Create header row
    const headers = ['Exit Value ($)'];
    const shareClassNames = [...new Set(distributionData.map(d => d.shareClass))];
    headers.push(...shareClassNames);
    
    // Group data by exit value
    const exitValues = [...new Set(distributionData.map(d => d.exitValue))];
    const data = exitValues.map(exitValue => {
        const row = [exitValue];
        for (const className of shareClassNames) {
            const entry = distributionData.find(d => d.exitValue === exitValue && d.shareClass === className);
            row.push(entry ? entry.amount : 0);
        }
        return row;
    });
    
    // Sort by exit value
    data.sort((a, b) => a[0] - b[0]);
    
    // Combine headers and data
    const wsData = [headers, ...data];
    
    // Create worksheet and add to workbook
    const ws = XLSX.utils.aoa_to_sheet(wsData);
    XLSX.utils.book_append_sheet(wb, ws, 'Exit Distribution');
    
    // Set column widths
    const cols = [
        { wch: 18 }, // Exit Value
        ...shareClassNames.map(() => ({ wch: 18 })) // Share class columns
    ];
    ws['!cols'] = cols;
} 