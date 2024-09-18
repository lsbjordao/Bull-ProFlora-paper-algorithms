const fs = require('fs')
const taxon = 'Croton quintasii'
const threatsFilePath = `./threats/${taxon}.json`;
const threats = JSON.parse(fs.readFileSync(threatsFilePath, 'utf-8'));

const threatsIUCN = {
    silvicultura: '2.2.3 Scale Unknown/Unrecorded',
    agropecuária: '2.3.4 Scale Unknown/Unrecorded',
    pastagem: '2.3.4 Scale Unknown/Unrecorded',
    agricultura: '2.1.4 Scale Unknown/Unrecorded',
    'lavoura temporária': '2.1.4 Scale Unknown/Unrecorded',
    cana: '2.1.4 Scale Unknown/Unrecorded',
    'mosaico de usos': '2.3.4 Scale Unknown/Unrecorded',
    'área urbanizada': '1.1 Housing & urban areas',
    mineração: '3.2 Mining & quarrying',
    'cultura de palma': '2.1.4 Scale Unknown/Unrecorded',
    'lavoura perene': '2.1.4 Scale Unknown/Unrecorded',
    soja: '2.1.4 Scale Unknown/Unrecorded',
    arroz: '2.1.4 Scale Unknown/Unrecorded',
    'outras lavouras temporárias': '2.1.4 Scale Unknown/Unrecorded',
    café: '2.1.4 Scale Unknown/Unrecorded',
    citrus: '2.1.4 Scale Unknown/Unrecorded',
    'outras lavouras perenes': '2.1.4 Scale Unknown/Unrecorded',
    'área urbana': '2.1.4 Scale Unknown/Unrecorded',
    infraestrutura: '2.1.4 Scale Unknown/Unrecorded',
    'outras áreas urbanizadas': '2.1.4 Scale Unknown/Unrecorded',
    'cultivos simples': '2.1.4 Scale Unknown/Unrecorded',
    'cultivos múltiples': '2.1.4 Scale Unknown/Unrecorded',
    algodão: '2.1.4 Scale Unknown/Unrecorded',
};

let today = new Date();
const months = [
    'janeiro',
    'fevereiro',
    'março',
    'abril',
    'maio',
    'junho',
    'julho',
    'agosto',
    'setembro',
    'outubro',
    'novembro',
    'dezembro',
];
const day = today.getDate();
const month = months[today.getMonth()];
const year = today.getFullYear();

const date = `${day} de ${month} de ${year}`;

const AooThreats = threats.AOO
const AooThreatsList = [];
for (const threat of AooThreats) {
    const lastYear = threat.lastYear;
    const lastYearPercentage = threat.lastYear_percentage
        .toFixed(2)
        .replace('.', ',');
    const lastYearKm2 = threat.lastYear_km2
        .toFixed(2)
        .replace('.', ',');
    const annualRate = threat.trendAnalysis.annualRate
        .toFixed(2);
    const pValue = threat.trendAnalysis.pValue
        .toExponential(4);
    const rSquared = threat.trendAnalysis.rSquared
        .toFixed(4);
    const threatName = threat.threat;

    let annualRateLabel = ''

    let threatText = `Em ${lastYear}, a espécie apresentava ${lastYearPercentage}% (${lastYearKm2} km²) da sua AOO convertidos em áreas de ${threatName}, atividade que apresenta tendência nula desde 1985 até 2020.`;
    if (annualRate > 0) {
        annualRateLabel = annualRate.replace('.', ',')
        threatText = `Em ${lastYear}, a espécie apresentava ${lastYearPercentage}% (${lastYearKm2} km²) da sua AOO convertidos em áreas de ${threatName}, atividade que cresce a uma taxa de ${annualRateLabel}% aa desde 1985 até 2020 [valor-p: ${pValue}; R²: ${rSquared}].`;
    }
    if (annualRate < 0) {
        annualRateLabel = annualRate.replace('.', ',')
        threatText = `Em ${lastYear}, a espécie apresentava ${lastYearPercentage}% (${lastYearKm2} km²) da sua AOO convertidos em áreas de ${threatName}, atividade que diminui a uma taxa de ${annualRateLabel}% aa desde 1985 até 2020 [valor-p: ${pValue}; R²: ${rSquared}].`;
    }

    threatText = threatText.replace(
        'áreas de área urbanizada',
        'área urbanizada',
    );

    const AooThreatInfo = {
        threat: threatsIUCN[threatName],
        text: threatText.replace(/\.$/, ' (MapBiomas, 2022).'),
        reference: `MapBiomas, 2022. Projeto MapBiomas - Coleção 7 da Série Anual de Mapas de Cobertura e Uso de Solo do Brasil, dados de 1985 e 2021. URL https://https://mapbiomas.org (acesso em ${date}).`
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