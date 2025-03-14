// Waterfall Analysis Tool - Main JavaScript

// State management
let shareClasses = [];
let transactions = [];
let exitAmount = 10000000;

// Charts
let summaryChart = null;
let exitDistributionChart = null;

// DOM Elements
let shareClassesTableBody;
let transactionsTableBody;

document.addEventListener('DOMContentLoaded', function() {
    // Get DOM elements
    shareClassesTableBody = document.querySelector('#shareClassesTable tbody');
    transactionsTableBody = document.querySelector('#transactionsTable tbody');
    
    // Initialize the application
    init();
});

// Initialize the application
function init() {
    // Load default data
    shareClasses = [...waterfallCalculator.DEFAULT_SHARE_CLASSES];
    transactions = [...waterfallCalculator.DEFAULT_TRANSACTIONS];
    
    // Set up event listeners
    setupEventListeners();
    
    // Render initial data
    renderShareClasses();
    renderTransactions();
    
    // Update waterfall analysis
    updateWaterfallAnalysis();
}

// Set up event listeners
function setupEventListeners() {
    // Add share class button
    document.getElementById('addShareClassBtn').addEventListener('click', addNewShareClassRow);
    
    // Add transaction button
    document.getElementById('addTransactionBtn').addEventListener('click', addNewTransactionRow);
    
    // Exit amount input
    setupNumericInputs();
}

