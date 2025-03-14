/**
 * Waterfall Analysis Tool - Main JavaScript
 * 
 * This file contains all the client-side functionality for the waterfall analysis tool,
 * including data management, UI interactions, API calls, and chart rendering.
 */

// State management
const state = {
  shareClasses: [],
  transactions: [],
  exitValue: 10000000,
  maxExitValue: 20000000,
  detailedResults: [],
  summaryResults: [],
  chartData: null,
  nextShareClassId: 1,
  nextTransactionId: 1
};

// DOM Elements
const elements = {
  // Containers
  shareClassesContainer: document.getElementById('shareClassesContainer'),
  transactionsContainer: document.getElementById('transactionsContainer'),
  
  // Buttons
  addShareClassBtn: document.getElementById('addShareClassBtn'),
  addTransactionBtn: document.getElementById('addTransactionBtn'),
  calculateBtn: document.getElementById('calculateBtn'),
  updateChartBtn: document.getElementById('updateChartBtn'),
  
  // Inputs
  exitValueInput: document.getElementById('exitValue'),
  maxExitValueInput: document.getElementById('maxExitValue'),
  
  // Tables
  detailedTable: document.getElementById('detailedTable').querySelector('tbody'),
  summaryTable: document.getElementById('summaryTable').querySelector('tbody'),
  
  // Chart
  distributionChart: document.getElementById('distributionChart'),
  
  // Tabs
  tabButtons: document.querySelectorAll('.tab-btn'),
  tabPanes: document.querySelectorAll('.tab-pane'),
  
  // Modals
  shareClassModal: document.getElementById('shareClassModal'),
  transactionModal: document.getElementById('transactionModal'),
  
  // Forms
  shareClassForm: document.getElementById('shareClassForm'),
  transactionForm: document.getElementById('transactionForm'),
  
  // Share Class Form Fields
  shareClassId: document.getElementById('shareClassId'),
  shareClassName: document.getElementById('shareClassName'),
  shareClassType: document.getElementById('shareClassType'),
  shareClassSeniority: document.getElementById('shareClassSeniority'),
  shareClassLiquidationPref: document.getElementById('shareClassLiquidationPref'),
  shareClassPrefType: document.getElementById('shareClassPrefType'),
  shareClassCap: document.getElementById('shareClassCap'),
  
  // Transaction Form Fields
  transactionId: document.getElementById('transactionId'),
  transactionShareClass: document.getElementById('transactionShareClass'),
  transactionShares: document.getElementById('transactionShares'),
  transactionInvestment: document.getElementById('transactionInvestment'),
  
  // Modal Titles
  shareClassModalTitle: document.getElementById('shareClassModalTitle'),
  transactionModalTitle: document.getElementById('transactionModalTitle'),
  
  // Close Modal Buttons
  closeModalButtons: document.querySelectorAll('.close-modal, .cancel-modal')
};

// Templates
const templates = {
  shareClass: document.getElementById('shareClassTemplate').innerHTML,
  transaction: document.getElementById('transactionTemplate').innerHTML
};

// Chart instance
let chart = null;

// Initialize the application
function init() {
  // Fetch initial data from the server
  fetchInitialData();
  
  // Set up event listeners
  setupEventListeners();
}

// Fetch initial data from the server
async function fetchInitialData() {
  try {
    const response = await fetch('/api/initial-data');
    const data = await response.json();
    
    // Update state with initial data
    state.shareClasses = data.shareClasses;
    state.transactions = data.transactions;
    
    // Update next IDs
    state.nextShareClassId = Math.max(...state.shareClasses.map(sc => sc.id), 0) + 1;
    state.nextTransactionId = Math.max(...state.transactions.map(tx => tx.id), 0) + 1;
    
    // Render initial data
    renderShareClasses();
    renderTransactions();
    
    // Calculate initial distribution
    calculateDistribution();
  } catch (error) {
    console.error('Error fetching initial data:', error);
    
    // Load default data if fetch fails
    loadDefaultData();
  }
}

