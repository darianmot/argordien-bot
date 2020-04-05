if (process.env.NODE_ENV !== 'production') require('dotenv').config()
const Discord = require('discord.js')
const client = new Discord.Client()
const axios = require('axios')
const cheerio = require('cheerio');
const config = require('./config.json');
const { parse } = require('querystring');
const iconv = require('iconv');
const bbh_objects = require('./bbh_objects');
const request = require('request');

client.on('ready', () => {
  console.log(`Logged in as ${client.user.tag}!`)
})

client.on('message', msg => {

  // Ignoring bot messages
  if(msg.author.bot) return;

  // Argo command
  if (msg.content.startsWith(config.prefix + config.command)) {
	const args = msg.content.slice(1).split(' ');
  	if (args.length !== 2) {
		return msg.channel.send("Usage : "+config.prefix+config.command + " [abreviation]");
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
		if (description.toLowerCase().trim() === args[1].toLowerCase().trim()){
		    output = `Abreviation non trouvée :cry:`
		}
    var isEmpty = true
    var typeOK = false
    var inText = false
    var output = ""
    $('.message').contents().each(function() {
	     if ($(this).is('strong')){
         if (!isEmpty){
           output+="\n\n"
         }
         isEmpty = false
         typeOK = false
         inText = false
         output += "**" + $(this).text().trim() + "**" + "\n"
       }
       if ($(this).is('em') && !typeOK) {
        output += "*" + $(this).text().trim() + "*" + "\n"
        typeOK = true
       }
       if ($(this).is('em') && inText) {
        output += " " + $(this).text() + " ";
       }
       if ($(this)[0].type === "text" && $(this).text().trim().length > 1) {
        inText = true
        output += $(this).text().trim()
       }
    });
    if (description.toLowerCase().trim() === args[1].toLowerCase().trim()){
		    output = `Abreviation non trouvée :cry:`
		}
    msg.channel.send(output);
	    })
	    .catch(function (response) {
		//handle error
    msg.channel.send("Error :x:");
		console.log(response);
	    });
  }

  // Object command
  if (msg.content.startsWith(config.prefix + config.command_object + ' ')) {
	const args = msg.content.slice(1).split(' ');
  	if (args.length < 1) {
		return msg.channel.send("Usage : "+config.prefix + config.command_object +
    " [un objet]");
  };
  const s = msg.content.slice(config.prefix.length +
    config.command_object.length).trim().split(' ').join('+') //search
  request({
    method: 'GET',
    uri: 'http://bbh.fred26.fr/?pg=objets&s=' + s,
    encoding: null,
  },
  function (error, response, body) {
     if (error !== 'null') {
       var ic = new iconv.Iconv('iso-8859-1', 'utf-8');
       var buf = ic.convert(body);
       var data = buf.toString('utf-8');
       const $ = cheerio.load(data);
       const item_nodes = $(".item");
       if (item_nodes.length === 0 ){
         msg.channel.send("Wtf ? :thinking:");
       }
       else {
         var output_message = "";
         var residual_objects = ">>> **Autres objets** : "
         var residual_objects_flag = false;
         for(var i = 0; i <  item_nodes.length;i++){
           var item = bbh_objects.parse_item(item_nodes.eq(i));
           if (i < config.max_object_messages){
             output_message = ">>> " + bbh_objects.render_item(item) + "\n";
             msg.channel.send(output_message);
           } else {
             residual_objects_flag = true
             residual_objects += "*" + bbh_objects.get_item_name(item) + "*, ";
           }
         }
         if (residual_objects_flag){
            residual_objects = residual_objects.slice(0, -2);
            msg.channel.send(residual_objects);
         }
       }
     }
     else {
        msg.channel.send("Error :x:");
    		console.log(error);
     }
   })
  }

  // Handle bot mention
  if (msg.isMemberMentioned(client.user) && !msg.mentions.everyone) {
    var mention_message = "**Commandes : **\n"
    mention_message += config.prefix + config.command + " [abbreviation]\n"
    mention_message += config.prefix + config.command_object + " [objet]"
    msg.channel.send(mention_message);
  }
})

client.login();
