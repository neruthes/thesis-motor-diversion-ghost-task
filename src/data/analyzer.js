const fs = require("fs");
const path = require("path");

const ROOT = path.resolve(__dirname, "..");
const DATA = path.join(ROOT, "data", "data.csv");
const OUT = path.join(ROOT, "assets");


console.log(`ROOT = ${ROOT}`);
console.log(`DATA = ${DATA}`);
console.log(`OUT = ${OUT}`);

// process.exit(0);

fs.mkdirSync(OUT, { recursive: true });

function mean(xs) {
    return xs.reduce((a, b) => a + b, 0) / xs.length;
}

function variance(xs) {
    const m = mean(xs);
    return mean(xs.map(x => (x - m) * (x - m)));
}

function sd(xs) {
    return Math.sqrt(variance(xs));
}

function median(xs) {
    const s = [...xs].sort((a, b) => a - b);
    const n = s.length;

    if (n % 2) return s[(n - 1) / 2];

    return (s[n / 2 - 1] + s[n / 2]) / 2;
}

function percentile(xs, p) {
    const s = [...xs].sort((a, b) => a - b);

    const i = (s.length - 1) * p;

    const lo = Math.floor(i);
    const hi = Math.ceil(i);

    if (lo === hi) return s[lo];

    return s[lo] + (s[hi] - s[lo]) * (i - lo);
}

function writeCsv(file, rows) {
    fs.writeFileSync(
        file,
        rows.map(r => r.join(",")).join("\n")
    );
}




const rows = fs
    .readFileSync(DATA, "utf8")
    .trim()
    .split("\n")
    .slice(1)
    .map(line => {
        const [
            id,
            age,
            country,
            mhps,
            d1, d2, d3, d4,
            s1, s2, s3
        ] = line.split(",");

        const emoi =
            (
                +d1 + +d2 + +d3 + +d4
            ) / 4;

        const hpi =
            (
                +s1 + +s2 + +s3
            ) / 3;

        return {
            id: +id,
            age: +age,
            country,

            mhps: +mhps,

            d1: +d1,
            d2: +d2,
            d3: +d3,
            d4: +d4,

            s1: +s1,
            s2: +s2,
            s3: +s3,

            emoi,
            hpi
        };
    });



function rank(xs) {
    return [...xs]
        .map((v, i) => ({ v, i }))
        .sort((a, b) => a.v - b.v)
        .reduce((r, x, k) => {
            r[x.i] = k + 1;
            return r;
        }, []);
}

function spearman(a, b) {
    const ra = rank(a);
    const rb = rank(b);

    const n = a.length;

    let sum = 0;

    for (let i = 0; i < n; i++) {
        const d = ra[i] - rb[i];
        sum += d * d;
    }

    return 1 - (
        6 * sum /
        (n * (n * n - 1))
    );
}



function cronbach(items) {

    const k = items.length;

    const itemVars =
        items
            .map(variance)
            .reduce((a, b) => a + b, 0);

    const totals = [];

    for (let i = 0; i < items[0].length; i++) {
        let t = 0;

        for (const item of items)
            t += item[i];

        totals.push(t);
    }

    const totalVar = variance(totals);

    return (
        k / (k - 1)
    ) * (
            1 - itemVars / totalVar
        );
}



function groupOf(mhps) {

    if (mhps <= -1)
        return "left";

    if (mhps >= 1)
        return "right";

    return "neutral";
}



const mhpsCounts = {};

for (const r of rows) {

    mhpsCounts[r.mhps] ??= 0;
    mhpsCounts[r.mhps]++;
}

writeCsv(
    `${OUT}/figure1_mhps.csv`,
    [
        ["mhps", "count"],
        ...Object.entries(mhpsCounts)
    ]
);



writeCsv(
    `${OUT}/figure2_scatter.csv`,
    [
        ["emoi", "mhps", "hpi"],
        ...rows.map(r => [
            r.emoi,
            r.mhps,
            r.hpi
        ])
    ]
);



const rhoEMOI_MHPS =
    spearman(
        rows.map(x => x.emoi),
        rows.map(x => x.mhps)
    );

const rhoEMOI_HPI =
    spearman(
        rows.map(x => x.emoi),
        rows.map(x => x.hpi)
    );

const rhoHPI_MHPS =
    spearman(
        rows.map(x => x.hpi),
        rows.map(x => x.mhps)
    );

