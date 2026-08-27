import fetch from 'node-fetch';

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

  console.log(JSON.stringify(detailData.obj.cm_statistics || {}, null, 2).substring(0, 3000));
}
run();