// Load default data if API fails
function loadDefaultData() {
  // Default share classes
  state.shareClasses = [
    { id: 1, name: "Series A", type: "preferred", seniority: 1, liquidationPref: 1, prefType: "participating", cap: null },
    { id: 2, name: "Series B", type: "preferred", seniority: 2, liquidationPref: 1.5, prefType: "participating", cap: 3 },
    { id: 3, name: "Common", type: "common", seniority: 3, liquidationPref: 1, prefType: "non-participating", cap: null }
  ];
  
  // Default transactions
  state.transactions = [
    { id: 1, shareClass: "Series A", shares: 1000000, investment: 1000000 },
    { id: 2, shareClass: "Series B", shares: 2000000, investment: 2000000 },
    { id: 3, shareClass: "Common", shares: 750000, investment: 0 }
  ];
  
  // Update next IDs
  state.nextShareClassId = 4;
  state.nextTransactionId = 4;
  
  // Render default data
  renderShareClasses();
  renderTransactions();
  
  // Calculate initial distribution
  calculateDistribution();
}

// Set up event listeners
function setupEventListeners() {
  // Add share class button
  elements.addShareClassBtn.addEventListener('click', () => openShareClassModal());
  
  // Add transaction button
  elements.addTransactionBtn.addEventListener('click', () => openTransactionModal());
  
  // Calculate button
  elements.calculateBtn.addEventListener('click', () => {
    state.exitValue = parseFloat(elements.exitValueInput.value) || 10000000;
    calculateDistribution();
  });
  
  // Update chart button
  elements.updateChartBtn.addEventListener('click', () => {
    state.maxExitValue = parseFloat(elements.maxExitValueInput.value) || 20000000;
    calculateExitDistribution();
  });
  
  // Tab buttons
  elements.tabButtons.forEach(button => {
    button.addEventListener('click', () => {
      const tabId = button.getAttribute('data-tab');
      switchTab(tabId);
      
      // If switching to chart tab, ensure chart is rendered
      if (tabId === 'chart' && !chart) {
        calculateExitDistribution();
      }
    });
  });
  
  // Share class form
  elements.shareClassForm.addEventListener('submit', (e) => {
    e.preventDefault();
    saveShareClass();
  });
  
  // Transaction form
  elements.transactionForm.addEventListener('submit', (e) => {
    e.preventDefault();
    saveTransaction();
  });
  
  // Share class type change (to show/hide preferred-only fields)
  elements.shareClassType.addEventListener('change', () => {
    togglePreferredFields();
  });
  
  // Close modal buttons
  elements.closeModalButtons.forEach(button => {
    button.addEventListener('click', () => {
      elements.shareClassModal.style.display = 'none';
      elements.transactionModal.style.display = 'none';
    });
  });
  
  // Close modals when clicking outside
  window.addEventListener('click', (e) => {
    if (e.target === elements.shareClassModal) {
      elements.shareClassModal.style.display = 'none';
    }
    if (e.target === elements.transactionModal) {
      elements.transactionModal.style.display = 'none';
    }
  });
  
  // Delegate event listeners for dynamic content
  document.addEventListener('click', (e) => {
    // Edit share class
    if (e.target.closest('.edit-share-class')) {
      const shareClassItem = e.target.closest('.share-class-item');
      const id = parseInt(shareClassItem.getAttribute('data-id'));
      editShareClass(id);
    }
    
    // Delete share class
    if (e.target.closest('.delete-share-class')) {
      const shareClassItem = e.target.closest('.share-class-item');
      const id = parseInt(shareClassItem.getAttribute('data-id'));
      deleteShareClass(id);
    }
    
    // Edit transaction
    if (e.target.closest('.edit-transaction')) {
      const transactionItem = e.target.closest('.transaction-item');
      const id = parseInt(transactionItem.getAttribute('data-id'));
      editTransaction(id);
    }
    
    // Delete transaction
    if (e.target.closest('.delete-transaction')) {
      const transactionItem = e.target.closest('.transaction-item');
      const id = parseInt(transactionItem.getAttribute('data-id'));
      deleteTransaction(id);
    }
  });
}

