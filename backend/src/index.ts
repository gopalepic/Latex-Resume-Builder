import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
dotenv.config();
import resumeRoutes from './routes/resumeRoutes';
import authRoutes from './routes/authRoutes';



const app = express();

app.use(cors());
app.use(express.json());
app.use('/api/resumes', resumeRoutes);
app.use('/api/auth', authRoutes);

app.get('/', (req, res) => {
    res.send("Hello from Resume Builder API!");
    });

const PORT = process.env.PORT || 4000;

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});