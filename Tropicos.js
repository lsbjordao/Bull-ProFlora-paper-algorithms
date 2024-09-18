const TropicosApi = require('@vicentecalfo/tropicos-api-wrapper');
const tropicosApiKey = require('./tropicosApiKey.json');

const tropicosApi = new TropicosApi({
  apiKey: tropicosApiKey[0],
  format: 'json'
});

async function getObraPrincepsAtTropicos(taxon) {
  try {
    let cleanedTaxon = taxon.replace(/var\. /, '')
    cleanedTaxon = cleanedTaxon.replace(/subsp\. /, '')
    cleanedTaxon = [...new Set(cleanedTaxon.split(' '))].join(' ')

    const data = await tropicosApi.search({
      name: cleanedTaxon,
      type: 'wildcard'
    }).toPromise()

    const response = JSON.parse(data.body)
    const reference = response[0].DisplayReference
    const date = response[0].DisplayDate
    const obraPrinceps = reference + ', ' + date + '.'

    return obraPrinceps
  } catch (error) {
    console.error('Error searching taxon in Tropicos:', error);
    throw error
  }
}

(async () => {
  try {
    const taxon = 'Mimosa gracilis var. brevissima'
    const result = await getObraPrincepsAtTropicos(taxon)
    console.log(result)
  } catch (error) {
    console.error('Error in the example usage:', error)
  }
})()