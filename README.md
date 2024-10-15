# Bull-ProFlora Paper Algorithms

This collection of scripts supports the paper currently under peer review. It demonstrates key methods for retrieving and generating data used in the assessment of plant species extinction risk.

## Clone this repository

`https://github.com/lsbjordao/Bull-ProFlora-paper-algorithms`

## Installation

All the required packages for this project are listed in the `package.json` file. To install them, simply run `npm install`.

The set of dependencies are:

- [https](https://www.npmjs.com/package/https)
- [@vicentecalfo/tropicos-api-wrapper](https://www.npmjs.com/package/@vicentecalfo/tropicos-api-wrapper)
- [@vicentecalfo/jskew](https://www.npmjs.com/package/@vicentecalfo/jskew)
- [fuse.js](https://www.fusejs.io/)
- [@turf/turf](https://www.npmjs.com/package/@turf/turf)
- [@vicentecalfo/eoo-aoo-calc](https://www.npmjs.com/package/@vicentecalfo/eoo-aoo-calc)
- [adm-zip](https://www.npmjs.com/package/adm-zip)
- [@google/earthengine](https://www.npmjs.com/package/@google/earthengine)
- [r-script](https://www.npmjs.com/package/r-script)
- [ejs](https://www.npmjs.com/package/ejs)

## Information

This ETL process fetches relevant data about taxa and transforms the response into a structured, readable format.

### FFB

Fetching data from [Flora e Funga do Brasil](https://floradobrasil.jbrj.gov.br/):

1. Open, the `FFB.js` file.
2. Observe the constant `taxon` at line 120: it is declared as `'Mimosa gracilis var. brevissima'`. This can be edited freely to test different entries.
3. Run the script:

```js
node ffb
```

4. Response should be similar to:

```js
{
  taxon: 'Mimosa gracilis var. brevissima',
  lifeForm: [ 'Erva' ],
  habitat: [ 'Terrícola' ],
  vegetationType: [ 'Cerrado (lato sensu)' ],
  states: [ 'DF', 'GO' ],
  endemism: 'YES',
  phytogeographicDomain: [ 'Cerrado' ],
  vernacularNames: [],
  citation: {
    full: 'Flora and Fungi of Brazil, 2024. Fabaceae. Flora and Fungi of Brazil. Jardim Botânico do Rio de Janeiro. URL https://floradobrasil.jbrj.gov.br/FB112007 (accessed on October 15, 2024).',
    inText: 'Flora e Funga do Brasil, 2024'
  }
}
```

### Obra princeps

Fetching data from [Tropicos](https://tropicos.org/):

1. First need is to possess an api key, where you can get at [https://services.tropicos.org/help?requestkey](https://services.tropicos.org/help?requestkey);
2. When in hands, create a file `tropicosApiKey.json`, an array with the api key string `["apiKey"]`;
3. Open, the `Tropicos.js` file;
4. Observe the constant `taxon` at line 34: it is declared as `'Mimosa gracilis var. brevissima'`. This can be edited freely to test different entries;
5. Run the script:
   
```js
node tropicos
```
4. Response should be similar to:

```js
// Mem. New York Bot. Gard. 65: 214, 1991.
```

Fetching data from [IPNI](https://www.ipni.org/):

1. Open, the `IPNI.js` file.
2. Observe the constant `taxon` at line 26: it is declared as `'Mimosa scabrella'`. This can be edited freely to test different entries.
3. Run the script:
   
```js
node ipni
```
4. Response should be similar to:

```js
// J. Bot. (Hooker) 4: 387. 1841.
```

## Records

A script showing the start with a specimens dataset as a json and a method for filterings according to a selected flow:

1. Open, the `records.js` file.
2. Observe the constant `occs` at first line: it is an array of objects with properties `id`, `lat`, `lon`, `record`, and `GIS`, all threated as strings.
3. Observe the constant `flowData` at line 9: it defines a hypothetic flow for the data: `flow` === `"PNA"`, `record` === `"x"`, and idem for `GIS` property.
4. Observe that after the filterings, the output to be generated is a [GeoJSON](https://geojson.org/).
5. Run the script:

```js
node records
```

6. Results should be similar to:

```js
{
  "type": "FeatureCollection",
  "features": [
    {
      "type": "Feature",
      "geometry": {
        "type": "Point",
        "coordinates": [
          -47.9292,
          -15.7801
        ]
      },
      "properties": {
        "occId": "specimen1",
        "validationRecord": "valid",
        "validationGIS": "valid"
      }
    },
    {
      "type": "Feature",
      "geometry": {
        "type": "Point",
        "coordinates": [
          -38.5014,
          -12.9714
        ]
      },
      "properties": {
        "occId": "specimen5",
        "validationRecord": "valid",
        "validationGIS": "valid"
      }
    }
  ]
}
```

## Distribution text generation

Due to the absence of a country field in CNCFlora's legacy system (http://cncflora.jbrj.gov.br/) and the frequent occurrence of unindexed administrative divisions in specimen databases, a method was developed to standardize the names of these entities, particularly for cases from South America.

The function should accept the name of a first-level administrative entity within the country (e.g., 'Estado' in Brazil, 'Provincia' in Argentina, 'Departamento' in Colombia) and a second-level administrative entity within the country (e.g., 'Município' in Brazil, 'Municipio' in Argentina, 'Municipio' in Colombia).

A dictionary of three levels of administrative divisions for South America countries, in CSV, is used (`./admDivisions/divisions.csv`):

1. Open, the `distribution.js` file;
2. Observe the constant `firstLvlInput` defined as `'RiodeJaneiro'` and `secondLvlInput` as `'   RiODe-JaNexirO '`;
3. Run the script:

```js
node distribution
```

4. Results should be similar to:

```
{
  item: {
    country: 'Brasil',
    firstLvl: 'Rio de Janeiro',
    secondLvl: 'Rio de Janeiro'
  },
  refIndex: 67
}
```

Try different patterns!

## Conservation actions

### Point-in-polygon analysis 

A GeoJSON file containing Brazil's major protected areas, known as '*Unidades de Conservação*', is used to check if a coordinate falls within any of these areas.

1. Open, the `UCs.js` file;
2. Observe the constant `coordinatesArray` defined as an array of objects, each with two properties: `latitude` and `longitude`;
3. Run the script:


```js
node ucs
```

4. The result should be similar to, indicating the coordinate which fall within and the protected area unity:

```js
// [ -43.284541, -22.947846 ]
// PARQUE NACIONAL DA TIJUCA
```

### Iterative JSON files searching

A directory containing multiple CSV files with columns for taxa and IUCN category status is accessed to verify if a taxon is listed:

1. Open, the `threatenedTaxa_lists.js` file;
2. Observe the constant `taxon` defined as `'Aspidosperma desmanthum'`: it can be changed by other taxon;
3. Run the script:

```js
node threatenedTaxa_lists
```

4. The result will be similar to below, showing the file in which the taxon was found and its respective status:

```js
// { threatenedLists: [ { File: 'res COEMA 54.json', Status: 'VU' } ] }
```

## Threats

### Overlay analysis

Overlay analysis is performed through the cloud of Google Earth Engine:

1. First, a `credentials.json` from Service Accounts at [Google Cloud](https://console.cloud.google.com/) is needed; copy one to the root project;
2. Open, the `threats-oa.js` file;
3. Observe the constant `taxon` at line 5: it is declared as `'Croton quintasii'`. This taxon name is used as a name for the file that contain the results from the records;
4. Run the script:

```js
node threats-oa
```

5. The result, it returns relevant the array of threats within the distribution area of a taxon:

```js
{
  EOO_area_km2: 5759.191240656638,
  AOO_area_km2: 4,
  EOO: [
    { band: 'classification_1985', areaKm2: [Object] },
    { band: 'classification_1986', areaKm2: [Object] },
    { band: 'classification_1987', areaKm2: [Object] },
    { band: 'classification_1988', areaKm2: [Object] },
    { band: 'classification_1989', areaKm2: [Object] },
    { band: 'classification_1990', areaKm2: [Object] },
    { band: 'classification_1991', areaKm2: [Object] },
    { band: 'classification_1992', areaKm2: [Object] },
    { band: 'classification_1993', areaKm2: [Object] },
    { band: 'classification_1994', areaKm2: [Object] },
    { band: 'classification_1995', areaKm2: [Object] },
    { band: 'classification_1996', areaKm2: [Object] },
    { band: 'classification_1997', areaKm2: [Object] },
    { band: 'classification_1998', areaKm2: [Object] },
    { band: 'classification_1999', areaKm2: [Object] },
    { band: 'classification_2000', areaKm2: [Object] },
    { band: 'classification_2001', areaKm2: [Object] },
    { band: 'classification_2002', areaKm2: [Object] },
    { band: 'classification_2003', areaKm2: [Object] },
    { band: 'classification_2004', areaKm2: [Object] },
    { band: 'classification_2005', areaKm2: [Object] },
    { band: 'classification_2006', areaKm2: [Object] },
    { band: 'classification_2007', areaKm2: [Object] },
    { band: 'classification_2008', areaKm2: [Object] },
    { band: 'classification_2009', areaKm2: [Object] },
    { band: 'classification_2010', areaKm2: [Object] },
    { band: 'classification_2011', areaKm2: [Object] },
    { band: 'classification_2012', areaKm2: [Object] },
    { band: 'classification_2013', areaKm2: [Object] },
    { band: 'classification_2014', areaKm2: [Object] },
    { band: 'classification_2015', areaKm2: [Object] },
    { band: 'classification_2016', areaKm2: [Object] },
    { band: 'classification_2017', areaKm2: [Object] },
    { band: 'classification_2018', areaKm2: [Object] },
    { band: 'classification_2019', areaKm2: [Object] },
    { band: 'classification_2020', areaKm2: [Object] },
    { band: 'classification_2021', areaKm2: [Object] },
    { band: 'classification_2022', areaKm2: [Object] }
  ],
  AOO: [
    { band: 'classification_1985', areaKm2: [Object] },
    { band: 'classification_1986', areaKm2: [Object] },
    { band: 'classification_1987', areaKm2: [Object] },
    { band: 'classification_1988', areaKm2: [Object] },
    { band: 'classification_1989', areaKm2: [Object] },
    { band: 'classification_1990', areaKm2: [Object] },
    { band: 'classification_1991', areaKm2: [Object] },
    { band: 'classification_1992', areaKm2: [Object] },
    { band: 'classification_1993', areaKm2: [Object] },
    { band: 'classification_1994', areaKm2: [Object] },
    { band: 'classification_1995', areaKm2: [Object] },
    { band: 'classification_1996', areaKm2: [Object] },
    { band: 'classification_1997', areaKm2: [Object] },
    { band: 'classification_1998', areaKm2: [Object] },
    { band: 'classification_1999', areaKm2: [Object] },
    { band: 'classification_2000', areaKm2: [Object] },
    { band: 'classification_2001', areaKm2: [Object] },
    { band: 'classification_2002', areaKm2: [Object] },
    { band: 'classification_2003', areaKm2: [Object] },
    { band: 'classification_2004', areaKm2: [Object] },
    { band: 'classification_2005', areaKm2: [Object] },
    { band: 'classification_2006', areaKm2: [Object] },
    { band: 'classification_2007', areaKm2: [Object] },
    { band: 'classification_2008', areaKm2: [Object] },
    { band: 'classification_2009', areaKm2: [Object] },
    { band: 'classification_2010', areaKm2: [Object] },
    { band: 'classification_2011', areaKm2: [Object] },
    { band: 'classification_2012', areaKm2: [Object] },
    { band: 'classification_2013', areaKm2: [Object] },
    { band: 'classification_2014', areaKm2: [Object] },
    { band: 'classification_2015', areaKm2: [Object] },
    { band: 'classification_2016', areaKm2: [Object] },
    { band: 'classification_2017', areaKm2: [Object] },
    { band: 'classification_2018', areaKm2: [Object] },
    { band: 'classification_2019', areaKm2: [Object] },
    { band: 'classification_2020', areaKm2: [Object] },
    { band: 'classification_2021', areaKm2: [Object] },
    { band: 'classification_2022', areaKm2: [Object] }
  ]
}
```

Each `areaKm2` object has this structure:

```js
{
  "groups": [
    {
      "class": Integer, // An integer representing the MapBiomas land cover class
      "sum": Float      // A decimal representing the total area in square kilometers
    },
    {
      "class": Integer,
      "sum": Float
    }
    // More objects with the same structure
  ]
}
```

### Trend analysis

Trend analysis is performed by spawning a command with the `r-script` package, which runs the `ggtrendline` R package:

1. Open, the `threats-trendAnalysis.js` file.
2. Observe the constant `taxon` at line 5: it is declared as `'Croton quintasii'`. This taxon name is used as a name for the file that contain the results from the overlay analysis.
3. Run the script:

```js
node threats-trendanalysis
```

4. As outcome, it returns relevant the array of threats within the distribution area of a taxon:

```js
[
  {
    threat: 'forest plantation',
    lastYear: '2022',
    trendAnalysis: { annualRate: 1.3256, pValue: 1.7964e-21, rSquared: 0.9324 },
    lastYear_km2: 4.31939824302829,
    lastYear_percentage: 17.99749267928454
  },
  {
    threat: 'mosaic of uses',
    lastYear: '2022',
    trendAnalysis: { annualRate: 0.1484, pValue: 0.1264, rSquared: 0.0637 },
    lastYear_km2: 2.572139705074356,
    lastYear_percentage: 10.71724877114315
  },
  {
    threat: 'soybean',
    lastYear: '2022',
    trendAnalysis: { annualRate: 0.4846, pValue: 1.024e-11, rSquared: 0.7279 },
    lastYear_km2: 2.1433431158448464,
    lastYear_percentage: 8.930596316020194
  }
]
```
## Taxon profile

### Text processing of threats

1. Open, the `taxonProfile-textProcessing.js` file.
2. Observe the constant `taxon` at line 5: it is declared as `'Croton quintasii'`. This taxon name is used as a name for the file that contain the results from the trend analysis.
3. Run the script:

```js
node taxonProfile-textProcessing
```

4. As a result, an array of elements is generated, each containing the threat codified according to IUCN protocols, along with a standardized statement that provides a calculated annual rate based on linear regression:

```
[
  {
    threat: '2.3.4 Scale Unknown/Unrecorded',
    text: 'In 2022, the species had 10.72% (2.57 km²) of its AOO converted into areas of mosaic land use, an activity that has been growing at a rate of 0.15% per year from 1985 to 2022 [valor-p: 1.2640e-1; R²: 0.0637] (MapBiomas, 2023).',
    reference: 'MapBiomas, 2023. MapBiomas Project - Collection 8 of the Annual Series of Land Cover and Use Maps of Brazil, data from 1985 to 2022. URL https://https://mapbiomas.org (accessed on August 21, 2024).'
  },
  {
    threat: '2.2.3 Scale Unknown/Unrecorded',
    text: 'In 2022, the species had 18.00% (4.32 km²) of its AOO converted into areas of forestry, an activity that has been growing at a rate of 1.30% per year from 1985 to 2022 [valor-p: 1.2176e-23; R²: 0.9404] (MapBiomas, 2023).',
    reference: 'MapBiomas, 2023. MapBiomas Project - Collection 8 of the Annual Series of Land Cover and Use Maps of Brazil, data from 1985 to 2022. URL https://https://mapbiomas.org (accessed on August 21, 2024).'
  },
  {
    threat: '2.1.4 Scale Unknown/Unrecorded',
    text: 'In 2022, the species had 8.93% (2.14 km²) of its AOO converted into areas of soybean, an activity that has been growing at a rate of 0.48% per year from 1985 to 2021 [valor-p: 1.0240e-11; R²: 0.7279] (MapBiomas, 2023).',
    reference: 'MapBiomas, 2023. MapBiomas Project - Collection 8 of the Annual Series of Land Cover and Use Maps of Brazil, data from 1985 to 2021. URL https://https://mapbiomas.org (accessed on August 21, 2024).'
  }
]
```

### Viewing

1. Open, the `taxonProfile-view.js` file;
2. Observe the constant `taxon` at line 4: it is declared as `'Croton quintasii'`. This taxon name is used as a name for the file that contain the results from the texts about the threats already processed;
3. Run the script:

```js
node taxonProfile-view
```

4. The outcome is an HTML file, which can be opened, with a table rendered dinamically according with the json loaded:

| Threat            | Last Year | Annual Rate | p-Value       | R²     | Last Year Area (km²) | Last Year Percentage (%) |
|-------------------|-----------|-------------|---------------|--------|----------------------|--------------------------|
| forest plantation       | 2022      | 1.2953      | 1.2176e-23    | 0.9404 | 4.32                 | 18.00                    |
| mosaicof uses    | 2022      | 0.1484      | 0.1264        | 0.0637 | 2.57                 | 10.72                    |
| soybean              | 2022      | 0.4846      | 1.024e-11     | 0.7279 | 2.14                 | 8.93                     |
