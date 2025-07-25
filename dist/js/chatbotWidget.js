// Yikes AI Chatbot Widget
class YikesAIChatbot {
    constructor(options = {}) {
        this.options = {
            position: options.position || 'bottom-right',
            theme: options.theme || 'dark',
            useNetlifyFunction: options.useNetlifyFunction !== false, // Default to true
            ...options
        };
        
        this.isOpen = false;
        this.useAI = this.options.useNetlifyFunction; // AI available via Netlify Function
        this.messageHistory = [];
        
        console.log('🔧 Chatbot initialized');
        console.log('🔧 AI mode enabled via Netlify Function:', this.useAI);
        
        this.knowledgeBase = {
            "add shares": {
                response: "To add shares to your cap table:",
                steps: [
                    "Navigate to 'Share Transactions' section in your admin dashboard",
                    "Click 'Add Transaction' or 'New Transaction' button",
                    "Select the appropriate transaction type from dropdown menu (Issuance, Transfer, etc.)",
                    "Choose the share class (Common, Preferred, Series A/B/C, etc.)",
                    "Enter share quantity and price per share details",
                    "Add or select stakeholder information from database",
                    "Set the issue date and effective date for the transaction",
                    "Configure any special rights or restrictions for the shares",
                    "Attach supporting legal documents and board resolutions",
                    "Review all transaction details for accuracy and compliance",
                    "Submit transaction for processing and approval",
                    "Monitor approval status and update stakeholders as needed"
                ],
                tips: "💡 Use bulk import functionality for multiple share issuances to save time and ensure consistency",
                related: ["stakeholders", "cap table compliance", "documents"]
            },
            "exercise options": {
                response: "To exercise vested stock options:",
                steps: [
                    "Log into your participant portal account using your credentials",
                    "Navigate to 'My Equity Grants' or 'Holdings' section",
                    "Locate the grant containing vested options available for exercise",
                    "Review the vesting schedule and confirm vested quantities available",
                    "Check the current fair market value and exercise price",
                    "Click 'Exercise & Release' or 'Exercise Options' button",
                    "Select exercise method: Cash Exercise, Cashless (Sell-to-Cover), or Net Exercise",
                    "Review exercise cost calculations and tax withholding estimates",
                    "Confirm exercise quantity (cannot exceed vested amount)",
                    "Upload any required documentation or attestations",
                    "Submit exercise request for processing",
                    "Wait for admin approval and board resolution if required",
                    "Receive confirmation and updated equity statements"
                ],
                tips: "💡 The platform automatically calculates tax withholding based on your profile settings and current valuations",
                related: ["participant portal dashboard", "vesting", "board approvals"]
            },
            "equity plans": {
                response: "To create and set up equity compensation plans:",
                steps: [
                    "Access 'Plan Management' section in the admin dashboard",
                    "Click 'Create New Plan' or 'Add Plan' button",
                    "Select plan type: ISO, NSO, RSU, ESPP, or custom plan structure",
                    "Define plan name, effective date, and expiration period",
                    "Set total equity pool size (number of shares reserved for the plan)",
                    "Configure default vesting schedule (e.g., 4-year vesting with 1-year cliff)",
                    "Define eligibility criteria and participant groups",
                    "Set exercise price methodology and valuation rules",
                    "Configure approval workflows and administrative permissions",
                    "Set up tax withholding rules and compliance parameters",
                    "Define termination and acceleration provisions",
                    "Upload plan documents, legal agreements, and board resolutions",
                    "Review plan settings and compliance requirements",
                    "Test plan functionality with sample grants",
                    "Submit plan for board approval and legal review",
                    "Activate plan and begin issuing grants to participants"
                ],
                tips: "💡 Use pre-built plan templates to ensure compliance with local regulations and best practices",
                related: ["board approvals", "documents", "equity grants"]
            },
            "round modeling": {
                response: "To model funding rounds and analyze dilution effects:",
                steps: [
                    "Navigate to 'Round Modeling' section in the admin dashboard",
                    "Click 'Create New Round' or 'Model Round' button",
                    "Enter investment round details: round name, type, and target amount",
                    "Define new investor information and investment amounts",
                    "Set share price, pre-money valuation, and post-money valuation",
                    "Configure liquidation preferences and participation rights",
                    "Model convertible instruments (SAFE, convertible notes) conversion",
                    "Set up anti-dilution provisions and protective provisions",
                    "Calculate dilution effects on existing shareholders",
                    "Generate pro forma cap table showing post-round ownership",
                    "Run scenario analysis with different investment amounts",
                    "Export round data and waterfall analysis for board presentation"
                ],
                tips: "💡 The platform automatically handles complex conversion calculations and dilution modeling",
                related: ["convertible instruments", "warrants", "reporting"]
            },
            "participant portal": {
                response: "To navigate the participant portal dashboard:",
                steps: [
                    "Log into your participant account using your credentials",
                    "Review the portfolio overview showing current equity holdings",
                    "Navigate to 'Equity Grants' section for detailed grant information",
                    "Check vesting schedules and track vesting progress",
                    "Access 'Exercise & Release' section for available actions",
                    "Review exercise options and associated costs",
                    "Download equity statements and tax documents",
                    "Update personal information and tax withholding preferences",
                    "Set up notification preferences for vesting events",
                    "Access historical transaction records and grant certificates"
                ],
                tips: "💡 Enable email notifications to stay updated on important vesting milestones and deadlines",
                related: ["equity grants", "vesting", "exercise and releases"]
            },
            "compliance": {
                response: "To manage cap table compliance and regulatory requirements:",
                steps: [
                    "Access the 'Cap Table & Compliance' dashboard section",
                    "Review current compliance status and any system alerts or warnings",
                    "Verify all share transactions have proper supporting documentation",
                    "Check stakeholder information completeness and accuracy",
                    "Review share class structures and voting rights compliance",
                    "Validate ownership percentages and regulatory thresholds",
                    "Generate compliance reports for regulatory filings (409A, IRC Section 280G)",
                    "Set up automated compliance monitoring rules and alerts",
                    "Review and update compliance policies and procedures",
                    "Maintain audit trails for all cap table modifications"
                ],
                tips: "💡 The platform maintains automatic audit trails and version control for all cap table changes",
                related: ["stakeholders", "documents", "reporting"]
            },
            "vesting": {
                response: "To manage vesting schedules and track equity maturation:",
                steps: [
                    "Navigate to the 'Vesting' section in the admin dashboard",
                    "Review vesting schedules for all active equity grants",
                    "Monitor upcoming vesting events and cliff periods",
                    "Set up automated vesting notifications for participants",
                    "Configure acceleration triggers (single vs double trigger)",
                    "Process vesting events as they occur automatically",
                    "Handle early exercise scenarios and unvested share repurchases",
                    "Generate vesting reports and summaries for stakeholders",
                    "Track performance-based vesting milestones if applicable",
                    "Manage vesting modifications due to terminations or role changes"
                ],
                tips: "💡 The platform automatically tracks cliff periods, acceleration triggers, and sends notifications before vesting events",
                related: ["equity grants", "participant portal dashboard", "plan management"]
            },
            "board approvals": {
                response: "To manage board approvals and governance workflows:",
                steps: [
                    "Navigate to the 'Board Approvals' section in the admin dashboard",
                    "Review pending items requiring board action and approval",
                    "Prepare board resolutions and supporting documentation",
                    "Create agenda items for board meetings with equity matters",
                    "Submit equity plans, grants, and major transactions for board review",
                    "Track approval status and voting results for each item",
                    "Maintain comprehensive records of all board decisions",
                    "Generate board packages with cap table summaries and dilution analysis",
                    "Set up approval workflows with required signatures and attestations",
                    "Archive approved resolutions with proper version control"
                ],
                tips: "💡 The approval workflow ensures all equity transactions have proper board oversight and legal compliance",
                related: ["documents", "equity grants", "plan management"]
            }
        };

        this.quickActions = [
            { icon: "💎", text: "Add Shares", query: "How do I add shares to my cap table?" },
            { icon: "📋", text: "Create Plans", query: "How to create equity plans?" },
            { icon: "🚀", text: "Round Modeling", query: "Explain round modeling" },
            { icon: "🎯", text: "Exercise Options", query: "How to exercise options?" },
            { icon: "⏱️", text: "Vesting", query: "What is vesting?" },
            { icon: "📊", text: "Export Data", query: "Export cap table to Excel" }
        ];

        this.init();
    }

