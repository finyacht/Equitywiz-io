/**
 * Netflix Option Calculator
 * Calculates comparison between purchasing Netflix stock vs options
 */

class NetflixOptionCalculator {
    constructor() {
        this.initialInvestment = 1000;
        this.currentStockPrice = 500;
        this.optionDiscount = 0.4; // Options cost 40% of current stock price
        this.exercisePrice = this.currentStockPrice; // Options exercise at current price
        this.yearsToProject = 10;
        this.annualGrowthRate = 0.1; // 10% annual growth
        this.taxRate = 0.33; // 33% tax rate for capital gains
    }

    /**
     * Set the initial parameters
     */
    setParameters(initialInvestment, currentStockPrice, optionDiscount, yearsToProject, annualGrowthRate, taxRate) {
        this.initialInvestment = initialInvestment || this.initialInvestment;
        this.currentStockPrice = currentStockPrice || this.currentStockPrice;
        this.optionDiscount = optionDiscount || this.optionDiscount;
        this.exercisePrice = this.currentStockPrice; // Exercise price is set to current stock price at purchase
        this.yearsToProject = yearsToProject || this.yearsToProject;
        this.annualGrowthRate = annualGrowthRate || this.annualGrowthRate;
        this.taxRate = taxRate || this.taxRate;
    }

    /**
     * Calculate number of shares that can be purchased with the initial investment
     */
    getShareCount() {
        return this.initialInvestment / this.currentStockPrice;
    }

    /**
     * Calculate number of options that can be purchased
     */
    getOptionCount() {
        const optionPrice = this.currentStockPrice * this.optionDiscount;
        return this.initialInvestment / optionPrice;
    }

    /**
     * Calculate the value of stock at a given stock price
     */
    calculateStockValue(stockPrice) {
        const shareCount = this.getShareCount();
        return shareCount * stockPrice;
    }

    /**
     * Calculate the value of options at a given stock price
     */
    calculateOptionValue(stockPrice) {
        const optionCount = this.getOptionCount();
        const intrinsicValue = Math.max(0, stockPrice - this.exercisePrice);
        return optionCount * intrinsicValue;
    }

    /**
     * Calculate rate of return for stock at a given price
     */
    calculateStockReturn(stockPrice) {
        const initialValue = this.initialInvestment;
        const currentValue = this.calculateStockValue(stockPrice);
        return (currentValue - initialValue) / initialValue;
    }

    /**
     * Calculate rate of return for options at a given price
     */
    calculateOptionReturn(stockPrice) {
        const initialValue = this.initialInvestment;
        const currentValue = this.calculateOptionValue(stockPrice);
        return (currentValue - initialValue) / initialValue;
    }

    /**
     * Calculate break-even price for options
     */
    calculateBreakEvenPrice() {
        // Need stock to rise by 40% just to break even
        return this.exercisePrice * 1.4;
    }

    /**
     * Calculate the price at which options outperform stock
     */
    calculateOutperformPrice() {
        // Need stock to rise by ~67% for options to outperform stock
        return this.exercisePrice * (1 + 2/3);
    }

    /**
     * Generate data for price comparison chart
     */
    generatePriceComparisonData() {
        const minPrice = this.currentStockPrice * 0.4;
        const maxPrice = this.currentStockPrice * 2.4;
        const step = (maxPrice - minPrice) / 20;
        
        const data = [];
        
        for (let price = minPrice; price <= maxPrice; price += step) {
            data.push({
                stockPrice: price,
                stockValue: this.calculateStockValue(price),
                optionValue: this.calculateOptionValue(price)
            });
        }
        
        return data;
    }

    /**
     * Generate data for return comparison chart
     */
    generateReturnComparisonData() {
        const minPrice = this.currentStockPrice * 0.4;
        const maxPrice = this.currentStockPrice * 2.4;
        const step = (maxPrice - minPrice) / 20;
        
        const data = [];
        
        for (let price = minPrice; price <= maxPrice; price += step) {
            data.push({
                stockPrice: price,
                stockReturn: this.calculateStockReturn(price) * 100, // Convert to percentage
                optionReturn: this.calculateOptionReturn(price) * 100 // Convert to percentage
            });
        }
        
        return data;
    }

    /**
     * Generate data for time projection chart (assuming annual growth rate)
     */
    generateTimeProjectionData() {
        const data = [];
        
        for (let year = 0; year <= this.yearsToProject; year++) {
            const projectedPrice = this.currentStockPrice * Math.pow(1 + this.annualGrowthRate, year);
            
            data.push({
                year: year,
                stockValue: this.calculateStockValue(projectedPrice),
                optionValue: this.calculateOptionValue(projectedPrice)
            });
        }
        
        return data;
    }

    /**
     * Calculate after-tax values for stock and options
     */
    calculateAfterTaxValues(stockPrice) {
        const stockValue = this.calculateStockValue(stockPrice);
        const optionValue = this.calculateOptionValue(stockPrice);
        
        // Calculate capital gains
        const stockGain = stockValue - this.initialInvestment;
        const optionGain = optionValue - this.initialInvestment;
        
        // Apply tax to gains (if positive)
        const stockTax = Math.max(0, stockGain * this.taxRate);
        const optionTax = Math.max(0, optionGain * this.taxRate);
        
        return {
            afterTaxStockValue: stockValue - stockTax,
            afterTaxOptionValue: optionValue - optionTax
        };
    }

    /**
     * Generate data for after-tax comparison over time
     */
    generateAfterTaxTimeProjection() {
        const data = [];
        
        for (let year = 0; year <= this.yearsToProject; year++) {
            const projectedPrice = this.currentStockPrice * Math.pow(1 + this.annualGrowthRate, year);
            const { afterTaxStockValue, afterTaxOptionValue } = this.calculateAfterTaxValues(projectedPrice);
            
            data.push({
                year: year,
                afterTaxStockValue: afterTaxStockValue,
                afterTaxOptionValue: afterTaxOptionValue
            });
        }
        
        return data;
    }
}

// Export the calculator
if (typeof module !== 'undefined' && typeof module.exports !== 'undefined') {
    module.exports = NetflixOptionCalculator;
} else {
    window.NetflixOptionCalculator = NetflixOptionCalculator;
} 