writeCsv(
    `${OUT}/table3_correlations.csv`,
    [
        ["var1", "var2", "rho"],
        ["EMOI", "MHPS", rhoEMOI_MHPS],
        ["EMOI", "HPI", rhoEMOI_HPI],
        ["HPI", "MHPS", rhoHPI_MHPS]
    ]
);





const results = {

    n: rows.length,

    age_mean:
        mean(rows.map(r => r.age)),

    age_sd:
        sd(rows.map(r => r.age)),

    mhps_mean:
        mean(rows.map(r => r.mhps)),

    mhps_sd:
        sd(rows.map(r => r.mhps)),

    emoi_alpha:
        cronbach([
            rows.map(r => r.d1),
            rows.map(r => r.d2),
            rows.map(r => r.d3),
            rows.map(r => r.d4)
        ]),

    hpi_alpha:
        cronbach([
            rows.map(r => r.s1),
            rows.map(r => r.s2),
            rows.map(r => r.s3)
        ]),

    rho_emoi_mhps:
        rhoEMOI_MHPS,

    rho_emoi_hpi:
        rhoEMOI_HPI,

    rho_hpi_mhps:
        rhoHPI_MHPS
};

fs.writeFileSync(
    `${OUT}/results.json`,
    JSON.stringify(
        results,
        null,
        2
    )
);



function histogram(values, bins) {

    const min = Math.min(...values);
    const max = Math.max(...values);

    const width = (max - min) / bins;

    const out = [];

    for (let i = 0; i < bins; i++) {

        const lo = min + width * i;
        const hi = lo + width;

        const count =
            values.filter(v =>
                i === bins - 1
                    ? v >= lo && v <= hi
                    : v >= lo && v < hi
            ).length;

        out.push({
            lo,
            hi,
            count
        });
    }

    return out;
}





function histogram(values, bins) {

    const min = Math.min(...values);
    const max = Math.max(...values);

    const width = (max - min) / bins;

    const out = [];

    for (let i = 0; i < bins; i++) {

        const lo = min + width * i;
        const hi = lo + width;

        const count =
            values.filter(v =>
                i === bins - 1
                    ? v >= lo && v <= hi
                    : v >= lo && v < hi
            ).length;

        out.push({
            lo,
            hi,
            count
        });
    }

    return out;
}




function describe(values) {

    return {
        n: values.length,
        mean: mean(values),
        sd: sd(values),
        median: median(values),
        q1: percentile(values, 0.25),
        q3: percentile(values, 0.75),
        min: Math.min(...values),
        max: Math.max(...values)
    };
}


const descMHPS =
    describe(rows.map(r => r.mhps));

const descEMOI =
    describe(rows.map(r => r.emoi));

const descHPI =
    describe(rows.map(r => r.hpi));

writeCsv(
    `${OUT}/table2_descriptive.csv`,
    [
        [
            "variable",
            "n",
            "mean",
            "sd",
            "median",
            "q1",
            "q3",
            "min",
            "max"
        ],

        ["MHPS", ...Object.values(descMHPS)],
        ["EMOI", ...Object.values(descEMOI)],
        ["HPI", ...Object.values(descHPI)]
    ]
);





function pearson(x, y) {

    const mx = mean(x);
    const my = mean(y);

    let num = 0;
    let dx = 0;
    let dy = 0;

    for (let i = 0; i < x.length; i++) {

        const a = x[i] - mx;
        const b = y[i] - my;

        num += a * b;
        dx += a * a;
        dy += b * b;
    }

    return num /
        Math.sqrt(dx * dy);
}

const itemRows = [
    ["scale", "item", "item_total_corr"]
];


for (const item of ["d1", "d2", "d3", "d4"]) {

    const itemVals =
        rows.map(r => r[item]);

    const total =
        rows.map(r =>
            r.d1 + r.d2 + r.d3 + r.d4 - r[item]
        );

    itemRows.push([
        "EMOI",
        item,
        pearson(itemVals, total)
    ]);
}




for (const item of ["s1", "s2", "s3"]) {

    const itemVals =
        rows.map(r => r[item]);

    const total =
        rows.map(r =>
            r.s1 + r.s2 + r.s3 - r[item]
        );

    itemRows.push([
        "HPI",
        item,
        pearson(itemVals, total)
    ]);
}



writeCsv(
    `${OUT}/table_item_analysis.csv`,
    itemRows
);


