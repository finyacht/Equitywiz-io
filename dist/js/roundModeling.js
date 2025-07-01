document.addEventListener("DOMContentLoaded",function(){let i=document.getElementById("method-pre-money"),e=document.getElementById("method-percentage"),d=document.getElementById("pre-money-valuation"),o=document.getElementById("investment-amount"),c=document.getElementById("target-ownership"),u=document.getElementById("post-money-result"),r=document.getElementById("new-ownership-result"),m=document.getElementById("dilution-result"),t=document.getElementById("ownership-chart"),n=document.getElementById("dilution-chart"),a=document.getElementById("add-note"),p=document.getElementById("note-modal"),s=document.getElementById("notes-container"),l=document.getElementById("notes-empty-state"),v=document.getElementById("save-note"),P=document.getElementById("add-safe"),y=document.getElementById("safe-modal"),H=document.getElementById("safes-container"),g=document.getElementById("safes-empty-state"),O=document.getElementById("save-safe"),f=document.getElementById("safe-type"),E=document.getElementById("safe-cap-group"),h=document.getElementById("safe-discount-group"),R=document.getElementById("chatbot-toggle"),I=document.getElementById("chatbot-modal"),M=document.getElementById("close-chatbot"),V=document.getElementById("send-message"),b=document.getElementById("chat-input"),B=document.getElementById("chat-messages"),W=document.querySelectorAll(".close-modal, .btn-cancel"),w=[],k=[],F=null,L=null;function A(){i.checked?(d.disabled=!1,o.disabled=!1,c.disabled=!0):(d.disabled=!0,o.disabled=!1,c.disabled=!1),C()}function $(e){"pre-money-valuation"!==e.target.id&&"investment-amount"!==e.target.id||(e.target.value=e.target.value.replace(/[^0-9.,]/g,"")),C()}function C(){var e=parseFloat(d.value.replace(/[^0-9.]/g,""))||0,t=parseFloat(o.value.replace(/[^0-9.]/g,""))||0;let n=parseFloat(c.value)||0,a,s,l;i.checked?(a=e+t,s=t/a*100,l=s):(100<=n&&(n=99.99),e=(a=100*t/n)-t,s=n,l=s,d.value=N(e)),u.textContent=N(a),r.textContent=s.toFixed(2)+"%",m.textContent=l.toFixed(2)+"%",t=s,e=100-t,F.data.datasets[0].data=[e,t],F.update(),L.data.datasets[0].data=[100,e],L.update()}function U(){var e=document.getElementById("note-name").value,t=document.getElementById("note-amount").value,n=document.getElementById("note-interest").value,a=document.getElementById("note-discount").value,s=document.getElementById("note-cap").value,l=document.getElementById("note-maturity").value;e&&t?(e={id:Date.now(),name:e,amount:parseFloat(t.replace(/[^0-9.]/g,"")),interest:parseFloat(n)||0,discount:parseFloat(a)||0,cap:parseFloat(s.replace(/[^0-9.]/g,""))||0,maturity:parseInt(l)||24,date:(new Date).toISOString()},w.push(e),x(),p.style.display="none",document.getElementById("note-name").value="",document.getElementById("note-amount").value="",document.getElementById("note-interest").value="",document.getElementById("note-discount").value="",document.getElementById("note-cap").value="",document.getElementById("note-maturity").value=""):alert("Please enter a name and amount for the note.")}function Y(){var e=document.getElementById("safe-name").value,t=document.getElementById("safe-amount").value,n=document.getElementById("safe-type").value,a=document.getElementById("safe-cap").value,s=document.getElementById("safe-discount").value,l=document.getElementById("safe-pro-rata").value;e&&t?(e={id:Date.now(),name:e,amount:parseFloat(t.replace(/[^0-9.]/g,"")),type:n,cap:parseFloat(a.replace(/[^0-9.]/g,""))||0,discount:parseFloat(s)||0,proRata:"yes"===l,date:(new Date).toISOString()},k.push(e),D(),y.style.display="none",document.getElementById("safe-name").value="",document.getElementById("safe-amount").value="",document.getElementById("safe-type").value="cap-no-discount",document.getElementById("safe-cap").value="",document.getElementById("safe-discount").value="",document.getElementById("safe-pro-rata").value="no",S()):alert("Please enter a name and amount for the SAFE.")}function S(){var e=f.value;E.style.display="cap-no-discount"===e||"cap-and-discount"===e?"block":"none",h.style.display="discount-no-cap"===e||"cap-and-discount"===e?"block":"none","mfn"===e&&(E.style.display="none",h.style.display="none")}function x(){if(0===w.length)l.style.display="block";else{l.style.display="none";let t="";w.forEach(e=>{t+=`
        <div class="card-item" data-id="${e.id}">
          <div class="card-item-header">
            <h4>${e.name}</h4>
            <div class="card-item-actions">
              <button class="btn-edit" onclick="editNote(${e.id})">
                <i class="fas fa-edit"></i>
              </button>
              <button class="btn-delete" onclick="deleteNote(${e.id})">
                <i class="fas fa-trash"></i>
              </button>
            </div>
          </div>
          <div class="card-item-details">
            <div class="detail-row">
              <span class="detail-label">Amount:</span>
              <span class="detail-value">${N(e.amount)}</span>
            </div>
            <div class="detail-row">
              <span class="detail-label">Interest Rate:</span>
              <span class="detail-value">${e.interest}%</span>
            </div>
            <div class="detail-row">
              <span class="detail-label">Discount:</span>
              <span class="detail-value">${e.discount}%</span>
            </div>
            <div class="detail-row">
              <span class="detail-label">Valuation Cap:</span>
              <span class="detail-value">${e.cap?N(e.cap):"None"}</span>
            </div>
            <div class="detail-row">
              <span class="detail-label">Term:</span>
              <span class="detail-value">${e.maturity} months</span>
            </div>
          </div>
        </div>
      `}),s.innerHTML=t}}function D(){if(0===k.length)g.style.display="block";else{g.style.display="none";let n="";k.forEach(e=>{let t="";switch(e.type){case"cap-no-discount":t="Valuation Cap Only";break;case"discount-no-cap":t="Discount Only";break;case"cap-and-discount":t="Valuation Cap & Discount";break;case"mfn":t="MFN"}n+=`
        <div class="card-item" data-id="${e.id}">
          <div class="card-item-header">
            <h4>${e.name}</h4>
            <div class="card-item-actions">
              <button class="btn-edit" onclick="editSafe(${e.id})">
                <i class="fas fa-edit"></i>
              </button>
              <button class="btn-delete" onclick="deleteSafe(${e.id})">
                <i class="fas fa-trash"></i>
              </button>
            </div>
          </div>
          <div class="card-item-details">
            <div class="detail-row">
              <span class="detail-label">Amount:</span>
              <span class="detail-value">${N(e.amount)}</span>
            </div>
            <div class="detail-row">
              <span class="detail-label">Type:</span>
              <span class="detail-value">${t}</span>
            </div>
            ${e.cap?`
            <div class="detail-row">
              <span class="detail-label">Valuation Cap:</span>
              <span class="detail-value">${N(e.cap)}</span>
            </div>
            `:""}
            ${e.discount?`
            <div class="detail-row">
              <span class="detail-label">Discount:</span>
              <span class="detail-value">${e.discount}%</span>
            </div>
            `:""}
            <div class="detail-row">
              <span class="detail-label">Pro-rata:</span>
              <span class="detail-value">${e.proRata?"Yes":"No"}</span>
            </div>
          </div>
        </div>
      `}),H.innerHTML=n}}function N(e){return e?(e=parseFloat(e.toString().replace(/[^0-9.]/g,"")),new Intl.NumberFormat("en-US",{style:"currency",currency:"USD",minimumFractionDigits:0,maximumFractionDigits:0}).format(e)):"$0"}function T(){var e=b.value.trim();if(e){q("user",e),b.value="";{var a=e;let n=document.createElement("div");n.className="message bot-message typing",n.innerHTML="Typing...",B.appendChild(n),B.scrollTop=B.scrollHeight,setTimeout(()=>{B.removeChild(n);let e="";var t=a.toLowerCase();q("bot",e=t.includes("safe")&&t.includes("what")?"A SAFE (Simple Agreement for Future Equity) is an investment instrument that allows investors to fund startups in exchange for the right to purchase equity in a future equity round.":t.includes("valuation cap")?"A valuation cap sets the maximum valuation at which the investment converts to equity, giving investors a minimum equity stake regardless of the valuation in a future round.":t.includes("discount")?"A discount gives investors shares at a reduced price compared to new investors, typically ranging from 10-30% off the price per share in a future financing round.":t.includes("dilution")||t.includes("diluted")?"Dilution occurs when new shares are issued, reducing the ownership percentage of existing shareholders. It's a normal part of raising capital through equity financing.":t.includes("convertible note")||t.includes("note")?"A convertible note is a debt instrument that converts to equity upon a triggering event, usually a future financing round. It includes an interest rate, maturity date, and may have a valuation cap and/or discount.":t.includes("pre-money")||t.includes("post-money")?"Pre-money valuation is the company's value before receiving funding. Post-money valuation is pre-money plus the new investment amount. The formula is: Post-money = Pre-money + Investment.":t.includes("pro rata")||t.includes("pro-rata")?"Pro-rata rights allow investors to maintain their ownership percentage in future rounds by participating at the same rate as their current ownership.":t.includes("hello")||t.includes("hi")?"Hello! How can I help you with round modeling, SAFEs, or convertible notes today?":"I'm not sure how to answer that specifically. Would you like to know more about SAFEs, convertible notes, or equity funding rounds?")},1e3)}}}function q(e,t){var n=document.createElement("div");n.className=`message ${e}-message`,n.textContent=t,B.appendChild(n),B.scrollTop=B.scrollHeight}window.editNote=function(t){var e=w.find(e=>e.id===t);e&&(document.getElementById("note-name").value=e.name,document.getElementById("note-amount").value=e.amount,document.getElementById("note-interest").value=e.interest,document.getElementById("note-discount").value=e.discount,document.getElementById("note-cap").value=e.cap,document.getElementById("note-maturity").value=e.maturity,w=w.filter(e=>e.id!==t),p.style.display="flex")},window.deleteNote=function(t){confirm("Are you sure you want to delete this note?")&&(w=w.filter(e=>e.id!==t),x())},window.editSafe=function(t){var e=k.find(e=>e.id===t);e&&(document.getElementById("safe-name").value=e.name,document.getElementById("safe-amount").value=e.amount,document.getElementById("safe-type").value=e.type,document.getElementById("safe-cap").value=e.cap,document.getElementById("safe-discount").value=e.discount,document.getElementById("safe-pro-rata").value=e.proRata?"yes":"no",S(),k=k.filter(e=>e.id!==t),y.style.display="flex")},window.deleteSafe=function(t){confirm("Are you sure you want to delete this SAFE?")&&(k=k.filter(e=>e.id!==t),D())},F=new Chart(t,{type:"doughnut",data:{labels:["Existing Shareholders","New Investors"],datasets:[{data:[83.33,16.67],backgroundColor:["#4CAF50","#2196F3"],borderWidth:0}]},options:{responsive:!0,maintainAspectRatio:!1,plugins:{legend:{position:"bottom"},tooltip:{callbacks:{label:function(e){return e.label+": "+e.raw+"%"}}}}}}),L=new Chart(n,{type:"bar",data:{labels:["Before","After"],datasets:[{label:"Ownership Percentage",data:[100,83.33],backgroundColor:["#4CAF50","#4CAF50"],borderWidth:0}]},options:{responsive:!0,maintainAspectRatio:!1,scales:{y:{beginAtZero:!0,max:100,ticks:{callback:function(e){return e+"%"}}}},plugins:{legend:{display:!1},tooltip:{callbacks:{label:function(e){return"Existing shareholders: "+e.raw+"%"}}}}}}),i.addEventListener("change",A),e.addEventListener("change",A),d.addEventListener("input",$),o.addEventListener("input",$),c.addEventListener("input",$),a.addEventListener("click",function(){p.style.display="flex"}),P.addEventListener("click",function(){y.style.display="flex"}),v.addEventListener("click",U),O.addEventListener("click",Y),f.addEventListener("change",function(){S()}),W.forEach(e=>{e.addEventListener("click",function(){p.style.display="none",y.style.display="none"})}),R.addEventListener("click",function(){I.classList.toggle("visible")}),M.addEventListener("click",function(){I.classList.remove("visible")}),V.addEventListener("click",T),b.addEventListener("keypress",function(e){"Enter"===e.key&&T()}),d.addEventListener("blur",function(){this.value=N(this.value)}),o.addEventListener("blur",function(){this.value=N(this.value)}),C()});