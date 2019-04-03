const express = require('express');
const user = require('../components/user/user');
const authenticate = require('../middleware/authenticate');
const intra = require('../middleware/getIntraUser');

const router = express.Router();

router.route('/').post(user.registerUser);
router.route('/refreshPassword').post(user.codePass);
router.route('/newPassword').post(user.refreshPassword);
router.route('/login').post(user.loginUser);
router.route('/confirm/new').post(user.newTmpToken);
router.route('/confirm/:token').get(user.confirmRegister);
router.route('/googleAuth').post(user.loginUserWithGoogle);
router.use('/intraAuth', intra.getIntraUser);
router.route('/intraAuth').post(user.loginUserWithIntra);
router.route('/logout').delete(authenticate.authenticate, user.logoutUser);

module.exports = router;