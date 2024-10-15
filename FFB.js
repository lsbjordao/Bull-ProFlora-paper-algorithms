const https = require('https')

async function searchInFFB(taxon) {
    const options = {
        hostname: 'servicos.jbrj.gov.br',
        path: '/v2/flora/taxon/' + encodeURIComponent(taxon),
        method: 'GET',
    }
    return new Promise((resolve, reject) => {
        const req = https.request(options, (res) => {
            let data = ''
            res.on('data', (chunk) => {
                data += chunk
            })
            res.on('end', () => {
                try {
                    resolve(JSON.parse(data))
                } catch (error) {
                    reject(error)
                }
            })
        })
        req.on('error', reject)
        req.end()
    })
}

function generateCitation(howToCite, family, taxonId, date) {
    function genfullCitation() {

        function formatDate(date) {
            const months = [
                'January', 'February', 'March', 'April', 'May', 'June',
                'July', 'August', 'September', 'October', 'November', 'December'
            ]
            return `${months[date.getMonth()]} ${date.getDate()}, ${date.getFullYear()}`;
        }

        const hasAuthorship = !/^Flora do Brasil/.test(howToCite)

        if (hasAuthorship) {
            const matchResult = howToCite.match(/(\W\w+)\sin/)
            const taxon = matchResult ? matchResult[1] : ''
            howToCite = howToCite.replace(/(.*)\sin Flora do Brasil.*/, '$1')
            howToCite = howToCite.replace(/\s\w+$/, '')
            return `${howToCite}, ${date.getFullYear()}.${taxon}. Flora and Fungi of Brazil. Jardim Botânico do Rio de Janeiro. URL https://floradobrasil.jbrj.gov.br/${taxonId} (accessed on ${formatDate(date)}).`
        } else {
            return `Flora and Fungi of Brazil, ${date.getFullYear()}. ${family}. Flora and Fungi of Brazil. Jardim Botânico do Rio de Janeiro. URL https://floradobrasil.jbrj.gov.br/${taxonId} (accessed on ${formatDate(date)}).`
        }
    }

    function geninTextCitation(fullCitation) {
        const yearMatch = fullCitation.match(/\b\d{4}\b/)
        const year = yearMatch ? yearMatch[0] : ''

        if (fullCitation.startsWith('Flora e Funga do Brasil')) {
            return `Flora and Fungi of Brazil, ${year}`
        } else {
            const authorsMatch = fullCitation.match(/.*?\d{4}/)
            let authors = authorsMatch ? authorsMatch[0] : ''
            authors = authors.replace(/,?\s*\d{4}\b/, '')
            const authorList = authors.split(/,\s+[\w\.-]+,\s/).filter(Boolean).map(author => author.replace(/,\s[\w\.-]+\s*$/, ''))

            if (authorList.length === 1) {
                return `${authorList[0]}, ${year}`
            } else if (authorList.length === 2) {
                return `${authorList[0]} and ${authorList[1]}, ${year}`
            } else {
                return `${authorList[0]} et al., ${year}`
            }
        }
    }
    
    const fullCitation = genfullCitation()
    const inTextCitation = geninTextCitation(fullCitation)

    return {
        full: fullCitation,
        inText: inTextCitation
    }
}

async function fetchTaxonData(taxon) {
    const response = await searchInFFB(taxon)
    if (!response || response.length === 0) return null

    const data = response[0]
    const taxonProfile = data.specie_profile
    
    const lifeForm = taxonProfile.lifeForm
    const habitat = taxonProfile.habitat
    const vegetationType = taxonProfile.vegetationType
    const states = data.distribuition.map(item => item.locationid.replace(/BR-/, ''))
    const distribution = data.distribuition[0]
    let endemism = distribution.occurrenceremarks.endemism
    endemism = endemism === 'Endemica' ? 'YES' : endemism === 'Não endemica' ? 'NO' : endemism
    const phytogeographicDomain = distribution.occurrenceremarks.phytogeographicDomain
    const vernacularNames = data.vernacular_name

    const taxonData = data.taxon
    const family = taxonData.family
    const howToCite = taxonData.bibliographiccitation_how_to_cite
    const references = taxonData.references
    const extractTaxonId = (references) => {
        const match = references.match(/id\=.*/)
        return match ? match[0].replace(/id\=/, '') : ''
    }
    const taxonId = extractTaxonId(references)
    const date = new Date()
    const citation = generateCitation(howToCite, family, taxonId, date)

    return {
        taxon, lifeForm, habitat, vegetationType, states, endemism, 
        phytogeographicDomain, vernacularNames, citation
    }
}

(async () => {
    try {
        const taxon = 'Mimosa gracilis var. brevissima'
        const result = await fetchTaxonData(taxon)
        console.log(result)
    } catch (error) {
        console.error('Error fetching taxon data:', error)
    }
})()
