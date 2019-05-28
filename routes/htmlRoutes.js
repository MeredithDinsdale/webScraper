const express = require('express');
const router = express.Router();
const News = require('../models/index');


router.get('/', (req, response) => {
	News.find().sort([ [ 'date', -1 ] ]).then(res => {
		response.render('index', {
			news: res
		});
	});
});
module.exports = router;