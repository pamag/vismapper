//Import dependencies
var execSync = require('child_process').execSync;

//Import configs
var Config = require('../config.json');
var ISConfig = require('../../ismapper-config.json');

//Function for run the aligner
function Run(folder, aligner, reference)
{
	//Get the command base
	var command = Config.base;

	//Add the aligner path
	command = command.replace(/{aligner}/, Config[aligner]);

	//Replace the path to the aligner
	command = command.replace(/{path}/g, ISConfig.bin[aligner]);

	//Replace the reference genome
	command = command.replace(/{reference}/g, ISConfig.reference[reference].path);

	//Replace the input file
	command = command.replace(/{input}/g, folder + 'input.fastq');

	//Replace the output
	command = command.replace(/{output}/g, folder + 'output.sam');

	//Show the command
	console.log(command);

	//Run
	execSync(command);
}

//Exports to node
module.exports = Run;
