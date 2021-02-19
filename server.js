const fs = require('fs');
const http = require('http');

const settings = require('./settings');

const Handlebars = require('handlebars');

const Discord = require('discord.js');
const client = new Discord.Client();

client.login(process.env.DISCORD_TOKEN)
.then(()=>{
  client.fetchApplication()
  .then(init)
})
.catch(handleError)

var tracery = require('tracery-grammar');




function init(app){
  fs.readFile("grammar.json", (err, data)=>{
    if (err) {
      console.error(err);
    } else {
      try {
        var grammar = tracery.createGrammar(JSON.parse(data));
        grammar.addModifiers(tracery.baseEngModifiers);
        grammar.addModifiers({
          caps: s=>{
            return s.toUpperCase();
          }
        })

        function flatten(pattern, context){
          Object.keys(context).forEach(key=>grammar.pushRules(key,context[key]))
          var str = grammar.flatten(pattern)
          Object.keys(context).forEach(key=>grammar.popRules(key))
          return str;
        }



        const requestListener = function (req, res) {
          fs.readFile("index.html", {encoding: 'utf-8'}, (err, html)=>{
            if (err){
              console.error(err)
            } else {
              var template = Handlebars.compile(html);
                res.setHeader("Content-Type", "text/html");
                res.writeHead(200);
                var mergedOrigins = []
                Object.keys(settings.origins).forEach(origin=>{
                  if (mergedOrigins.hasOwnProperty(settings.origins[origin])){
                    mergedOrigins[settings.origins[origin]]+=` / ${origin}`;
                  } else {
                    mergedOrigins[settings.origins[origin]] = origin;
                  }
                });
                var outputs = Object.keys(mergedOrigins).map(
                  (merge)=>{
                    return {
                      command: mergedOrigins[merge],
                      origin: merge,
                      story: flatten(merge, {
                        user: "Discord User",
                        userid: "@DiscordUser",
                        botname: client.user.username,
                        botid: client.user.id,
                        glitchproject: process.env.PROJECT_NAME
                      })
                    };
                  }
                )
                res.end(template({
                  story: outputs,
                  botname: client.user.username,
                  id: client.user.id,
                  description: app.description,
                  avatar: client.user.avatar
                }));
              }
          })
        }

        const server = http.createServer(requestListener);
        server.listen(8080); 

        function dm(message){
          var keys = Object.keys(settings.origins);
          for (var i=0; i<keys.length; i++){
            var origin = keys[i];
            if (message.content.toLowerCase().includes(origin.toLowerCase())) {
              message.channel.send(flatten(settings.origins[origin],{
                user: message.author.username,
                userid: `<@${message.author.id}>`,
                botname: client.user.username,
                botid: client.user.id,
                glitchproject: process.env.PROJECT_NAME
              }));
              return;
            }
          }
          if (settings.origins.hasOwnProperty("default")){
            message.channel.send(flatten(settings.origins.default,{
              user: message.author.username,
              userid: `<@${message.author.id}>`,
              botname: client.user.username,
              botid: client.user.id,
              glitchproject: process.env.PROJECT_NAME
            })); 
          }
        }

        client.on('message', message => {
          if (message.author.bot) return;
          if (message.author == client.user) return;
          if (message.channel.type == 'dm') return dm(message);
          var unmentioned = message.mentions.members.array().length==0 && Math.random()<settings.unmentionedProbability;
          if (unmentioned || message.mentions.members.map(member=>member.user.username).includes(client.user.username)){
            var keys = Object.keys(settings.origins);
            for (var i=0; i<keys.length; i++){
              var origin = keys[i];
              if (message.content.toLowerCase().includes(origin.toLowerCase())) {
                message.channel.send(flatten(settings.origins[origin],{
                  user: message.author.username,
                  userid: `<@${message.author.id}>`,
                  botname: client.user.username,
                  botid: client.user.id,
                  glitchproject: process.env.PROJECT_NAME
                }));
                return;
              }
            }
            if (!unmentioned && settings.origins.hasOwnProperty("default")){
              message.channel.send(flatten(settings.origins.default,{
              user: message.author.username,
              userid: `<@${message.author.id}>`,
              botname: client.user.username,
              botid: client.user.id,
              glitchproject: process.env.PROJECT_NAME
            })); 
            }
          }
        })
      } catch (e) {
        handleError(e);
      }
    }
  });
}

function handleError(e){
  const requestListener = function (req, res) {
  fs.readFile("error.html", {encoding: 'utf-8'}, (err, html)=>{
    if (err){
      console.error(err)
    } else {
      var template = Handlebars.compile(html);
        res.setHeader("Content-Type", "text/html");
        res.writeHead(200);
        res.end(template({error: e}));
      }
  })
  }
  const server = http.createServer(requestListener);
  server.listen(8080); 
}
