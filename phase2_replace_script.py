import re

html_path = 'home.html'
with open(html_path, 'r', encoding='utf-8') as f:
    content = f.read()

# 1. Update HTML structure with Categories and View Toggle
grid_tools_regex = r'<div class="tools-grid">[\s\S]+?</div>\s*</div>\s*</div>'

new_html_content = """<div class="view-controls">
                    <button class="view-btn active" data-view="grid" title="Bento Grid View">
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" viewBox="0 0 16 16"><path d="M1 2.5A1.5 1.5 0 0 1 2.5 1h3A1.5 1.5 0 0 1 7 2.5v3A1.5 1.5 0 0 1 5.5 7h-3A1.5 1.5 0 0 1 1 5.5v-3zM2.5 2a.5.5 0 0 0-.5.5v3a.5.5 0 0 0 .5.5h3a.5.5 0 0 0 .5-.5v-3a.5.5 0 0 0-.5-.5h-3zm6.5.5A1.5 1.5 0 0 1 10.5 1h3A1.5 1.5 0 0 1 15 2.5v3A1.5 1.5 0 0 1 13.5 7h-3A1.5 1.5 0 0 1 9 5.5v-3zm1.5-.5a.5.5 0 0 0-.5.5v3a.5.5 0 0 0 .5.5h3a.5.5 0 0 0 .5-.5v-3a.5.5 0 0 0-.5-.5h-3zM1 10.5A1.5 1.5 0 0 1 2.5 9h3A1.5 1.5 0 0 1 7 10.5v3A1.5 1.5 0 0 1 5.5 15h-3A1.5 1.5 0 0 1 1 13.5v-3zm1.5-.5a.5.5 0 0 0-.5.5v3a.5.5 0 0 0 .5.5h3a.5.5 0 0 0 .5-.5v-3a.5.5 0 0 0-.5-.5h-3zm6.5.5A1.5 1.5 0 0 1 10.5 9h3a1.5 1.5 0 0 1 1.5 1.5v3a1.5 1.5 0 0 1-1.5 1.5h-3A1.5 1.5 0 0 1 9 13.5v-3zm1.5-.5a.5.5 0 0 0-.5.5v3a.5.5 0 0 0 .5.5h3a.5.5 0 0 0 .5-.5v-3a.5.5 0 0 0-.5-.5h-3z"/></svg>
                    </button>
                    <button class="view-btn" data-view="list" title="List View">
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" viewBox="0 0 16 16"><path fill-rule="evenodd" d="M2.5 12a.5.5 0 0 1 .5-.5h10a.5.5 0 0 1 0 1H3a.5.5 0 0 1-.5-.5zm0-4a.5.5 0 0 1 .5-.5h10a.5.5 0 0 1 0 1H3a.5.5 0 0 1-.5-.5zm0-4a.5.5 0 0 1 .5-.5h10a.5.5 0 0 1 0 1H3a.5.5 0 0 1-.5-.5z"/></svg>
                    </button>
                </div>

                <div class="category-block">
                    <h2 class="category-header">Investment & Growth</h2>
                    <div class="tools-grid">
                        <a href="sip_calculator.html" class="tool-card interest">
                            <div class="tool-card-header">
                                <span class="tool-type-badge">Systematic Investment Plan with Inflation Analysis</span>
                            </div>
                            <h3 class="tool-card-title">SIP Calculator</h3>
                            <p class="tool-card-desc">Plan recurring investments with flexible frequency & currency. Features powerful inflation comparison showing real value after inflation, with clear gain/loss indicators.</p>
                            <div class="tool-card-footer">
                                Launch Calculator
                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16"><path fill-rule="evenodd" d="M1 8a.5.5 0 0 1 .5-.5h11.793l-3.147-3.146a.5.5 0 0 1 .708-.708l4 4a.5.5 0 0 1 0 .708l-4 4a.5.5 0 0 1-.708-.708L13.293 8.5H1.5A.5.5 0 0 1 1 8z"/></svg>
                            </div>
                        </a>

                        <a href="interest-calculator.html" class="tool-card interest">
                            <div class="tool-card-header">
                                <span class="tool-type-badge">Investment Growth Modeler</span>
                            </div>
                            <h3 class="tool-card-title">Interest Rate Calculator</h3>
                            <p class="tool-card-desc">Calculate how your investments grow over time with this interactive tool. Compare simple and compound interest with various compounding frequencies, and visualize the impact of regular deposits on your investment growth.</p>
                            <div class="tool-card-footer">
                                Launch Calculator
                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16"><path fill-rule="evenodd" d="M1 8a.5.5 0 0 1 .5-.5h11.793l-3.147-3.146a.5.5 0 0 1 .708-.708l4 4a.5.5 0 0 1 0 .708l-4 4a.5.5 0 0 1-.708-.708L13.293 8.5H1.5A.5.5 0 0 1 1 8z"/></svg>
                            </div>
                        </a>
                        
                        <a href="debt-snowball-calculator.html" class="tool-card budget">
                            <div class="tool-card-header">
                                <span class="tool-type-badge">Debt Payoff Strategy</span>
                            </div>
                            <h3 class="tool-card-title">Debt Snowball Calculator</h3>
                            <p class="tool-card-desc">Accelerate your journey to becoming debt-free by calculating how paying off your smallest debts first can save you time and money.</p>
                            <div class="tool-card-footer">
                                Launch Calculator
                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16"><path fill-rule="evenodd" d="M1 8a.5.5 0 0 1 .5-.5h11.793l-3.147-3.146a.5.5 0 0 1 .708-.708l4 4a.5.5 0 0 1 0 .708l-4 4a.5.5 0 0 1-.708-.708L13.293 8.5H1.5A.5.5 0 0 1 1 8z"/></svg>
                            </div>
                        </a>
                        
                        <a href="budget-calculator.html" class="tool-card budget">
                            <div class="tool-card-header">
                                <span class="tool-type-badge">Smart Budget Planning Tool</span>
                            </div>
                            <h3 class="tool-card-title">Budget & Finances Modeler</h3>
                            <p class="tool-card-desc">Plan your budget with flexible allocation rules and see how your savings can grow over time.</p>
                            <div class="tool-card-footer">
                                Launch Calculator
                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16"><path fill-rule="evenodd" d="M1 8a.5.5 0 0 1 .5-.5h11.793l-3.147-3.146a.5.5 0 0 1 .708-.708l4 4a.5.5 0 0 1 0 .708l-4 4a.5.5 0 0 1-.708-.708L13.293 8.5H1.5A.5.5 0 0 1 1 8z"/></svg>
                            </div>
                        </a>
                    </div>
                </div>

                <div class="category-block">
                    <h2 class="category-header">Equity Compensation</h2>
                    <div class="tools-grid">
                        <a href="vanilla.html" class="tool-card vanilla">
                            <div class="tool-card-header">
                                <span class="tool-type-badge">Option Value Calculator</span>
                            </div>
                            <h3 class="tool-card-title">Vanilla Option Modeler</h3>
                            <p class="tool-card-desc">Analyze vanilla options by calculating their value at different price points. Understand whether options are in-the-money or out-of-the-money, and visualize total value and net gain.</p>
                            <div class="tool-card-footer">
                                Launch Calculator
                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16"><path fill-rule="evenodd" d="M1 8a.5.5 0 0 1 .5-.5h11.793l-3.147-3.146a.5.5 0 0 1 .708-.708l4 4a.5.5 0 0 1 0 .708l-4 4a.5.5 0 0 1-.708-.708L13.293 8.5H1.5A.5.5 0 0 1 1 8z"/></svg>
                            </div>
                        </a>

                        <a href="netflix.html" class="tool-card netflix">
                            <div class="tool-card-header">
                                <span class="tool-type-badge">Stock Option Value Calculator</span>
                            </div>
                            <h3 class="tool-card-title">Netflix Options</h3>
                            <p class="tool-card-desc">Model and compare Netflix's Supplemental Stock Option Plan to direct stock purchases. Analyze break-even points, potential returns, and visualize how options can outperform stock at different prices.</p>
                            <div class="tool-card-footer">
                                Launch Calculator
                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16"><path fill-rule="evenodd" d="M1 8a.5.5 0 0 1 .5-.5h11.793l-3.147-3.146a.5.5 0 0 1 .708-.708l4 4a.5.5 0 0 1 0 .708l-4 4a.5.5 0 0 1-.708-.708L13.293 8.5H1.5A.5.5 0 0 1 1 8z"/></svg>
                            </div>
                        </a>
                        
                        <a href="grant-calculator.html" class="tool-card grant">
                            <div class="tool-card-header">
                                <span class="tool-type-badge">Equity Compensation Calculator</span>
                            </div>
                            <h3 class="tool-card-title">Grant Calculator</h3>
                            <p class="tool-card-desc">Estimate the value of your equity compensation, including both stock options and RSUs, with modern, intuitive analysis.</p>
                            <div class="tool-card-footer">
                                Launch Calculator
                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16"><path fill-rule="evenodd" d="M1 8a.5.5 0 0 1 .5-.5h11.793l-3.147-3.146a.5.5 0 0 1 .708-.708l4 4a.5.5 0 0 1 0 .708l-4 4a.5.5 0 0 1-.708-.708L13.293 8.5H1.5A.5.5 0 0 1 1 8z"/></svg>
                            </div>
                        </a>

                        <a href="grant_lifecycle_calculator.html" class="tool-card grant">
                            <div class="tool-card-header">
                                <span class="tool-type-badge">Options/RSUs/Shares Lifecycle</span>
                            </div>
                            <h3 class="tool-card-title">Grant Lifecycle Calculator</h3>
                            <p class="tool-card-desc">Model grants end-to-end: vesting schedules, exercises/sales, portfolio value over time with an interactive combined chart.</p>
                            <div class="tool-card-footer">
                                Launch Calculator
                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16"><path fill-rule="evenodd" d="M1 8a.5.5 0 0 1 .5-.5h11.793l-3.147-3.146a.5.5 0 0 1 .708-.708l4 4a.5.5 0 0 1 0 .708l-4 4a.5.5 0 0 1-.708-.708L13.293 8.5H1.5A.5.5 0 0 1 1 8z"/></svg>
                            </div>
                        </a>

                        <a href="grant_lifecycle_calculator_v2.html" class="tool-card grant">
                            <div class="tool-card-header">
                                <span class="tool-type-badge">Yearly Timeline & Tax Modes</span>
                            </div>
                            <h3 class="tool-card-title">Grant Lifecycle Calculator V2</h3>
                            <p class="tool-card-desc">Explore a dashboard view with yearly timeline, WTC/STC tax modes, departure scenarios, and value vs shares charts.</p>
                            <div class="tool-card-footer">
                                Launch Calculator
                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16"><path fill-rule="evenodd" d="M1 8a.5.5 0 0 1 .5-.5h11.793l-3.147-3.146a.5.5 0 0 1 .708-.708l4 4a.5.5 0 0 1 0 .708l-4 4a.5.5 0 0 1-.708-.708L13.293 8.5H1.5A.5.5 0 0 1 1 8z"/></svg>
                            </div>
                        </a>
                        
                        <a href="grant_lifecycle_calculator_v3.html" class="tool-card grant">
                            <div class="tool-card-header">
                                <span class="tool-type-badge">Basic Past / Present / Future View</span>
                            </div>
                            <h3 class="tool-card-title">Portfolio Timeline</h3>
                            <p class="tool-card-desc">A clear helicopter view of your equity journey: Past (vested/exercised), Present (current holdings and value), and Future (remaining to vest and projected value), with a clean lifecycle chart.</p>
                            <div class="tool-card-footer">
                                Launch Calculator
                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16"><path fill-rule="evenodd" d="M1 8a.5.5 0 0 1 .5-.5h11.793l-3.147-3.146a.5.5 0 0 1 .708-.708l4 4a.5.5 0 0 1 0 .708l-4 4a.5.5 0 0 1-.708-.708L13.293 8.5H1.5A.5.5 0 0 1 1 8z"/></svg>
                            </div>
                        </a>

                        <a href="espp-calculator.html" class="tool-card espp">
                            <div class="tool-card-header">
                                <span class="tool-type-badge">Employee Stock Purchase Plan Calculator</span>
                            </div>
                            <h3 class="tool-card-title">ESPP Calculator</h3>
                            <p class="tool-card-desc">Calculate potential returns from your Employee Stock Purchase Plan with detailed tax implications and scenarios.</p>
                            <div class="tool-card-footer">
                                Launch Calculator
                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16"><path fill-rule="evenodd" d="M1 8a.5.5 0 0 1 .5-.5h11.793l-3.147-3.146a.5.5 0 0 1 .708-.708l4 4a.5.5 0 0 1 0 .708l-4 4a.5.5 0 0 1-.708-.708L13.293 8.5H1.5A.5.5 0 0 1 1 8z"/></svg>
                            </div>
                        </a>
                    </div>
                </div>
                
                <div class="category-block">
                    <h2 class="category-header">Exits & Cap Tables</h2>
                    <div class="tools-grid">
                        <a href="term-sheet-benchmark.html" class="tool-card benchmark">
                            <div class="tool-card-header">
                                <span class="tool-type-badge">AI SAFE / Note / Equity review</span>
                            </div>
                            <h3 class="tool-card-title">Term Sheet Benchmarker</h3>
                            <p class="tool-card-desc">Upload or paste a term sheet and get a simple market-fit score, key risks, and stage-aware benchmarks. Uses Gemini with founder/investor persona toggles.</p>
                            <div class="tool-card-footer">
                                Launch Calculator
                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16"><path fill-rule="evenodd" d="M1 8a.5.5 0 0 1 .5-.5h11.793l-3.147-3.146a.5.5 0 0 1 .708-.708l4 4a.5.5 0 0 1 0 .708l-4 4a.5.5 0 0 1-.708-.708L13.293 8.5H1.5A.5.5 0 0 1 1 8z"/></svg>
                            </div>
                        </a>

                        <a href="waterfall_analysis.html" class="tool-card waterfall">
                            <div class="tool-card-header">
                                <span class="tool-type-badge">Investment Distribution Calculator</span>
                            </div>
                            <h3 class="tool-card-title">Waterfall Analysis Tool</h3>
                            <p class="tool-card-desc">Visualize how investment proceeds are distributed among different share classes during a company exit or liquidation event based on liquidation preferences and participation rights.</p>
                            <div class="tool-card-footer">
                                Launch Calculator
                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16"><path fill-rule="evenodd" d="M1 8a.5.5 0 0 1 .5-.5h11.793l-3.147-3.146a.5.5 0 0 1 .708-.708l4 4a.5.5 0 0 1 0 .708l-4 4a.5.5 0 0 1-.708-.708L13.293 8.5H1.5A.5.5 0 0 1 1 8z"/></svg>
                            </div>
                        </a>
                        
                        <a href="share-registry-converter.html" class="tool-card converter">
                            <div class="tool-card-header">
                                <span class="tool-type-badge">Cap Table Data Transformation Tool</span>
                            </div>
                            <h3 class="tool-card-title">Share Registry Converter</h3>
                            <p class="tool-card-desc">Convert cap table exports between different share registry platforms. Transform certificate ledger data into standardized import formats with automatic field mapping and validation.</p>
                            <div class="tool-card-footer">
                                Launch Calculator
                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16"><path fill-rule="evenodd" d="M1 8a.5.5 0 0 1 .5-.5h11.793l-3.147-3.146a.5.5 0 0 1 .708-.708l4 4a.5.5 0 0 1 0 .708l-4 4a.5.5 0 0 1-.708-.708L13.293 8.5H1.5A.5.5 0 0 1 1 8z"/></svg>
                            </div>
                        </a>
                    </div>
                </div>
                
                <div class="category-block">
                    <h2 class="category-header">Real Estate & Markets</h2>
                    <div class="tools-grid">
                        <a href="mortgage_calculator.html" class="tool-card interest">
                            <div class="tool-card-header">
                                <span class="tool-type-badge">Real Estate</span>
                            </div>
                            <h3 class="tool-card-title">Mortgage AI Advisor</h3>
                            <p class="tool-card-desc">Smart mortgage planning with AI-powered advice and dynamic visualizations.</p>
                            <div class="tool-card-footer">
                                Launch Calculator
                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16"><path fill-rule="evenodd" d="M1 8a.5.5 0 0 1 .5-.5h11.793l-3.147-3.146a.5.5 0 0 1 .708-.708l4 4a.5.5 0 0 1 0 .708l-4 4a.5.5 0 0 1-.708-.708L13.293 8.5H1.5A.5.5 0 0 1 1 8z"/></svg>
                            </div>
                        </a>
                        
                        <a href="stock-screener.html" class="tool-card stock">
                            <div class="tool-card-header">
                                <span class="tool-type-badge">Real-time Market Data & Analysis</span>
                            </div>
                            <h3 class="tool-card-title">Stock Market Screener</h3>
                            <p class="tool-card-desc">Professional stock market dashboard with S&P 500 charts, real-time data, top gainers/losers, and advanced screening tools for informed investment decisions.</p>
                            <div class="tool-card-footer">
                                Launch Calculator
                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16"><path fill-rule="evenodd" d="M1 8a.5.5 0 0 1 .5-.5h11.793l-3.147-3.146a.5.5 0 0 1 .708-.708l4 4a.5.5 0 0 1 0 .708l-4 4a.5.5 0 0 1-.708-.708L13.293 8.5H1.5A.5.5 0 0 1 1 8z"/></svg>
                            </div>
                        </a>
                        
                        <a href="news-sentiment.html" class="tool-card espp">
                            <div class="tool-card-header">
                                <span class="tool-type-badge">2-Day Social Sentiment on News</span>
                            </div>
                            <h3 class="tool-card-title">News Sentiment Tracker</h3>
                            <p class="tool-card-desc">Track positive, neutral, and negative sentiment for news from the last two days using Reddit and Twitter signals.</p>
                            <div class="tool-card-footer">
                                Launch Calculator
                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16"><path fill-rule="evenodd" d="M1 8a.5.5 0 0 1 .5-.5h11.793l-3.147-3.146a.5.5 0 0 1 .708-.708l4 4a.5.5 0 0 1 0 .708l-4 4a.5.5 0 0 1-.708-.708L13.293 8.5H1.5A.5.5 0 0 1 1 8z"/></svg>
                            </div>
                        </a>
                    </div>
                </div>
            </div>
        </div>"""

