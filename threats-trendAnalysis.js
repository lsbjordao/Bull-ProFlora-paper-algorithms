const fs = require('fs');
const R = require("r-script");
const rScriptPath = './R_function/trendAnalysis.R';

const taxon = 'Croton quintasii';
const overlayAnalysisResultFilePath = `./overlayAnalysis_result/${taxon}.json`;
const overlayAnalysisResult = JSON.parse(fs.readFileSync(overlayAnalysisResultFilePath, 'utf-8'));

const { AOO, AOO_area_km2 } = overlayAnalysisResult;
const AOOseries = {};

// Populate the AOOseries object
AOO.forEach(item => {
    const band = item.band;
    const year = band.substring(band.lastIndexOf('_') + 1);

    item.areaKm2.groups.forEach(group => {
        const threatValue = group.class;

        if ([9, 15, 18, 19, 20, 21, 24, 30, 35, 36, 39, 40, 41, 46, 47, 48, 57, 58, 62].includes(threatValue)) {
            const sumValue = group.sum;

            AOOseries[threatValue] = AOOseries[threatValue] || {};
            AOOseries[threatValue][year] = (AOOseries[threatValue][year] || 0) + sumValue;
        }
    });
});

// Mapping class numbers to labels
const threats = {
    "9": "Forest plantation",
    "15": "Pasture",
    "18": "Agriculture",
    "19": "Temporary crop",
    "20": "Sugar cane",
    "21": "Mosaic of uses",
    "24": "Urban area",
    "30": "Mining",
    "35": "Palm oil",
    "36": "Perennial crop",
    "39": "Soybean",
    "40": "Rice",
    "41": "Other temporary crops",
    "46": "Coffee",
    "47": "Citrus",
    "48": "Other perennial crops",
    "57": "Simple crops",
    "58": "Multiple crops",
    "62": "Cotton"
};

const AooThreats = {};
Object.keys(AOOseries).forEach(key => {
    AooThreats[threats[key]] = AOOseries[key];
});

// Filtering threats greater than 5%
const relevantAooThreats = {};
Object.keys(AooThreats).forEach(key => {
    const areaPercentage = AooThreats[key]['2022'] / AOO_area_km2;
    if (areaPercentage >= 0.05) {
        relevantAooThreats[key] = AooThreats[key];
    }
});

// Calculate percentage of relevant threats
const relevantAooThreatsPercentage = {};
Object.keys(relevantAooThreats).forEach(key => {
    const values = relevantAooThreats[key];
    const percentageValues = {};

    Object.keys(values).forEach(year => {
        const value = values[year];
        percentageValues[year] = (value / AOO_area_km2) * 100;
    });

    relevantAooThreatsPercentage[key] = percentageValues;
});

function runRScript(y) {
    return new Promise((resolve, reject) => {
        R(rScriptPath)
            .data({ y })
            .call((err, result) => {
                if (err) {
                    reject(err.toString());
                } else {
                    resolve(result);
                }
            });
    });
}

async function processThreats() {
    const AOOresult = [];

    for (const key in relevantAooThreatsPercentage) {
        const y = Object.values(relevantAooThreatsPercentage[key]);

        try {
            const trendAnalysis = await runRScript(y);

            const lastYearKm2 = relevantAooThreats[key]["2022"];
            AOOresult.push({
                threat: key.toLowerCase(),
                lastYear: "2022",
                trendAnalysis: trendAnalysis[0],
                lastYear_km2: lastYearKm2,
                lastYear_percentage: relevantAooThreatsPercentage[key]["2022"]
            });
        } catch (error) {
            console.error(`Error processing threat ${key}:`, error);
        }
    }

    console.log(AOOresult);
}

processThreats();