// Format number with commas
function formatNumberWithCommas(number) {
    return number.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

// Parse number from string with commas
function parseNumberWithCommas(str) {
    return parseFloat(str.replace(/,/g, '')) || 0;
}

// Add input event listeners for numeric fields
function setupNumericInputs() {
    // Exit amount input
    const exitAmountInput = document.getElementById('exitAmount');
    exitAmountInput.addEventListener('input', function(e) {
        const value = parseNumberWithCommas(this.value);
        exitAmount = value;
        updateWaterfallAnalysis();
    });
    
    exitAmountInput.addEventListener('focus', function() {
        this.value = exitAmount.toString();
    });
    
    exitAmountInput.addEventListener('blur', function() {
        this.value = formatNumberWithCommas(exitAmount);
    });
    
    // Format initial value
    exitAmountInput.value = formatNumberWithCommas(exitAmount);
}

// Render share classes to the table
function renderShareClasses() {
    shareClassesTableBody.innerHTML = '';
    
    shareClasses.forEach(sc => {
        const row = document.createElement('tr');
        row.dataset.id = sc.id;
        
        row.innerHTML = `
            <td><input type="text" class="name" value="${sc.name}" onchange="updateShareClassField(${sc.id}, 'name', this.value)"></td>
            <td>
                <select class="type" onchange="updateShareClassField(${sc.id}, 'type', this.value)">
                    <option value="preferred" ${sc.type === 'preferred' ? 'selected' : ''}>Preferred</option>
                    <option value="common" ${sc.type === 'common' ? 'selected' : ''}>Common</option>
                </select>
            </td>
            <td><input type="number" class="seniority" min="1" value="${sc.seniority}" onchange="updateShareClassField(${sc.id}, 'seniority', this.value)"></td>
            <td>
                <input type="number" class="liquidationPref" min="1" step="0.1" value="${sc.liquidationPref}" 
                onchange="updateShareClassField(${sc.id}, 'liquidationPref', this.value)" 
                style="display: ${sc.type === 'preferred' ? 'block' : 'none'}">
                <span style="display: ${sc.type === 'preferred' ? 'none' : 'block'}">-</span>
            </td>
            <td>
                <select class="prefType" onchange="updateShareClassField(${sc.id}, 'prefType', this.value)" 
                style="display: ${sc.type === 'preferred' ? 'block' : 'none'}">
                    <option value="non-participating" ${sc.prefType === 'non-participating' ? 'selected' : ''}>Non-Part.</option>
                    <option value="participating" ${sc.prefType === 'participating' ? 'selected' : ''}>Part.</option>
                </select>
                <span style="display: ${sc.type === 'preferred' ? 'none' : 'block'}">-</span>
            </td>
            <td>
                <input type="number" class="cap" min="0" step="0.1" 
                value="${sc.cap || ''}" placeholder="No cap"
                onchange="updateShareClassField(${sc.id}, 'cap', this.value)"
                style="display: ${sc.type === 'preferred' && sc.prefType === 'participating' ? 'block' : 'none'}">
                <span style="display: ${sc.type === 'preferred' && sc.prefType === 'participating' ? 'none' : 'block'}">${sc.type === 'preferred' && sc.prefType === 'participating' ? '' : 'No Cap'}</span>
            </td>
            <td>
                <button class="delete" onclick="deleteShareClass(${sc.id})">Delete</button>
            </td>
        `;
        
        // Add type change handler
        const typeSelect = row.querySelector('.type');
        const prefFields = [row.querySelector('.liquidationPref'), row.querySelector('.prefType')];
        const prefSpans = [row.querySelector('td:nth-child(4) span'), row.querySelector('td:nth-child(5) span')];
        const capField = row.querySelector('.cap');
        const capSpan = row.querySelector('td:nth-child(6) span');
        
        typeSelect.addEventListener('change', function() {
            const isPreferred = this.value === 'preferred';
            prefFields.forEach((field, index) => {
                field.style.display = isPreferred ? 'block' : 'none';
                prefSpans[index].style.display = isPreferred ? 'none' : 'block';
            });
            
            const isParticipating = row.querySelector('.prefType').value === 'participating';
            capField.style.display = (isPreferred && isParticipating) ? 'block' : 'none';
            capSpan.style.display = (isPreferred && isParticipating) ? 'none' : 'block';
            capSpan.textContent = 'No Cap';
        });

        // Add preference type change handler
        row.querySelector('.prefType')?.addEventListener('change', function() {
            if (typeSelect.value === 'preferred') {
                const isParticipating = this.value === 'participating';
                capField.style.display = isParticipating ? 'block' : 'none';
                capSpan.style.display = isParticipating ? 'none' : 'block';
                capSpan.textContent = 'No Cap';
            }
        });
        
        shareClassesTableBody.appendChild(row);
    });
}

// Render transactions to the table
function renderTransactions() {
    transactionsTableBody.innerHTML = '';
    
    transactions.forEach(tx => {
        const row = document.createElement('tr');
        row.dataset.id = tx.id;
        
        row.innerHTML = `
            <td>
                <select class="shareClass" onchange="updateTransactionField(${tx.id}, 'shareClass', this.value)">
                    ${shareClasses.map(sc => 
                        `<option value="${sc.name}" ${tx.shareClass === sc.name ? 'selected' : ''}>${sc.name}</option>`
                    ).join('')}
                </select>
            </td>
            <td>
                <input type="text" class="shares" value="${formatNumberWithCommas(tx.shares)}" 
                onfocus="this.value=this.value.replace(/,/g, '')"
                onblur="this.value=formatNumberWithCommas(parseFloat(this.value.replace(/,/g, '')) || 0)"
                onchange="updateTransactionField(${tx.id}, 'shares', parseNumberWithCommas(this.value))">
            </td>
            <td>
                <input type="text" class="investment" value="${formatNumberWithCommas(tx.investment)}" 
                onfocus="this.value=this.value.replace(/,/g, '')"
                onblur="this.value=formatNumberWithCommas(parseFloat(this.value.replace(/,/g, '')) || 0)"
                onchange="updateTransactionField(${tx.id}, 'investment', parseNumberWithCommas(this.value))">
            </td>
            <td>
                <button class="delete" onclick="deleteTransaction(${tx.id})">Delete</button>
            </td>
        `;
        
        transactionsTableBody.appendChild(row);
    });
}

// Function to create a tooltip element
function createTooltip(text) {
    return `
        <span class="tooltip">
            <span class="tooltip-icon">?</span>
            <span class="tooltip-text">${text}</span>
        </span>
    `;
}

// Add tooltips to dynamically created elements
function addTooltipsToShareClassRow(row) {
    // Add tooltips to table headers in the edit mode
    const tooltips = {
        'seniority': 'Determines the order in which share classes receive distributions. Lower numbers have higher priority (1 is highest).',
        'liquidationPref': 'Multiplier applied to the original investment that preferred shareholders receive before common shareholders. E.g., 1x means 100% of investment is returned first.',
        'prefType': 'Non-participating: Preferred shareholders choose either liquidation preference OR pro-rata share. Participating: Preferred shareholders receive BOTH liquidation preference AND pro-rata share.',
        'cap': 'For participating preferred shares, limits the total return as a multiple of the original investment. E.g., 3x cap means maximum return is 3 times the investment.'
    };
    
    // Add tooltips to labels if they exist
    Object.keys(tooltips).forEach(key => {
        const label = row.querySelector(`.${key}-label`);
        if (label && !label.querySelector('.tooltip')) {
            label.innerHTML += createTooltip(tooltips[key]);
        }
    });
}

// Modify the addNewShareClassRow function to include tooltips
function addNewShareClassRow() {
    const row = document.createElement('tr');
    row.className = 'editing-row';
    
    row.innerHTML = `
        <td><input type="text" class="name" placeholder="Series A"></td>
        <td>
            <select class="type">
                <option value="preferred">Preferred</option>
                <option value="common">Common</option>
            </select>
        </td>
        <td>
            <label class="seniority-label">
                <input type="number" class="seniority" min="1" value="1">
            </label>
        </td>
        <td>
            <label class="liquidationPref-label">
                <input type="number" class="liquidationPref" min="1" step="0.1" value="1">
            </label>
        </td>
        <td>
            <label class="prefType-label">
                <select class="prefType">
                    <option value="non-participating">Non-Participating</option>
                    <option value="participating">Participating</option>
                </select>
            </label>
        </td>
        <td>
            <label class="cap-label">
                <input type="number" class="cap" min="0" step="0.1" placeholder="No cap">
            </label>
        </td>
        <td class="action-buttons">
            <button class="save" onclick="saveShareClass(this)">Save</button>
            <button class="cancel" onclick="cancelShareClass(this)">Cancel</button>
        </td>
    `;

    // Add tooltips to the row
    addTooltipsToShareClassRow(row);

    // Add type change handler
    const typeSelect = row.querySelector('.type');
    const prefFields = [row.querySelector('.liquidationPref'), row.querySelector('.prefType')];
    const capField = row.querySelector('.cap');
    
    typeSelect.addEventListener('change', function() {
        const isPreferred = this.value === 'preferred';
        prefFields.forEach(field => {
            field.parentElement.style.display = isPreferred ? '' : 'none';
        });
        capField.parentElement.style.display = 
            (isPreferred && row.querySelector('.prefType').value === 'participating') ? '' : 'none';
    });

    // Add preference type change handler
    row.querySelector('.prefType').addEventListener('change', function() {
        if (typeSelect.value === 'preferred') {
            capField.parentElement.style.display = 
                this.value === 'participating' ? '' : 'none';
        }
    });
    
    shareClassesTableBody.appendChild(row);
}

// Save share class
window.saveShareClass = function(button) {
    const row = button.closest('tr');
    
    const name = row.querySelector('.name').value.trim();
    if (name === '') return;

    const type = row.querySelector('.type').value;
    const seniority = parseInt(row.querySelector('.seniority').value) || 1;
    const liquidationPref = type === 'preferred' ? (parseFloat(row.querySelector('.liquidationPref').value) || 1) : 1;
    const prefType = type === 'preferred' ? row.querySelector('.prefType').value : 'non-participating';
    const capInput = row.querySelector('.cap').value;
    const cap = (type === 'preferred' && prefType === 'participating' && capInput !== '') ? parseFloat(capInput) : null;
    
    const newShareClass = {
        id: shareClasses.length > 0 ? Math.max(...shareClasses.map(sc => sc.id)) + 1 : 1,
        name,
        type,
        seniority,
        liquidationPref,
        prefType,
        cap
    };
    
    shareClasses.push(newShareClass);
    renderShareClasses();
    renderTransactions(); // Re-render transactions to update share class options
    updateWaterfallAnalysis();
};

// Cancel share class addition
window.cancelShareClass = function(button) {
    const row = button.closest('tr');
    row.remove();
};

// Edit share class
function editShareClass(id) {
    const shareClass = shareClasses.find(sc => sc.id === id);
    if (!shareClass) return;
    
    const modal = document.createElement('div');
    modal.className = 'modal';
    modal.innerHTML = `
        <div class="modal-content">
            <h3>Edit Share Class</h3>
            <div class="form-field">
                <label for="name">Name</label>
                <input type="text" id="name" value="${shareClass.name}">
            </div>
            <div class="form-field">
                <label for="type">Type</label>
                <select id="type">
                    <option value="preferred" ${shareClass.type === 'preferred' ? 'selected' : ''}>Preferred</option>
                    <option value="common" ${shareClass.type === 'common' ? 'selected' : ''}>Common</option>
                </select>
            </div>
            <div class="form-field">
                <label for="seniority">Seniority</label>
                <input type="number" id="seniority" min="1" value="${shareClass.seniority}">
            </div>
            <div class="form-field preferred-only ${shareClass.type !== 'preferred' ? 'hidden' : ''}">
                <label for="liquidationPref">Liquidation Preference</label>
                <input type="number" id="liquidationPref" min="1" step="0.1" value="${shareClass.liquidationPref}">
            </div>
            <div class="form-field preferred-only ${shareClass.type !== 'preferred' ? 'hidden' : ''}">
                <label for="prefType">Preference Type</label>
                <select id="prefType">
                    <option value="non-participating" ${shareClass.prefType === 'non-participating' ? 'selected' : ''}>Non-Participating</option>
                    <option value="participating" ${shareClass.prefType === 'participating' ? 'selected' : ''}>Participating</option>
                </select>
            </div>
            <div class="form-field preferred-only cap-only ${shareClass.type !== 'preferred' || shareClass.prefType !== 'participating' ? 'hidden' : ''}">
                <label for="cap">Cap (x)</label>
                <input type="number" id="cap" min="0" step="0.1" value="${shareClass.cap || ''}" placeholder="No cap">
            </div>
            <div class="form-actions">
                <button onclick="updateShareClass(${id})">Save</button>
                <button onclick="closeModal()">Cancel</button>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
    
    // Add type change handler
    const typeSelect = document.getElementById('type');
    const prefFields = document.querySelectorAll('.preferred-only');
    const capField = document.querySelector('.cap-only');
    
    typeSelect.addEventListener('change', function() {
        const isPreferred = this.value === 'preferred';
        prefFields.forEach(field => {
            field.classList.toggle('hidden', !isPreferred);
        });
    });
    
    // Add preference type change handler
    document.getElementById('prefType').addEventListener('change', function() {
        const isParticipating = this.value === 'participating';
        capField.classList.toggle('hidden', !isParticipating);
    });
}

// Update share class
function updateShareClass(id) {
    const shareClass = shareClasses.find(sc => sc.id === id);
    if (!shareClass) return;
    
    const name = document.getElementById('name').value.trim();
    if (name === '') return;
    
    const type = document.getElementById('type').value;
    const seniority = parseInt(document.getElementById('seniority').value) || 1;
    const liquidationPref = type === 'preferred' ? (parseFloat(document.getElementById('liquidationPref').value) || 1) : 1;
    const prefType = type === 'preferred' ? document.getElementById('prefType').value : 'non-participating';
    const capInput = document.getElementById('cap')?.value;
    const cap = (type === 'preferred' && prefType === 'participating' && capInput !== '') ? parseFloat(capInput) : null;
    
    // Update share class
    shareClass.name = name;
    shareClass.type = type;
    shareClass.seniority = seniority;
    shareClass.liquidationPref = liquidationPref;
    shareClass.prefType = prefType;
    shareClass.cap = cap;
    
    // Update any transactions that reference this share class
    const oldName = shareClass.name;
    transactions.forEach(tx => {
        if (tx.shareClass === oldName) {
            tx.shareClass = name;
        }
    });
    
    closeModal();
    renderShareClasses();
    renderTransactions();
    updateWaterfallAnalysis();
}

// Delete share class
function deleteShareClass(id) {
    const shareClass = shareClasses.find(sc => sc.id === id);
    if (!shareClass) return;
    
    // Remove share class
    shareClasses = shareClasses.filter(sc => sc.id !== id);
    
    // Remove any transactions that reference this share class
    transactions = transactions.filter(tx => tx.shareClass !== shareClass.name);
    
    renderShareClasses();
    renderTransactions();
    updateWaterfallAnalysis();
}

// Add new transaction row
function addNewTransactionRow() {
    const row = document.createElement('tr');
    row.className = 'editing-row';
    
    row.innerHTML = `
        <td>
            <select class="shareClass">
                <option value="">Select Class</option>
                ${shareClasses.map(sc => `<option value="${sc.name}">${sc.name}</option>`).join('')}
            </select>
        </td>
        <td>
            <input type="text" class="shares" value="0" 
            onfocus="this.value=this.value.replace(/,/g, '')"
            onblur="this.value=formatNumberWithCommas(parseFloat(this.value.replace(/,/g, '')) || 0)">
        </td>
        <td>
            <label class="investment-label">
                <input type="text" class="investment" value="0"
                onfocus="this.value=this.value.replace(/,/g, '')"
                onblur="this.value=formatNumberWithCommas(parseFloat(this.value.replace(/,/g, '')) || 0)">
                ${createTooltip('The amount of money invested to acquire these shares. Used to calculate liquidation preferences for preferred shares.')}
            </label>
        </td>
        <td class="action-buttons">
            <button class="save" onclick="saveTransaction(this)">Save</button>
            <button class="cancel" onclick="cancelTransaction(this)">Cancel</button>
        </td>
    `;
    
    transactionsTableBody.appendChild(row);
}

// Save transaction
window.saveTransaction = function(button) {
    const row = button.closest('tr');
    
    const shareClass = row.querySelector('.shareClass').value;
    if (shareClass === '') return;

    const shares = parseNumberWithCommas(row.querySelector('.shares').value);
    const investment = parseNumberWithCommas(row.querySelector('.investment').value);

    const newTransaction = {
        id: transactions.length > 0 ? Math.max(...transactions.map(tx => tx.id)) + 1 : 1,
        shareClass,
        shares,
        investment
    };

    transactions.push(newTransaction);
    renderTransactions();
    updateWaterfallAnalysis();
};

// Cancel transaction addition
window.cancelTransaction = function(button) {
    const row = button.closest('tr');
    row.remove();
};

// Edit transaction
function editTransaction(id) {
    const transaction = transactions.find(tx => tx.id === id);
    if (!transaction) return;
    
    const modal = document.createElement('div');
    modal.className = 'modal';
    modal.innerHTML = `
        <div class="modal-content">
            <h3>Edit Transaction</h3>
            <div class="form-field">
                <label for="shareClass">Share Class</label>
                <select id="shareClass">
                    ${shareClasses.map(sc => `<option value="${sc.name}" ${transaction.shareClass === sc.name ? 'selected' : ''}>${sc.name}</option>`).join('')}
                </select>
            </div>
            <div class="form-field">
                <label for="shares">Shares</label>
                <input type="number" id="shares" min="0" value="${transaction.shares}">
            </div>
            <div class="form-field">
                <label for="investment">Investment ($)</label>
                <input type="number" id="investment" min="0" value="${transaction.investment}">
            </div>
            <div class="form-actions">
                <button onclick="updateTransaction(${id})">Save</button>
                <button onclick="closeModal()">Cancel</button>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
}

// Update transaction
function updateTransaction(id) {
    const transaction = transactions.find(tx => tx.id === id);
    if (!transaction) return;
    
    const shareClass = document.getElementById('shareClass').value;
    if (shareClass === '') return;
    
    const shares = parseFloat(document.getElementById('shares').value) || 0;
    const investment = parseFloat(document.getElementById('investment').value) || 0;
    
    // Update transaction
    transaction.shareClass = shareClass;
    transaction.shares = shares;
    transaction.investment = investment;
    
    closeModal();
    renderTransactions();
    updateWaterfallAnalysis();
}

// Delete transaction
function deleteTransaction(id) {
    transactions = transactions.filter(tx => tx.id !== id);
    
    renderTransactions();
    updateWaterfallAnalysis();
}

// Close modal
function closeModal() {
    const modal = document.querySelector('.modal');
    if (modal) {
        modal.remove();
    }
}

// Update the waterfall analysis charts and tables
function updateWaterfallAnalysis() {
    const waterfallSteps = waterfallCalculator.calculateDetailedWaterfall(shareClasses, transactions, exitAmount);
    const summaryData = waterfallCalculator.calculateSummaryWaterfall(shareClasses, transactions, exitAmount);
    
    // Update the summary table
    renderSummaryTable(summaryData);
    
    // Update the charts
    renderCombinedChart(summaryData);
    renderExitDistributionChart();
}

// Render summary table
function renderSummaryTable(summaryData) {
    const summaryTableBody = document.querySelector('#summaryTable tbody');
    summaryTableBody.innerHTML = '';
    
    // Add each summary row
    summaryData.forEach(result => {
        const row = document.createElement('tr');
        
        row.innerHTML = `
            <td>${result.name}</td>
            <td>$${result.payout.toLocaleString()}</td>
            <td>${result.percentage}%</td>
        `;
        
        summaryTableBody.appendChild(row);
    });
    
    // Add total row
    const totalRow = document.createElement('tr');
    totalRow.className = 'font-bold';
    
    totalRow.innerHTML = `
        <td>Total</td>
        <td>$${exitAmount.toLocaleString()}</td>
        <td>100%</td>
    `;
    
    summaryTableBody.appendChild(totalRow);
}

// Render combined chart
function renderCombinedChart(summaryData) {
    const ctx = document.getElementById('combinedChart');
    if (!ctx) return;
    
    if (summaryChart) {
        summaryChart.destroy();
    }
    
    // Create datasets for each distribution type
    const distributionTypes = [
        'Liquidation Preference',
        'Participation',
        'Common Distribution',
        'Additional Distribution',
        'Retained'
    ];
    
    const datasets = distributionTypes.map(type => ({
        label: type,
        data: summaryData.map(summary => summary.components[type] || 0),
        backgroundColor: getDistributionTypeColor(type),
        borderColor: getDistributionTypeColor(type, 0.8),
        borderWidth: 1
    })).filter(dataset => dataset.data.some(value => value > 0)); // Only include datasets with non-zero values
    
    summaryChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: summaryData.map(d => d.name),
            datasets: datasets
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                x: {
                    stacked: true,
                    grid: {
                        display: false
                    }
                },
                y: {
                    stacked: true,
                    beginAtZero: true,
                    ticks: {
                        callback: function(value) {
                            return '$' + value.toLocaleString();
                        }
                    }
                }
            },
            plugins: {
                tooltip: {
                    callbacks: {
                        title: function(context) {
                            const shareClass = context[0].label;
                            if (shareClass === 'Retained by Company') return 'Retained by Company';
                            
                            const sc = shareClasses.find(s => s.name === shareClass);
                            if (!sc) return shareClass;
                            
                            let title = shareClass;
                            if (sc.type === 'preferred') {
                                title += ` (${sc.prefType})`;
                                if (sc.prefType === 'participating' && sc.cap) {
                                    title += ` - ${sc.cap}x cap`;
                                }
                            }
                            return title;
                        },
                        label: function(context) {
                            const value = context.raw;
                            if (value === 0) return null;
                            const percentage = ((value / exitAmount) * 100).toFixed(1);
                            return `${context.dataset.label}: $${value.toLocaleString()} (${percentage}%)`;
                        },
                        afterBody: function(context) {
                            const shareClass = context[0].label;
                            const total = datasets.reduce((sum, dataset) => 
                                sum + (dataset.data[context[0].dataIndex] || 0), 0
                            );
                            const percentage = ((total/exitAmount)*100).toFixed(1);
                            return [`Total Payout: $${total.toLocaleString()} (${percentage}%)`];
                        }
                    }
                },
                legend: {
                    position: 'bottom',
                    labels: {
                        boxWidth: 12,
                        padding: 15
                    }
                }
            }
        }
    });
}

