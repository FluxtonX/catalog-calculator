const q = "Lil Tjay";
fetch("https://api.apify.com/v2/actor-tasks/mikk.maci~spotify-task/run-sync-get-dataset-items?token=apify_api_tqZ8Fid5K7K3e3aYxX9Z3v1u0M5w1u1g1q1q", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ query: q })
}).then(res => res.json()).then(data => {
  const tracks = data[0].topTracks || [];
  tracks.forEach(t => console.log(t.title));
}).catch(e => console.log(e));
