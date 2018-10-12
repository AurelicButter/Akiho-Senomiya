const settings = require('./settings.json');
const { Client, RichEmbed } = require('discord.js');
const Slacker = require('slackbots');
const { writeFile } = require("fs");

const discord = new Client(); const slack = new Slacker(settings.slack);

slack.on('start', function() { console.log("Slack services are online and functional!"); });
slack.on('error', (err) => { writeFile('./errorSlack.txt', err, () => { console.log("Error was found on the Slack side and has been logged.") }); })
slack.on('message', function(data) { 
    if (data.type === 'message' && data.attachments) {
        var event = data.attachments[0]; var text = []; var info = [12, 6, 7, 5];
        text.push(event.text.search("Description:"), event.text.search("Where:"), event.text.search("Start:"), event.text.search("End:"));

        var embed = new RichEmbed()
            .setColor("#9a1bc9")
            .setURL(event.title_link)
            .setTitle(event.title);
            if (text[0] !== -1) {
                if (event.text.slice(text[0] + info[0], text[1]).trim().length > 2) { embed.setDescription(event.text.slice(text[0] + info[0], text[1])); } 
                else { embed.setDescription("No Description was provided."); }
            } if (text[1] !== -1) { 
                if (event.text.slice(text[1] + info[1], text[2]).trim().length > 2) { embed.addField("Location:", event.text.slice(text[1] + info[1], text[2])); }
                else { embed.addField("Location:", "Somewhere on Earth, I guess..."); }
            } if (text[2] !== -1) { embed.addField("Start:", event.text.slice(text[2] + info[2], text[3]).trim(), true); }
            if (text[3] !== -1) { embed.addField("End:", event.text.slice(text[3] + info[3]).trim(), true); }
        
        discord.users.get(settings.ownerID).send({embed}); 
    } 
});

discord.on("ready", () => { 
    discord.user.setActivity("Slack notifications", { type: "LISTENING" }); 
    console.log("Discord services are online and functional!"); 
});
discord.on("error", (err) => { writeFile('./errorDiscord.txt', err, () => { console.log("Error was found on the Discord side and has been logged.") }); });
discord.on("message", (msg) => { if (msg.content.startsWith("Aki, presence")) { msg.client.user.setActivity("Slack notifications", { type: "LISTENING" }) } });

discord.login(settings.discordToken);