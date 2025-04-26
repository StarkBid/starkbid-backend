import express from 'express';
import config from './config/config';
import mongoConnect from './config/monogo-connector';

const app = express();
app.use(express.json());

app.get('/', (req, res) => {
  res.send('Hello World!');
});

function startServer() {
  mongoConnect().then(() => {
    app.listen(config.port, () => {
      console.log(`Server running on port ${config.port}`);
  });
  })
}

startServer();