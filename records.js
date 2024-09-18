const occs = [
    { "id": "specimen1", "lat": "-15.7801", "lon": "-47.9292", "record": "valid", "SIG": "valid" },
    { "id": "specimen2", "lat": "-22.9068", "lon": "-43.1729", "record": "valid", "SIG": "invalid" },
    { "id": "specimen3", "lat": "-23.5505", "lon": "-46.6333", "record": "invalid", "SIG": "valid" },
    { "id": "specimen4", "lat": "-3.1190", "lon": "-60.0217", "record": "invalid", "SIG": "invalid" },
    { "id": "specimen5", "lat": "-12.9714", "lon": "-38.5014", "record": "valid", "SIG": "valid" }
];

const flowData = {
    "flow": "PNA",
    "record": "x",
    "SIG": "x"
};

const isOccValid = (occ) => occ.record === 'valid';
const isOccNotInvalid = (occ) => occ.record !== 'invalid';
const isSigValid = (occ) => occ.SIG === 'valid';
const isSigNotInvalid = (occ) => occ.SIG !== 'invalid';

const filteredOccIdx = occs
    .map((occ, i) => ({ occ, idx: i }))
    .filter(({ occ }) => {
        if (flowData.flow === 'PA') {
            return isOccValid(occ) && isSigValid(occ);
        } else if (flowData.flow === 'PNA') {
            return (
                (flowData.record === 'x' && flowData.SIG === 'x' && isOccValid(occ) && isSigValid(occ)) ||
                (flowData.record === 'x' && flowData.SIG === '0' && isOccValid(occ)) ||
                (flowData.record === '0' && flowData.SIG === 'x' && isSigValid(occ)) ||
                (flowData.record === '0' && flowData.SIG === '0') ||
                (flowData.record === '!' && flowData.SIG === '0' && isOccNotInvalid(occ)) ||
                (flowData.record === 'x' && flowData.SIG === '!' && isSigNotInvalid(occ))
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
        validationSIG: occs[i].SIG
    }
}));

const geojson = {
    type: "FeatureCollection",
    features: taxonRecords
};

console.log(JSON.stringify(geojson, null, 2));
