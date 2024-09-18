const fs = require('fs');
const AdmZip = require('adm-zip');
const turf = require('@turf/turf');
const UCsZippedFilePath = './geojsons/UCs.zip';
const UCsFilePath = './geojsons/UCs.json';

if (!fs.existsSync(UCsFilePath)) {
    const zip = new AdmZip(UCsZippedFilePath);
    const zipEntries = zip.getEntries();

    zipEntries.forEach(entry => {
        if (entry.entryName.endsWith('.json')) {
            fs.writeFileSync(UCsFilePath, entry.getData());
            console.log(`${entry.entryName} extracted to ${UCsFilePath}`);
        }
    });
}

const UCs = JSON.parse(fs.readFileSync(UCsFilePath, 'utf-8'));

const polygons = UCs.features.map(feature =>
    turf.multiPolygon(feature.geometry.coordinates, { properties: feature.properties })
);

const coordinatesArray = [
    {
        latitude: -22,
        longitude: -44
    },
    {
        latitude: -22.947846,
        longitude: -43.284541
    }
];

const UCsWithin = [];
const pointsWithinUCs = [];

for (const coordinates of coordinatesArray) {
    const point = turf.point([coordinates.longitude, coordinates.latitude]);
    
    polygons.forEach(polygon => {
        const isWithin = turf.booleanPointInPolygon(point, polygon);

        if (isWithin) {
            UCsWithin.push(polygon);
            pointsWithinUCs.push(point);
        }
    });
}

if (pointsWithinUCs.length > 0 && UCsWithin.length > 0) {
    console.log(pointsWithinUCs[0].geometry.coordinates); // [ -43.284541, -22.947846 ]
    console.log(UCsWithin[0].properties.properties.NOME_UC1); // PARQUE NACIONAL DA TIJUCA
} else {
    console.log('No point found within UCs.');
}
