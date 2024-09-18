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
    function genLongCitation() {

        function formatDate(date) {
            const months = [
                'janeiro', 'fevereiro', 'março', 'abril', 'maio', 'junho',
                'julho', 'agosto', 'setembro', 'outubro', 'novembro', 'dezembro'
            ]
            return `${date.getDate()} de ${months[date.getMonth()]} de ${date.getFullYear()}`
        }

        const hasAuthorship = !/^Flora do Brasil/.test(howToCite)

        if (hasAuthorship) {
            const matchResult = howToCite.match(/(\W\w+)\sin/)
            const taxon = matchResult ? matchResult[1] : ''
            howToCite = howToCite.replace(/(.*)\sin Flora do Brasil.*/, '$1')
            howToCite = howToCite.replace(/\s\w+$/, '')
            return `${howToCite}, ${date.getFullYear()}.${taxon}. Flora e Funga do Brasil. Jardim Botânico do Rio de Janeiro. URL https://floradobrasil.jbrj.gov.br/${taxonId} (acesso em ${formatDate(date)}).`
        } else {
            return `Flora e Funga do Brasil, ${date.getFullYear()}. ${family}. Flora e Funga do Brasil. Jardim Botânico do Rio de Janeiro. URL https://floradobrasil.jbrj.gov.br/${taxonId} (acesso em ${formatDate(date)}).`
        }
    }

    function genShortCitation(longCitation) {
        const yearMatch = longCitation.match(/\b\d{4}\b/)
        const year = yearMatch ? yearMatch[0] : ''

        if (longCitation.startsWith('Flora e Funga do Brasil')) {
            return `Flora e Funga do Brasil, ${year}`
        } else {
            const authorsMatch = longCitation.match(/.*?\d{4}/)
            let authors = authorsMatch ? authorsMatch[0] : ''
            authors = authors.replace(/,?\s*\d{4}\b/, '')
            const authorList = authors.split(/,\s+[\w\.-]+,\s/).filter(Boolean).map(author => author.replace(/,\s[\w\.-]+\s*$/, ''))

            if (authorList.length === 1) {
                return `${authorList[0]}, ${year}`
            } else if (authorList.length === 2) {
                return `${authorList[0]} e ${authorList[1]}, ${year}`
            } else {
                return `${authorList[0]} et al., ${year}`
            }
        }
    }
    
    const longCitation = genLongCitation()
    const shortCitation = genShortCitation(longCitation)

    return {
        long: longCitation,
        short: shortCitation
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
        lifeForm, habitat, vegetationType, states, endemism, 
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
