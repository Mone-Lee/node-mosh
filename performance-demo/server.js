const express = require('express');

const app = express();

function blocking(duration) {
  const start = new Date().getTime();

  while (new Date().getTime() - start < duration) {
    // blocking
  }
}

app.get('/', (req, res) => {
  res.send('performance demo');
})

app.get('/timer', (req, res) => {
  blocking(9000);
  res.send('timer');
})

app.listen(3000);