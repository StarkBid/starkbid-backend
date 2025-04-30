import express from 'express';
import config from './config/config';
import mongoConnect from './config/monogo-connector';
import walletRoutes from './routes/walletRoutes';
const app = express();
app.use(express.json());

app.get('/', (req, res) => {
  res.send('Hello World!');
});
app.use('/api/wallets', walletRoutes);

function startServer() {
  mongoConnect().then(() => {
    app.listen(config.port, () => {
      console.log(`Server running on port ${config.port}`);
    });
  });
}

startServer();
