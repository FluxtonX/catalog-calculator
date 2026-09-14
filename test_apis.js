async function testApple() {
  console.log("Testing Apple Music direct API");
  const res = await fetch(`https://itunes.apple.com/search?term=Taylor+Swift&entity=musicArtist&limit=1`);
  const data = await res.json();
  console.log(JSON.stringify(data, null, 2));
}
testApple();
