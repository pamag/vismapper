//Import express
var express = require('express');
var router = express.Router();

//Import dependencies
var db = require('dosql');

//Import sections
var Status = require('../lib/status.js');
var Days = require('../lib/utils/days.js');

//Import configs
var Config = require('../config.json');
var ISConfig = require('../../ismapper-config.json');

//Project root
router.get('/project', function(req, res, next){ res.redirect('/'); });

//Project with ID
router.get('/project/:id', Status, function(req, res, next){

	//Get the project ID
	var id = req.params.id;

	//Check for error in the project
	if(req.result.ready == 2)
	{
		res.render('project/error', {title: 'Error on project', projectId: req.result.id });
	}

	//Check if project is successful created
	else if(req.result.ready == 1)
	{
		//Get the remaining days
		var days = Days.Remaining(req.result.date, Config.time.extend);

		//Save the options
		var options = { title: 'Dashboard', projectId: req.result.id, projectTitle: req.result.title };

		//Save other project info
		options.projectDays = days;
		options.projectAligner = ISConfig.aligner[req.result.aligner];
		options.projectSpecie = ISConfig.reference[req.result.specie].name;
		options.projectSpecieID = req.result.specie;
		options.projectTime = req.result.time/1000;
		options.projectSeqOrig = req.result.seq_orig;
		options.projectSeqMapp = req.result.seq_mapp;

		//Show project dashboard
		res.render('project/dashboard', options);
	}

	//Else, project is not ready
	else
	{
		//Wait
		res.render('project/status', {title: 'Status', projectId: req.result.id, refresh: Config.refresh });
	}

});

//For extend the project life
router.get('/project/:id/extend', Status, function(req, res, next){

	//Get the project ID
	var id = req.params.id;

	//Get project remaining days
	var days = Days.Remaining(req.result.date);

	//Check if remaining days is <= 10
	if(days <= 10)
	{
		//Extend the time
		var extend = Days.Extend(req.result.date);

		//Save
		db.Do({in: 'project', do: 'update', set: {date: extend}, where: {'id': id}}, function(results){

			//Done, go to the project page
			res.redirect('/project/' + id);

		});
	}
	else
	{
		//You can't extend the time, redirect
		res.redirect('/project/' + id);
	}

});

//Exports to node
module.exports = router;
