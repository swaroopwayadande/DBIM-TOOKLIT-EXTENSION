# DBIM v3 Toolkit - Global Website Checker

This toolkit is designed for the **Ministry of Electronics and Information Technology (MeitY)** to ensure digital platforms comply with the **Digital Brand Identity Manual (DBIM) v3** and **GIGW 3.0**.

## 🚀 Getting Started

### 1. Load the Browser Extension
1. Open Chrome and navigate to `chrome://extensions/`.
2. Enable **"Developer mode"** in the top right.
3. Click **"Load unpacked"**.
4. Select the `gigw-toolkit` folder (the root of this repository).

### 2. Run the Deep AI Auditor (Backend)
The backend uses NLP and Computer Vision concepts to audit tone, language, and visual consistency.

#### Setup Virtual Environment
```powershell
# 1. Create venv
python -m venv venv

# 2. Activate venv
# On Windows:
.\venv\Scripts\activate
# On macOS/Linux:
source venv/bin/activate

# 3. Install dependencies
pip install -r ai-auditor/requirements.txt
```

#### Running the Audit
```bash
python ai-auditor/dbim_ai_auditor.py
```


## 🛠 Features
- **DBIM v3 Compliance**: Scans for Noto Sans, State Emblem, Inclusive White palette, and sticky navigation.
- **Accessibility (GIGW 3.0)**: Checks for Alt text, skip links, form labels, and language attributes.
- **Deep AI Audit**: ML-powered analysis of tone of voice, sentiment, and icon consistency.
- **Integrated Manual**: The official DBIM v3 PDF is available directly in the extension footer.

## 📁 Project Structure
- `src/`: Extension source code (HTML, CSS, JS).
- `ai-auditor/`: Python-based ML audit engine.
- `icons/`: Extension icons.
- `DBIM MANUAL.pdf`: Official guidelines reference.

---
© 2025 MeitY Digital Governance Division