// Render exit distribution chart
function renderExitDistributionChart() {
    const ctx = document.getElementById('exitDistributionChart');
    if (!ctx) return;
    
    if (exitDistributionChart) {
        exitDistributionChart.destroy();
    }
    
    // Generate exit values from 0 to 2x current exit amount
    const maxExit = exitAmount * 2;
    const numPoints = 20;
    const exitDistribution = waterfallCalculator.calculateExitDistribution(
        shareClasses, 
        transactions, 
        maxExit,
        numPoints
    );
    
    // Get all unique share classes
    const activeShareClasses = [...new Set(
        shareClasses
            .filter(sc => transactions.some(tx => tx.shareClass === sc.name))
            .map(sc => sc.name)
    )];
    
    // Create datasets for each share class
    const datasets = activeShareClasses.map((className, index) => {
        const data = exitDistribution.exitValues.map((_, i) => {
            const distribution = exitDistribution.distributions[i];
            const shareData = distribution.find(d => d.name === className);
            return shareData ? shareData.payout : 0;
        });
        
        return {
            label: className,
            data: data,
            fill: false,
            borderColor: waterfallCalculator.getShareClassColor(className, index),
            backgroundColor: waterfallCalculator.getShareClassColor(className, index, 0.1),
            tension: 0.4
        };
    });
    
    exitDistributionChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: exitDistribution.exitValues.map(value => waterfallCalculator.formatCurrency(value)),
            datasets: datasets
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            interaction: {
                intersect: false,
                mode: 'index'
            },
            scales: {
                x: {
                    title: {
                        display: true,
                        text: 'Exit Value'
                    }
                },
                y: {
                    beginAtZero: true,
                    title: {
                        display: true,
                        text: 'Distribution Amount'
                    },
                    ticks: {
                        callback: value => waterfallCalculator.formatCurrency(value)
                    }
                }
            },
            plugins: {
                tooltip: {
                    enabled: true,
                    mode: 'index',
                    intersect: false,
                    callbacks: {
                        title: function(tooltipItems) {
                            return `Exit Value: ${tooltipItems[0].label}`;
                        },
                        label: function(tooltipItem) {
                            return `${tooltipItem.dataset.label}: ${waterfallCalculator.formatCurrency(tooltipItem.raw)}`;
                        }
                    }
                }
            }
        }
    });
}

