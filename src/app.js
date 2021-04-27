import express from 'express';
import cors from 'cors';

import {decodeAuthToken} from './utils/middlewares';

import swagger from './swagger';
import users from './routes/users';
import userStatus from './routes/userStatus';
import teams from './routes/teams';
import records from './routes/records';

const app = express();

// middlewares
app.use(express.json({limit: '10mb'}));
app.use(decodeAuthToken);
app.use(cors());

// routes
app.use('/docs', swagger);
app.use('/teams', teams);
app.use('/users', users);
app.use('/user-status', userStatus);
app.use('/meeting-records', records);

export default app;
