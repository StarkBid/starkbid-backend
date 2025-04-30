import express from 'express';
import config from './config/config';
import mongoConnect from './config/monogo-connector';
import path from 'path';

const app = express();
app.use(express.json());

app.get('/', (req, res) => {
  res.send('Hello from Starkbid API!');
});

app.get('/health', (req, res) => {
  res.status(200).json({ message: 'Server is healthy!' });
});

app.get('/cdn', express.static(path.join(__dirname, 'uploads'), {
  maxAge: 31557600000, // 1 year in milliseconds
  immutable: true,
}));

function startServer() {
  mongoConnect().then(() => {
    app.listen(config.port, () => {
      console.log(`Server running on port ${config.port}`);
  });
  })
}

startServer();