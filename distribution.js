const Fuse = require('fuse.js')
const fs = require('fs')

function getBestMatch(firstLvl, secondLvl) {

    const divisions = fs.readFileSync('./admDivisions/divisions.csv', 'utf-8')
        .split('\n')
        .filter(Boolean)
        .map(line => {
            const [country, firstLvl, secondLvl] = line.trim().split(',')
            return { country, firstLvl, secondLvl }
        })

    const optionsFirstLvl = {
        keys: [
            { name: 'firstLvl' }
        ],
        threshold: 0.7,
        useExtendedSearch: true
    }

    let fuse = new Fuse(divisions, optionsFirstLvl)
    let bestMatchesFirstLvl = fuse.search(firstLvl)
    bestMatchesFirstLvl = bestMatchesFirstLvl.map(element => element.item)

    const identicalFirstLvl = bestMatchesFirstLvl.some(element => element.firstLvl === firstLvl)

    if (identicalFirstLvl) {
        bestMatchesFirstLvl = bestMatchesFirstLvl.filter(element => element.firstLvl === firstLvl)
    }

    const optionsSecondLvl = {
        keys: [
            { name: 'secondLvl' }
        ],
        useExtendedSearch: true
    }

    fuse = new Fuse(bestMatchesFirstLvl, optionsSecondLvl)
    let bestMatchSecondLvl = fuse.search(secondLvl)

    if (bestMatchSecondLvl.length === 0) {
        bestMatchSecondLvl = [
            {
                item: {
                    country: bestMatchesFirstLvl[0].country,
                    firstLvl: bestMatchesFirstLvl[0].firstLvl,
                    secondLvl: 'unknown'
                }
            }
        ]
    }

    return bestMatchSecondLvl
}

const firstLvlInput = 'RiodeJaneiro'
const secondLvlInput = '   RiODe-JaNexirO '

const result = getBestMatch(firstLvlInput, secondLvlInput)
console.log(result[0])