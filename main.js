var map = L.map('map').setView([37.8, -96], 4);

L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
    attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
}).addTo(map);

var greenFeatheredIcon = L.icon({
    iconUrl: 'GreenMark.png',

    iconSize:     [32, 32], // size of the icon
    iconAnchor:   [16, 16], // point of the icon which will correspond to marker's location
});

var redFeatheredIcon = L.icon({
    iconUrl: 'RedMark.png',

    iconSize:     [32, 32], // size of the icon
    iconAnchor:   [16, 16], // point of the icon which will correspond to marker's location
});

map.createPane('closed');
map.getPane('closed').style.zIndex = 999;

fetchDataToPoints();

async function extractJSONData(url) {
    try {
        const response = await fetch(url);
        const html = await response.text();

        // Find the start and end index of the JSON data in the HTML file
        const startIndex = html.indexOf('<script id="__NEXT_DATA__" type="application/json">') + '<script id="__NEXT_DATA__" type="application/json">'.length;
        const endIndex = html.indexOf('</script>', startIndex);

        if (startIndex !== -1 && endIndex !== -1) {
            const jsonDataString = html.substring(startIndex, endIndex);
            const jsonData = JSON.parse(jsonDataString);
            return jsonData;
        } else {
            throw new Error('No JSON data found between script tags with id "__NEXT_DATA__"');
        }
    } catch (error) {
        console.error('Error:', error.message);
    }
}

async function fetchDataToPoints() {
    // Have to do this because of CORS
    const url = 'https://corsproxy.io/?https://locations.wafflehouse.com/';

    let dataSet = await extractJSONData(url);
    let locations = dataSet.props.pageProps.locations;

    for (let i = 0; i < locations.length; i++) {
        let isClosed = (locations[i].specialHours != null);

        if (isClosed)L.marker([locations[i].latitude, locations[i].longitude], { icon: redFeatheredIcon, pane: 'closed'}).addTo(map);
        else L.marker([locations[i].latitude, locations[i].longitude], { icon: greenFeatheredIcon }).addTo(map);

    }

}