async function test() {
  const res = await fetch('https://itunes.apple.com/search?term=Lil+Tjay&entity=musicArtist&limit=1');
  const data = await res.json();
  const artistId = data.results[0].amgArtistId || data.results[0].artistId;
  
  const lookupRes = await fetch(https://itunes.apple.com/lookup?id= + artistId + &entity=album&limit=200);
  const lookupData = await lookupRes.json();
  
  const albums = lookupData.results.filter(r => r.wrapperType === 'collection');
  const singles = albums.filter(a => (a.trackCount || 0) <= 3);
  
  console.log('Found ' + singles.length + ' singles/EPs. Here are the first 15:');
  singles.slice(0,15).forEach(s => console.log('- ' + s.collectionName + ' (' + s.trackCount + ' tracks, released ' + s.releaseDate.substring(0,4) + ')'));
}
test();
