require('dotenv').config()
const Discord = require('discord.js')
const client = new Discord.Client()
const axios = require('axios')
const cheerio = require('cheerio');
const config = require('./config.json');
const { parse } = require('querystring');

client.on('ready', () => {
  console.log(`Logged in as ${client.user.tag}!`)
})

client.on('message', msg => {
  if (msg.content.startsWith(config.prefix+'argordien')) {
	const args = msg.content.slice(1).split(' ');
  	if (args.length !== 2) {
		return msg.channel.send(`Syntaxe : /argordien [abreviation]`);
	}
 
	axios({
	    method: 'post',
	    url: 'https://argordien.azurewebsites.net/index.php',
	    data: 'message='.concat('', args[1]),
	    })
	    .then(function (response) {
		//handle success
		parse(response);
		const $ = cheerio.load(response.data)
		const description = $('.message').text()
		var output = description;
		if (description.toLowerCase().trim() === args[1].toLowerCase().trim()){
		    console.log(output)
		    output = `Abreviation non trouvée :cry:`
		}
		msg.channel.send(output);
	    })
	    .catch(function (response) {
		//handle error
		console.log(response);
	    });
  }
})

client.login();
