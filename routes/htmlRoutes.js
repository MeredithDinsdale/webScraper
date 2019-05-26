const express = require('express');
const router = express.Router();
const News = require('../models/news');


router.get('/', (req, response) => {
	News.find().sort([ [ 'date', -1 ] ]).then(res => {
		response.render('index', {
			news: res
		});
	});
});
module.exports = router;