// Render share classes
function renderShareClasses() {
  elements.shareClassesContainer.innerHTML = '';
  
  state.shareClasses.forEach(shareClass => {
    const html = templates.shareClass
      .replace('{id}', shareClass.id)
      .replace('{name}', shareClass.name)
      .replace('{type}', shareClass.type === 'preferred' ? 'Preferred' : 'Common')
      .replace('{seniority}', shareClass.seniority)
      .replace('{liquidationPref}', shareClass.liquidationPref)
      .replace('{prefType}', shareClass.prefType === 'participating' ? 'Participating' : 'Non-Participating')
      .replace('{cap}', shareClass.cap ? `${shareClass.cap}x` : 'None');
    
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = html;
    elements.shareClassesContainer.appendChild(tempDiv.firstElementChild);
  });
  
  // Update transaction share class options
  updateTransactionShareClassOptions();
}

// Render transactions
function renderTransactions() {
  elements.transactionsContainer.innerHTML = '';
  
  state.transactions.forEach(transaction => {
    const html = templates.transaction
      .replace('{id}', transaction.id)
      .replace('{shareClass}', transaction.shareClass)
      .replace('{shares}', transaction.shares.toLocaleString())
      .replace('{investment}', transaction.investment.toLocaleString());
    
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = html;
    elements.transactionsContainer.appendChild(tempDiv.firstElementChild);
  });
}

// Update transaction share class options
function updateTransactionShareClassOptions() {
  const select = elements.transactionShareClass;
  select.innerHTML = '';
  
  state.shareClasses.forEach(shareClass => {
    const option = document.createElement('option');
    option.value = shareClass.name;
    option.textContent = shareClass.name;
    select.appendChild(option);
  });
}

// Open share class modal for adding
function openShareClassModal(shareClass = null) {
  // Reset form
  elements.shareClassForm.reset();
  
  if (shareClass) {
    // Edit mode
    elements.shareClassModalTitle.textContent = 'Edit Share Class';
    elements.shareClassId.value = shareClass.id;
    elements.shareClassName.value = shareClass.name;
    elements.shareClassType.value = shareClass.type;
    elements.shareClassSeniority.value = shareClass.seniority;
    elements.shareClassLiquidationPref.value = shareClass.liquidationPref;
    elements.shareClassPrefType.value = shareClass.prefType || 'participating';
    elements.shareClassCap.value = shareClass.cap || '';
  } else {
    // Add mode
    elements.shareClassModalTitle.textContent = 'Add Share Class';
    elements.shareClassId.value = '';
    elements.shareClassType.value = 'preferred';
  }
  
  // Show/hide preferred-only fields
  togglePreferredFields();
  
  // Show modal
  elements.shareClassModal.style.display = 'block';
}

// Open transaction modal for adding
function openTransactionModal(transaction = null) {
  // Reset form
  elements.transactionForm.reset();
  
  if (transaction) {
    // Edit mode
    elements.transactionModalTitle.textContent = 'Edit Transaction';
    elements.transactionId.value = transaction.id;
    elements.transactionShareClass.value = transaction.shareClass;
    elements.transactionShares.value = transaction.shares;
    elements.transactionInvestment.value = transaction.investment;
  } else {
    // Add mode
    elements.transactionModalTitle.textContent = 'Add Transaction';
    elements.transactionId.value = '';
    
    // Set default values
    if (state.shareClasses.length > 0) {
      elements.transactionShareClass.value = state.shareClasses[0].name;
    }
  }
  
  // Show modal
  elements.transactionModal.style.display = 'block';
}

// Toggle preferred-only fields based on share class type
function togglePreferredFields() {
  const isPreferred = elements.shareClassType.value === 'preferred';
  const preferredFields = document.querySelectorAll('.preferred-only');
  
  preferredFields.forEach(field => {
    field.style.display = isPreferred ? 'block' : 'none';
  });
}

// Save share class
function saveShareClass() {
  const id = elements.shareClassId.value ? parseInt(elements.shareClassId.value) : state.nextShareClassId++;
  const name = elements.shareClassName.value;
  const type = elements.shareClassType.value;
  const seniority = parseInt(elements.shareClassSeniority.value);
  const liquidationPref = parseFloat(elements.shareClassLiquidationPref.value);
  const prefType = type === 'preferred' ? elements.shareClassPrefType.value : 'non-participating';
  const cap = type === 'preferred' && elements.shareClassCap.value ? parseFloat(elements.shareClassCap.value) : null;
  
  const shareClass = {
    id,
    name,
    type,
    seniority,
    liquidationPref,
    prefType,
    cap
  };
  
  // Check if editing or adding
  const existingIndex = state.shareClasses.findIndex(sc => sc.id === id);
  if (existingIndex !== -1) {
    // Update existing
    state.shareClasses[existingIndex] = shareClass;
  } else {
    // Add new
    state.shareClasses.push(shareClass);
  }
  
  // Close modal
  elements.shareClassModal.style.display = 'none';
  
  // Render share classes
  renderShareClasses();
  
  // Recalculate distribution
  calculateDistribution();
}

