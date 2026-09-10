import { getNormalizedArtistData } from './src/utils/api.js';

// We need to mock import.meta.env since we are running in Node
// But wait, it's a vite project, maybe we can run a script via vite-node or just plain node with dotenv.
