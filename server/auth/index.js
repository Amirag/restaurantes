'use strict';

/*eslint-env node*/

import express from 'express';
import config from '../config/environment';
import { User } from '../sqldb';

require('./local/passport').setup(User, config);

const router = express.Router();

router.use('/local', require('./local').default);

export default router;
