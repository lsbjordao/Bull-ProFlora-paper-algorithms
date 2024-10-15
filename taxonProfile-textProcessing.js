const fs = require('fs')
const taxon = 'Croton quintasii'
const threatsFilePath = `./threats/${taxon}.json`;
const threats = JSON.parse(fs.readFileSync(threatsFilePath, 'utf-8'));

const threatsIUCN = {
    'forest plantation': '2.2.3 Scale Unknown/Unrecorded',
    pasture: '2.3.4 Scale Unknown/Unrecorded',
    agriculture: '2.1.4 Scale Unknown/Unrecorded',
    'temporary crop': '2.1.4 Scale Unknown/Unrecorded',
    'sugar cane': '2.1.4 Scale Unknown/Unrecorded',
    'mosaic of uses': '2.3.4 Scale Unknown/Unrecorded',
    'urban area': '1.1 Housing & urban areas',
    mining: '3.2 Mining & quarrying',
    'palm oil': '2.1.4 Scale Unknown/Unrecorded',
    'perennial crop': '2.1.4 Scale Unknown/Unrecorded',
    soybean: '2.1.4 Scale Unknown/Unrecorded',
    rice: '2.1.4 Scale Unknown/Unrecorded',
    'other temporary crops': '2.1.4 Scale Unknown/Unrecorded',
    coffee: '2.1.4 Scale Unknown/Unrecorded',
    citrus: '2.1.4 Scale Unknown/Unrecorded',
    'other perennial crops': '2.1.4 Scale Unknown/Unrecorded',
    'simple crops': '2.1.4 Scale Unknown/Unrecorded',
    'multiple crops': '2.1.4 Scale Unknown/Unrecorded',
    cotton: '2.1.4 Scale Unknown/Unrecorded'
};

let today = new Date();
const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
];
const day = today.getDate();
const month = months[today.getMonth()];
const year = today.getFullYear();

const date = `${month} ${day}, ${year}`;

const AooThreats = threats.AOO
const AooThreatsList = [];
for (const threat of AooThreats) {
    const lastYear = threat.lastYear;
    const lastYearPercentage = threat.lastYear_percentage
        .toFixed(2)
    const lastYearKm2 = threat.lastYear_km2
        .toFixed(2)
    const annualRate = threat.trendAnalysis.annualRate
        .toFixed(2);
    const pValue = threat.trendAnalysis.pValue
        .toExponential(4);
    const rSquared = threat.trendAnalysis.rSquared
        .toFixed(4);
    const threatName = threat.threat;

    let annualRateLabel = ''

    let threatText = `In ${lastYear}, the species had ${lastYearPercentage}% (${lastYearKm2} km²) of its AOO converted into areas of ${threatName}, an activity that has shown no trend from 1985 to 2022.`;
    if (annualRate > 0) {
        annualRateLabel = annualRate.replace('.', ',')
        threatText = `In ${lastYear}, the species had ${lastYearPercentage}% (${lastYearKm2} km²) of its AOO converted into areas of ${threatName}, an activity that has been growing at a rate of ${annualRateLabel}% per year from 1985 to 2022 [p-value: ${pValue}; R²: ${rSquared}].`;
    }
    if (annualRate < 0) {
        annualRateLabel = annualRate.replace('.', ',')
        threatText = `In ${lastYear}, the species had ${lastYearPercentage}% (${lastYearKm2} km²) of its AOO converted into areas of ${threatName}, an activity that has been decreasing at a rate of ${annualRateLabel}% per year from 1985 to 2022 [p-value: ${pValue}; R²: ${rSquared}].`;
    }

    const AooThreatInfo = {
        threat: threatsIUCN[threatName],
        text: threatText.replace(/\.$/, ' (MapBiomas, 2023).'),
        reference: `MapBiomas, 2023. MapBiomas Project - Collection 8 of the Annual Series of Land Cover and Use Maps of Brazil, data from 1985 to 2022. URL https://https://mapbiomas.org (accessed on ${date}).`
    };
    AooThreatsList.push(AooThreatInfo);
}

let AooThreatsListMerged = AooThreatsList.filter(
    (item) => item.threat === '2.1.4 Scale Unknown/Unrecorded'
);

let AooThreatsListNotMerged = AooThreatsList.filter(
    (item) => item.threat !== '2.1.4 Scale Unknown/Unrecorded',
);

if (AooThreatsListMerged.length >= 2) {
    const firstItem = AooThreatsListMerged[0];
    const secondItem = AooThreatsListMerged[1];

    firstItem.text += ' ' + secondItem.text;

    AooThreatsList.splice(AooThreatsList.indexOf(secondItem), 1);
}
AooThreatsListMerged = AooThreatsListMerged.concat(AooThreatsListNotMerged);

AooThreatsListMerged = AooThreatsList.filter(
    (item) => item.threat === '2.3.4 Scale Unknown/Unrecorded',
);
AooThreatsListNotMerged = AooThreatsList.filter(
    (item) => item.threat !== '2.3.4 Scale Unknown/Unrecorded',
);
if (AooThreatsListMerged.length >= 2) {
    const firstItem = AooThreatsListMerged[0];
    const secondItem = AooThreatsListMerged[1];

    firstItem.text += ' ' + secondItem.text;

    AooThreatsList.splice(AooThreatsList.indexOf(secondItem), 1);
}
const landCoverThreatsList = AooThreatsListMerged.concat(
    AooThreatsListNotMerged,
);

console.log(landCoverThreatsList)