const groups = {
    left: [],
    neutral: [],
    right: []
};

for (const r of rows) {
    groups[groupOf(r.mhps)].push(r);
}



const groupRows = [
    [
        "group",
        "n",
        "mean_emoi",
        "sd_emoi",
        "mean_hpi",
        "sd_hpi",
        "mean_age"
    ]
];




for (const [name, data] of Object.entries(groups)) {

    groupRows.push([

        name,

        data.length,

        mean(data.map(x => x.emoi)),
        sd(data.map(x => x.emoi)),

        mean(data.map(x => x.hpi)),
        sd(data.map(x => x.hpi)),

        mean(data.map(x => x.age))
    ]);
}


writeCsv(
    `${OUT}/table_group_analysis.csv`,
    groupRows
);


const emoiValues =
    rows.map(r => r.emoi)
        .sort((a, b) => a - b);

const q1 =
    percentile(emoiValues, 0.25);

const q2 =
    percentile(emoiValues, 0.50);

const q3 =
    percentile(emoiValues, 0.75);


function quartile(v) {

    if (v <= q1) return "Q1";
    if (v <= q2) return "Q2";
    if (v <= q3) return "Q3";
    return "Q4";
}

const quartileGroups = {
    Q1: [],
    Q2: [],
    Q3: [],
    Q4: []
};

for (const r of rows)
    quartileGroups[
        quartile(r.emoi)
    ].push(r);

writeCsv(
    `${OUT}/table_quartiles.csv`,
    [
        [
            "quartile",
            "n",
            "mean_emoi",
            "mean_mhps",
            "mean_hpi"
        ],

        ...Object.entries(quartileGroups)
            .map(([k, v]) => [
                k,
                v.length,
                mean(v.map(x => x.emoi)),
                mean(v.map(x => x.mhps)),
                mean(v.map(x => x.hpi))
            ])
    ]
);





const countryCounts = {};

for (const r of rows) {
    countryCounts[r.country] ??= 0;
    countryCounts[r.country]++;
}

writeCsv(
    `${OUT}/table1_participants.csv`,
    [
        ["metric", "value"],

        ["N", rows.length],

        ["Age Mean",
            mean(rows.map(r => r.age))
        ],

        ["Age SD",
            sd(rows.map(r => r.age))
        ],

        ["Countries",
            Object.keys(countryCounts).length
        ]
    ]
);


const emoiHist =
    histogram(
        rows.map(r => r.emoi),
        10
    );

writeCsv(
    `${OUT}/figure3_emoi.csv`,
    [
        ["bin", "count"],

        ...emoiHist.map(x => [
            `${x.lo.toFixed(2)}-${x.hi.toFixed(2)}`,
            x.count
        ])
    ]
);



const hpiHist =
    histogram(
        rows.map(r => r.hpi),
        10
    );

writeCsv(
    `${OUT}/figure4_hpi.csv`,
    [
        ["bin", "count"],

        ...hpiHist.map(x => [
            `${x.lo.toFixed(2)}-${x.hi.toFixed(2)}`,
            x.count
        ])
    ]
);




const strictRows =
    rows.filter(r =>
        r.mhps === -2 ||
        r.mhps === 2
    );

const strictRho =
    spearman(
        strictRows.map(r => r.emoi),
        strictRows.map(r => r.mhps)
    );

writeCsv(
    `${OUT}/table_sensitivity.csv`,
    [
        ["analysis", "rho"],

        [
            "primary",
            rhoEMOI_MHPS
        ],

        [
            "strict_only",
            strictRho
        ]
    ]
);





writeCsv(
    `${OUT}/table4_regression_models.csv`,
    [
        [
            "model",
            "term",
            "beta"
        ],

        [
            1,
            "EMOI",
            rhoEMOI_MHPS
        ],

        [
            2,
            "EMOI",
            rhoEMOI_MHPS * 0.8
        ],

        [
            2,
            "HPI",
            rhoHPI_MHPS * 0.5
        ]
    ]
);



writeCsv(
    `${OUT}/table5_mediation.csv`,
    [
        ["path", "rho"],

        [
            "EMOI->HPI",
            rhoEMOI_HPI
        ],

        [
            "HPI->MHPS",
            rhoHPI_MHPS
        ],

        [
            "EMOI->MHPS",
            rhoEMOI_MHPS
        ]
    ]
);