// Helper function to get colors for distribution types
function getDistributionTypeColor(type, alpha = 1) {
    // Use consistent colors for each distribution type
    const colors = {
        'Liquidation Preference': `rgba(59, 130, 246, ${alpha})`, // Blue for liquidation preferences
        'Participation': `rgba(16, 185, 129, ${alpha})`, // Green for participation
        'Common Distribution': `rgba(107, 114, 128, ${alpha})`, // Gray for common
        'Additional Distribution': `rgba(168, 85, 247, ${alpha})`, // Purple for additional distributions
        'Retained': `rgba(245, 158, 11, ${alpha})` // Orange for retained distributions
    };
    return colors[type] || `rgba(107, 114, 128, ${alpha})`;
}

// Make functions globally accessible
window.addNewShareClassRow = addNewShareClassRow;
window.editShareClass = editShareClass;
window.updateShareClass = updateShareClass;
window.deleteShareClass = deleteShareClass;
window.addNewTransactionRow = addNewTransactionRow;
window.editTransaction = editTransaction;
window.updateTransaction = updateTransaction;
window.deleteTransaction = deleteTransaction;
window.closeModal = closeModal;

// Update share class field
window.updateShareClassField = function(id, field, value) {
    const shareClass = shareClasses.find(sc => sc.id === id);
    if (!shareClass) return;
    
    // Handle different field types
    switch (field) {
        case 'name':
            const oldName = shareClass.name;
            const newName = value.trim();
            if (newName === '') return;
            
            shareClass.name = newName;
            
            // Update any transactions that reference this share class
            transactions.forEach(tx => {
                if (tx.shareClass === oldName) {
                    tx.shareClass = newName;
                }
            });
            break;
            
        case 'type':
            shareClass.type = value;
            
            // Reset related fields if changing from preferred to common
            if (value === 'common') {
                shareClass.liquidationPref = 1;
                shareClass.prefType = 'non-participating';
                shareClass.cap = null;
            }
            break;
            
        case 'seniority':
            shareClass.seniority = parseInt(value) || 1;
            break;
            
        case 'liquidationPref':
            if (shareClass.type === 'preferred') {
                shareClass.liquidationPref = parseFloat(value) || 1;
            }
            break;
            
        case 'prefType':
            if (shareClass.type === 'preferred') {
                shareClass.prefType = value;
                
                // Reset cap if changing from participating to non-participating
                if (value === 'non-participating') {
                    shareClass.cap = null;
                }
            }
            break;
            
        case 'cap':
            if (shareClass.type === 'preferred' && shareClass.prefType === 'participating') {
                shareClass.cap = value !== '' ? parseFloat(value) : null;
            }
            break;
    }
    
    // Update the UI and analysis
    renderTransactions(); // Re-render transactions to update share class options
    updateWaterfallAnalysis();
};

// Update transaction field
window.updateTransactionField = function(id, field, value) {
    const transaction = transactions.find(tx => tx.id === id);
    if (!transaction) return;
    
    // Handle different field types
    switch (field) {
        case 'shareClass':
            transaction.shareClass = value;
            break;
            
        case 'shares':
            transaction.shares = typeof value === 'string' ? parseNumberWithCommas(value) : value;
            break;
            
        case 'investment':
            transaction.investment = typeof value === 'string' ? parseNumberWithCommas(value) : value;
            break;
    }
    
    // Update the analysis
    updateWaterfallAnalysis();
}; 