    init() {
        this.createWidget();
        this.attachEventListeners();
        this.updateStatus();
    }

    updateStatus() {
        const statusText = document.getElementById('gsStatusText');
        if (statusText) {
            statusText.textContent = this.useAI ? 'AI Connected' : 'Knowledge Base';
            console.log('🔧 Status updated to:', statusText.textContent);
        }
    }

    refreshAPIStatus() {
        // AI is available through Netlify Function (no client-side API key needed)
        this.useAI = this.options.useNetlifyFunction;
        this.updateStatus();
        console.log('🔧 API status refreshed - AI via Netlify Function:', this.useAI);
    }

    createWidget() {
        const widget = document.createElement('div');
        widget.className = `gs-chatbot-widget ${this.options.position || 'bottom-right'}`;
        widget.innerHTML = this.getWidgetHTML();
        document.body.appendChild(widget);
        this.addStyles();
    }

    getWidgetHTML() {
        return `
            <div class="gs-widget-toggle" id="gsChatToggle">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
                </svg>
                <div class="gs-notification-dot" id="gsNotificationDot"></div>
            </div>
            
            <div class="gs-widget-container" id="gsWidgetContainer">
                <div class="gs-widget-header">
                    <div class="gs-header-content">
                        <div class="gs-logo">
                            <div class="gs-logo-icon">🤖</div>
                            <div class="gs-logo-text">Yikes AI</div>
                        </div>
                        <div class="gs-status">
                            <div class="gs-status-dot"></div>
                            <span id="gsStatusText">${this.useAI ? 'AI Connected' : 'Knowledge Base'}</span>
                        </div>
                    </div>
                    <button class="gs-close-btn" id="gsCloseBtn">×</button>
                </div>
                
                <div class="gs-quick-actions" id="gsQuickActions">
                    ${this.quickActions.map(action => `
                        <button class="gs-quick-action" data-query="${action.query}">
                            ${action.icon} ${action.text}
                        </button>
                    `).join('')}
                </div>
                
                <div class="gs-chat-messages" id="gsChatMessages">
                    <div class="gs-message gs-bot-message">
                        <div class="gs-message-avatar gs-bot-avatar">🤖</div>
                        <div class="gs-message-content">
                            <div class="gs-message-bubble">
                                👋 Welcome to Yikes AI Assistant! I'm here to help you with:
                                <br><br>
                                • <strong>Cap Table Management</strong> - Add shares, manage ownership, track changes
                                <br>• <strong>Equity Plans</strong> - Create and manage employee stock options
                                <br>• <strong>Round Modeling</strong> - Simulate funding scenarios
                                <br>• <strong>Participant Portal</strong> - Access your equity information
                                <br>• <strong>Exercise Options</strong> - Learn how to exercise vested options
                                <br>• <strong>Reports & Exports</strong> - Generate cap table reports
                                <br><br>
                                ${this.useAI ? 
                                    '🤖 <strong>AI Mode Active</strong> - Enhanced responses powered by secure Gemini AI' : 
                                    '📚 <strong>Knowledge Base Mode</strong> - AI service temporarily unavailable'
                                }
                                <br><br>
                                Just ask me anything or click one of the quick actions above! 🚀
                            </div>
                        </div>
                    </div>
                </div>
                
                <div class="gs-input-area">
                    <div class="gs-input-container">
                        <div class="gs-input-wrapper">
                            <textarea 
                                class="gs-chat-input" 
                                id="gsChatInput" 
                                placeholder="Ask me anything about equity"
                                rows="1"
                            ></textarea>
                        </div>
                        <button class="gs-send-button" id="gsSendButton">
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <path d="M22 2L11 13M22 2L15 22L11 13L2 9L22 2Z"/>
                            </svg>
                        </button>
                    </div>
                </div>
            </div>
        `;
    }

