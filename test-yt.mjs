import { searchYouTube } from './src/utils/api.js';

async function test() {
  try {
    console.log('Searching YouTube for taylor swift...');
    const result = await searchYouTube('taylor swift');
    console.log(JSON.stringify(result, null, 2));
  } catch (error) {
    console.error(error);
  }
}

test();
