const fs = require('fs');

function getTaxonInThreatenedLists(taxon) {
    try {
        const lists = './threatenedTaxa_lists';
        const files = fs.readdirSync(lists);

        const result = {
            threatenedLists: []
        };

        for (const file of files) {
            const filePath = `${lists}/${file}`;
            const fileContent = fs.readFileSync(filePath, 'utf-8');
            const json = JSON.parse(fileContent);

            json.forEach(element => {
                if (element.TAXON === taxon) {
                    const threatenedList = {
                        File: file,
                        Status: element.STATUS
                    };
                    result.threatenedLists.push(threatenedList);
                }
            });
        }

        console.log(result);
    } catch (error) {
        console.error('Error processing files:', error);
    }
}

const taxon = 'Aspidosperma desmanthum'
getTaxonInThreatenedLists(taxon)
