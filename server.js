const express = require('express');
const helmet = require('helmet');
const cors = require('cors'); // https://www.npmjs.com/package/cors
const bodyParser = require('body-parser');
const mongoose = require('mongoose');

const server = express();

const Bear = require('./Bears/BearModel');

server.use(helmet()); // https://helmetjs.github.io/
server.use(cors()); // https://medium.com/trisfera/using-cors-in-express-cac7e29b005b
server.use(bodyParser.json());

server.get('/', function(req, res) {
	res.status(200).json({ status: 'API Running' });
});

server.post('/api/bears', function(req, res) {
	const bearInformation = req.body;

	if (bearInformation.species && bearInformation.latinName) {
		const bear = new Bear(bearInformation); // mongoose document
		bear
			.save() // returns a Promise
			.then((savedBear) => {
				res.status(201).json(savedBear);
			})
			.catch((error) => {
				res.status(500).json({
					error: 'There was an error while saving the Bear to the Database'
				});
			});
	} else {
		res.status(500).json({
			errorMessage: 'Please provide both species and latinName for the Bear.'
		});
	}
});

server.get('/api/bears/:id', function(req, res) {
	const id = req.params.id;

	Bear.findById(id) // all the bears
		.then(bear => {
			if (bear) {
				res.status(200).json(bear);
			} else {
				res.status(404).json({ message: 'Not found' });
			}
		})
		.catch(error => {
			if (error.name === 'CastError') {
				res
					.status(400)
					.json({ message: `TheID: ${error.value} is not valid` });
			} else {
				res.status(500).json({
					message: 'The bear information could not be retrieved.',
					error,
				});
			}
		});
});

mongoose
	.connect('mongodb://localhost/bearKeeper') // returns a Promise
	.then((db) => {
		console.log(`Successfully connected to the ${db.connections[0].name} database`);
	})
	.catch((error) => {
		console.error('Database Connection Failed');
	});

const port = process.env.PORT || 5005;
server.listen(port, () => {
	console.log(`API running on http://localhost:${port}.`);
});
