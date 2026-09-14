import fs from 'fs';

async function run() {
  const tokenRes = await fetch("https://api.chartmetric.com/api/token", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ refreshtoken: "8k7e3gw3zw5S8NdKA6UgzmDiJnSXKdINnsyDHeGZZTUMnw7ewqkcGVSKHrl1ElPT" }),
  });
  const { token } = await tokenRes.json();

  const searchRes = await fetch("https://api.chartmetric.com/api/search?q=billie%20eilish", {
    headers: { Authorization: `Bearer ${token}` }
  });
  const searchData = await searchRes.json();
  const artistId = searchData.obj.artists[0].id;

  const detailRes = await fetch(`https://api.chartmetric.com/api/artist/${artistId}`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  const detailData = await detailRes.json();

  const topTracksRes = await fetch(`https://api.chartmetric.com/api/artist/${artistId}/tracks`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  const topTracksData = await topTracksRes.json();

  fs.writeFileSync('debug_cm.json', JSON.stringify({ detail: detailData.obj, tracks: topTracksData }, null, 2));
  console.log("Saved to debug_cm.json");
}
run();
