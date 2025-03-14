let shareClasses=[],transactions=[],exitAmount=1e7,summaryChart=null,exitDistributionChart=null,shareClassesTableBody,transactionsTableBody;function init(){try{console.log("Initializing application..."),shareClasses=[...waterfallCalculator.DEFAULT_SHARE_CLASSES],transactions=[...waterfallCalculator.DEFAULT_TRANSACTIONS],elements={shareClassesTableBody:document.querySelector("#shareClassesTable tbody"),transactionsTableBody:document.querySelector("#transactionsTable tbody"),summaryTableBody:document.querySelector("#summaryTable tbody"),combinedChart:document.getElementById("combinedChart"),exitDistributionChart:document.getElementById("exitDistributionChart"),exitAmountInput:document.getElementById("exitAmount"),addShareClassBtn:document.getElementById("addShareClassBtn"),addTransactionBtn:document.getElementById("addTransactionBtn"),closeModalButtons:document.querySelectorAll(".close-modal, .cancel-modal")},console.log("Elements initialized:",elements),shareClassesTableBody=elements.shareClassesTableBody,transactionsTableBody=elements.transactionsTableBody,setupEventListeners(),setupNumericInputs(),renderShareClasses(),renderTransactions(),updateWaterfallAnalysis(),window.addEventListener("error",function(e){console.error("Global error caught:",e.error)}),console.log("Application initialized successfully")}catch(e){console.error("Error initializing application:",e)}}function setupEventListeners(){document.getElementById("addShareClassBtn").addEventListener("click",function(){addNewShareClassRow()}),document.getElementById("addTransactionBtn").addEventListener("click",function(){addNewTransactionRow()});var e=document.getElementById("exitAmount");e.addEventListener("input",function(){parseNumberWithCommas(this.value);updateWaterfallAnalysis()}),e.addEventListener("blur",function(){var e=parseNumberWithCommas(this.value);this.value=formatNumberWithCommas(e),updateWaterfallAnalysis()}),elements.closeModalButtons&&elements.closeModalButtons.forEach(e=>{e.addEventListener("click",closeModal)})}function formatNumberWithCommas(e){return e.toString().replace(/\B(?=(\d{3})+(?!\d))/g,",")}function parseNumberWithCommas(e){return e&&parseFloat(e.toString().replace(/,/g,""))||0}function setupNumericInputs(){document.querySelectorAll('input[type="text"].shares, input[type="text"].investment, #exitAmount').forEach(e=>{e.addEventListener("blur",function(){var e=parseNumberWithCommas(this.value);this.value=formatNumberWithCommas(e)}),e.addEventListener("focus",function(){this.value=this.value.replace(/,/g,"")})}),document.querySelectorAll("#exitAmount").forEach(e=>{var t=parseNumberWithCommas(e.value);e.value=formatNumberWithCommas(t)}),document.addEventListener("DOMNodeInserted",function(e){e.target.querySelectorAll&&e.target.querySelectorAll('input[type="text"].shares, input[type="text"].investment').forEach(e=>{e.addEventListener("blur",function(){var e=parseNumberWithCommas(this.value);this.value=formatNumberWithCommas(e)}),e.addEventListener("focus",function(){this.value=this.value.replace(/,/g,"")})})})}function renderShareClasses(){shareClassesTableBody.innerHTML="",shareClasses.forEach(e=>{let t=document.createElement("tr"),a=(t.dataset.id=e.id,t.innerHTML=`
            <td><input type="text" class="name" value="${e.name}" data-field="name" data-id="${e.id}"></td>
            <td>
                <select class="type" data-field="type" data-id="${e.id}">
                    <option value="preferred" ${"preferred"===e.type?"selected":""}>Preferred</option>
                    <option value="common" ${"common"===e.type?"selected":""}>Common</option>
                </select>
            </td>
            <td><input type="number" class="seniority" min="1" value="${e.seniority}" data-field="seniority" data-id="${e.id}"></td>
            <td>
                <input type="number" class="liquidationPref" min="1" step="0.1" value="${e.liquidationPref}" 
                data-field="liquidationPref" data-id="${e.id}" 
                style="display: ${"preferred"===e.type?"block":"none"}">
                <span style="display: ${"preferred"===e.type?"none":"block"}">-</span>
            </td>
            <td>
                <select class="prefType" data-field="prefType" data-id="${e.id}" 
                style="display: ${"preferred"===e.type?"block":"none"}">
                    <option value="non-participating" ${"non-participating"===e.prefType?"selected":""}>Non-Part.</option>
                    <option value="participating" ${"participating"===e.prefType?"selected":""}>Part.</option>
                </select>
                <span style="display: ${"preferred"===e.type?"none":"block"}">-</span>
            </td>
            <td>
                <input type="number" class="cap" min="0" step="0.1" 
                value="${e.cap||""}" placeholder="No cap"
                data-field="cap" data-id="${e.id}"
                style="display: ${"preferred"===e.type&&"participating"===e.prefType?"block":"none"}">
                <span style="display: ${"preferred"===e.type&&"participating"===e.prefType?"none":"block"}">${"preferred"===e.type&&"participating"===e.prefType?"":"No Cap"}</span>
            </td>
            <td>
                <button class="delete" data-action="delete" data-id="${e.id}">Delete</button>
            </td>
        `,t.querySelector(".type")),n=[t.querySelector(".liquidationPref"),t.querySelector(".prefType")],r=[t.querySelector("td:nth-child(4) span"),t.querySelector("td:nth-child(5) span")],s=t.querySelector(".cap"),i=t.querySelector("td:nth-child(6) span");a.addEventListener("change",function(){let a="preferred"===this.value;n.forEach((e,t)=>{e.style.display=a?"block":"none",r[t].style.display=a?"none":"block"});var e="participating"===t.querySelector(".prefType").value;s.style.display=a&&e?"block":"none",i.style.display=a&&e?"none":"block",i.textContent="No Cap"}),t.querySelector(".prefType")?.addEventListener("change",function(){var e;"preferred"===a.value&&(e="participating"===this.value,s.style.display=e?"block":"none",i.style.display=e?"none":"block",i.textContent="No Cap")}),shareClassesTableBody.appendChild(t)}),addShareClassEventListeners()}function renderTransactions(){transactionsTableBody.innerHTML="",transactions.forEach(t=>{var e=document.createElement("tr"),a=(e.dataset.id=t.id,e.innerHTML=`
            <td>
                <select class="shareClass" data-field="shareClass" data-id="${t.id}">
                    ${shareClasses.map(e=>`<option value="${e.name}" ${t.shareClass===e.name?"selected":""}>${e.name}</option>`).join("")}
                </select>
            </td>
            <td>
                <input type="text" class="shares" value="${formatNumberWithCommas(t.shares)}" 
                data-field="shares" data-id="${t.id}">
            </td>
            <td>
                <input type="text" class="investment" value="${formatNumberWithCommas(t.investment)}" 
                data-field="investment" data-id="${t.id}">
            </td>
            <td>
                <button class="delete" data-action="delete" data-id="${t.id}">Delete</button>
            </td>
        `,e.querySelector(".shares")),n=e.querySelector(".investment");a.addEventListener("focus",function(){this.value=this.value.replace(/,/g,"")}),a.addEventListener("blur",function(){var e=parseNumberWithCommas(this.value);this.value=formatNumberWithCommas(e)}),n.addEventListener("focus",function(){this.value=this.value.replace(/,/g,"")}),n.addEventListener("blur",function(){var e=parseNumberWithCommas(this.value);this.value=formatNumberWithCommas(e)}),transactionsTableBody.appendChild(e)}),addTransactionEventListeners()}function createTooltip(e){return`
        <span class="tooltip">
            <span class="tooltip-icon">?</span>
            <span class="tooltip-text">${e}</span>
        </span>
    `}function addTooltipsToShareClassRow(a){let n={seniority:"Determines the order in which share classes receive distributions. Higher numbers have higher priority (3 is higher than 1).",liquidationPref:"Multiplier applied to the original investment that preferred shareholders receive before common shareholders. E.g., 1x means 100% of investment is returned first.",prefType:"Non-participating: Preferred shareholders choose either liquidation preference OR pro-rata share. Participating: Preferred shareholders receive BOTH liquidation preference AND pro-rata share.",cap:"For participating preferred shares, limits the total return as a multiple of the original investment. E.g., 3x cap means maximum return is 3 times the investment."};Object.keys(n).forEach(e=>{var t=a.querySelector(`.${e}-label`);t&&!t.querySelector(".tooltip")&&(t.innerHTML+=createTooltip(n[e]))})}function addNewShareClassRow(){var e=document.createElement("tr"),t=(e.className="editing-row",e.innerHTML=`
        <td><input type="text" class="name" placeholder="e.g., Series A"></td>
        <td>
            <select class="type">
                <option value="common">Common</option>
                <option value="preferred">Preferred</option>
            </select>
        </td>
        <td><input type="number" class="seniority" min="1" value="1"></td>
        <td><input type="number" class="liquidationPref preferred-only" min="0" step="0.1" value="1"></td>
        <td>
            <select class="prefType preferred-only">
                <option value="non-participating">Non-Participating</option>
                <option value="participating">Participating</option>
            </select>
        </td>
        <td><input type="number" class="cap preferred-only participating-only hidden" min="0" step="0.1" placeholder="e.g., 3"></td>
        <td class="action-buttons">
            <button class="save" data-action="save">Save</button>
            <button class="cancel" data-action="cancel">Cancel</button>
        </td>
    `,e.querySelector(".save")),a=e.querySelector(".cancel");t.addEventListener("click",function(){saveShareClass(this)}),a.addEventListener("click",function(){cancelShareClass(this)}),e.querySelector(".type").addEventListener("change",function(){togglePreferredFields(this)}),e.querySelector(".prefType").addEventListener("change",function(){toggleCapField(this)}),addTooltipsToShareClassRow(e),togglePreferredFields(e.querySelector(".type")),shareClassesTableBody.appendChild(e)}function saveShareClass(e){var t,a,n,r,e=e.closest("tr"),s=e.querySelector(".name").value.trim();""!==s&&(t=e.querySelector(".type").value,a=parseInt(e.querySelector(".seniority").value)||1,n="preferred"===t&&parseFloat(e.querySelector(".liquidationPref").value)||1,r="preferred"===t?e.querySelector(".prefType").value:"non-participating",e=e.querySelector(".cap").value,e="preferred"===t&&"participating"===r&&""!==e?parseFloat(e):null,s={id:0<shareClasses.length?Math.max(...shareClasses.map(e=>e.id))+1:1,name:s,type:t,seniority:a,liquidationPref:n,prefType:r,cap:e},shareClasses.push(s),renderShareClasses(),renderTransactions(),updateWaterfallAnalysis())}function cancelShareClass(e){e.closest("tr").remove()}function editShareClass(a){var n=shareClasses.find(e=>e.id===a);if(n){var r=document.createElement("div"),n=(r.className="modal",r.innerHTML=`
        <div class="modal-content">
            <h3>Edit Share Class</h3>
            <div class="form-field">
                <label for="name">Name</label>
                <input type="text" id="name" value="${n.name}">
            </div>
            <div class="form-field">
                <label for="type">Type</label>
                <select id="type">
                    <option value="preferred" ${"preferred"===n.type?"selected":""}>Preferred</option>
                    <option value="common" ${"common"===n.type?"selected":""}>Common</option>
                </select>
            </div>
            <div class="form-field">
                <label for="seniority">Seniority</label>
                <input type="number" id="seniority" min="1" value="${n.seniority}">
            </div>
            <div class="form-field preferred-only ${"preferred"!==n.type?"hidden":""}">
                <label for="liquidationPref">Liquidation Preference</label>
                <input type="number" id="liquidationPref" min="1" step="0.1" value="${n.liquidationPref}">
            </div>
            <div class="form-field preferred-only ${"preferred"!==n.type?"hidden":""}">
                <label for="prefType">Preference Type</label>
                <select id="prefType">
                    <option value="non-participating" ${"non-participating"===n.prefType?"selected":""}>Non-Participating</option>
                    <option value="participating" ${"participating"===n.prefType?"selected":""}>Participating</option>
                </select>
            </div>
            <div class="form-field preferred-only cap-only ${"preferred"!==n.type||"participating"!==n.prefType?"hidden":""}">
                <label for="cap">Cap (x)</label>
                <input type="number" id="cap" min="0" step="0.1" value="${n.cap||""}" placeholder="No cap">
            </div>
            <div class="form-actions">
                <button onclick="updateShareClass(${a})">Save</button>
                <button onclick="closeModal()">Cancel</button>
            </div>
        </div>
    `,document.body.appendChild(r),document.getElementById("type"));let e=document.querySelectorAll(".preferred-only"),t=document.querySelector(".cap-only");n.addEventListener("change",function(){let t="preferred"===this.value;e.forEach(e=>{e.classList.toggle("hidden",!t)})}),document.getElementById("prefType").addEventListener("change",function(){var e="participating"===this.value;t.classList.toggle("hidden",!e)})}}function updateShareClass(t){var e=shareClasses.find(e=>e.id===t);if(e){let a=document.getElementById("name").value.trim();if(""!==a){var n=document.getElementById("type").value,r=parseInt(document.getElementById("seniority").value)||1,s="preferred"===n&&parseFloat(document.getElementById("liquidationPref").value)||1,i="preferred"===n?document.getElementById("prefType").value:"non-participating",l=document.getElementById("cap")?.value,l="preferred"===n&&"participating"===i&&""!==l?parseFloat(l):null;e.name=a,e.type=n,e.seniority=r,e.liquidationPref=s,e.prefType=i,e.cap=l;let t=e.name;transactions.forEach(e=>{e.shareClass===t&&(e.shareClass=a)}),closeModal(),renderShareClasses(),renderTransactions(),updateWaterfallAnalysis()}}}function deleteShareClass(t){let a=shareClasses.find(e=>e.id===t);a&&(shareClasses=shareClasses.filter(e=>e.id!==t),transactions=transactions.filter(e=>e.shareClass!==a.name),renderShareClasses(),renderTransactions(),updateWaterfallAnalysis())}function addNewTransactionRow(){var e=document.createElement("tr"),t=(e.className="editing-row",e.innerHTML=`
        <td>
            <select class="shareClass">
                <option value="">Select Share Class</option>
                ${shareClasses.map(e=>`<option value="${e.id}">${e.name}</option>`).join("")}
            </select>
        </td>
        <td><input type="text" class="shares" placeholder="e.g., 1000000"></td>
        <td><input type="text" class="investment" placeholder="e.g., 1000000"></td>
        <td class="action-buttons">
            <button class="save" data-action="save">Save</button>
            <button class="cancel" data-action="cancel">Cancel</button>
        </td>
    `,e.querySelector(".save")),a=e.querySelector(".cancel"),t=(t.addEventListener("click",function(){saveTransaction(this)}),a.addEventListener("click",function(){cancelTransaction(this)}),e.querySelector(".shares")),a=e.querySelector(".investment");t.addEventListener("focus",function(){this.value=this.value.replace(/,/g,"")}),t.addEventListener("blur",function(){var e=parseNumberWithCommas(this.value);this.value=formatNumberWithCommas(e)}),a.addEventListener("focus",function(){this.value=this.value.replace(/,/g,"")}),a.addEventListener("blur",function(){var e=parseNumberWithCommas(this.value);this.value=formatNumberWithCommas(e)}),transactionsTableBody.appendChild(e)}function saveTransaction(e){var t,e=e.closest("tr"),a=e.querySelector(".shareClass").value;""!==a&&(t=parseNumberWithCommas(e.querySelector(".shares").value),e=parseNumberWithCommas(e.querySelector(".investment").value),a={id:0<transactions.length?Math.max(...transactions.map(e=>e.id))+1:1,shareClass:a,shares:t,investment:e},transactions.push(a),renderTransactions(),updateWaterfallAnalysis())}function cancelTransaction(e){e.closest("tr").remove()}function editTransaction(t){let a=transactions.find(e=>e.id===t);var e;a&&((e=document.createElement("div")).className="modal",e.innerHTML=`
        <div class="modal-content">
            <h3>Edit Transaction</h3>
            <div class="form-field">
                <label for="shareClass">Share Class</label>
                <select id="shareClass">
                    ${shareClasses.map(e=>`<option value="${e.name}" ${a.shareClass===e.name?"selected":""}>${e.name}</option>`).join("")}
                </select>
            </div>
            <div class="form-field">
                <label for="shares">Shares</label>
                <input type="number" id="shares" min="0" value="${a.shares}">
            </div>
            <div class="form-field">
                <label for="investment">Investment ($)</label>
                <input type="number" id="investment" min="0" value="${a.investment}">
            </div>
            <div class="form-actions">
                <button onclick="updateTransaction(${t})">Save</button>
                <button onclick="closeModal()">Cancel</button>
            </div>
        </div>
    `,document.body.appendChild(e))}function updateTransaction(t){var e,a,n,r=transactions.find(e=>e.id===t);r&&""!==(e=document.getElementById("shareClass").value)&&(a=parseFloat(document.getElementById("shares").value)||0,n=parseFloat(document.getElementById("investment").value)||0,r.shareClass=e,r.shares=a,r.investment=n,closeModal(),renderTransactions(),updateWaterfallAnalysis())}function deleteTransaction(t){transactions=transactions.filter(e=>e.id!==t),renderTransactions(),updateWaterfallAnalysis()}function closeModal(){var e=document.querySelector(".modal");e&&e.remove()}function updateWaterfallAnalysis(){try{console.log("Updating waterfall analysis with exit amount:",exitAmount);var e=document.getElementById("exitAmount"),t=(e&&(exitAmount=parseNumberWithCommas(e.value)),waterfallCalculator.calculateDetailedWaterfall(shareClasses,transactions,exitAmount),waterfallCalculator.calculateSummaryWaterfall(shareClasses,transactions,exitAmount));renderSummaryTable(t),renderCombinedChart(t),renderExitDistributionChart(),console.log("Waterfall analysis updated successfully")}catch(e){console.error("Error updating waterfall analysis:",e)}}function renderSummaryTable(e){let a=document.querySelector("#summaryTable tbody");a.innerHTML="",e.forEach(e=>{var t=document.createElement("tr");t.innerHTML=`
            <td>${e.name}</td>
            <td>$${e.payout.toLocaleString()}</td>
            <td>${e.percentage}%</td>
        `,a.appendChild(t)});e=document.createElement("tr");e.className="font-bold",e.innerHTML=`
        <td>Total</td>
        <td>$${exitAmount.toLocaleString()}</td>
        <td>100%</td>
    `,a.appendChild(e)}function renderCombinedChart(e){try{console.log("Rendering combined chart with data:",e);var t=document.getElementById("combinedChart");if(t){summaryChart&&summaryChart.destroy();let n=["Liquidation Preference","Participation","Common Distribution","Additional Distribution","Retained"].map(t=>({label:t,data:e.map(e=>e.components[t]||0),backgroundColor:getDistributionTypeColor(t),borderColor:getDistributionTypeColor(t,.8),borderWidth:1})).filter(e=>e.data.some(e=>0<e));console.log("Chart datasets:",n),summaryChart=new Chart(t,{type:"bar",data:{labels:e.map(e=>e.name),datasets:n},options:{responsive:!0,maintainAspectRatio:!1,scales:{x:{stacked:!0,grid:{display:!1}},y:{stacked:!0,beginAtZero:!0,ticks:{callback:function(e){return"$"+e.toLocaleString()}}}},plugins:{tooltip:{callbacks:{title:function(e){let t=e[0].label;if("Retained by Company"===t)return"Retained by Company";e=shareClasses.find(e=>e.name===t);if(!e)return t;let a=t;return"preferred"===e.type&&(a+=` (${e.prefType})`,"participating"===e.prefType)&&e.cap&&(a+=` - ${e.cap}x cap`),a},label:function(e){var t,a=e.raw;return 0===a?null:(t=(a/exitAmount*100).toFixed(1),`${e.dataset.label}: $${a.toLocaleString()} (${t}%)`)},afterBody:function(a){a[0].label;var e=n.reduce((e,t)=>e+(t.data[a[0].dataIndex]||0),0),t=(e/exitAmount*100).toFixed(1);return[`Total Payout: $${e.toLocaleString()} (${t}%)`]}}},legend:{position:"bottom",labels:{boxWidth:12,padding:15}}}}}),console.log("Combined chart rendered successfully")}else console.error("Combined chart canvas element not found")}catch(e){console.error("Error rendering combined chart:",e)}}function renderExitDistributionChart(){try{console.log("Rendering exit distribution chart");var e=document.getElementById("exitDistributionChart");if(e){exitDistributionChart&&exitDistributionChart.destroy();var t=2*exitAmount;let n=waterfallCalculator.calculateExitDistribution(shareClasses,transactions,t,20);var a=[...new Set(shareClasses.filter(t=>transactions.some(e=>e.shareClass===t.name)).map(e=>e.name))].map((a,e)=>{var t=n.exitValues.map((e,t)=>{t=n.distributions[t].find(e=>e.name===a);return t?t.payout:0});return{label:a,data:t,fill:!1,borderColor:waterfallCalculator.getShareClassColor(a,e),backgroundColor:waterfallCalculator.getShareClassColor(a,e,.1),tension:.4}});exitDistributionChart=new Chart(e,{type:"line",data:{labels:n.exitValues.map(e=>waterfallCalculator.formatCurrency(e)),datasets:a},options:{responsive:!0,maintainAspectRatio:!1,interaction:{intersect:!1,mode:"index"},scales:{x:{title:{display:!0,text:"Exit Value"}},y:{beginAtZero:!0,title:{display:!0,text:"Distribution Amount"},ticks:{callback:e=>waterfallCalculator.formatCurrency(e)}}},plugins:{tooltip:{enabled:!0,mode:"index",intersect:!1,callbacks:{title:function(e){return"Exit Value: "+e[0].label},label:function(e){return e.dataset.label+": "+waterfallCalculator.formatCurrency(e.raw)}}}}}}),console.log("Exit distribution chart rendered successfully")}else console.error("Exit distribution chart canvas element not found")}catch(e){console.error("Error rendering exit distribution chart:",e)}}function getDistributionTypeColor(e,t=1){return{"Liquidation Preference":`rgba(59, 130, 246, ${t})`,Participation:`rgba(16, 185, 129, ${t})`,"Common Distribution":`rgba(107, 114, 128, ${t})`,"Additional Distribution":`rgba(168, 85, 247, ${t})`,Retained:`rgba(245, 158, 11, ${t})`}[e]||`rgba(107, 114, 128, ${t})`}function togglePreferredFields(e){var t=e.closest("tr");let a="preferred"===e.value;t.querySelectorAll(".preferred-only").forEach(e=>{a?e.classList.remove("hidden"):e.classList.add("hidden")}),a&&toggleCapField(t.querySelector(".prefType"))}function toggleCapField(e){var t=e.closest("tr"),e="participating"===e.value,t=t.querySelector(".cap");e?t.classList.remove("hidden"):t.classList.add("hidden")}function addShareClassEventListeners(){shareClassesTableBody.addEventListener("change",function(e){var e=e.target,t=e.dataset.field,a=parseInt(e.dataset.id);t&&a&&updateShareClassField(a,t,e.value)}),shareClassesTableBody.addEventListener("click",function(e){var e=e.target;"delete"===e.dataset.action&&(e=parseInt(e.dataset.id))&&deleteShareClass(e)})}function addTransactionEventListeners(){transactionsTableBody.addEventListener("change",function(t){var t=t.target,a=t.dataset.field,n=parseInt(t.dataset.id);if(a&&n){let e=t.value;"shares"!==a&&"investment"!==a||(e=parseNumberWithCommas(e)),updateTransactionField(n,a,e)}}),transactionsTableBody.addEventListener("click",function(e){var e=e.target,t=e.dataset.action,e=parseInt(e.dataset.id);t&&e&&"delete"===t&&deleteTransaction(e)})}document.addEventListener("DOMContentLoaded",function(){shareClassesTableBody=document.querySelector("#shareClassesTable tbody"),transactionsTableBody=document.querySelector("#transactionsTable tbody"),init()}),window.addNewShareClassRow=addNewShareClassRow,window.editShareClass=editShareClass,window.updateShareClass=updateShareClass,window.deleteShareClass=deleteShareClass,window.addNewTransactionRow=addNewTransactionRow,window.updateTransaction=updateTransaction,window.deleteTransaction=deleteTransaction,window.closeModal=closeModal,window.updateShareClassField=function(t,e,n){var r=shareClasses.find(e=>e.id===t);if(r){switch(e){case"name":let t=r.name,a=n.trim();if(""===a)return;r.name=a,transactions.forEach(e=>{e.shareClass===t&&(e.shareClass=a)}),renderShareClasses(),renderTransactions();break;case"type":"common"===(r.type=n)&&(r.liquidationPref=1,r.prefType="non-participating",r.cap=null);break;case"seniority":r.seniority=parseInt(n)||1;break;case"liquidationPref":"preferred"===r.type&&(r.liquidationPref=parseFloat(n)||1);break;case"prefType":"preferred"===r.type&&"non-participating"===(r.prefType=n)&&(r.cap=null);break;case"cap":"preferred"===r.type&&"participating"===r.prefType&&(r.cap=""!==n?parseFloat(n):null)}updateWaterfallAnalysis()}},window.updateTransactionField=function(t,e,a){var n=transactions.find(e=>e.id===t);if(n){switch(e){case"shareClass":n.shareClass=a;break;case"shares":n.shares="string"==typeof a?parseNumberWithCommas(a):a;break;case"investment":n.investment="string"==typeof a?parseNumberWithCommas(a):a}updateWaterfallAnalysis()}},window.saveShareClass=saveShareClass,window.cancelShareClass=cancelShareClass,window.saveTransaction=saveTransaction,window.cancelTransaction=cancelTransaction,window.togglePreferredFields=togglePreferredFields,window.toggleCapField=toggleCapField,window.editShareClass=editShareClass,window.updateShareClass=updateShareClass,window.deleteShareClass=deleteShareClass,window.editTransaction=editTransaction,window.updateTransaction=updateTransaction,window.deleteTransaction=deleteTransaction,window.closeModal=closeModal;