// Save transaction
function saveTransaction() {
  const id = elements.transactionId.value ? parseInt(elements.transactionId.value) : state.nextTransactionId++;
  const shareClass = elements.transactionShareClass.value;
  const shares = parseFloat(elements.transactionShares.value);
  const investment = parseFloat(elements.transactionInvestment.value);
  
  const transaction = {
    id,
    shareClass,
    shares,
    investment
  };
  
  // Check if editing or adding
  const existingIndex = state.transactions.findIndex(tx => tx.id === id);
  if (existingIndex !== -1) {
    // Update existing
    state.transactions[existingIndex] = transaction;
  } else {
    // Add new
    state.transactions.push(transaction);
  }
  
  // Close modal
  elements.transactionModal.style.display = 'none';
  
  // Render transactions
  renderTransactions();
  
  // Recalculate distribution
  calculateDistribution();
}

// Edit share class
function editShareClass(id) {
  const shareClass = state.shareClasses.find(sc => sc.id === id);
  if (shareClass) {
    openShareClassModal(shareClass);
  }
}

// Delete share class
function deleteShareClass(id) {
  if (confirm('Are you sure you want to delete this share class? This will also delete any transactions associated with it.')) {
    // Remove share class
    state.shareClasses = state.shareClasses.filter(sc => sc.id !== id);
    
    // Remove associated transactions
    const shareClassName = state.shareClasses.find(sc => sc.id === id)?.name;
    if (shareClassName) {
      state.transactions = state.transactions.filter(tx => tx.shareClass !== shareClassName);
    }
    
    // Render share classes and transactions
    renderShareClasses();
    renderTransactions();
    
    // Recalculate distribution
    calculateDistribution();
  }
}

// Edit transaction
function editTransaction(id) {
  const transaction = state.transactions.find(tx => tx.id === id);
  if (transaction) {
    openTransactionModal(transaction);
  }
}

// Delete transaction
function deleteTransaction(id) {
  if (confirm('Are you sure you want to delete this transaction?')) {
    // Remove transaction
    state.transactions = state.transactions.filter(tx => tx.id !== id);
    
    // Render transactions
    renderTransactions();
    
    // Recalculate distribution
    calculateDistribution();
  }
}

// Switch tab
function switchTab(tabId) {
  // Update active tab button
  elements.tabButtons.forEach(button => {
    button.classList.toggle('active', button.getAttribute('data-tab') === tabId);
  });
  
  // Update active tab pane
  elements.tabPanes.forEach(pane => {
    pane.classList.toggle('active', pane.id === tabId);
  });
}

// Calculate distribution
async function calculateDistribution() {
  try {
    const response = await fetch('/api/calculate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        shareClasses: state.shareClasses,
        transactions: state.transactions,
        exitAmount: state.exitValue
      })
    });
    
    const data = await response.json();
    
    // Update state
    state.detailedResults = data.detailed;
    state.summaryResults = data.summary;
    
    // Render results
    renderDetailedResults();
    renderSummaryResults();
  } catch (error) {
    console.error('Error calculating distribution:', error);
    alert('Error calculating distribution. Please try again.');
  }
}

// Calculate exit distribution for chart
async function calculateExitDistribution() {
  try {
    const response = await fetch('/api/calculate-exit-distribution', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        shareClasses: state.shareClasses,
        transactions: state.transactions,
        maxExitAmount: state.maxExitValue
      })
    });
    
    const data = await response.json();
    
    // Update state
    state.chartData = data;
    
    // Render chart
    renderChart();
  } catch (error) {
    console.error('Error calculating exit distribution:', error);
    alert('Error calculating exit distribution. Please try again.');
  }
}

