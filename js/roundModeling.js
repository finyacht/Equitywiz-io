document.addEventListener('DOMContentLoaded', function() {
  // DOM Elements - Funding Calculator
  const methodPreMoney = document.getElementById('method-pre-money');
  const methodPercentage = document.getElementById('method-percentage');
  const premoneyInput = document.getElementById('pre-money-valuation');
  const investmentInput = document.getElementById('investment-amount');
  const ownershipInput = document.getElementById('target-ownership');
  const postMoneyResult = document.getElementById('post-money-result');
  const newOwnershipResult = document.getElementById('new-ownership-result');
  const dilutionResult = document.getElementById('dilution-result');

  // DOM Elements - Charts
  const ownershipChart = document.getElementById('ownership-chart');
  const dilutionChart = document.getElementById('dilution-chart');

  // DOM Elements - Notes
  const addNoteButton = document.getElementById('add-note');
  const noteModal = document.getElementById('note-modal');
  const notesContainer = document.getElementById('notes-container');
  const notesEmptyState = document.getElementById('notes-empty-state');
  const saveNoteButton = document.getElementById('save-note');

  // DOM Elements - SAFEs
  const addSafeButton = document.getElementById('add-safe');
  const safeModal = document.getElementById('safe-modal');
  const safesContainer = document.getElementById('safes-container');
  const safesEmptyState = document.getElementById('safes-empty-state');
  const saveSafeButton = document.getElementById('save-safe');
  const safeTypeSelect = document.getElementById('safe-type');
  const safeCapGroup = document.getElementById('safe-cap-group');
  const safeDiscountGroup = document.getElementById('safe-discount-group');

  // DOM Elements - Chatbot
  const chatbotToggle = document.getElementById('chatbot-toggle');
  const chatbotModal = document.getElementById('chatbot-modal');
  const closeButton = document.getElementById('close-chatbot');
  const sendButton = document.getElementById('send-message');
  const chatInput = document.getElementById('chat-input');
  const chatMessages = document.getElementById('chat-messages');

  // Close modal buttons
  const closeButtons = document.querySelectorAll('.close-modal, .btn-cancel');

  // Storage for notes and SAFEs
  let notes = [];
  let safes = [];

  // Chart instances
  let ownershipChartInstance = null;
  let dilutionChartInstance = null;

  // Initialize the application
  function init() {
    initializeCharts();
    setupEventListeners();
    calculateRound();
  }

  // Initialize charts
  function initializeCharts() {
    // Ownership Chart
    ownershipChartInstance = new Chart(ownershipChart, {
      type: 'doughnut',
      data: {
        labels: ['Existing Shareholders', 'New Investors'],
        datasets: [{
          data: [83.33, 16.67],
          backgroundColor: ['#4CAF50', '#2196F3'],
          borderWidth: 0
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: 'bottom'
          },
          tooltip: {
            callbacks: {
              label: function(context) {
                return context.label + ': ' + context.raw + '%';
              }
            }
          }
        }
      }
    });

    // Dilution Chart
    dilutionChartInstance = new Chart(dilutionChart, {
      type: 'bar',
      data: {
        labels: ['Before', 'After'],
        datasets: [{
          label: 'Ownership Percentage',
          data: [100, 83.33],
          backgroundColor: ['#4CAF50', '#4CAF50'],
          borderWidth: 0
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          y: {
            beginAtZero: true,
            max: 100,
            ticks: {
              callback: function(value) {
                return value + '%';
              }
            }
          }
        },
        plugins: {
          legend: {
            display: false
          },
          tooltip: {
            callbacks: {
              label: function(context) {
                return 'Existing shareholders: ' + context.raw + '%';
              }
            }
          }
        }
      }
    });
  }

  // Setup event listeners
  function setupEventListeners() {
    // Calculation method toggle
    methodPreMoney.addEventListener('change', toggleCalculationMethod);
    methodPercentage.addEventListener('change', toggleCalculationMethod);

    // Input fields
    premoneyInput.addEventListener('input', handleInputChange);
    investmentInput.addEventListener('input', handleInputChange);
    ownershipInput.addEventListener('input', handleInputChange);

    // Add Note button
    addNoteButton.addEventListener('click', function() {
      noteModal.style.display = 'flex';
    });

    // Add SAFE button
    addSafeButton.addEventListener('click', function() {
      safeModal.style.display = 'flex';
    });

    // Save Note button
    saveNoteButton.addEventListener('click', saveNote);

    // Save SAFE button
    saveSafeButton.addEventListener('click', saveSafe);

    // SAFE type select change
    safeTypeSelect.addEventListener('change', function() {
      updateSafeFields();
    });

    // Close modal buttons
    closeButtons.forEach(button => {
      button.addEventListener('click', function() {
        noteModal.style.display = 'none';
        safeModal.style.display = 'none';
      });
    });

    // Chatbot toggle
    chatbotToggle.addEventListener('click', function() {
      chatbotModal.classList.toggle('visible');
    });

    // Close chatbot
    closeButton.addEventListener('click', function() {
      chatbotModal.classList.remove('visible');
    });

    // Send message
    sendButton.addEventListener('click', sendChatMessage);
    chatInput.addEventListener('keypress', function(e) {
      if (e.key === 'Enter') {
        sendChatMessage();
      }
    });

    // Format inputs as currency
    premoneyInput.addEventListener('blur', function() {
      this.value = formatCurrency(this.value);
    });
    investmentInput.addEventListener('blur', function() {
      this.value = formatCurrency(this.value);
    });
  }

  // Toggle calculation method (pre-money vs percentage)
  function toggleCalculationMethod() {
    if (methodPreMoney.checked) {
      premoneyInput.disabled = false;
      investmentInput.disabled = false;
      ownershipInput.disabled = true;
    } else {
      premoneyInput.disabled = true;
      investmentInput.disabled = false;
      ownershipInput.disabled = false;
    }
    calculateRound();
  }

  // Handle input changes
  function handleInputChange(e) {
    // Remove non-numeric characters for calculations
    if (e.target.id === 'pre-money-valuation' || e.target.id === 'investment-amount') {
      e.target.value = e.target.value.replace(/[^0-9.,]/g, '');
    }
    calculateRound();
  }

  // Calculate round metrics
  function calculateRound() {
    let preMoney = parseFloat(premoneyInput.value.replace(/[^0-9.]/g, '')) || 0;
    let investment = parseFloat(investmentInput.value.replace(/[^0-9.]/g, '')) || 0;
    let targetOwnership = parseFloat(ownershipInput.value) || 0;
    
    let postMoney, newOwnership, dilution;
    
    if (methodPreMoney.checked) {
      // Calculate based on pre-money valuation and investment amount
      postMoney = preMoney + investment;
      newOwnership = investment / postMoney * 100;
      dilution = newOwnership;
    } else {
      // Calculate based on target ownership percentage and investment amount
      if (targetOwnership >= 100) {
        targetOwnership = 99.99; // Prevent division by zero
      }
      postMoney = investment * 100 / targetOwnership;
      preMoney = postMoney - investment;
      newOwnership = targetOwnership;
      dilution = newOwnership;
      
      // Update pre-money input field
      premoneyInput.value = formatCurrency(preMoney);
    }
    
    // Update results
    postMoneyResult.textContent = formatCurrency(postMoney);
    newOwnershipResult.textContent = newOwnership.toFixed(2) + '%';
    dilutionResult.textContent = dilution.toFixed(2) + '%';
    
    // Update charts
    updateCharts(newOwnership);
  }

  // Update charts with new data
  function updateCharts(newOwnership) {
    const existingOwnership = 100 - newOwnership;
    
    // Update ownership chart
    ownershipChartInstance.data.datasets[0].data = [existingOwnership, newOwnership];
    ownershipChartInstance.update();
    
    // Update dilution chart
    dilutionChartInstance.data.datasets[0].data = [100, existingOwnership];
    dilutionChartInstance.update();
  }

  // Save note function
  function saveNote() {
    const noteName = document.getElementById('note-name').value;
    const noteAmount = document.getElementById('note-amount').value;
    const noteInterest = document.getElementById('note-interest').value;
    const noteDiscount = document.getElementById('note-discount').value;
    const noteCap = document.getElementById('note-cap').value;
    const noteMaturity = document.getElementById('note-maturity').value;
    
    if (!noteName || !noteAmount) {
      alert('Please enter a name and amount for the note.');
      return;
    }
    
    const note = {
      id: Date.now(),
      name: noteName,
      amount: parseFloat(noteAmount.replace(/[^0-9.]/g, '')),
      interest: parseFloat(noteInterest) || 0,
      discount: parseFloat(noteDiscount) || 0,
      cap: parseFloat(noteCap.replace(/[^0-9.]/g, '')) || 0,
      maturity: parseInt(noteMaturity) || 24,
      date: new Date().toISOString()
    };
    
    notes.push(note);
    renderNotes();
    noteModal.style.display = 'none';
    
    // Reset form
    document.getElementById('note-name').value = '';
    document.getElementById('note-amount').value = '';
    document.getElementById('note-interest').value = '';
    document.getElementById('note-discount').value = '';
    document.getElementById('note-cap').value = '';
    document.getElementById('note-maturity').value = '';
  }

  // Save SAFE function
  function saveSafe() {
    const safeName = document.getElementById('safe-name').value;
    const safeAmount = document.getElementById('safe-amount').value;
    const safeType = document.getElementById('safe-type').value;
    const safeCap = document.getElementById('safe-cap').value;
    const safeDiscount = document.getElementById('safe-discount').value;
    const safeProRata = document.getElementById('safe-pro-rata').value;
    
    if (!safeName || !safeAmount) {
      alert('Please enter a name and amount for the SAFE.');
      return;
    }
    
    const safe = {
      id: Date.now(),
      name: safeName,
      amount: parseFloat(safeAmount.replace(/[^0-9.]/g, '')),
      type: safeType,
      cap: parseFloat(safeCap.replace(/[^0-9.]/g, '')) || 0,
      discount: parseFloat(safeDiscount) || 0,
      proRata: safeProRata === 'yes',
      date: new Date().toISOString()
    };
    
    safes.push(safe);
    renderSafes();
    safeModal.style.display = 'none';
    
    // Reset form
    document.getElementById('safe-name').value = '';
    document.getElementById('safe-amount').value = '';
    document.getElementById('safe-type').value = 'cap-no-discount';
    document.getElementById('safe-cap').value = '';
    document.getElementById('safe-discount').value = '';
    document.getElementById('safe-pro-rata').value = 'no';
    updateSafeFields();
  }

  // Update SAFE modal fields based on selected type
  function updateSafeFields() {
    const safeType = safeTypeSelect.value;
    
    if (safeType === 'cap-no-discount' || safeType === 'cap-and-discount') {
      safeCapGroup.style.display = 'block';
    } else {
      safeCapGroup.style.display = 'none';
    }
    
    if (safeType === 'discount-no-cap' || safeType === 'cap-and-discount') {
      safeDiscountGroup.style.display = 'block';
    } else {
      safeDiscountGroup.style.display = 'none';
    }
    
    if (safeType === 'mfn') {
      safeCapGroup.style.display = 'none';
      safeDiscountGroup.style.display = 'none';
    }
  }

  // Render notes
  function renderNotes() {
    if (notes.length === 0) {
      notesEmptyState.style.display = 'block';
      return;
    }
    
    notesEmptyState.style.display = 'none';
    let html = '';
    
    notes.forEach(note => {
      html += `
        <div class="card-item" data-id="${note.id}">
          <div class="card-item-header">
            <h4>${note.name}</h4>
            <div class="card-item-actions">
              <button class="btn-edit" onclick="editNote(${note.id})">
                <i class="fas fa-edit"></i>
              </button>
              <button class="btn-delete" onclick="deleteNote(${note.id})">
                <i class="fas fa-trash"></i>
              </button>
            </div>
          </div>
          <div class="card-item-details">
            <div class="detail-row">
              <span class="detail-label">Amount:</span>
              <span class="detail-value">${formatCurrency(note.amount)}</span>
            </div>
            <div class="detail-row">
              <span class="detail-label">Interest Rate:</span>
              <span class="detail-value">${note.interest}%</span>
            </div>
            <div class="detail-row">
              <span class="detail-label">Discount:</span>
              <span class="detail-value">${note.discount}%</span>
            </div>
            <div class="detail-row">
              <span class="detail-label">Valuation Cap:</span>
              <span class="detail-value">${note.cap ? formatCurrency(note.cap) : 'None'}</span>
            </div>
            <div class="detail-row">
              <span class="detail-label">Term:</span>
              <span class="detail-value">${note.maturity} months</span>
            </div>
          </div>
        </div>
      `;
    });
    
    notesContainer.innerHTML = html;
  }

  // Render SAFEs
  function renderSafes() {
    if (safes.length === 0) {
      safesEmptyState.style.display = 'block';
      return;
    }
    
    safesEmptyState.style.display = 'none';
    let html = '';
    
    safes.forEach(safe => {
      let typeText = '';
      switch (safe.type) {
        case 'cap-no-discount':
          typeText = 'Valuation Cap Only';
          break;
        case 'discount-no-cap':
          typeText = 'Discount Only';
          break;
        case 'cap-and-discount':
          typeText = 'Valuation Cap & Discount';
          break;
        case 'mfn':
          typeText = 'MFN';
          break;
      }
      
      html += `
        <div class="card-item" data-id="${safe.id}">
          <div class="card-item-header">
            <h4>${safe.name}</h4>
            <div class="card-item-actions">
              <button class="btn-edit" onclick="editSafe(${safe.id})">
                <i class="fas fa-edit"></i>
              </button>
              <button class="btn-delete" onclick="deleteSafe(${safe.id})">
                <i class="fas fa-trash"></i>
              </button>
            </div>
          </div>
          <div class="card-item-details">
            <div class="detail-row">
              <span class="detail-label">Amount:</span>
              <span class="detail-value">${formatCurrency(safe.amount)}</span>
            </div>
            <div class="detail-row">
              <span class="detail-label">Type:</span>
              <span class="detail-value">${typeText}</span>
            </div>
            ${safe.cap ? `
            <div class="detail-row">
              <span class="detail-label">Valuation Cap:</span>
              <span class="detail-value">${formatCurrency(safe.cap)}</span>
            </div>
            ` : ''}
            ${safe.discount ? `
            <div class="detail-row">
              <span class="detail-label">Discount:</span>
              <span class="detail-value">${safe.discount}%</span>
            </div>
            ` : ''}
            <div class="detail-row">
              <span class="detail-label">Pro-rata:</span>
              <span class="detail-value">${safe.proRata ? 'Yes' : 'No'}</span>
            </div>
          </div>
        </div>
      `;
    });
    
    safesContainer.innerHTML = html;
  }

  // Format currency
  function formatCurrency(value) {
    if (!value) return '$0';
    
    const numValue = parseFloat(value.toString().replace(/[^0-9.]/g, ''));
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(numValue);
  }

  // Send chat message
  function sendChatMessage() {
    const message = chatInput.value.trim();
    if (!message) return;
    
    // Add user message to chat
    appendMessage('user', message);
    chatInput.value = '';
    
    // Process the user message and get a response
    processUserMessage(message);
  }

  // Process user message and get response
  function processUserMessage(message) {
    // Show typing indicator
    const typingIndicator = document.createElement('div');
    typingIndicator.className = 'message bot-message typing';
    typingIndicator.innerHTML = 'Typing...';
    chatMessages.appendChild(typingIndicator);
    chatMessages.scrollTop = chatMessages.scrollHeight;
    
    // This is where you would integrate with the Gemini API
    // For now, we'll use a simple hardcoded response system
    setTimeout(() => {
      chatMessages.removeChild(typingIndicator);
      
      let response = '';
      
      // Simple pattern matching for demo purposes
      const lowerMessage = message.toLowerCase();
      
      if (lowerMessage.includes('safe') && lowerMessage.includes('what')) {
        response = "A SAFE (Simple Agreement for Future Equity) is an investment instrument that allows investors to fund startups in exchange for the right to purchase equity in a future equity round.";
      } else if (lowerMessage.includes('valuation cap')) {
        response = "A valuation cap sets the maximum valuation at which the investment converts to equity, giving investors a minimum equity stake regardless of the valuation in a future round.";
      } else if (lowerMessage.includes('discount')) {
        response = "A discount gives investors shares at a reduced price compared to new investors, typically ranging from 10-30% off the price per share in a future financing round.";
      } else if (lowerMessage.includes('dilution') || lowerMessage.includes('diluted')) {
        response = "Dilution occurs when new shares are issued, reducing the ownership percentage of existing shareholders. It's a normal part of raising capital through equity financing.";
      } else if (lowerMessage.includes('convertible note') || lowerMessage.includes('note')) {
        response = "A convertible note is a debt instrument that converts to equity upon a triggering event, usually a future financing round. It includes an interest rate, maturity date, and may have a valuation cap and/or discount.";
      } else if (lowerMessage.includes('pre-money') || lowerMessage.includes('post-money')) {
        response = "Pre-money valuation is the company's value before receiving funding. Post-money valuation is pre-money plus the new investment amount. The formula is: Post-money = Pre-money + Investment.";
      } else if (lowerMessage.includes('pro rata') || lowerMessage.includes('pro-rata')) {
        response = "Pro-rata rights allow investors to maintain their ownership percentage in future rounds by participating at the same rate as their current ownership.";
      } else if (lowerMessage.includes('hello') || lowerMessage.includes('hi')) {
        response = "Hello! How can I help you with round modeling, SAFEs, or convertible notes today?";
      } else {
        response = "I'm not sure how to answer that specifically. Would you like to know more about SAFEs, convertible notes, or equity funding rounds?";
      }
      
      appendMessage('bot', response);
    }, 1000);
  }

  // Append message to chat
  function appendMessage(sender, message) {
    const messageElement = document.createElement('div');
    messageElement.className = `message ${sender}-message`;
    messageElement.textContent = message;
    chatMessages.appendChild(messageElement);
    chatMessages.scrollTop = chatMessages.scrollHeight;
  }

  // Global functions (needed for onclick actions)
  window.editNote = function(id) {
    const note = notes.find(n => n.id === id);
    if (!note) return;
    
    document.getElementById('note-name').value = note.name;
    document.getElementById('note-amount').value = note.amount;
    document.getElementById('note-interest').value = note.interest;
    document.getElementById('note-discount').value = note.discount;
    document.getElementById('note-cap').value = note.cap;
    document.getElementById('note-maturity').value = note.maturity;
    
    // Remove the old note
    notes = notes.filter(n => n.id !== id);
    
    // Show the modal
    noteModal.style.display = 'flex';
  };
  
  window.deleteNote = function(id) {
    if (confirm('Are you sure you want to delete this note?')) {
      notes = notes.filter(n => n.id !== id);
      renderNotes();
    }
  };
  
  window.editSafe = function(id) {
    const safe = safes.find(s => s.id === id);
    if (!safe) return;
    
    document.getElementById('safe-name').value = safe.name;
    document.getElementById('safe-amount').value = safe.amount;
    document.getElementById('safe-type').value = safe.type;
    document.getElementById('safe-cap').value = safe.cap;
    document.getElementById('safe-discount').value = safe.discount;
    document.getElementById('safe-pro-rata').value = safe.proRata ? 'yes' : 'no';
    
    updateSafeFields();
    
    // Remove the old safe
    safes = safes.filter(s => s.id !== id);
    
    // Show the modal
    safeModal.style.display = 'flex';
  };
  
  window.deleteSafe = function(id) {
    if (confirm('Are you sure you want to delete this SAFE?')) {
      safes = safes.filter(s => s.id !== id);
      renderSafes();
    }
  };

  // Initialize the application
  init();
}); 