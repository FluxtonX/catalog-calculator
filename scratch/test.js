const url = "https://itunes.apple.com/search?term=Katy%20Perry%20The%20One%20That%20Got%20Away&entity=song&limit=1";
fetch(url).then(res => res.json()).then(data => console.log(data)).catch(console.error);
