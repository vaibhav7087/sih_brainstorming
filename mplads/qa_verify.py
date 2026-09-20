#!/usr/bin/env python3
import os
from pptx import Presentation

TEMPLATE = "SIH2026-IDEA-Presentation-Format.pptx"
OUT = "generated_ppts"
FILES = {
    "OptionA": "MPLADS_AI_Sentinel_OptionA_HighTech.pptx",
    "OptionB": "MPLADS_AI_Sentinel_OptionB_BusinessImpact.pptx",
    "OptionC": "MPLADS_AI_Sentinel_OptionC_Innovation.pptx",
}
NAMES = {"OptionA": "High Tech Focus", "OptionB": "Business Impact Focus", "OptionC": "Innovation Focus"}
BAD = ["Lorem Ipsum", "TODO", "Your Team Name", "TITLE PAGE", "Proposed Solution (Describe",
       "Detailed explanation of the proposed", "How it addresses the problem",
       "Innovation and uniqueness", "Technologies to be used", "Methodology and process",
       "Analysis of the feasibility", "Potential challenges and risks",
       "Strategies for overcoming", "Potential impact on the target",
       "Benefits of the solution", "Details / Links of the reference",
       "Kindly keep the maximum", "IMPORTANT INSTRUCTIONS"]

def get_texts(prs):
    out = []
    for slide in prs.slides:
        st = []
        for shape in slide.shapes:
            if shape.has_text_frame:
                for para in shape.text_frame.paragraphs:
                    t = para.text.strip()
                    if t:
                        st.append(t)
        out.append(st)
    return out

def find_bad(texts):
    found = []
    for i, texts_s in enumerate(texts):
        for t in texts_s:
            for b in BAD:
                if b.lower() in t.lower():
                    found.append((i+1, t[:80]))
    return found

def count_imgs(prs):
    return sum(1 for s in prs.slides for sh in s.shapes if sh.shape_type == 13)

def count_bullets(texts):
    return [sum(1 for t in ss if t.startswith("\u2022")) for ss in texts]

def run_qa():
    tpl = Presentation(TEMPLATE)
    tpl_n = len(tpl.slides)
    print(f"Template: {tpl_n} slides\n")
    report_lines = []
    report_lines.append("# QA Report - MPLADS AI Sentinel PPT Generation")
    report_lines.append(f"\nTemplate slide count: {tpl_n}\n")

    scores = {}
    for key, fname in FILES.items():
        path = os.path.join(OUT, fname)
        prs = Presentation(path)
        texts = get_texts(prs)
        score = 100
        issues = []
        n = len(prs.slides)
        if n != tpl_n:
            score -= 15
            issues.append(f"Slide count mismatch: {n} vs {tpl_n}")
        bad = find_bad(texts)
        if bad:
            score -= 20
            for s, t in bad:
                issues.append(f"Placeholder on slide {s}: {t}")
        imgs = count_imgs(prs)
        if imgs == 0:
            score -= 10
            issues.append("No images injected")
        bullets = count_bullets(texts)
        mx = max(bullets) if bullets else 0
        if mx > 10:
            score -= 5
            issues.append(f"Wall of text: {mx} bullets on one slide")
        score = max(score, 0)
        scores[key] = score
        status = "PASS" if score >= 95 else "NEEDS WORK"
        report_lines.append(f"## {NAMES[key]} ({fname})")
        report_lines.append(f"Score: **{score}/100** - {status}")
        report_lines.append(f"- Slides: {n} (expected {tpl_n})")
        report_lines.append(f"- Images: {imgs}")
        report_lines.append(f"- Max bullets per slide: {mx}")
        if issues:
            report_lines.append("- Issues:")
            for iss in issues:
                report_lines.append(f"  - {iss}")
        else:
            report_lines.append("- No issues found")
        report_lines.append("")
        print(f"{NAMES[key]}: {score}/100 - {status}")
        if issues:
            for iss in issues:
                print(f"  - {iss}")

    avg = sum(scores.values()) / len(scores)
    report_lines.append("## Overall Assessment")
    report_lines.append(f"Average score: {avg:.0f}/100")
    all_pass = all(s >= 95 for s in scores.values())
    report_lines.append(f"Target (>95): {'ACHIEVED' if all_pass else 'NOT YET'}")
    report_lines.append("")
    report_lines.append("### Evaluation Criteria Mapping")
    report_lines.append("| Criterion | Weight | Coverage |")
    report_lines.append("|-----------|--------|----------|")
    report_lines.append("| Problem Statement Understanding | 15% | Slide 1 (Title) + Slide 2 (Solution) |")
    report_lines.append("| Uniqueness & Innovation | 20% | Slide 2 (Solution) - Option C emphasis |")
    report_lines.append("| Feasibility | 20% | Slide 4 (Feasibility & Viability) |")
    report_lines.append("| Technical Stack Robustness | 20% | Slide 3 (Technical Approach) |")
    report_lines.append("| Business Model & Scalability | 15% | Slides 4+5 (Feasibility + Impact) |")
    report_lines.append("| UX/UI Presentation Impact | 10% | Layout balance, images, visual design |")

    with open("qa_report.md", "w", encoding="utf-8") as f:
        f.write("\n".join(report_lines))
    print(f"\nqa_report.md written")
    return scores

if __name__ == "__main__":
    run_qa()
