import fs from 'fs';
import xml2js from 'xml2js';

const svgFile = fs.readFileSync('c:/Users/PC 1/BrokerHouse/src/assets/ncr_map.svg', 'utf-8');

xml2js.parseString(svgFile, (err, result) => {
    if (err) {
        console.error(err);
        return;
    }

    const districts = [];

    // recursively find all g with aria-label AND extract the geometry inside it
    function findDistricts(gArray) {
        if (!gArray) return;
        gArray.forEach(g => {
            if (g.$ && g.$['aria-label']) {
                const label = g.$['aria-label'];
                const clipPath = g.$['clip-path'];
                
                // Extract actual paths inside this group
                const paths = [];
                if (g.path) {
                    g.path.forEach(p => {
                        if (p.$ && p.$.d && !p.$.d.includes('M -1,-1')) { // ignore bounding box paths
                            paths.push(p.$.d);
                        }
                    });
                }
                
                districts.push({ label, clipPath, paths });
            }
            if (g.g) {
                findDistricts(g.g);
            }
        });
    }

    findDistricts(result.svg.g);

    fs.writeFileSync('ncr_labeled_paths.json', JSON.stringify(districts, null, 2));
    console.log(`Extracted labeled paths: ${districts.length}`);
});
