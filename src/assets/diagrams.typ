#import "@preview/cetz:0.5.2"
#import cetz.draw: *

#set page(width: 210mm, height: auto)

#let mhps_hist = csv("figure1_mhps.csv")
#let scatter = csv("figure2_scatter.csv")
#let emoi_hist = csv("figure3_emoi.csv")
#let hpi_hist = csv("figure4_hpi.csv")
#let mediation = csv("table5_mediation.csv")
#let quartiles = csv("table_quartiles.csv")
#let groups = csv("table_group_analysis.csv")

#let max-count(rows) = {
  let vals = rows.slice(1).map(r => int(r.at(1)))
  vals.fold(0, calc.max)
}

= Generated Figures

== Figure 1. Distribution of MHPS

#let figure1 = figure(
  caption: [Distribution of Masturbation Hand Preference Score],
)[

  #cetz.canvas({
    let maxy = max-count(mhps_hist)

    line((0, 0), (8, 0))
    line((0, 0), (0, 6))

    for row in mhps_hist.slice(1) {
      let mhps = int(row.at(0))
      let count = int(row.at(1))

      let x = (mhps + 2) * 1.5 + 0.5
      let h = count / maxy * 5

      rect(
        (x, 0),
        (x + 1, h),
      )

      content(
        (x + 0.5, -0.4),
        [#mhps],
      )

      content(
        (x + 0.5, h + 0.2),
        [#count],
      )
    }
  })

]
#figure1
#pagebreak()

== Figure 2. EMOI vs MHPS Scatterplot

#let figure2 = figure(
  caption: [Relationship Between EMOI and MHPS],
)[

  #cetz.canvas({
    line((0, 0), (6, 0))
    line((0, -2.5), (0, 2.5))

    for row in scatter.slice(1) {
      let emoi = float(row.at(0))
      let mhps = float(row.at(1))

      circle(
        (
          emoi,
          mhps,
        ),
        radius: 0.03,
      )
    }

    content((3, -3), [EMOI])
    content((-1, 0), [MHPS])
  })

]
#figure2
#pagebreak()

== Figure 3. EMOI Distribution

#let figure3 = figure(
  caption: [Distribution of Early Mouse Occupancy Index],
)[

  #cetz.canvas({
    let maxy = max-count(emoi_hist)

    line((0, 0), (12, 0))
    line((0, 0), (0, 6))

    for (idx, row) in emoi_hist.slice(1).enumerate() {
      let count = int(row.at(1))

      let x = idx * 1.1 + 0.3
      let h = count / maxy * 5

      rect(
        (x, 0),
        (x + 0.9, h),
      )

      content(
        (x + 0.45, h + 0.15),
        [#count],
      )
    }
  })

]
#figure3
#pagebreak()

== Figure 4. HPI Distribution

#let figure4 = figure(
  caption: [Distribution of Habit Persistence Index],
)[

  #cetz.canvas({
    let maxy = max-count(hpi_hist)

    line((0, 0), (12, 0))
    line((0, 0), (0, 6))

    for (idx, row) in hpi_hist.slice(1).enumerate() {
      let count = int(row.at(1))

      let x = idx * 1.1 + 0.3
      let h = count / maxy * 5

      rect(
        (x, 0),
        (x + 0.9, h),
      )

      content(
        (x + 0.45, h + 0.15),
        [#count],
      )
    }
  })

]
#figure4
#pagebreak()

== Figure 5. Mediation and Dose-Response Summary

#let figure5 = figure(
  caption: [Proposed Mediation Pathway and Quartile Trend],
)[

  #cetz.canvas({
    let emoi_hpi = float(mediation.at(1).at(1))

    let hpi_mhps = float(mediation.at(2).at(1))

    let emoi_mhps = float(mediation.at(3).at(1))

    circle((0, 0), radius: 0.6)
    content((0, 0), [EMOI])

    circle((4, 0), radius: 0.6)
    content((4, 0), [HPI])

    circle((8, 0), radius: 0.6)
    content((8, 0), [MHPS])

    line((0.6, 0), (3.4, 0))
    line((4.6, 0), (7.4, 0))
    line((0.6, -0.5), (7.4, -0.5))

    content(
      (2, 0.5),
      [#emoi_hpi],
    )

    content(
      (6, 0.5),
      [#hpi_mhps],
    )

    content(
      (4, -1),
      [#emoi_mhps],
    )

    let basey = -5

    line((0, basey), (6, basey))
    line((0, basey), (0, basey + 3))

    for (idx, row) in quartiles.slice(1).enumerate() {
      let q = row.at(0)
      let mean_mhps = float(row.at(3))

      let x = idx * 1.5 + 0.5
      let y = basey + mean_mhps + 1.5

      circle((x, y), radius: 0.05)

      if idx > 0 {
        let prev = quartiles.at(idx)

        let py = basey + float(prev.at(3)) + 1.5

        let px = (idx - 1) * 1.5 + 0.5

        line(
          (px, py),
          (x, y),
        )
      }

      content(
        (x, basey - 0.3),
        [#q],
      )
    }
  })

]
#figure5


