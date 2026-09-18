# SIH WINNING TACTICS — Complete Intelligence Report

> Based on analysis of 100+ sources: GitHub repos, Reddit threads, Medium articles, LinkedIn posts, winner interviews, and official SIH documentation.

---

## TABLE OF CONTENTS

1. [The Real Game — How SIH Is Actually Won](#1-the-real-game)
2. [Repository Analysis — Winning Project Examples](#2-repository-analysis)
3. [Tech Stacks That Win](#3-tech-stacks-that-win)
4. [PPT Format & Presentation Strategy](#4-ppt-format)
5. [Problem Statement Selection](#5-problem-statement-selection)
6. [Team Formation Blueprint](#6-team-formation)
7. [Judging Criteria & What Evaluators Score](#7-judging-criteria)
8. [Jury Questions — Real Questions & Winning Answers](#8-jury-questions)
9. [Demo Strategy](#9-demo-strategy)
10. [What Makes SIH Winners Different](#10-what-makes-winners-different)
11. [Common Mistakes That Make Teams Lose](#11-common-mistakes)
12. [Timeline & Preparation Checklist](#12-timeline)

---

## 1. THE REAL GAME — HOW SIH IS ACTUALLY WON

SIH looks like a coding competition. It is actually a **multi-month filtering process** where each stage rewards a different skill:

| Stage | What It Rewards |
|-------|----------------|
| Problem Statement Selection | Strategic thinking |
| Internal College Round | Presentation skills |
| National Screening (PPT only) | Written clarity & packaging |
| Grand Finale (36 hours) | Composure + engineering + pitch |

> "The hackathon is won or lost long before the 36-hour clock starts." — Zaid Sayyed, SIH Winner

**Key Insight:** 80% of teams get eliminated before writing a single line of code — mostly by missing SPOC dates, picking the wrong team, or selecting dead problem statements.

---

## 2. REPOSITORY ANALYSIS — WINNING PROJECT EXAMPLES

### GitHub Repo: Aadiii00/SIH-Winners-PPt-and-Sources

**Files in repo:**
- `SIH 2023 Presentation Clean.pdf` — SIH 2023 winning PPT
- `SIH 2024 AKY GreenSort AI.pdf` — GreenSort AI (waste management)
- `SIH 2024 Cannon Crew High Quality.pdf` — Cannon Crew project
- `SIH 2024 Innovators High Quality.pdf` — Innovators project
- `SIH 2024 Techbyte High Quality.pdf` — Techbyte project
- `SIH 2025 GeoGuards High Quality.pdf` — GeoGuards (geospatial)
- `SIH 2025 Tech Pioneers High Quality.pdf` — Tech Pioneers
- `SIH 2026 Playbook TechDoodles Final.pdf` — TechDoodles playbook
- `SIH 2026 - Easy vs Difficult Problem Statements.pdf` — PS selection guide

**What these winning projects have in common:**
- Clear problem → solution → impact flow
- Data visualization (charts, graphs, not just text)
- Polished prototype UI
- Specific tech stacks, not generic "AI/ML" labels

### Other Confirmed Winning Projects

| Project | Year | Tech Stack | What Made It Win |
|---------|------|------------|-----------------|
| **KrishiNetra** | SIH 2025 | Next.js, Hyperledger Fabric, Kotlin, Docker/K8s, 4 AI models | Production-grade, 200K users/day capacity, blockchain transparency |
| **MINE-SIGMA** | SIH 2025 | PyTorch, CesiumJS 4D viz, Ethereum smart contracts | Fusion of AI + Geospatial + Blockchain for illegal mining detection |
| **CarbonX** | SIH 2025 | Next.js 14, Polygon L2, Solidity, PostgreSQL, ML pipeline | Full microservices architecture, 99.9% fraud detection accuracy |
| **HireMe** | SIH 2024 | React, Node.js, Flask, TensorFlow, NLTK, ElasticSearch | Comprehensive skill assessment with AI job matching |
| **Document Verification** | SIH 2024 | React, Node.js, TensorFlow, Ethereum, IPFS, AES-256 | AI fraud detection + blockchain immutability |
| **KnitKraft** | SIH 2023 | Wool supply chain monitoring | End-to-end farm-to-fabric tracking |
| **DhwaniSarathi** | SIH 2023 | App-based audiometer | Medical device innovation |

---

## 3. TECH STACKS THAT WIN

### Most Common in Winning Projects

**Frontend:**
- React.js / Next.js (dominant)
- Flutter (for mobile)
- Tailwind CSS / Framer Motion
- D3.js / CesiumJS (for data visualization)

**Backend:**
- Node.js + Express.js
- Python Flask/FastAPI (for AI components)
- Django (for data-heavy apps)

**AI/ML:**
- TensorFlow / PyTorch
- Scikit-learn
- OpenCV (computer vision)
- Whisper (speech-to-text)
- FAISS (vector search)

**Blockchain:**
- Hyperledger Fabric (enterprise/government)
- Ethereum / Polygon (smart contracts)
- Solidity
- IPFS (decentralized storage)

**Database:**
- PostgreSQL (structured data)
- MongoDB (flexible schemas)
- Redis (caching)
- InfluxDB (time-series)

**DevOps/Infrastructure:**
- Docker + Kubernetes
- AWS / Google Cloud
- Prometheus + Grafana (monitoring)

### The Pattern
> **AI + Blockchain + Cloud** is the winning trifecta for government-focused problem statements. But judges care more about HOW your tech solves the problem than how fancy the stack is.

---

## 4. PPT FORMAT & PRESENTATION STRATEGY

### Official SIH Idea Submission Format (6 Slides)

| Slide | Content | Tips |
|-------|---------|------|
| **1. Title Slide** | PS ID, title, theme, category, team name | Copy from portal character-by-character. Wrong theme = cheapest marks lost |
| **2. Proposed Solution** | What it does, how it solves the problem | Name the SPECIFIC condition. Replace place name — if slide still reads fine, it's not specific enough |
| **3. Technical Approach** | Tech stack, architecture diagram, flowchart | Name ACTUAL libraries/models, not "AI/ML layer". Specific names are checkable = trust signal |
| **4. Feasibility & Viability** | Risks, challenges, mitigation | Include 3 REAL risks with fixes. Teams with no risks = haven't thought past the demo |
| **5. Impact & Benefits** | Quantifiable impact, who benefits | One number with working shown. Hours saved, rupees per district, people helped |
| **6. Research & References** | Data sources, prior work | Name SPECIFIC sources: data.gov.in, ministry reports, Bhuvan. "Government datasets" = no answer |

### Hard Rules (Actually Enforced)
- **Max 6 slides** (including title) — check this year's exact count
- **No paragraphs** — points, diagrams, infographics only
- **Submit as PDF** — wrong format = disqualified
- **Don't alter template headings** — fill content within provided pointers
- File size under 10MB

### What Evaluators Score on PPT (Screening Round)

| Criteria | Weight |
|----------|--------|
| Problem understanding & clarity | 20% |
| Innovation and uniqueness of solution | 25% |
| Technical feasibility | 20% |
| Impact and scalability | 20% |
| Presentation quality and clarity | 15% |

### Grand Finale PPT (10 Slides)

```
1. Title & Team Introduction
2. Problem Statement (with real statistic)
3. Proposed Solution (one-line + flowchart)
4. Technical Architecture (diagram + data flow)
5. Innovation & Novelty (comparison chart)
6. Feasibility & Viability (honest risks)
7. Impact & Benefits (quantified)
8. Prototype/Demo (screenshots + live link)
9. Timeline (hour-by-hour 36-hour plan)
10. Team
```

### Formatting Tips from Winners
- **Diagrams > text** — evaluators scan visually first
- Max 6 bullet points per slide
- 14pt minimum font for body text
- Consistent color scheme throughout
- First two slides matter most (hook + tech approach)
- Add comparison chart (how you're different, not just what you built)
- Add data if possible (survey, financials, user interviews)
- Number your slides, add small footer
- Last slide = links to docs, sheets, prototype
- Use Figma instead of PowerPoint (text stays selectable in diagrams)
- **Print a physical PDF report** for judges — small detail, big impression

---

## 5. PROBLEM STATEMENT SELECTION

### The Strategy

> "Don't pick what you know. Pick what others won't bother to figure out. Fewer competitors + unique problem = real shot at standing out." — SIH 2025 Winner

### Selection Criteria (6-Point Viability Calculator)

1. **Can your team ship a convincing version in 36 hours?**
2. **Does it align with your team's REAL skills?** (not aspirational)
3. **Is the competition field manageable?** (avoid oversaturated PS)
4. **Does the ministry/department have clear expectations?**
5. **Is a similar solution already deployed?** (if yes, what's missing?)
6. **Can you show measurable impact?**

### What Winners Actually Do

- **Choose complex, niche problem statements** — fewer teams participate = higher shortlisting chances
- Use AI tools (Claude/ChatGPT) to scan the full PS list and find the hardest ones
- Research the ministry's own reports to understand why the problem exists
- Look for "quieter" themes: Space Technology, Robotics & Drones, Transportation, Clean & Green Technology
- Avoid PS with "easy" labels — they attract the most competition

### The Dual Submission Strategy
> Submit TWO PPTs for two different problem statements. Use the second slot strategically — low-competition PS, submitted close to the deadline.

---

## 6. TEAM FORMATION BLUEPRINT

### Team Requirements
- **Exactly 6 members** (including team leader)
- **At least 1 female member** (mandatory, disqualification without)
- All from the **same college** (different departments OK)
- Up to 2 mentors with 5+ years experience

### Ideal Role Distribution

| Role | Count | Skills |
|------|-------|--------|
| AI/ML Specialist | 1-2 | Model training, data processing |
| Backend Developer | 1-2 | APIs, database, server logic |
| Frontend Developer | 1-2 | UI/UX, user experience |
| Domain Researcher | 1 | Problem understanding, ministry reports |
| Presenter/Demo Operator | 1 | Public speaking, pitch delivery |
| Full-Stack/DevOps | 1 | Deployment, Docker, integration |

### What Winners Say About Teams
- **Diverse skill sets matter more than friend groups**
- At least one person MUST excel at public speaking
- Coordinate Git workflows BEFORE the hackathon
- Every member must be able to explain their module AND the adjacent one
- When judges split teams, one person answering everything = one person did everything = BAD

---

## 7. JUDGING CRITERIA & WHAT EVALUATORS SCORE

### Official AICTE Evaluation Rubric

| Criteria | Weight | What It Means |
|----------|--------|---------------|
| Innovation/Novelty | 20% | Originality, novel methods, creative thinking |
| Technology | 15% | Integration of advanced tools, technical feasibility |
| MVP/Prototype/Demo | 15% | Working demo, proof of concept |
| Criticality/Impact | 25% | Societal, industry, or research impact |
| Commercial Viability | 25% | Market potential, affordability, scalability |

### What Judges Actually Care About (From Winners)

1. **Demo first, slides second** — "Show me this running. Not the slides."
2. **Visible progress between rounds** — evaluators visit 3-4 times, comparing against their last note
3. **Implementation of mentor suggestions** — they often become evaluation criteria
4. **Balanced team participation** — not one person carrying everything
5. **Honest acknowledgment of limitations** — nobody believes a 36-hour build is bulletproof

---

## 8. JURY QUESTIONS — REAL QUESTIONS & WINNING ANSWERS

### The 16 Questions That Decide Everything

| # | Question | Trap Answer | Winning Answer |
|---|----------|-------------|----------------|
| 1 | "Show me this running. Not the slides." | Opening the PPT | Demo first, 60 seconds, on what actually works |
| 2 | "Which of our existing systems would this talk to?" | Not knowing their systems | Name their actual portal/database, say how you'd connect |
| 3 | "What's the smallest version we could deploy next month?" | Describing full vision | Name a pilot with boundary: one district, 50 users |
| 4 | "Who inside the ministry owns this on day one?" | "The government" | Name the specific role: block officer, depot supervisor |
| 5 | "What law/policy does this comply with?" | Never thought about it | Name one: DPDP Act, sector-specific rules |
| 6 | "Where does the data sit, and who can see it?" | "On the cloud" | Region, access model, what's anonymized. Data can't leave India |
| 7 | "What does this cost to run for a year at state scale?" | "Cloud is cheap" | Rough figure with biggest line item named |
| 8 | "You have not spoken yet. What did you build?" | Team leader answering | Every member explains their own module |
| 9 | "Twelve other teams picked this. Why yours?" | Listing features | Name ONE sharp difference: offline, local language, old phone support |
| 10 | "This works on your laptop. What breaks in the field?" | "Nothing, it's production ready" | Name 3 real failures + fixes |
| 11 | "How long does it take one worker to learn this?" | "It's intuitive" | Give a number + assumptions |
| 12 | "What did you get wrong and change during 36 hours?" | "Nothing, went to plan" | One real pivot + trigger |
| 13 | "How much of this is from existing open source?" | "None of it" | Name what you used, the license, what you wrote |
| 14 | "If we gave you 3 months and a budget, what would you fix first?" | "Add more features" | Name weakest part honestly |
| 15 | "How much did AI write?" | "We wrote everything" | Be honest: this part pretrained, this API, this logic we wrote |
| 16 | "Show me your data. Where did it come from?" | "Dummy data" | Name real sources: data.gov.in, ministry reports |

### Bonus Questions (After Demo)

- "How would somebody cheat this?"
- "Who runs this after you graduate?"
- "Half the people who need this don't have a smartphone. Now what?"
- "Who pays for this once pilot money is over?"
- "Explain it to me as if I'm the user, not a judge"

---

## 9. DEMO STRATEGY

### The Demo Hierarchy (What Wins)

```
1. WORKING LIVE DEMO (highest impact)
2. Recorded video of working demo
3. Website link (deployed)
4. Screenshots of prototype
5. Slides only (instant elimination risk)
```

### Demo Best Practices

- **Demo first, slides only if asked** — at finale everyone has a deck, few have something running
- **Practice the "magic moment"** — single interaction that makes value obvious, show it early
- **Prepare offline backup** — Wi-Fi drops are normal
- **Test demo on another device** before submitting
- **Keep demo video 2-3 minutes** — fast-paced, crisp editing, voiceover or walkthrough
- **Put prototype link IN the PPT** — evaluators notice working links

### What the Winning SIH 2025 Team Did
> "We handed the judges a physical PDF report of our solution. Not required. Not expected. Just a clean, printed summary. It showed we cared beyond the screen." — Kartikay Singh, SIH 2025 Winner

---

## 10. WHAT MAKES SIH WINNERS DIFFERENT

### AI Complexity vs User Experience
**WINNERS FOCUS ON UX, NOT JUST AI COMPLEXITY**
- "The winning team concentrated more on perfecting their pitch and ensuring their presentation was flawless" (Rushabh Bhalgat, SIH 2024)
- "You have the best user interface out of all teams here" — judge comment to SIH 2025 finalist
- Simple + Practical + Innovative + Impactful = Strong SIH Project

### Live Deployment vs Mockups
**WINNERS DEPLOY LIVE**
- Working prototype > polished mockups
- "A non-negotiable: a working prototype instantly puts you above teams with just slides"
- Deploy on Vercel/Netlify/Heroku for instant links
- If not ready, drop a website link you can update even after submitting

### Real Data vs Synthetic Data
**WINNERS USE REAL OR REALISTIC DATA**
- Name real sources: data.gov.in, Bhuvan, ministry reports
- If live access needs government clearance, say you generated realistic data modelled on official schema
- **"The word 'dummy' ends the conversation with every evaluator"**
- Show data governance: region, access model, anonymization

### The Impact Section
**WINNERS QUANTIFY IMPACT**
- ❌ "Better, faster, improved, enhanced"
- ✅ "Saves 3 hours per inspection, reduces ₹50K cost per district per year"
- One number with working shown
- Align with SDGs if applicable
- Name SPECIFIC beneficiary: farmers in Punjab, inspectors in Maharashtra, etc.

### The Key Differentiator Pattern
> "Focus on Innovation Over Perfection. While we built a technically sound platform, the winning team focused on a more innovative approach. They introduced novel elements judges hadn't seen before."

**Winners identify ONE thing only they did:**
- It works offline
- It runs on a 4-year-old phone
- It handles the local language
- It integrates with an existing government system
- **One sharp difference is remembered. A feature list is not.**

---

## 11. COMMON MISTAKES THAT MAKE TEAMS LOSE

### PPT Mistakes (Screening Elimination)
- ❌ Placeholder text still on slides ("TO BE UPDATED", "IDEA TITLE")
- ❌ Wrong theme on slide 1 (doesn't match portal listing)
- ❌ Duplicated slides
- ❌ Notes to yourself left visible
- ❌ References that name no actual source
- ❌ Demo link on free host that sleeps
- ❌ Copying another team's solution from previous SIH

### Technical Mistakes
- ❌ Overcomplicating with too many technologies
- ❌ Saying "we'll use AI" without explaining HOW
- ❌ No working prototype (instant disadvantage)
- ❌ Not testing demo before submission
- ❌ Git conflicts during 36 hours (master Git BEFORE)

### Presentation Mistakes
- ❌ One person answering everything
- ❌ Replaying the same pitch every evaluation round
- ❌ Claiming "nothing is wrong" when asked about failures
- ❌ Not implementing mentor suggestions between rounds
- ❌ Opening slides when asked to demo

### Strategic Mistakes
- ❌ Picking easy/popular problem statements (max competition)
- ❌ Not researching the ministry's expectations
- ❌ Forming team with only friends (need diverse skills)
- ❌ Not knowing who your college SPOC is
- ❌ Missing internal hackathon deadline

### The Brutal Truth
> "90% of students are going to copy-paste ideas. The one who picks a good niche and does their work correctly from scratch won't win. The luck factor is also there." — Reddit user

---

## 12. TIMELINE & PREPARATION CHECKLIST

### Phase 1: Before Registration (2-3 Months)

- [ ] Form team with complementary skills
- [ ] Master Git/GitHub collaboration
- [ ] Study previous years' problem statements
- [ ] Research winning solutions from past SIH
- [ ] Practice rapid prototyping
- [ ] Identify college SPOC

### Phase 2: Registration Period (1 Month)

- [ ] Analyze all problem statements
- [ ] Shortlist 2-3 PS aligning with team strengths
- [ ] Research the ministry/department posting the PS
- [ ] Prepare for internal hackathon
- [ ] Build rough prototype/simulation

### Phase 3: Internal College Round

- [ ] Create polished PPT (6 slides, official template)
- [ ] Build working MVP (even basic)
- [ ] Practice pitch multiple times
- [ ] Every member rehearsed answering questions
- [ ] Prepare for faculty panel evaluation

### Phase 4: National Screening (PPT Only)

- [ ] Perfect the 6-slide deck
- [ ] Ensure no placeholder text
- [ ] Verify PS ID/title/theme match portal
- [ ] Include working prototype link
- [ ] Submit as PDF before deadline
- [ ] Consider second PS submission (low-competition)

### Phase 5: Grand Finale (36 Hours)

- [ ] Hour-by-hour development plan
- [ ] Role assignments clear
- [ ] Offline demo backup ready
- [ ] Physical PDF reports for judges
- [ ] Implement ALL mentor suggestions between rounds
- [ ] Show DELTA at each evaluation (what changed since last visit)
- [ ] Every member speaks
- [ ] Stay calm when things break

### The 7-Day Action Plan (Before Finale)

| Day | Action |
|-----|--------|
| 1 | Finalize architecture diagram |
| 2 | Set up all development environments |
| 3 | Build core features (MVP) |
| 4 | Polish UI + add data visualization |
| 5 | Prepare demo flow + practice pitch |
| 6 | Test everything, prepare backups |
| 7 | Rest, pack, travel prep |

---

## KEY TAKEAWAYS — THE WINNING FORMULA

```
PROBLEM UNDERSTANDING (Deep)
    + UNIQUE SOLUTION (One sharp differentiator)
    + WORKING PROTOTYPE (Live demo > slides)
    + POLISHED PRESENTATION (Visual-first, quantified impact)
    + TEAM DIVERSITY (Everyone speaks, everyone builds)
    + COMPOSURE (Calm when things break)
    = SIH WINNER
```

### The One Rule That Matters Most
> **"A good solution poorly presented will lose to an average solution excellently presented."**

### The SIH Winner's Mindset
- Focus on the PROBLEM, not just the technology
- Treat internal round like the finals
- Take mentor suggestions as evaluation criteria
- Show progress between rounds, not one polished demo at the end
- Know where your system is weak (maturity test)
- Build something REAL under REAL pressure

---

## 13. OUR PS-SPECIFIC STRATEGY (MPLADS AI SENTINEL)

### Why Problem Statement 26102 Wins
- **No Existing Automated Anomaly Defense**: The current eSAKSHI portal tracks *actions*, but has no automated audit intelligence or fraud prevention layer.
- **Rooted in Official Audits**: Every single detection rule and feature maps directly to empirical findings from CAG Performance Audits (Report No. 31/2010, Report No. 18/2021) and 85 documented fraud/misuse cases.
- **Massive Verifiable Real-World Data**: Ingests 143,257 official records from data.gov.in across the 18th Lok Sabha.
- **Explainable by Design (SHAP)**: We avoid black-box AI claims. Every flagged work includes a human-readable attribution waterfall that any District Collector or CAG auditor can verify and act upon.
- **Zero-Cost Evaluation Prototype**: Built entirely on modern open-source stacks with a realistic ₹0 prototype cost and low-cost enterprise cloud path.

### Our Sharp Differentiator
> **"3-Layer Explainable Defense: Deterministic statutory gatekeeper + unsupervised zero-day anomaly isolation + CAG-calibrated risk scoring, with full SHAP transparency and CV-based milestone verification."**

### 60-Second Jury Demo Flow
1. **Pan-India Overview (10 sec)**: Open Ministry dashboard → interactive India GIS map showing constituency anomaly heatmaps.
2. **District Deep-Dive (15 sec)**: Switch to DA+CAG view → inspect Work #4523 flagged at 82/100 risk score.
3. **SHAP Explainability (10 sec)**: Expand waterfall chart → show exact driver breakdown: *Cost overrun (+42 pts), Vendor concentration (+31 pts), Sanction delay (+14 pts)*.
4. **Vendor Collusion Graph (10 sec)**: Open district procurement view → show single vendor capturing 62% of allocated district tenders.
5. **Multi-Tier Role Switching (10 sec)**: Transition seamlessly across MP, District Authority, and Ministry perspectives.
6. **Closing & Scalability (5 sec)**: State total projected savings (>₹120 Cr/yr) and immediate eSAKSHI API compatibility.

### Primary Data Sources to Emphasize in PPT
- **Government Data Portal**: data.gov.in MPLADS datasets (143,257 works records)
- **Ministry Operational Data**: eSAKSHI dashboard (mplads.mospi.gov.in)
- **Statutory Audit Truth**: Comptroller and Auditor General of India (CAG) Performance Audits
- **Regulatory Framework**: MoSPI Revised MPLADS Guidelines (April 2023)

---

*Document compiled from: Official SIH Documentation, GitHub Winners Repositories, r/developersIndia, CAG Performance Reports, and MoSPI Guidelines.*  
*Document Version: 2.0 | Last Updated: September 2026*
