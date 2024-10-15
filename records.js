const occs = [
    { "id": "specimen1", "lat": "-15.7801", "lon": "-47.9292", "record": "valid", "GIS": "valid" },
    { "id": "specimen2", "lat": "-22.9068", "lon": "-43.1729", "record": "valid", "GIS": "invalid" },
    { "id": "specimen3", "lat": "-23.5505", "lon": "-46.6333", "record": "invalid", "GIS": "valid" },
    { "id": "specimen4", "lat": "-3.1190", "lon": "-60.0217", "record": "invalid", "GIS": "invalid" },
    { "id": "specimen5", "lat": "-12.9714", "lon": "-38.5014", "record": "valid", "GIS": "valid" }
];

const flowData = {
    "flow": "PNA",
    "record": "x",
    "GIS": "x"
};

const isOccValid = (occ) => occ.record === 'valid';
const isOccNotInvalid = (occ) => occ.record !== 'invalid';
const isGisValid = (occ) => occ.GIS === 'valid';
const isGisNotInvalid = (occ) => occ.GIS !== 'invalid';

const filteredOccIdx = occs
    .map((occ, i) => ({ occ, idx: i }))
    .filter(({ occ }) => {
        if (flowData.flow === 'PA') {
            return isOccValid(occ) && isGisValid(occ);
        } else if (flowData.flow === 'PNA') {
            return (
                (flowData.record === 'x' && flowData.GIS === 'x' && isOccValid(occ) && isGisValid(occ)) ||
                (flowData.record === 'x' && flowData.GIS === '0' && isOccValid(occ)) ||
                (flowData.record === '0' && flowData.GIS === 'x' && isGisValid(occ)) ||
                (flowData.record === '0' && flowData.GIS === '0') ||
                (flowData.record === '!' && flowData.GIS === '0' && isOccNotInvalid(occ)) ||
                (flowData.record === 'x' && flowData.GIS === '!' && isGisNotInvalid(occ))
            );
        }
        return false;
    })
    .map(({ idx }) => idx);

const taxonRecords = filteredOccIdx.map(i => ({
    type: "Feature",
    geometry: {
        type: "Point",
        coordinates: [parseFloat(occs[i].lon), parseFloat(occs[i].lat)]
    },
    properties: {
        occId: occs[i].id,
        validationRecord: occs[i].record,
        validationGIS: occs[i].GIS
    }
}));

const geojson = {
    type: "FeatureCollection",
    features: taxonRecords
};

console.log(JSON.stringify(geojson, null, 2));
