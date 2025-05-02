import mongoose from "mongoose";

async function mongoConnect() {
    mongoose.connect(process.env.MONGO_URI  as string)
  .then(() => console.log('DB Connected!'))
  .catch(() => console.error('Failed to connect DB!'));
}

export default mongoConnect;