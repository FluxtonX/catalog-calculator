const track = {
  name: "Pop Out (feat. Lil Tjay)",
  artists: [{name: "Polo G"}, {name: "Lil Tjay"}]
};

const primaryName = "Lil Tjay".toLowerCase();
const title = track.name.toLowerCase();

let isFeat = false;
if (track.artists && Array.isArray(track.artists) && track.artists.length > 0) {
  const firstArtistName = (track.artists[0].name || "").toLowerCase();
  if (!firstArtistName.includes(primaryName) && !primaryName.includes(firstArtistName)) {
    isFeat = true;
  }
}
console.log("Is Feat:", isFeat);
