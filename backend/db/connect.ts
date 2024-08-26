import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

const connectDb = (): void => {
    mongoose.connect(process.env.MONGO_URI as string)
            .then(() => console.log("MongoDB Connected"))
            .catch(err => console.log(err));
}

export default connectDb;
