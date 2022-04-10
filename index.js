if (process.env.NODE_ENV !== 'production') require('dotenv').config()
const Discord = require('discord.js')
const client = new Discord.Client({ intents: ["GUILDS", "GUILD_MESSAGES"] });
const axios = require('axios')
const cheerio = require('cheerio');
const config = require('./config.json');
const { parse } = require('querystring');
//const iconv = require('iconv');
const bbh_objects = require('./bbh_objects');
const request = require('request');

// Update argo data
var language = 'fr'
var argo_data_fr = JSON.parse('{}');
let argo_data_url = "https://argordien.dev.ctruillet.eu/data_" + language
+ ".json";
axios.get(argo_data_url)
  .then((response) => {
    argo_data_fr = response.data['data'];
  })
  .catch((response) => {
    console.log(error);
  });



// Setup bot
client.on('ready', () => {
  console.log(`Logged in as ${client.user.tag}!`)
})

// Handle message response
client.on('messageCreate', msg => {

  // Ignoring bot messages
  if(msg.author.bot) return;

  // Argo command
  if (msg.content.startsWith(config.prefix + config.command)) {
  	const args = msg.content.slice(1).split(' ');
    	if (args.length !== 2) {
  		return msg.channel.send("Usage : "+config.prefix+config.command + " [abreviation]");
  	}
    var input = args[1].toLowerCase().trim();
    var output = "";
    for(var i=0; i<argo_data_fr.length ; i++){
      if(argo_data_fr[i].word.toLowerCase() === input){
        if (output.length === 0) {
          output = ">>> ";
        }
        output += "**" + argo_data_fr[i].meaning + " : **" +
        argo_data_fr[i].description + "\n";
      }
    }
    // If no abreviation found
    if (output.length === 0){
        output = `Abbreviation non trouvée :cry:`
    }

    // Send output message
    msg.channel.send(output);
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
       // var ic = new iconv.Iconv('utf-8', 'utf-8');
       // var buf = ic.convert(body);
       // var data = buf.toString(); // NO encoding necessary anymore
       var data = body.toString();
       const $ = cheerio.load(data);
       const item_nodes = $(".item");
       if (item_nodes.length === 0 ){
         msg.channel.send("Objet non trouvé :cry:");
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
  if (msg.mentions.has(client.user.id) && !msg.mentions.everyone) {
    var mention_message = "**Commandes : **\n"
    mention_message += config.prefix + config.command + " [abbreviation]\n"
    mention_message += config.prefix + config.command_object + " [objet]"
    msg.channel.send(mention_message);
  }
})

client.login(process.env.CLIENT_TOKEN);
