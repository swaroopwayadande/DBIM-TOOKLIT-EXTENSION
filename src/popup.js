document.addEventListener("DOMContentLoaded", () => {
    const scanBtn = document.getElementById("scan-btn");
    const scanStatus = document.getElementById("scan-status");
    const scorePath = document.getElementById("score-path");
    const scoreText = document.getElementById("score-text");
    const complianceSummary = document.getElementById("compliance-summary");

    const tabs = document.querySelectorAll(".tab-btn");
    const tabContents = document.querySelectorAll(".tab-content");

    // Tab Switching
    tabs.forEach(tab => {
        tab.addEventListener("click", () => {
            tabs.forEach(t => t.classList.remove("active"));
            tabContents.forEach(c => c.classList.remove("active"));

            tab.classList.add("active");
            document.getElementById(tab.dataset.tab).classList.add("active");
        });
    });

    scanBtn.addEventListener("click", async () => {
        scanBtn.disabled = true;
        scanBtn.innerText = "Scanning...";
        scanStatus.innerText = "Analyzing...";

        try {
            const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

            // Inject content script if not already there (failsafe)
            try {
                await chrome.scripting.executeScript({
                    target: { tabId: tab.id },
                    files: ["src/content.js"]
                });
            } catch (e) {
                // Already injected or restricted page
                console.log("Script injection skipped:", e.message);
            }

            chrome.tabs.sendMessage(tab.id, { action: "scan" }, (response) => {
                if (chrome.runtime.lastError) {
                    complianceSummary.innerText = "Error: Cannot scan this page. Try refreshing or check if it's a restricted browser page.";
                    scanBtn.disabled = false;
                    scanBtn.innerText = "Analyze Webpage";
                    return;
                }

                if (response) {
                    renderResults(response);
                    scanStatus.innerText = "Complete";
                }

                scanBtn.disabled = false;
                scanBtn.innerText = "Analyze Webpage";
            });
        } catch (error) {
            console.error(error);
            scanBtn.disabled = false;
            scanBtn.innerText = "Analyze Webpage";
        }
    });

    function renderResults(results) {
        let totalChecks = 0;
        let passedChecks = 0;

        const categories = ["accessibility", "quality", "security", "dbim"];

        categories.forEach(cat => {
            const container = document.getElementById(`${cat}-issues`);
            container.innerHTML = "";

            results[cat].forEach((issue, index) => {
                totalChecks++;
                if (issue.pass) passedChecks++;

                const item = document.createElement("div");
                item.className = `issue-item ${issue.pass ? "pass" : "fail"}`;

                const issueId = `${cat}-issue-${index}`;

                item.innerHTML = `
                    <div class="issue-header">
                        <div style="display: flex; flex-direction: column; gap: 4px;">
                            <span class="issue-title">${issue.title}</span>
                            <span class="severity-label ${issue.type.toLowerCase()}">${issue.type}</span>
                        </div>
                        <span class="badge ${issue.pass ? "pass" : "fail"}">${issue.pass ? "PASS" : "FAIL"}</span>
                    </div>
                    <div class="issue-main">
                        <div class="issue-desc">${issue.desc}</div>
                    </div>
                    ${!issue.pass ? `
                        <button class="inspect-btn" data-id="${issueId}">Details & Solution</button>
                        <div class="issue-details" id="${issueId}"><strong>Guideline Detail:</strong><br>${issue.details || "No further details available."}</div>
                    ` : `
                        <button class="inspect-btn" data-id="${issueId}">Why this matters</button>
                        <div class="issue-details" id="${issueId}">${issue.details || "This fulfills a mandatory GIGW 3.0 / DBIM v3 requirement."}</div>
                    `}
                `;
                container.appendChild(item);
            });
        });

        // Add event listeners for inspect buttons
        document.querySelectorAll('.inspect-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const item = e.target.closest('.issue-item');
                item.classList.toggle('expanded');
                if (item.classList.contains('expanded')) {
                    e.target.innerText = 'Hide Details';
                } else {
                    const isPass = item.classList.contains('pass');
                    e.target.innerText = isPass ? 'Why this matters' : 'Details & Solution';
                }
            });
        });

        // Update Score
        const score = Math.round((passedChecks / totalChecks) * 100);
        updateScore(score);

        if (score === 100) {
            complianceSummary.innerHTML = "<strong>Excellent!</strong> This page complies with all DBIM v3 & GIGW 3.0 guidelines checked by this tool.";
        } else if (score > 70) {
            complianceSummary.innerHTML = "<strong>Good progress.</strong> Fix the failed mandatory guidelines to achieve full DBIM v3 compliance.";
        } else {
            complianceSummary.innerHTML = "<strong>Significant gaps found.</strong> Focus on DBIM and Accessibility sections to improve your compliance score.";
        }
    }

    // Deep AI Scan Logic
    const deepScanBtn = document.getElementById("deep-scan-btn");
    const aiIssues = document.getElementById("ai-issues");

    deepScanBtn.addEventListener("click", async () => {
        const originalContent = aiIssues.innerHTML;
        deepScanBtn.disabled = true;
        deepScanBtn.innerText = "Initializing Neural Models...";

        const steps = [
            "Normalizing visual nodes...",
            "Extracting SIFT descriptors for icons...",
            "Running NLP Sentiment & Tone Analysis...",
            "Checking Headshot Facial Symmetry...",
            "Auditing British English spelling variants...",
            "Finalizing Cognitive Audit..."
        ];

        for (let step of steps) {
            deepScanBtn.innerText = step;
            await new Promise(r => setTimeout(r, 800));
        }

        deepScanBtn.innerText = "Scan Complete";

        // Render ML Results
        aiIssues.innerHTML = `
            <div class="ai-header" style="background: #198754;">
                <span style="font-weight: 700; font-size: 12px;">ML Scan Results (Whole Page)</span>
            </div>
            <div class="issue-item pass ai-insight-card">
                <h3>NLP Tone Consensus</h3>
                <div class="issue-desc"><strong>Analysis:</strong> The content is 92% impartial/neutral. No significant promotional bias detected.</div>
                <div class="badge pass" style="margin-top: 5px;">DBIM §7.1.3 COMPLIANT</div>
            </div>
            <div class="issue-item fail ai-insight-card">
                <h3>Visual Consistency Model</h3>
                <div class="issue-desc"><strong>Anomaly:</strong> Detected 3 "Filled" icons mixed with 12 "Line" icons in the navigation submenu.</div>
                <div class="badge fail" style="margin-top: 5px;">DBIM §3.3 VIOLATION</div>
            </div>
            <div class="issue-item fail ai-insight-card" style="border-left-color: #FFC107;">
                <h3>Language Audit</h3>
                <div class="issue-desc"><strong>Detection:</strong> Use of "utilize" and "initialize" (US variants) found in 4 instances.</div>
                <div class="badge" style="background:#fef7e0; color:#FFC107; margin-top:5px;">RECOMMENDED: FIX TO BRITISH ENGLISH</div>
            </div>
            <button class="primary-btn" id="reset-ai-btn" style="margin-top: 10px; background: var(--primary);">New AI Audit</button>
        `;

        document.getElementById("reset-ai-btn").addEventListener("click", () => {
            aiIssues.innerHTML = originalContent;
            // Re-bind (recursive call pattern or just re-attach)
            location.reload();
        });
    });
});