// Render detailed results
function renderDetailedResults() {
  elements.detailedTable.innerHTML = '';
  
  state.detailedResults.forEach((result, index) => {
    const row = document.createElement('tr');
    
    // Add CSS class for starting row
    if (result.isStarting) {
      row.classList.add('starting-row');
    }
    
    // Step column
    const stepCell = document.createElement('td');
    stepCell.textContent = result.isStarting ? 'Start' : index;
    row.appendChild(stepCell);
    
    // Description column
    const descCell = document.createElement('td');
    descCell.textContent = result.description || result.name;
    row.appendChild(descCell);
    
    // Amount column
    const amountCell = document.createElement('td');
    amountCell.textContent = formatCurrency(result.value);
    amountCell.classList.add(result.value < 0 ? 'negative' : 'positive');
    row.appendChild(amountCell);
    
    // Remaining column
    const remainingCell = document.createElement('td');
    remainingCell.textContent = formatCurrency(result.remainingProceeds);
    row.appendChild(remainingCell);
    
    elements.detailedTable.appendChild(row);
  });
}

// Render summary results
function renderSummaryResults() {
  elements.summaryTable.innerHTML = '';
  
  state.summaryResults.forEach(result => {
    const row = document.createElement('tr');
    
    // Share class column
    const classCell = document.createElement('td');
    classCell.textContent = result.name;
    row.appendChild(classCell);
    
    // Total payout column
    const payoutCell = document.createElement('td');
    payoutCell.textContent = formatCurrency(result.payout);
    row.appendChild(payoutCell);
    
    // Percentage column
    const percentCell = document.createElement('td');
    percentCell.textContent = `${result.percentage}%`;
    row.appendChild(percentCell);
    
    // Components column
    const componentsCell = document.createElement('td');
    const componentsList = document.createElement('ul');
    componentsList.classList.add('components-list');
    
    Object.entries(result.components).forEach(([type, amount]) => {
      if (amount > 0) {
        const item = document.createElement('li');
        item.textContent = `${type}: ${formatCurrency(amount)}`;
        componentsList.appendChild(item);
      }
    });
    
    componentsCell.appendChild(componentsList);
    row.appendChild(componentsCell);
    
    elements.summaryTable.appendChild(row);
  });
}

// Render chart
function renderChart() {
  if (!state.chartData) return;
  
  const ctx = elements.distributionChart.getContext('2d');
  
  // Destroy existing chart if it exists
  if (chart) {
    chart.destroy();
  }
  
  // Prepare datasets
  const datasets = state.chartData.activeShareClasses.map((className, index) => {
    const color = getShareClassColor(className, index);
    
    return {
      label: className,
      data: state.chartData.distributions.map(dist => dist[index]),
      backgroundColor: color,
      borderColor: color,
      borderWidth: 2,
      fill: true
    };
  });
  
  // Create stacked area chart
  chart = new Chart(ctx, {
    type: 'line',
    data: {
      labels: state.chartData.exitValues.map(formatCurrency),
      datasets
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      scales: {
        x: {
          title: {
            display: true,
            text: 'Exit Value'
          }
        },
        y: {
          stacked: true,
          title: {
            display: true,
            text: 'Distribution Amount'
          },
          ticks: {
            callback: value => formatCurrency(value)
          }
        }
      },
      plugins: {
        tooltip: {
          callbacks: {
            label: context => {
              const label = context.dataset.label || '';
              const value = context.parsed.y;
              return `${label}: ${formatCurrency(value)}`;
            }
          }
        }
      }
    }
  });
}

// Format currency
function formatCurrency(value) {
  return '$' + Math.abs(value).toLocaleString();
}

// Get color for a share class
function getShareClassColor(className, index) {
  const colors = {
    'Common': 'rgba(168, 85, 247, 0.7)', // Purple
    'Series A': 'rgba(59, 130, 246, 0.7)', // Blue
    'Series B': 'rgba(16, 185, 129, 0.7)', // Green
    'Series C': 'rgba(245, 158, 11, 0.7)', // Orange
    'Series D': 'rgba(239, 68, 68, 0.7)', // Red
  };
  
  return colors[className] || `hsla(${index * 137.5}, 70%, 50%, 0.7)`;
}

// Initialize the application when the DOM is loaded
document.addEventListener('DOMContentLoaded', init); 