    addStyles() {
        const styles = `
            .gs-chatbot-widget {
                position: fixed;
                bottom: 20px;
                z-index: 10000;
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            }

            .gs-chatbot-widget.bottom-right {
                right: 20px;
            }

            .gs-chatbot-widget.bottom-left {
                left: 20px;
            }

            .gs-widget-toggle {
                width: 60px;
                height: 60px;
                border-radius: 50%;
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                border: none;
                color: white;
                cursor: pointer;
                display: flex;
                align-items: center;
                justify-content: center;
                box-shadow: 0 4px 20px rgba(0,0,0,0.15);
                transition: all 0.3s ease;
                position: relative;
            }

            .gs-widget-toggle:hover {
                transform: scale(1.05);
                box-shadow: 0 6px 25px rgba(0,0,0,0.2);
            }

            .gs-notification-dot {
                position: absolute;
                top: 8px;
                right: 8px;
                width: 12px;
                height: 12px;
                background: #ef4444;
                border-radius: 50%;
                border: 2px solid white;
                display: none;
                animation: pulse 2s infinite;
            }

            .gs-notification-dot.active {
                display: block;
            }

            @keyframes pulse {
                0% { opacity: 1; transform: scale(1); }
                50% { opacity: 0.5; transform: scale(1.2); }
                100% { opacity: 1; transform: scale(1); }
            }

            .gs-widget-container {
                position: absolute;
                bottom: 80px;
                width: 400px;
                height: 600px;
                background: rgba(15, 23, 42, 0.95);
                border-radius: 16px;
                backdrop-filter: blur(10px);
                border: 1px solid rgba(255,255,255,0.1);
                display: none;
                flex-direction: column;
                overflow: hidden;
                box-shadow: 0 20px 40px rgba(0,0,0,0.3);
            }

            .gs-chatbot-widget.bottom-right .gs-widget-container {
                right: 0;
            }

            .gs-chatbot-widget.bottom-left .gs-widget-container {
                left: 0;
            }

            .gs-widget-container.open {
                display: flex;
                animation: slideUp 0.3s ease;
            }

            @keyframes slideUp {
                from {
                    opacity: 0;
                    transform: translateY(20px);
                }
                to {
                    opacity: 1;
                    transform: translateY(0);
                }
            }

            .gs-widget-header {
                padding: 16px 20px;
                background: rgba(30, 41, 59, 0.8);
                border-bottom: 1px solid rgba(255,255,255,0.1);
                display: flex;
                justify-content: space-between;
                align-items: center;
            }

            .gs-header-content {
                display: flex;
                align-items: center;
                justify-content: space-between;
                flex: 1;
                margin-right: 12px;
            }

            .gs-logo {
                display: flex;
                align-items: center;
                gap: 8px;
            }

            .gs-logo-icon {
                width: 32px;
                height: 32px;
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                border-radius: 8px;
                display: flex;
                align-items: center;
                justify-content: center;
                font-size: 16px;
            }

            .gs-logo-text {
                font-size: 16px;
                font-weight: 600;
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                -webkit-background-clip: text;
                background-clip: text;
                -webkit-text-fill-color: transparent;
            }

            .gs-status {
                display: flex;
                align-items: center;
                gap: 6px;
                padding: 4px 12px;
                background: rgba(16, 185, 129, 0.1);
                border: 1px solid rgba(16, 185, 129, 0.3);
                border-radius: 12px;
                font-size: 12px;
                color: #10b981;
            }

            .gs-status-dot {
                width: 6px;
                height: 6px;
                background: #10b981;
                border-radius: 50%;
                animation: pulse 2s infinite;
            }

            .gs-close-btn {
                background: none;
                border: none;
                color: #94a3b8;
                cursor: pointer;
                font-size: 20px;
                padding: 4px;
                border-radius: 4px;
                transition: all 0.2s ease;
            }

            .gs-close-btn:hover {
                background: rgba(255,255,255,0.1);
                color: white;
            }

            .gs-quick-actions {
                padding: 12px;
                display: flex;
                gap: 8px;
                overflow-x: auto;
                scrollbar-width: none;
                -ms-overflow-style: none;
            }

            .gs-quick-actions::-webkit-scrollbar {
                display: none;
            }

            .gs-quick-action {
                flex-shrink: 0;
                padding: 8px 12px;
                background: rgba(99, 102, 241, 0.1);
                border: 1px solid rgba(99, 102, 241, 0.3);
                border-radius: 16px;
                color: white;
                cursor: pointer;
                transition: all 0.3s ease;
                font-size: 12px;
                white-space: nowrap;
            }

            .gs-quick-action:hover {
                background: rgba(99, 102, 241, 0.2);
                transform: translateY(-1px);
            }

            .gs-chat-messages {
                flex: 1;
                overflow-y: auto;
                padding: 16px;
                scroll-behavior: smooth;
            }

            .gs-message {
                display: flex;
                gap: 8px;
                margin-bottom: 16px;
                animation: fadeInUp 0.4s ease;
            }

            @keyframes fadeInUp {
                from {
                    opacity: 0;
                    transform: translateY(20px);
                }
                to {
                    opacity: 1;
                    transform: translateY(0);
                }
            }

            .gs-message-avatar {
                width: 28px;
                height: 28px;
                border-radius: 8px;
                display: flex;
                align-items: center;
                justify-content: center;
                font-size: 14px;
                flex-shrink: 0;
            }

            .gs-user-avatar {
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            }

            .gs-bot-avatar {
                background: rgba(99, 102, 241, 0.2);
                border: 1px solid rgba(99, 102, 241, 0.3);
            }

            .gs-message-content {
                flex: 1;
            }

            .gs-message-bubble {
                background: rgba(51, 65, 85, 0.5);
                border: 1px solid rgba(255, 255, 255, 0.1);
                border-radius: 12px;
                padding: 12px;
                backdrop-filter: blur(10px);
                max-width: 85%;
                display: inline-block;
                word-wrap: break-word;
                font-size: 14px;
                line-height: 1.5;
                color: #f8fafc;
            }

            .gs-user-message .gs-message-bubble {
                background: rgba(99, 102, 241, 0.2);
                border-color: rgba(99, 102, 241, 0.3);
                margin-left: auto;
            }

            .gs-user-message {
                flex-direction: row-reverse;
            }

            .gs-input-area {
                padding: 16px;
                background: rgba(30, 41, 59, 0.8);
                border-top: 1px solid rgba(255,255,255,0.1);
                box-sizing: border-box;
            }

            .gs-input-container {
                display: flex;
                gap: 12px;
                align-items: flex-end;
                width: 100%;
                box-sizing: border-box;
            }

            .gs-input-wrapper {
                flex: 1;
                position: relative;
                min-width: 0;
            }

            .gs-chat-input {
                width: 100%;
                padding: 12px 16px;
                background: rgba(51, 65, 85, 0.5);
                border: 1px solid rgba(255, 255, 255, 0.1);
                border-radius: 20px;
                color: white;
                font-size: 14px;
                resize: none;
                outline: none;
                transition: all 0.3s ease;
                max-height: 100px;
                box-sizing: border-box;
                min-height: 36px;
            }

            .gs-chat-input:focus {
                border-color: rgba(99, 102, 241, 0.5);
                box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.1);
            }

            .gs-chat-input::placeholder {
                color: #94a3b8;
            }

            .gs-send-button {
                width: 36px;
                height: 36px;
                min-width: 36px;
                min-height: 36px;
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                border: none;
                border-radius: 50%;
                color: white;
                cursor: pointer;
                display: flex;
                align-items: center;
                justify-content: center;
                transition: all 0.3s ease;
                flex-shrink: 0;
                box-sizing: border-box;
            }

            .gs-send-button:hover {
                transform: scale(1.05);
                box-shadow: 0 4px 15px rgba(99, 102, 241, 0.4);
            }

            .gs-send-button:disabled {
                opacity: 0.5;
                cursor: not-allowed;
                transform: none;
            }

            .gs-typing-indicator {
                display: flex;
                gap: 4px;
                padding: 16px 0;
            }

            .gs-typing-dot {
                width: 6px;
                height: 6px;
                background: #94a3b8;
                border-radius: 50%;
                animation: typing 1.4s infinite;
            }

            .gs-typing-dot:nth-child(2) {
                animation-delay: 0.2s;
            }

            .gs-typing-dot:nth-child(3) {
                animation-delay: 0.4s;
            }

            @keyframes typing {
                0%, 60%, 100% {
                    transform: translateY(0);
                    opacity: 0.7;
                }
                30% {
                    transform: translateY(-8px);
                    opacity: 1;
                }
            }

            /* Mobile responsive */
            @media (max-width: 768px) {
                .gs-chatbot-widget {
                    bottom: 16px;
                    right: 16px;
                }

                .gs-widget-toggle {
                    width: 56px;
                    height: 56px;
                }

                .gs-widget-container {
                    width: calc(100vw - 32px);
                    height: calc(100vh - 100px);
                    right: -16px;
                    bottom: 72px;
                }

                .gs-quick-actions {
                    padding: 8px;
                }

                .gs-quick-action {
                    padding: 6px 10px;
                    font-size: 11px;
                }

                .gs-chat-messages {
                    padding: 12px;
                }

                .gs-message-bubble {
                    max-width: 90%;
                    padding: 10px;
                    font-size: 13px;
                }

                .gs-input-area {
                    padding: 12px;
                }

                .gs-chat-input {
                    padding: 10px 14px;
                    font-size: 13px;
                }

                .gs-send-button {
                    width: 32px;
                    height: 32px;
                }
            }
        `;

        const styleSheet = document.createElement('style');
        styleSheet.textContent = styles;
        document.head.appendChild(styleSheet);
    }