content = re.sub(grid_tools_regex, new_html_content, content, count=1, flags=re.DOTALL)

# 2. Add New CSS (Toggle controls + Category headers + List View rules)
new_css = """        .view-controls {
            display: flex;
            justify-content: flex-end;
            margin-bottom: 24px;
            gap: 8px;
        }

        .view-btn {
            background: rgba(255, 255, 255, 0.7);
            border: 1px solid rgba(226, 232, 240, 0.8);
            border-radius: 8px;
            padding: 8px 12px;
            cursor: pointer;
            color: #64748b;
            transition: all 0.2s ease;
            display: flex;
            align-items: center;
            justify-content: center;
            box-shadow: 0 2px 4px rgba(0, 0, 0, 0.02);
            backdrop-filter: blur(10px);
        }

        .view-btn:hover {
            background: rgba(255, 255, 255, 0.9);
            color: #334155;
            transform: translateY(-1px);
        }

        .view-btn.active {
            background: white;
            color: #4a6cf7;
            border-color: #4a6cf7;
            box-shadow: 0 2px 8px rgba(74, 108, 247, 0.15);
        }

        .category-block {
            margin-bottom: 48px;
        }

        .category-header {
            font-size: 1.7rem;
            font-weight: 700;
            color: #1e293b;
            margin: 0 0 24px 0;
            padding-bottom: 12px;
            border-bottom: 2px solid rgba(226, 232, 240, 0.6);
            display: flex;
            align-items: center;
        }

        .category-header::before {
            content: '';
            display: block;
            width: 6px;
            height: 24px;
            background: linear-gradient(135deg, #4a6cf7, #2ecc71);
            border-radius: 4px;
            margin-right: 12px;
        }

        /* List View Styles */
        .tools-container.view-mode-list .tools-grid {
            display: flex;
            flex-direction: column;
            gap: 16px;
        }

        .tools-container.view-mode-list .tool-card {
            flex-direction: row;
            align-items: center;
            min-height: auto;
            padding: 16px 24px;
            gap: 24px;
        }

        .tools-container.view-mode-list .tool-card::before {
            width: 4px;
            height: 100%;
        }

        .tools-container.view-mode-list .tool-card-header {
            margin-bottom: 0;
            flex-shrink: 0;
            width: 180px; /* Fixed width for badge area */
            display: flex;
            align-items: center;
        }

        .tools-container.view-mode-list .tool-type-badge {
            font-size: 0.7rem;
            text-align: center;
        }

        .tools-container.view-mode-list .tool-card-content-wrapper {
            flex-grow: 1;
            display: flex;
            flex-direction: column;
        }

        .tools-container.view-mode-list .tool-card-title {
            font-size: 1.15rem;
            margin: 0 0 4px 0;
        }

        .tools-container.view-mode-list .tool-card-desc {
            margin: 0;
            font-size: 0.9rem;
            line-height: 1.4;
            max-width: 800px;
        }

        .tools-container.view-mode-list .tool-card-footer {
            margin-top: 0;
            flex-shrink: 0;
            font-size: 0.9rem;
            padding-left: 16px;
            border-left: 1px solid rgba(226, 232, 240, 0.6);
        }

        @media (max-width: 768px) {
            .tools-container.view-mode-list .tool-card {
                flex-direction: column;
                align-items: flex-start;
                gap: 12px;
            }
            .tools-container.view-mode-list .tool-card-header {
                width: 100%;
            }
            .tools-container.view-mode-list .tool-card-footer {
                border-left: none;
                padding-left: 0;
                margin-top: 8px;
            }
        }"""

