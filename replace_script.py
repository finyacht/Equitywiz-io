import re

html_path = 'home.html'
with open(html_path, 'r', encoding='utf-8') as f:
    content = f.read()

grid_html = """                <div class="tools-grid">
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
                </div>"""

content = re.sub(r'<table class="tools-table">.+?</table>', grid_html, content, flags=re.DOTALL)

grid_css = """        .tools-grid {
            display: grid;
            grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
            gap: 24px;
            width: 100%;
        }

        .tool-card {
            background: rgba(255, 255, 255, 0.9);
            border-radius: 16px;
            padding: 24px;
            transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
            box-shadow: 0 4px 15px -3px rgba(0, 0, 0, 0.05), 0 2px 6px -2px rgba(0, 0, 0, 0.025);
            border: 1px solid rgba(226, 232, 240, 0.8);
            display: flex;
            flex-direction: column;
            cursor: pointer;
            position: relative;
            overflow: hidden;
            text-decoration: none;
            color: inherit;
            backdrop-filter: blur(10px);
            min-height: 250px;
        }

        .tool-card::before {
            content: '';
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 4px;
            background: var(--card-color, #4a6cf7);
            opacity: 0.8;
            transition: opacity 0.3s ease;
        }

        .tool-card:hover {
            transform: translateY(-5px);
            box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
            border-color: rgba(226, 232, 240, 1);
            background: rgba(255, 255, 255, 1);
        }

        .tool-card:hover::before {
            opacity: 1;
        }
        
        .tool-card.waterfall { --card-color: var(--waterfall-color); }
        .tool-card.vanilla { --card-color: var(--vanilla-color); }
        .tool-card.netflix { --card-color: var(--netflix-color); }
        .tool-card.interest { --card-color: var(--interest-color); }
        .tool-card.benchmark { --card-color: #4a6cf7; }
        .tool-card.budget { --card-color: #8B5CF6; }
        .tool-card.grant { --card-color: #0a5264; }
        .tool-card.espp { --card-color: #0a5264; }
        .tool-card.stock { --card-color: #4a6cf7; }
        .tool-card.converter { --card-color: #059669; }

        .tool-card-header {
            display: flex;
            justify-content: space-between;
            align-items: flex-start;
            margin-bottom: 16px;
        }

        .tool-type-badge {
            font-size: 0.75rem;
            font-weight: 600;
            padding: 4px 10px;
            border-radius: 20px;
            background: rgba(var(--card-color-rgb, 74, 108, 247), 0.1);
            color: var(--card-color, #4a6cf7);
            letter-spacing: 0.5px;
            text-transform: uppercase;
        }

        .tool-card.waterfall .tool-type-badge { background: rgba(74, 108, 247, 0.1); }
        .tool-card.vanilla .tool-type-badge { background: rgba(46, 204, 113, 0.1); }
        .tool-card.netflix .tool-type-badge { background: rgba(229, 9, 20, 0.1); }
        .tool-card.interest .tool-type-badge { background: rgba(14, 165, 233, 0.1); }
        .tool-card.benchmark .tool-type-badge { background: rgba(74, 108, 247, 0.1); }
        .tool-card.budget .tool-type-badge { background: rgba(139, 92, 246, 0.1); }
        .tool-card.grant .tool-type-badge { background: rgba(10, 82, 100, 0.1); }
        .tool-card.espp .tool-type-badge { background: rgba(10, 82, 100, 0.1); }
        .tool-card.stock .tool-type-badge { background: rgba(74, 108, 247, 0.1); }
        .tool-card.converter .tool-type-badge { background: rgba(5, 150, 105, 0.1); }

        .tool-card-title {
            font-size: 1.35rem;
            font-weight: 700;
            color: #1e293b;
            margin: 0 0 12px 0;
            line-height: 1.3;
            letter-spacing: -0.01em;
        }

        .tool-card-desc {
            font-size: 0.95rem;
            color: #64748b;
            line-height: 1.6;
            flex-grow: 1;
            margin: 0 0 20px 0;
        }

        .tool-card-footer {
            display: flex;
            align-items: center;
            font-weight: 600;
            font-size: 0.95rem;
            color: var(--card-color, #4a6cf7);
            margin-top: auto;
            transition: all 0.2s ease;
        }

        .tool-card-footer svg {
            margin-left: 6px;
            transition: transform 0.2s ease;
        }

        .tool-card:hover .tool-card-footer svg {
            transform: translateX(4px);
        }"""

content = re.sub(r'\s*\.tools-table\s+\{[\s\S]+?\.stock\s+\.tool-launch-btn\s+\{\s*background:\s*#[a-zA-Z0-9]+\s*!important;\s*\}', '\n' + grid_css, content)

# Remove media query table rules
def remove_css_block(text, selector):
    return re.sub(r'(?m)^[ \t]*' + re.escape(selector) + r'[^\{]*\{[^\}]*\}[\r\n]*', '', text)

for sel in ['.tools-table', '.table-header', '.tool-row', '.tool-row:hover', '.tool-row td', '.tool-row td:first-child', '.tool-row td:nth-child(2)', '.tool-row td:nth-child(3)', '.tool-row td:last-child', '.tool-indicator', '.tool-name', '.tool-type', '.tool-description', '.tool-launch-btn', '.tool-launch-btn:hover']:
    content = remove_css_block(content, sel)

# Remove any extra cleanups
content = re.sub(r'/\*\s*Clean Card Layout\s*\*/[\r\n]*', '', content)

with open(html_path, 'w', encoding='utf-8') as f:
    f.write(content)
print("Updated home.html successfully")
