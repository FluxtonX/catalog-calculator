const YOUTUBE_API_KEY = "AIzaSyBvlzgXH5IKpLZFckQu-_KXv_rdMELAdNw";

async function run() {
  try {
    const query = encodeURIComponent("taylor swift");
    const url = `https://www.googleapis.com/youtube/v3/search?part=snippet&type=channel&q=${query}&maxResults=5&key=${YOUTUBE_API_KEY}`;
    console.log("Fetching from:", url);
    const res = await fetch(url);
    const data = await res.json();
    console.log(JSON.stringify(data, null, 2));
  } catch (err) {
    console.error(err);
  }
}
run();
