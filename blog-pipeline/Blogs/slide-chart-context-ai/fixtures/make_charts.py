#!/usr/bin/env python3
"""M05-S2 fixture: a synthetic deck of four native charts, each hiding one
piece of context in the chart formatting rather than in its data. All
numbers invented.

charts-original.pptx
  1 "Churn by month"          line chart, values 0.042 0.051 0.078 shown as
                              percent by the axis and data-label format 0.0%
  2 "Plan vs actual signups"  line chart, two series, value axis starting at
                              4.0 (thousands), so a small gap looks large
  3 "Revenue share"           pie chart, values 45 30 25, data labels show
                              percentages and category names
  4 "Quarterly revenue"       column chart, values 125000 ... with number
                              format "$"#,##0 on axis and labels; axis title
                              "Revenue (USD)"

charts-label-trap.pptx
  units added to chart and series titles and a takeaway on each slide, but
  the churn series still stores 0.042 while its new name says "(%)"

charts-reviewed.pptx
  the same as label-trap, except the churn values are stored as 4.2, 5.1,
  7.8 with the number format 0.0"%", so the stored values match the label

  python make_charts.py
"""

from __future__ import annotations

import hashlib
import json
from pathlib import Path

from pptx import Presentation
from pptx.chart.data import CategoryChartData
from pptx.enum.chart import XL_CHART_TYPE, XL_LEGEND_POSITION
from pptx.util import Inches, Pt

HERE = Path(__file__).resolve().parent
MONTHS = ["July", "August", "September"]


def chart_slide(prs, title, kind, cats, series, *, chart_title, takeaway=None):
    s = prs.slides.add_slide(prs.slide_layouts[5])  # title only
    s.shapes.title.text = title
    data = CategoryChartData()
    data.categories = cats
    for name, values in series:
        data.add_series(name, values)
    top = Inches(1.5)
    if takeaway:
        box = s.shapes.add_textbox(Inches(0.8), Inches(1.3), Inches(8.4), Inches(0.6))
        box.text_frame.text = takeaway
        box.text_frame.paragraphs[0].runs[0].font.size = Pt(18)
        top = Inches(2.0)
    gf = s.shapes.add_chart(kind, Inches(0.8), top, Inches(8.4), Inches(4.8), data)
    ch = gf.chart
    ch.has_title = True
    ch.chart_title.text_frame.text = chart_title
    return ch


def build(path: Path, mode: str) -> None:
    reviewed = mode != "original"
    prs = Presentation()
    # 1 Churn: percent formatting carries the unit.
    ch = chart_slide(prs, "Churn by month", XL_CHART_TYPE.LINE_MARKERS, MONTHS,
                     [("Churn rate (%)" if reviewed else "Churn",
                       (4.2, 5.1, 7.8) if mode == "reviewed" else (0.042, 0.051, 0.078))],
                     chart_title="Monthly churn rate, % of accounts" if reviewed else "Churn",
                     takeaway="Churn rose from 4.2% to 7.8% of accounts." if reviewed else None)
    pct = '0.0"%"' if mode == "reviewed" else "0.0%"
    ch.value_axis.tick_labels.number_format = pct
    ch.value_axis.tick_labels.number_format_is_linked = False
    pl = ch.plots[0]
    pl.has_data_labels = True
    pl.data_labels.number_format = pct
    pl.data_labels.number_format_is_linked = False

    # 2 Plan vs actual: truncated axis exaggerates the gap.
    ch = chart_slide(prs, "Plan vs actual signups", XL_CHART_TYPE.LINE_MARKERS, MONTHS,
                     [("Plan (thousands)" if reviewed else "Plan", (5.0, 5.5, 6.0)),
                      ("Actual (thousands)" if reviewed else "Actual", (4.2, 5.1, 7.8))],
                     chart_title="Signups, thousands (axis starts at 4)" if reviewed else "Signups",
                     takeaway="Actual passed plan in September: 7.8k against 6.0k." if reviewed else None)
    ch.value_axis.minimum_scale = 4.0
    ch.has_legend = True
    ch.legend.position = XL_LEGEND_POSITION.BOTTOM
    ch.legend.include_in_layout = False

    # 3 Pie: labels show percentages computed by the chart.
    ch = chart_slide(prs, "Revenue share", XL_CHART_TYPE.PIE, ["North", "South", "West"],
                     [("Share of revenue (%)" if reviewed else "Revenue", (45, 30, 25))],
                     chart_title="Share of Q3 revenue by region, %" if reviewed else "Q3",
                     takeaway="North brought in 45% of Q3 revenue." if reviewed else None)
    pl = ch.plots[0]
    pl.has_data_labels = True
    pl.data_labels.show_percentage = True
    pl.data_labels.show_category_name = True
    pl.data_labels.show_value = False

    # 4 Revenue: currency lives in the number format and axis title.
    ch = chart_slide(prs, "Quarterly revenue", XL_CHART_TYPE.COLUMN_CLUSTERED, ["Q1", "Q2", "Q3"],
                     [("Revenue (USD)" if reviewed else "Revenue", (125000, 131500, 162250))],
                     chart_title="Quarterly revenue, USD" if reviewed else "Revenue",
                     takeaway="Q3 revenue was $162,250, up 23% on Q2." if reviewed else None)
    ch.value_axis.tick_labels.number_format = '"$"#,##0'
    ch.value_axis.tick_labels.number_format_is_linked = False
    ch.value_axis.has_title = True
    ch.value_axis.axis_title.text_frame.text = "Revenue (USD)"
    pl = ch.plots[0]
    pl.has_data_labels = True
    pl.data_labels.number_format = '"$"#,##0'
    pl.data_labels.number_format_is_linked = False
    prs.save(path)


def main() -> None:
    record = {}
    for name, mode in (("charts-original.pptx", "original"), ("charts-label-trap.pptx", "label-trap"),
                       ("charts-reviewed.pptx", "reviewed")):
        build(HERE / name, mode)
        data = (HERE / name).read_bytes()
        record[name] = {"bytes": len(data), "sha256": hashlib.sha256(data).hexdigest()}
    (HERE / "chart-files.json").write_text(json.dumps({"label": "Synthetic chart deck, original and reviewed", "files": record}, indent=2) + "\n")
    print(json.dumps(record, indent=2))


if __name__ == "__main__":
    main()
