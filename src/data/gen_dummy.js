const fs = require("fs");
const path = require("path");

const ROOT =
    path.resolve(__dirname, "..");

const OUT =
    path.join(ROOT, "data", "data.csv");

const rows = [];

rows.push(
    "id,age,country,mhps,d1,d2,d3,d4,s1,s2,s3"
);

function clamp(x, min, max) {
    return Math.max(
        min,
        Math.min(max, x)
    );
}

for (let id = 1; id <= 1200; id++) {

    const age =
        Math.floor(
            18 + Math.random() * 40
        );

    const countries =
        ["SG", "MY", "US", "UK", "AU"];

    const country =
        countries[
        Math.floor(
            Math.random() * countries.length
        )
        ];

    const latent =
        Math.random() * 4 + 1;

    const d1 =
        clamp(
            Math.round(
                latent + (Math.random() - 0.5)
            ),
            1, 5
        );

    const d2 =
        clamp(
            Math.round(
                latent + (Math.random() - 0.5)
            ),
            1, 5
        );

    const d3 =
        clamp(
            Math.round(
                latent + (Math.random() - 0.5)
            ),
            1, 5
        );

    const d4 =
        clamp(
            Math.round(
                latent * 1.4 +
                (Math.random() - 0.5)
            ),
            1, 7
        );

    const emoi =
        (d1 + d2 + d3 + d4) / 4;

    const hpiLatent =
        emoi +
        (Math.random() - 0.5);

    const s1 =
        clamp(
            Math.round(hpiLatent + 2),
            1, 7
        );

    const s2 =
        clamp(
            Math.round(hpiLatent + 2),
            1, 7
        );

    const s3 =
        clamp(
            Math.round(hpiLatent + 2),
            1, 7
        );

    let mhps;

    if (emoi > 4.0)
        mhps =
            Math.random() < 0.6
                ? -2
                : -1;

    else if (emoi > 3.0)
        mhps =
            [-1, 0, 1][
            Math.floor(Math.random() * 3)
            ];

    else if (emoi > 2.0)
        mhps =
            [0, 1, 1, 2][
            Math.floor(Math.random() * 4)
            ];

    else
        mhps =
            Math.random() < 0.7
                ? 2
                : 1;

    rows.push([
        id,
        age,
        country,
        mhps,
        d1, d2, d3, d4,
        s1, s2, s3
    ].join(","));
}

fs.writeFileSync(
    OUT,
    rows.join("\n")
);

console.log(
    "Generated 1200 rows:",
    OUT
);
