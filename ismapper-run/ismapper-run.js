//Import dependencies
var fs = require('fs');
var path = require('path');
var db = require('dosql');

//Import libs
var Sam = require('./lib/sam.js');
var Run = require('./lib/run.js');
var Mail = require('./lib/mail.js');

//Import config
var Config = require('./config.json');
var ISConfig = require('../ismapper-config.json');

//Initialize request client
db.Connect(ISConfig.db);

//Get the arguments
var args = process.argv.slice(2);

//Save the project ID
var id = args[0];

//Save the folder
var folder = path.join(ISConfig.uploads, id + '/');

//Time for complete the run
var time = 0;

//Get the project info
db.Do({ in: 'project', do: 'select', where: { id: id }}, function(results){

	//Initialize the time
	time = Date.now();

	//Run the aligner
	Run(folder, results[0].aligner, results[0].specie);

	//Get the new time
	time = Date.now() - time;

	//Show confirmation in console
	console.log('Run ' + results[0].aligner + ' in ' + time + 'ms');

	//Read the sam file
	Sam(id, folder + 'alignments.sam', results[0].quality, function(num){

		//Create the update object
		var upd = { ready: 1, time: time, seq_mapp: num };

		//Check the number for error
		if(num == 0)
		{
			//Change to 2
			upd.ready = 2;
		}

		//Update the project
		db.Do({ in: 'project', do: 'update', where: { id: id }, set: upd }, function(res){

			//Check for clean the project folder
			if(Config.clean === true)
			{
				//Remove the fastq file
				fs.unlinkSync(folder + 'input.fastq');

				//Remove the sam file
				fs.unlinkSync(folder + 'alignments.sam');
			}

			//Send the mail and exit
			Mail(id, results[0], num, function(){ process.exit(0); });

		});

	});

});
