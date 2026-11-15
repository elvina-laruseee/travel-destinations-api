import app from './src/index.js';

const PORT = 3000;

app.listen(PORT, () => {
  console.log(`Travel Destinations API is running at http://localhost:${PORT}`);
});
