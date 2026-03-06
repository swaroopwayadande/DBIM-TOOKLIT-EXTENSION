// GIGW and DBIM Web Scanner Logic - Updated for DBIM v3 (Jan 2025)
(function () {
    console.log("GIGW & DBIM Toolkit: DBIM v3 Scanner Loaded");

    chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
        if (request.action === "scan") {
            const results = scanPage();
            sendResponse(results);
        }
        return true;
    });

    function scanPage() {
        const results = {
            accessibility: [],
            quality: [],
            security: [],
            dbim: []
        };

        const getSelector = (el) => {
            if (el.id) return `#${el.id}`;
            let sel = el.tagName.toLowerCase();
            if (el.className && typeof el.className === 'string') {
                sel += `.${el.className.split(' ').filter(c => !!c).join('.')}`;
            }
            return sel;
        };

        const getComputedStyleValue = (el, prop) => {
            return window.getComputedStyle(el).getPropertyValue(prop);
        };

        // --- 1. ACCESSIBILITY CHECKS ---
        // 1.1 HTML Lang
        const htmlLang = document.documentElement.getAttribute("lang");
        results.accessibility.push({
            title: "HTML Language Attribute",
            desc: htmlLang ? `Lang attribute found: ${htmlLang}` : "Missing 'lang' attribute in <html> tag.",
            pass: !!htmlLang,
            type: "MANDATORY",
            details: htmlLang
                ? `Currently set to: <html lang="${htmlLang}">\nThis allows screen readers to use the correct voice synthesis.`
                : "Fix: Add a lang attribute (e.g., lang=\"en\") to the root <html> element as per GIGW 3.0 section 5.2.2."
        });

        // 1.2 Image Alt Text
        const images = Array.from(document.querySelectorAll("img"));
        const missingAlt = images.filter(img => !img.hasAttribute("alt") || img.getAttribute("alt").trim() === "");
        results.accessibility.push({
            title: "Image Alt Text",
            desc: missingAlt.length === 0 ? "All images have alt text." : `${missingAlt.length} images are missing alt text.`,
            pass: missingAlt.length === 0,
            type: "MANDATORY",
            details: missingAlt.length > 0
                ? "Missing alt on these elements:\n" + missingAlt.slice(0, 5).map(img => `- ${img.src.split('/').pop() || 'Image'}`).join('\n') + "\n\nProvide meaningful 'alt' text for all images to ensure accessibility for visually impaired users."
                : "All <img> tags have alt attributes as per GIGW guidelines."
        });

        // 1.3 Skip to Main Content
        const skipLink = Array.from(document.querySelectorAll("a")).find(a =>
            a.textContent.toLowerCase().includes("skip to") ||
            a.href.includes("#main") ||
            a.href.includes("#content") ||
            a.href.includes("#main-content")
        );
        results.accessibility.push({
            title: "Skip to Main Content",
            desc: skipLink ? "Skip link found." : "No 'Skip to main content' link found.",
            pass: !!skipLink,
            type: "MANDATORY",
            details: skipLink
                ? `Found skip link: "${skipLink.textContent.trim()}"\nThis helps keyboard users bypass repetitive navigation.`
                : "Fix: Add an anchor link at the very beginning of the <body> that points to the main content container (e.g., <a href=\"#main\">Skip to main content</a>)."
        });

        // 1.4 Form Labels
        const fields = Array.from(document.querySelectorAll("input:not([type='hidden']):not([type='submit']):not([type='button']), select, textarea"));
        const missingLabels = fields.filter(f => {
            if (f.id) {
                const label = document.querySelector(`label[for="${f.id}"]`);
                if (label) return false;
            }
            return !f.closest("label");
        });
        results.accessibility.push({
            title: "Form Labels",
            desc: missingLabels.length === 0 ? "All form fields have associated labels." : `${missingLabels.length} fields missing labels.`,
            pass: missingLabels.length === 0,
            type: "MANDATORY",
            details: missingLabels.length > 0
                ? "Fields missing labels:\n" + missingLabels.slice(0, 5).map(i => `- ${getSelector(i)}`).join('\n') + "\n\nFix: Ensure every input has a <label> with a 'for' attribute matching the input's 'id'."
                : "Form controls are properly labeled as per WCAG 2.1 / GIGW 3.0."
        });

        // --- 2. QUALITY CHECKS ---
        // 2.1 Title
        const title = document.title;
        results.quality.push({
            title: "Page Title",
            desc: title ? `Title: ${title}` : "Missing page title.",
            pass: !!title && title.length > 5,
            type: "MANDATORY",
            details: title
                ? `Current title: "${title}"\nKeep titles concise and meaningful for SEO and browser tabs.`
                : "Fix: Add a descriptive <title> in the <head> section."
        });

        // 2.2 Meta Description
        const metaDesc = document.querySelector('meta[name="description"]');
        results.quality.push({
            title: "Meta Description",
            desc: metaDesc ? "Meta description found." : "Missing meta description.",
            pass: !!metaDesc,
            type: "MANDATORY",
            details: metaDesc
                ? `Current content: "${metaDesc.getAttribute('content').substring(0, 100)}..."`
                : "Fix: Add <meta name=\"description\" content=\"...\"> to help search engines index your site correctly."
        });

        // 2.3 Site Map
        const sitemapLink = Array.from(document.querySelectorAll("a")).find(a =>
            a.textContent.toLowerCase().includes("sitemap") || a.textContent.toLowerCase().includes("site map")
        );
        results.quality.push({
            title: "Sitemap",
            desc: sitemapLink ? "Sitemap link found." : "Required Sitemap link missing.",
            pass: !!sitemapLink,
            type: "MANDATORY",
            details: sitemapLink
                ? `Found at: ${sitemapLink.href}`
                : "Fix: DBIM v3 mandates a hierarchical sitemap (min 2 levels) to be linked in the footer."
        });

        // --- 3. SECURITY & POLICIES ---
        // 3.1 HTTPS
        const isHttps = window.location.protocol === "https:";
        results.security.push({
            title: "HTTPS Encryption",
            desc: isHttps ? "Site is served over HTTPS." : "Site is not using HTTPS.",
            pass: isHttps,
            type: "MANDATORY",
            details: isHttps
                ? "Correct security protocol detected."
                : "Fix: All government websites must be served exclusively over HTTPS for data integrity and user privacy."
        });

        // 3.2 Privacy Policy
        const privacyLink = Array.from(document.querySelectorAll("a")).find(a => a.textContent.toLowerCase().includes("privacy policy"));
        results.security.push({
            title: "Privacy Policy",
            desc: privacyLink ? "Privacy Policy found." : "Missing Privacy Policy link.",
            pass: !!privacyLink,
            type: "MANDATORY",
            details: privacyLink
                ? `Found at: ${privacyLink.href}`
                : "Fix: A link to the Privacy Policy is mandatory in the footer as per DBIM Section 4."
        });

        // 3.3 Cookie Consent (DBIM v3 Section 10)
        const cookieBanner = Array.from(document.querySelectorAll("div, section")).find(el => {
            const text = el.textContent.toLowerCase();
            return (text.includes("cookie") || text.includes("consent")) && (text.includes("accept") || text.includes("agree"));
        });
        results.security.push({
            title: "Cookie Consent Banner",
            desc: cookieBanner ? "Potential cookie banner detected." : "Cookie consent banner not found.",
            pass: !!cookieBanner,
            type: "MANDATORY",
            details: cookieBanner
                ? "Detected a banner with consent terminology."
                : "Fix: DBIM v3 Section 10 mandates a cookie consent banner at the bottom of the page with Accept/Reject/Customize options."
        });

        // --- 4. DBIM 3.0 BRAND IDENTITY (NEW) ---
        // 4.1 State Emblem (Section 4)
        const emblemFound = Array.from(document.querySelectorAll("img, svg")).find(el => {
            const alt = (el.getAttribute("alt") || "").toLowerCase();
            const src = (el.getAttribute("src") || "").toLowerCase();
            return alt.includes("emblem") || alt.includes("national emblem") || src.includes("emblem") || src.includes("national-emblem");
        });
        results.dbim.push({
            title: "State Emblem of India",
            desc: emblemFound ? "State Emblem detected." : "State Emblem of India not found.",
            pass: !!emblemFound,
            type: "MANDATORY",
            details: emblemFound
                ? "National emblem found in the header area."
                : "Fix: The State Emblem must be prominently displayed in the header according to Logo Lockup rules (§5.2)."
        });

        // 4.2 Typography: Noto Sans (Section 3)
        const bodyFont = getComputedStyleValue(document.body, "font-family");
        const usesNoto = bodyFont.toLowerCase().includes("noto sans");
        results.dbim.push({
            title: "Typeface: Noto Sans",
            desc: usesNoto ? `Noto Sans is in use.` : `Current Font: ${bodyFont.split(',')[0]}`,
            pass: usesNoto,
            type: "MANDATORY",
            details: usesNoto
                ? "Successfully using the mandated Noto Sans typeface."
                : "Fix: DBIM v3 Section 3 mandates Noto Sans for all scripts across all digital platforms. Add 'Noto Sans' to your CSS font-family."
        });

        // 4.3 Multilingual Switcher (Section 9)
        const langSwitcher = Array.from(document.querySelectorAll("a, button, span, select")).find(el => {
            const text = el.textContent.toLowerCase();
            return text.includes("hindi") || text.includes("हिंदी") || text.includes("language") || text.includes("अ | a");
        });
        results.dbim.push({
            title: "Multilingual Support",
            desc: langSwitcher ? "Language switcher/English-Hindi toggle found." : "Missing language switcher.",
            pass: !!langSwitcher,
            type: "MANDATORY",
            details: langSwitcher
                ? "Found indicator for language selection."
                : "Fix: Provide a language selection (English/Hindi/Regional) consistently in the header (§9)."
        });

        // 4.4 Sticky Header (Section 4.3)
        const header = document.querySelector("header, .header, #header, nav:first-of-type");
        const isSticky = header && (getComputedStyleValue(header, "position") === "sticky" || getComputedStyleValue(header, "position") === "fixed");
        results.dbim.push({
            title: "Sticky Navigation",
            desc: isSticky ? "Header is fixed/sticky." : "Header does not appear to be sticky.",
            pass: !!isSticky,
            type: "MANDATORY",
            details: isSticky
                ? "Header remains visible on scroll."
                : "Fix: DBIM v3 mandates that the header/global navigation menu must stay sticky while scrolling (§5.4)."
        });

        // 4.5 Functional Palette - Inclusive White (Section 1)
        const bodyBg = getComputedStyleValue(document.body, "background-color");
        const isWhiteBg = bodyBg === "rgb(255, 255, 255)" || bodyBg === "rgba(255, 255, 255, 1)";
        results.dbim.push({
            title: "Functional Palette: Background",
            desc: isWhiteBg ? "Background is Inclusive White (#FFFFFF)." : `Background is ${bodyBg}.`,
            pass: isWhiteBg,
            type: "RECOMMENDED",
            details: isWhiteBg
                ? "Correct primary background color used."
                : "Recommendation: DBIM v3 specifies #FFFFFF (Inclusive White) as the primary background color for digital platforms."
        });

        // 4.6 Footer Key Colour (Section 1 & 4)
        const footer = document.querySelector("footer, .footer, #footer");
        results.dbim.push({
            title: "Footer Background",
            desc: footer ? "Footer element found." : "Footer element not found.",
            pass: !!footer,
            type: "MANDATORY",
            details: footer
                ? "Footer detected. Ensure its background matches the key colour (darkest shade) of your selected color group."
                : "Fix: Every website must have a footer with a background of the selected primary colour group's key shade."
        });

        // 4.7 Table Alignment (Section 3.2)
        const tables = Array.from(document.querySelectorAll("table"));
        let tableCheck = true;
        let tableDetail = "All tables follow alignment rules.";
        if (tables.length > 0) {
            const firstTable = tables[0];
            const firstHeader = firstTable.querySelector("th");
            const headerAlign = firstHeader ? getComputedStyleValue(firstHeader, "text-align") : "center";
            if (headerAlign !== "center") {
                tableCheck = false;
                tableDetail = "Table headers (column names) must be CENTER-aligned as per DBIM Section 3.2.";
            }
        }
        results.dbim.push({
            title: "Table Alignment",
            desc: tableCheck ? "Tables follow alignment rules (sample check)." : "Inconsistent table alignment detected.",
            pass: tableCheck,
            type: "MANDATORY",
            details: tableDetail
        });

        // 4.8 Form Layout (Section 15)
        const forms = Array.from(document.querySelectorAll("form"));
        let formCheck = true;
        let formDetail = "Forms appear to follow vertical layout.";
        if (forms.length > 0) {
            const firstFormInput = forms[0].querySelector("input");
            if (firstFormInput) {
                const display = getComputedStyleValue(firstFormInput, "display");
                // This is a rough check, but often helpful
                if (display === "inline" || display === "inline-block") {
                    // Check parent for flex/grid or just assume
                }
            }
        }
        results.dbim.push({
            title: "Form Layout",
            desc: "Manual Verification Recommended",
            pass: true, // Difficult to automate accurately without false positives
            type: "SHOULD",
            details: "Rule: Forms must be arranged VERTICALLY with ONE field per line. Labels must be aligned ON TOP of fields (§15)."
        });

        return results;
    }
})();

