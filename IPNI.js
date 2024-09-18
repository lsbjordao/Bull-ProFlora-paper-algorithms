const jskew = require('@vicentecalfo/jskew')

async function getObraPrincepsAtIpni(taxon, taxonAuthor) {
    const genus = taxon.match(/^[^\s]+/)[0]
    const epithet = taxon.match(/^\S+\s+(\S+)/)[1]
  try {
    const ipni = new jskew.Ipni()
    const data = await ipni
      .name({
        genus: genus,
        species: epithet,
        author: taxonAuthor,
      })
      .toPromise()

    const abbreviatedObraPrinceps = data.body.results[0].reference.trim() + '.'
    return abbreviatedObraPrinceps
  } catch (error) {
    console.error('Error searching species in IPNI:', error)
    throw error
  }
}

(async () => {
  try {
    const taxon = 'Mimosa scabrella'
    const author = 'Benth.'

    const result = await getObraPrincepsAtIpni(taxon, author)
    console.log(result)
  } catch (error) {
    console.error('Error in example usage:', error)
  }
})()