    attachEventListeners() {
        const toggle = document.getElementById('gsChatToggle');
        const closeBtn = document.getElementById('gsCloseBtn');
        const sendBtn = document.getElementById('gsSendButton');
        const input = document.getElementById('gsChatInput');
        const quickActions = document.querySelectorAll('.gs-quick-action');

        toggle.addEventListener('click', () => this.toggleWidget());
        closeBtn.addEventListener('click', () => this.closeWidget());
        sendBtn.addEventListener('click', () => this.sendMessage());

        input.addEventListener('keypress', (e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                this.sendMessage();
            }
        });

        input.addEventListener('input', () => this.autoResizeInput());

        quickActions.forEach(action => {
            action.addEventListener('click', () => {
                const query = action.getAttribute('data-query');
                this.sendQuickAction(query);
            });
        });
    }

    toggleWidget() {
        const container = document.getElementById('gsWidgetContainer');
        this.isOpen = !this.isOpen;
        
        if (this.isOpen) {
            container.classList.add('open');
            document.getElementById('gsChatInput').focus();
            this.hideNotification();
        } else {
            container.classList.remove('open');
        }
    }

    closeWidget() {
        const container = document.getElementById('gsWidgetContainer');
        container.classList.remove('open');
        this.isOpen = false;
    }

    showNotification() {
        document.getElementById('gsNotificationDot').classList.add('active');
    }

    hideNotification() {
        document.getElementById('gsNotificationDot').classList.remove('active');
    }

    autoResizeInput() {
        const input = document.getElementById('gsChatInput');
        input.style.height = 'auto';
        input.style.height = Math.min(input.scrollHeight, 100) + 'px';
    }

    sendQuickAction(message) {
        document.getElementById('gsChatInput').value = message;
        this.sendMessage();
    }

    sendMessage() {
        const input = document.getElementById('gsChatInput');
        const message = input.value.trim();
        
        if (!message) return;

        this.addMessage(message, 'user');
        this.messageHistory.push({ role: 'user', content: message });
        
        input.value = '';
        input.style.height = 'auto';
        
        this.showTypingIndicator();
        
        // Try AI first if available, fallback to local knowledge
        if (this.useAI) {
            this.callNetlifyFunction(message);
        } else {
            setTimeout(() => {
                this.removeTypingIndicator();
                this.generateResponse(message);
            }, 1000 + Math.random() * 1000);
        }
    }

    async callNetlifyFunction(message) {
        console.log('🤖 Calling Netlify Function with message:', message);
        
        try {
            console.log('📤 Sending request to Netlify Function');

            const response = await fetch('/.netlify/functions/gemini-chat', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    message: message
                })
            });

            console.log('📥 Netlify Function response status:', response.status);

            if (response.ok) {
                const data = await response.json();
                console.log('✅ AI Response received via Netlify Function');
                this.removeTypingIndicator();
                
                if (data.response) {
                    this.addMessage(data.response, 'bot');
                    this.messageHistory.push({ role: 'assistant', content: data.response });
                } else {
                    throw new Error('No response content from AI service');
                }
            } else {
                let errorMessage = `HTTP ${response.status}`;
                try {
                    const errorData = await response.json();
                    errorMessage = errorData.error || errorMessage;
                } catch (e) {
                    // If we can't parse error response, use status
                }
                console.error('❌ Netlify Function Error:', errorMessage);
                throw new Error(`AI service failed: ${errorMessage}`);
            }
        } catch (error) {
            console.error('💥 AI Error:', error);
            this.removeTypingIndicator();
            
            // More specific error handling
            let errorMsg = '⚠️ AI service temporarily unavailable. Using local knowledge base.';
            
            if (error.name === 'TypeError' || error.message.includes('Failed to fetch')) {
                errorMsg = `⚠️ Connection to AI service failed.<br><br>
                <strong>Possible causes:</strong><br>
                • Function not deployed or configured<br>
                • Network connectivity issues<br>
                • Server configuration problems<br><br>
                <em>Switching to knowledge base...</em>`;
            } else if (error.message.includes('configuration')) {
                errorMsg = '⚠️ AI service configuration issue. Please check server setup.';
            }
            
            this.addMessage(errorMsg, 'bot');
            
            // Always fallback to knowledge base after a short delay
            setTimeout(() => {
                this.generateResponse(message);
            }, 800);
        }
    }

    generateResponse(userMessage) {
        const lowerMessage = userMessage.toLowerCase();
        let response = '';
        
        for (const [key, data] of Object.entries(this.knowledgeBase)) {
            if (lowerMessage.includes(key)) {
                response = data.response;
                
                if (data.steps) {
                    response += '<br><br>';
                    data.steps.forEach(step => {
                        response += `• ${step}<br><br>`;
                    });
                }
                
                if (data.tips) {
                    response += `<br><br>${data.tips}`;
                }
                
                if (data.related) {
                    response += '<br><br>🔗 <em>Related topics: ' + data.related.join(', ') + '</em>';
                }
                
                break;
            }
        }
        
        if (!response) {
            const defaultResponses = [
                "I can help you with equity platform features. Try asking about: adding shares, creating equity plans, round modeling, exercising options, or accessing the participant portal.",
                "That's a great question! While I'm continuously learning, I can assist with common cap table operations like equity management, vesting schedules, and equity administration.",
                "I'd be happy to help! Could you be more specific? For example, are you looking for help with equity grants, participant access, reporting, or platform administration?"
            ];
            response = defaultResponses[Math.floor(Math.random() * defaultResponses.length)];
        }
        
        this.addMessage(response, 'bot');
        this.messageHistory.push({ role: 'assistant', content: response });
    }

    addMessage(content, sender) {
        const messagesContainer = document.getElementById('gsChatMessages');
        const messageDiv = document.createElement('div');
        messageDiv.className = `gs-message gs-${sender}-message`;
        
        const avatarDiv = document.createElement('div');
        avatarDiv.className = `gs-message-avatar gs-${sender}-avatar`;
        avatarDiv.textContent = sender === 'user' ? 'U' : '🤖';
        
        const contentDiv = document.createElement('div');
        contentDiv.className = 'gs-message-content';
        
        const bubbleDiv = document.createElement('div');
        bubbleDiv.className = 'gs-message-bubble';
        bubbleDiv.innerHTML = content;
        
        contentDiv.appendChild(bubbleDiv);
        messageDiv.appendChild(avatarDiv);
        messageDiv.appendChild(contentDiv);
        
        messagesContainer.appendChild(messageDiv);
        messagesContainer.scrollTop = messagesContainer.scrollHeight;

        if (!this.isOpen && sender === 'bot') {
            this.showNotification();
        }
    }

    showTypingIndicator() {
        const messagesContainer = document.getElementById('gsChatMessages');
        const typingDiv = document.createElement('div');
        typingDiv.className = 'gs-message gs-bot-message';
        typingDiv.id = 'gsTypingIndicator';
        
        const avatarDiv = document.createElement('div');
        avatarDiv.className = 'gs-message-avatar gs-bot-avatar';
        avatarDiv.textContent = '🤖';
        
        const contentDiv = document.createElement('div');
        contentDiv.className = 'gs-message-content';
        
        const typingContent = document.createElement('div');
        typingContent.className = 'gs-typing-indicator';
        
        for (let i = 0; i < 3; i++) {
            const dot = document.createElement('div');
            dot.className = 'gs-typing-dot';
            typingContent.appendChild(dot);
        }
        
        contentDiv.appendChild(typingContent);
        typingDiv.appendChild(avatarDiv);
        typingDiv.appendChild(contentDiv);
        
        messagesContainer.appendChild(typingDiv);
        messagesContainer.scrollTop = messagesContainer.scrollHeight;
    }

    removeTypingIndicator() {
        const indicator = document.getElementById('gsTypingIndicator');
        if (indicator) {
            indicator.remove();
        }
    }
}

// Auto-initialize when DOM is ready
document.addEventListener('DOMContentLoaded', function() {
    if (!document.querySelector('.gs-chatbot-widget')) {
        window.yikesAIChatbot = new YikesAIChatbot();
    }
});

window.YikesAIChatbot = YikesAIChatbot;
