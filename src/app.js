import express from 'express';
import cors from 'cors';

import swagger from './swagger';
import teams from './routes/teams';
import users from './routes/users';

const app = express();

// middlewares
app.use(express.json());
app.use(cors());

// routes
app.use('/docs', swagger);
app.use('/teams', teams);
app.use('/users', users);

export default app;
