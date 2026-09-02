const url = "https://ubenhhgxamprkamptpoz.supabase.co/functions/v1/fetch-distributor-catalog";

async function run() {
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ action: 'poll', distributor: 'Concord', taskRunId: 'trun_Ya7Vo7YImmftXIdQ' })
  });
  console.log(res.status);
  console.log(await res.text());
}
run();
