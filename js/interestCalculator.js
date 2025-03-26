// Interest Rate Calculator
document.addEventListener('DOMContentLoaded', function() {
    // Get DOM elements
    const interestTypeToggle = document.getElementById('interest-type-toggle');
    const compoundFrequencyGroup = document.getElementById('compound-frequency-group');
    const compoundFrequency = document.getElementById('compound-frequency');
    const initialInvestment = document.getElementById('initial-investment');
    const interestRate = document.getElementById('interest-rate');
    const interestRateSlider = document.getElementById('interest-rate-slider');
    const timePeriod = document.getElementById('time-period');
    const timePeriodSlider = document.getElementById('time-period-slider');
    const regularDepositToggle = document.getElementById('regular-deposit-toggle');
    const regularDepositOptions = document.getElementById('regular-deposit-options');
    const depositAmount = document.getElementById('deposit-amount');
    const depositFrequency = document.getElementById('deposit-frequency');
    const timeUnitBtns = document.querySelectorAll('.time-unit-btn');
    const timeUnitToggle = document.querySelector('.time-unit-toggle');
    const depositsCard = document.getElementById('deposits-card');
    
    // Summary elements
    const summaryInitial = document.getElementById('summary-initial');
    const summaryFinal = document.getElementById('summary-final');
    const summaryInterest = document.getElementById('summary-interest');
    const summaryDeposits = document.getElementById('summary-deposits');
    const resultsTableBody = document.getElementById('results-table-body');
    
    // Chart
    let growthChart = null;
    
    // State variables
    let currentTimeUnit = 'years';
    let debounceTimer = null;
    
    // Initialize the UI
    function initUI() {
        // Show/hide compound frequency based on interest type
        interestTypeToggle.addEventListener('change', function() {
            compoundFrequencyGroup.style.display = this.checked ? 'block' : 'none';
            calculate();
        });
        
        // Show/hide regular deposit options and deposits card
        regularDepositToggle.addEventListener('change', function() {
            regularDepositOptions.style.display = this.checked ? 'block' : 'none';
            updateDepositsCardVisibility(this.checked);
            calculate();
        });
        
        // Initialize deposits card visibility
        updateDepositsCardVisibility(regularDepositToggle.checked);
        
        // Initialize time unit toggle
        timeUnitBtns.forEach(btn => {
            btn.addEventListener('click', function() {
                // Update active button
                timeUnitBtns.forEach(b => b.classList.remove('active'));
                this.classList.add('active');
                
                // Update time unit and slider
                const newUnit = this.dataset.unit;
                updateTimeUnit(newUnit);
            });
        });
        
        // Sync sliders with input fields and calculate on change
        interestRateSlider.addEventListener('input', function() {
            interestRate.value = this.value;
            updateSliderValue(this, this.value + '%');
            debounceCalculate();
        });
        
        interestRate.addEventListener('input', function() {
            interestRateSlider.value = this.value;
            debounceCalculate();
        });
        
        timePeriodSlider.addEventListener('input', function() {
            timePeriod.value = this.value;
            updateSliderValue(this, this.value + ' ' + currentTimeUnit);
            debounceCalculate();
        });
        
        timePeriod.addEventListener('input', function() {
            timePeriodSlider.value = this.value;
            debounceCalculate();
        });
        
        // Live calculation for all other inputs
        const inputElements = [
            initialInvestment, depositAmount, depositFrequency, compoundFrequency
        ];
        
        inputElements.forEach(element => {
            element.addEventListener('input', debounceCalculate);
            element.addEventListener('change', calculate);
        });
        
        // Run initial calculation
        calculate();
    }
    
    // Update deposits card visibility
    function updateDepositsCardVisibility(isVisible) {
        if (isVisible) {
            depositsCard.classList.remove('hidden');
        } else {
            depositsCard.classList.add('hidden');
        }
    }
    
    // Update time unit and adjust slider accordingly
    function updateTimeUnit(newUnit) {
        const oldUnit = currentTimeUnit;
        currentTimeUnit = newUnit;
        
        // Set data attribute for CSS
        timeUnitToggle.dataset.active = newUnit;
        
        // Convert time period value based on unit change
        let oldValue = parseInt(timePeriod.value);
        let newValue, newMax;
        
        if (oldUnit === 'years' && newUnit === 'months') {
            newValue = oldValue * 12;
            newMax = 120; // 10 years in months
        } else if (oldUnit === 'years' && newUnit === 'days') {
            newValue = oldValue * 365;
            newMax = 3650; // 10 years in days
        } else if (oldUnit === 'months' && newUnit === 'years') {
            newValue = Math.max(1, Math.round(oldValue / 12));
            newMax = 50;
        } else if (oldUnit === 'months' && newUnit === 'days') {
            newValue = oldValue * 30;
            newMax = 3650;
        } else if (oldUnit === 'days' && newUnit === 'years') {
            newValue = Math.max(1, Math.round(oldValue / 365));
            newMax = 50;
        } else if (oldUnit === 'days' && newUnit === 'months') {
            newValue = Math.max(1, Math.round(oldValue / 30));
            newMax = 120;
        } else {
            newValue = oldValue;
            newMax = (newUnit === 'years') ? 50 : (newUnit === 'months') ? 120 : 3650;
        }
        
        // Update input and slider
        timePeriod.value = newValue;
        timePeriod.max = newMax;
        timePeriodSlider.value = newValue;
        timePeriodSlider.max = newMax;
        
        // Update slider steps based on unit
        if (newUnit === 'years') {
            timePeriodSlider.step = 1;
            timePeriod.step = 1;
        } else if (newUnit === 'months') {
            timePeriodSlider.step = 1;
            timePeriod.step = 1;
        } else {
            timePeriodSlider.step = 5; // Step by 5 days
            timePeriod.step = 1;
        }
        
        calculate();
    }
    
    // Update slider value tooltip
    function updateSliderValue(slider, value) {
        const sliderValue = slider.nextElementSibling;
        sliderValue.textContent = value;
        const thumbPosition = (slider.value - slider.min) / (slider.max - slider.min);
        const thumbOffset = thumbPosition * (slider.offsetWidth - 20);
        sliderValue.style.left = (thumbOffset + 10) + 'px';
        sliderValue.style.visibility = 'visible';
        sliderValue.style.opacity = '1';
    }
    
    // Debounce calculation to avoid excessive updates
    function debounceCalculate() {
        clearTimeout(debounceTimer);
        debounceTimer = setTimeout(calculate, 150);
    }
    
    // Calculate interest
    function calculate() {
        const initialAmount = parseFloat(initialInvestment.value);
        const rate = parseFloat(interestRate.value) / 100;
        let years = parseInt(timePeriod.value);
        
        // Convert time period to years based on current unit
        if (currentTimeUnit === 'months') {
            years = years / 12;
        } else if (currentTimeUnit === 'days') {
            years = years / 365;
        }
        
        const isCompound = interestTypeToggle.checked;
        const frequency = compoundFrequency.value;
        const hasRegularDeposits = regularDepositToggle.checked;
        const depositAmt = hasRegularDeposits ? parseFloat(depositAmount.value) : 0;
        const depositFreq = hasRegularDeposits ? depositFrequency.value : null;
        
        // Update deposits card visibility based on current state
        updateDepositsCardVisibility(hasRegularDeposits);
        
        if (isNaN(initialAmount) || isNaN(rate) || isNaN(years)) {
            console.warn('Invalid input values');
            return;
        }
        
        // Calculate results
        const results = calculateGrowth(initialAmount, rate, years, isCompound, frequency, hasRegularDeposits, depositAmt, depositFreq);
        
        // Update summary
        updateSummary(results);
        
        // Update chart
        updateChart(results);
        
        // Update table
        updateTable(results);
    }
    
    // Calculate investment growth
    function calculateGrowth(initial, rate, years, isCompound, frequency, hasDeposits, depositAmount, depositFrequency) {
        const results = [];
        let balance = initial;
        let totalDeposits = 0;
        let totalInterest = 0;
        
        // Determine number of compounds per year
        let compoundsPerYear = 1;
        if (isCompound) {
            switch (frequency) {
                case 'daily': compoundsPerYear = 365; break;
                case 'monthly': compoundsPerYear = 12; break;
                case 'quarterly': compoundsPerYear = 4; break;
                case 'yearly': compoundsPerYear = 1; break;
            }
        }
        
        // Determine number of deposits per year
        let depositsPerYear = 0;
        if (hasDeposits) {
            switch (depositFrequency) {
                case 'monthly': depositsPerYear = 12; break;
                case 'quarterly': depositsPerYear = 4; break;
                case 'yearly': depositsPerYear = 1; break;
            }
        }
        
        // Get whole years and fraction
        const wholeYears = Math.floor(years);
        const fraction = years - wholeYears;
        const periods = wholeYears + (fraction > 0 ? 1 : 0);
        
        for (let year = 1; year <= periods; year++) {
            // For the last period, if it's a fraction of a year
            const isPartialYear = (year === periods && fraction > 0);
            const yearFraction = isPartialYear ? fraction : 1;
            
            const startBalance = balance;
            let yearlyDeposit = 0;
            let yearlyInterest = 0;
            
            if (isCompound) {
                // Compound interest calculation with regular deposits
                if (hasDeposits) {
                    // For partial year, adjust number of deposits
                    const actualDepositsThisYear = isPartialYear 
                        ? Math.ceil(depositsPerYear * yearFraction)
                        : depositsPerYear;
                    
                    for (let i = 0; i < actualDepositsThisYear; i++) {
                        // Add deposit
                        balance += depositAmount;
                        yearlyDeposit += depositAmount;
                        
                        // For the last partial year
                        const periodsAfterDeposit = isPartialYear && i === actualDepositsThisYear - 1
                            ? (compoundsPerYear / depositsPerYear) * (yearFraction - i/depositsPerYear)
                            : compoundsPerYear / depositsPerYear;
                            
                        // Calculate interest for each compound period after deposit
                        for (let j = 0; j < periodsAfterDeposit; j++) {
                            const periodInterest = balance * (rate / compoundsPerYear);
                            balance += periodInterest;
                            yearlyInterest += periodInterest;
                        }
                    }
                } else {
                    // Compound interest without deposits
                    // For partial year, adjust number of compounds
                    const actualCompoundsThisYear = isPartialYear 
                        ? Math.ceil(compoundsPerYear * yearFraction) 
                        : compoundsPerYear;
                        
                    for (let i = 0; i < actualCompoundsThisYear; i++) {
                        const periodInterest = balance * (rate / compoundsPerYear);
                        balance += periodInterest;
                        yearlyInterest += periodInterest;
                    }
                }
            } else {
                // Simple interest calculation
                // For partial year, adjust interest rate
                yearlyInterest = startBalance * rate * yearFraction;
                balance += yearlyInterest;
                
                // Add deposits if any
                if (hasDeposits) {
                    // For partial year, adjust number of deposits
                    const actualDepositsThisYear = isPartialYear 
                        ? Math.ceil(depositsPerYear * yearFraction)
                        : depositsPerYear;
                        
                    yearlyDeposit = depositAmount * actualDepositsThisYear;
                    balance += yearlyDeposit;
                }
            }
            
            totalDeposits += yearlyDeposit;
            totalInterest += yearlyInterest;
            
            results.push({
                year,
                startBalance,
                yearlyDeposit,
                yearlyInterest,
                endBalance: balance,
                cumulativeInterest: totalInterest,
                cumulativeDeposits: totalDeposits,
                isPartialYear
            });
        }
        
        return {
            yearlyData: results,
            initialInvestment: initial,
            finalBalance: balance,
            totalInterest,
            totalDeposits
        };
    }
    
    // Update summary section
    function updateSummary(results) {
        summaryInitial.textContent = formatCurrency(results.initialInvestment);
        summaryFinal.textContent = formatCurrency(results.finalBalance);
        summaryInterest.textContent = formatCurrency(results.totalInterest);
        summaryDeposits.textContent = formatCurrency(results.totalDeposits);
    }
    
    // Update results table
    function updateTable(results) {
        resultsTableBody.innerHTML = '';
        
        // Check if we should show deposits
        const showDeposits = regularDepositToggle.checked;
        
        // Get table head for updating column visibility if needed
        const tableHead = document.querySelector('.results-table thead tr');
        const depositsHeadCell = tableHead.querySelector('th:nth-child(3)');
        
        // Show/hide deposits column in table header
        if (depositsHeadCell) {
            depositsHeadCell.style.display = showDeposits ? 'table-cell' : 'none';
        }
        
        results.yearlyData.forEach(data => {
            const row = document.createElement('tr');
            
            const yearCell = document.createElement('td');
            yearCell.textContent = data.isPartialYear 
                ? `Year ${Math.floor(data.year - 1) + 1}*` 
                : `Year ${data.year}`;
            row.appendChild(yearCell);
            
            const startBalanceCell = document.createElement('td');
            startBalanceCell.textContent = formatCurrency(data.startBalance);
            row.appendChild(startBalanceCell);
            
            const depositsCell = document.createElement('td');
            depositsCell.textContent = formatCurrency(data.yearlyDeposit);
            depositsCell.style.display = showDeposits ? 'table-cell' : 'none';
            row.appendChild(depositsCell);
            
            const interestCell = document.createElement('td');
            interestCell.textContent = formatCurrency(data.yearlyInterest);
            row.appendChild(interestCell);
            
            const endBalanceCell = document.createElement('td');
            endBalanceCell.textContent = formatCurrency(data.endBalance);
            row.appendChild(endBalanceCell);
            
            resultsTableBody.appendChild(row);
        });
        
        // Add footnote if there's a partial year
        if (results.yearlyData.some(data => data.isPartialYear)) {
            const footnoteRow = document.createElement('tr');
            footnoteRow.classList.add('footnote-row');
            
            const footnoteCell = document.createElement('td');
            footnoteCell.colSpan = 5;
            footnoteCell.style.fontSize = '12px';
            footnoteCell.style.fontStyle = 'italic';
            footnoteCell.style.color = 'var(--gray-600)';
            footnoteCell.textContent = '* Partial year calculation';
            
            footnoteRow.appendChild(footnoteCell);
            resultsTableBody.appendChild(footnoteRow);
        }
    }
    
    // Update chart visualization
    function updateChart(results) {
        const ctx = document.getElementById('growth-chart').getContext('2d');
        
        // Check if we should show deposits
        const showDeposits = regularDepositToggle.checked;
        
        // Prepare data
        const labels = results.yearlyData.map(d => d.isPartialYear 
            ? `Year ${Math.floor(d.year - 1) + 1}*` 
            : `Year ${d.year}`);
        const balances = results.yearlyData.map(d => d.endBalance);
        const initialInvestments = [results.initialInvestment];
        const deposits = results.yearlyData.map(d => d.cumulativeDeposits);
        const interests = results.yearlyData.map(d => d.cumulativeInterest);
        
        // Calculate investment portion (initial + deposits) for each year
        const investments = results.yearlyData.map(d => 
            results.initialInvestment + d.cumulativeDeposits);
        
        // Destroy previous chart if it exists
        if (growthChart) {
            growthChart.destroy();
        }
        
        // Prepare datasets
        let datasets = [
            {
                label: 'Initial Investment',
                data: investments.map(() => results.initialInvestment),
                backgroundColor: 'rgba(99, 102, 241, 0.8)',
                stack: 'stack0',
                borderWidth: 0
            },
            {
                label: 'Interest',
                data: results.yearlyData.map(d => d.cumulativeInterest),
                backgroundColor: 'rgba(34, 197, 94, 0.8)',
                stack: 'stack0',
                borderWidth: 0
            }
        ];
        
        // Only add deposits dataset if deposits are enabled
        if (showDeposits) {
            datasets.splice(1, 0, {
                label: 'Deposits',
                data: results.yearlyData.map(d => d.cumulativeDeposits),
                backgroundColor: 'rgba(236, 72, 153, 0.8)',
                stack: 'stack0',
                borderWidth: 0
            });
        }
        
        // Create new chart
        growthChart = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: labels,
                datasets: datasets
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                animation: {
                    duration: 500 // Faster animations for live updates
                },
                plugins: {
                    tooltip: {
                        callbacks: {
                            label: function(context) {
                                return context.dataset.label + ': ' + formatCurrency(context.raw);
                            },
                            footer: function(tooltipItems) {
                                const index = tooltipItems[0].dataIndex;
                                return 'Total: ' + formatCurrency(balances[index]);
                            }
                        }
                    },
                    legend: {
                        position: 'bottom'
                    },
                    title: {
                        display: true,
                        text: 'Investment Growth Over Time',
                        font: {
                            size: 16
                        }
                    }
                },
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
                                return formatCurrency(value, false);
                            }
                        }
                    }
                }
            }
        });
    }
    
    // Format currency
    function formatCurrency(value, showCents = true) {
        const formatter = new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
            minimumFractionDigits: showCents ? 2 : 0,
            maximumFractionDigits: showCents ? 2 : 0
        });
        return formatter.format(value);
    }
    
    // Initialize the app
    initUI();
}); 