# Insert CSS after `.tools-grid {` definition block
# Actually, I'll just append it right before `</style>` to be safe.
content = content.replace("</style>", new_css + "\n    </style>")

# Modify the card content in `content` to include `.tool-card-content-wrapper` for the list view styling to work smoothly
# It wraps the Title and Description
content = re.sub(r'(<h3 class="tool-card-title">.*?</h3>\s*<p class="tool-card-desc">.*?</p>)', r'<div class="tool-card-content-wrapper">\n                            \1\n                        </div>', content)

# 3. Add Javascript for Toggle Logic
js_code = """
        // View Toggle Logic
        document.addEventListener('DOMContentLoaded', function() {
            const viewBtns = document.querySelectorAll('.view-btn');
            const toolsContainer = document.querySelector('.tools-container');
            
            // Check local storage for preference
            const savedView = localStorage.getItem('toolsViewMode') || 'grid';
            
            function setViewMode(mode) {
                if (mode === 'list') {
                    toolsContainer.classList.add('view-mode-list');
                } else {
                    toolsContainer.classList.remove('view-mode-list');
                }
                
                viewBtns.forEach(btn => {
                    if (btn.dataset.view === mode) {
                        btn.classList.add('active');
                    } else {
                        btn.classList.remove('active');
                    }
                });
                
                localStorage.setItem('toolsViewMode', mode);
            }
            
            // Apply saved preference immediately
            setViewMode(savedView);
            
            viewBtns.forEach(btn => {
                btn.addEventListener('click', function() {
                    setViewMode(this.dataset.view);
                });
            });
        });
"""

content = content.replace("document.addEventListener('DOMContentLoaded', function () {\n            // Initialize chatbot", js_code + "\n        document.addEventListener('DOMContentLoaded', function () {\n            // Initialize chatbot")


with open(html_path, 'w', encoding='utf-8') as f:
    f.write(content)

print("HTML script executed.")
