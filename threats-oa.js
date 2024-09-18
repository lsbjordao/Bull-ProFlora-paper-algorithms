const fs = require('fs')
const EooAooCalc = require('@vicentecalfo/eoo-aoo-calc')
const ee = require('@google/earthengine')
const privateKey = require('./credentials.json')

async function makeEooGeometry(coordinates) {
    const eoo = new EooAooCalc.EOO({ coordinates })
    const eooObj = await eoo.calculate()
    const area_km2 = eooObj.areaInSquareKm
    const eooGeoJson = eooObj.convexHullPolygon
    const featureCollectionEOO = ee.FeatureCollection(eooGeoJson.features)
    return { geometry: featureCollectionEOO.geometry(), area_km2 }
}

async function makeAooGeometry(coordinates) {
    const aoo = new EooAooCalc.AOO({ coordinates })
    const aooObj = await aoo.calculate({ gridWidthInKm: 2 })
    const area_km2 = aooObj.gridAreaInSquareKm
    const aooGeoJson = aooObj.occupiedGrids
    const featureCollectionAOO = ee.FeatureCollection(aooGeoJson.features)
    return { geometry: featureCollectionAOO.geometry(), area_km2 }
}

async function overlayAnalysis_calcArea(coordinates) {
    return new Promise((resolve, reject) => {
        ee.data.authenticateViaPrivateKey(
            privateKey,
            async () => {
                ee.initialize()

                const EOO = await makeEooGeometry(coordinates)
                const AOO = await makeAooGeometry(coordinates)

                const imageIds = [
                    'projects/mapbiomas-workspace/public/collection8/mapbiomas_collection80_integration_v1',
                    'projects/mapbiomas-raisg/public/collection5/mapbiomas_raisg_panamazonia_collection5_integration_v1',
                    'projects/MapBiomas_Pampa/public/collection3/mapbiomas_pampa_collection3_integration_v1',
                    'projects/mapbiomas-chaco/public/collection4/mapbiomas_chaco_collection4_integration_v1',
                    'projects/mapbiomas_af_trinacional/public/collection3/mapbiomas_atlantic_forest_collection30_integration_v1',
                    'projects/mapbiomas-public/assets/peru/collection2/mapbiomas_peru_collection2_integration_v1',
                    'projects/MapBiomas_Pampa/public/collection3/mapbiomas_uruguay_collection1_integration_v1'
                ]

                const images = imageIds.map(id => ee.Image(id))
                const bandNames = await images[0].bandNames().getInfo()
                const mosaic = ee.ImageCollection(images).mosaic()

                const calculateArea = async (geometry, bands) => {
                    const result = []
                    for (const bandName of bands) {
                        const band = mosaic.select(bandName)
                        const clippedImage = band.clip(geometry)
                        const areaImage = ee.Image.pixelArea().divide(1000000).addBands(clippedImage)
                        const areas = await areaImage.reduceRegion({
                            reducer: ee.Reducer.sum().group({
                                groupField: 1,
                                groupName: 'class',
                            }),
                            geometry: clippedImage.geometry(),
                            scale: 10,
                            maxPixels: 1e7,
                            bestEffort: true
                        }).getInfo()
                        result.push({
                            band: bandName,
                            areaKm2: areas
                        })
                    }
                    return result
                }

                const [ EOOresult, AOOresult ] = await Promise.all([
                    calculateArea(EOO.geometry, bandNames),
                    calculateArea(AOO.geometry, bandNames)
                ])

                resolve({ 
                    EOO_area_km2: EOO.area_km2, 
                    AOO_area_km2: AOO.area_km2,
                    EOO: EOOresult, 
                    AOO: AOOresult,
                })
            },
            error => {
                reject(error)
            }
        )
    })
}

function getCoordinates(geojson) {
    const coords = geojson.map(feature => ({
        lat: feature.geometry.coordinates[1],
        lon: feature.geometry.coordinates[0]
    }))

    return coords.map(({ lat, lon }) => ({
        latitude: parseFloat(lat),
        longitude: parseFloat(lon)
    }))
}

(async () => {
    try {
        const taxon = 'Croton quintasii'
        const pathFile = `./records/${taxon}.json`
        const fileContent = await fs.promises.readFile(pathFile, 'utf-8')
        const records = JSON.parse(fileContent)
        const coordinates = await getCoordinates(records)

        const result = coordinates.length > 0
            ? await overlayAnalysis_calcArea(coordinates)
            : await overlayAnalysis_calcArea([{
                latitude: -26.148915,
                longitude: -41.805632
            }]) // fall in water

        console.log(result)
    } catch (error) {
        console.error('Error:', error)
    }
})()
