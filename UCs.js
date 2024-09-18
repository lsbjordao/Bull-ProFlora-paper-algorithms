const fs = require('fs');
const turf = require('@turf/turf');
const UCsFilePath = './geojsons/UCs.json';

const UCs = JSON.parse(fs.readFileSync(UCsFilePath, 'utf-8'))

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
        const pointWithin = turf.pointsWithinPolygon(point, polygon);

        if (pointWithin.features.length > 0) {
            UCsWithin.push(polygon);
            pointsWithinUCs.push(point);
        }
    });
}

console.log(pointsWithinUCs[0].geometry.coordinates) // [ -43.284541, -22.947846 ]
console.log(UCsWithin[0].properties.properties.NOME_UC1) // PARQUE NACIONAL DA TIJUCA