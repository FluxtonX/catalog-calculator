const url = 'https://customer.api.soundcharts.com/api/v2/artist/search/billie%20eilish';

fetch(url, {
  method: 'GET',
  headers: {
    'x-app-id': 'soundcharts',
    'x-api-key': 'soundcharts'
  }
})
.then(response => response.json())
.then(data => console.log(JSON.stringify(data, null, 2)))
.catch(error => console.error('Error:', error));
