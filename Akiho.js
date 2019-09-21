const settings = require('./settings.json');
const { Client, RichEmbed } = require('discord.js');
const Slacker = require('slackbots');
const { writeFile } = require("fs");

const discord = new Client(); const slack = new Slacker(settings.slack);

slack.on('start', function() { console.log("Slack services are online and functional!"); });
slack.on('error', (err) => { writeFile("./errorSlack.txt", err, () => { console.log("Error encountered...\n" + err)}); });
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

slack.on("goodbye", () => { slack.postMessageToChannel("I'm awake!"); })

discord.on("ready", () => { 
    discord.user.setActivity("Slack notifications", { type: "LISTENING" }); 
    console.log("Discord services are online and functional!"); 
});
discord.on("error", (err) => { 
    writeFile("./errorDiscord.txt", err, () => { console.log("Error encountered...\n" + err); });
    writeErr("Discord", err);
    discord.destroy(); //Destroy client. Bot has crashed.
    discord.login(settings.discordToken);
});
discord.on("message", (msg) => { 
    if (msg.author.id !== settings.ownerID) { return; }
    if (!msg.content.startsWith(settings.discordPrefix)) { return; }

    switch(msg.content.substr(settings.discordPrefix.length).trim()) {
        case "presence":
            msg.client.user.setActivity("Slack notifications", { type: "LISTENING" });
            msg.channel.send("Reactivated my presence!");
            break;
        case "ping":
            msg.channel.send("Pong!");
            break;
        case "stats":
            var second = Math.floor(discord.uptime / 1000);
            var minute = Math.floor(second / 60);
            var hour = Math.floor(minute / 60);
            var day = Math.floor(hour / 24);

            var properLabel = function(time, label) {
                if (time === 0) { return null; }
                if (time === 1) { return " " + time + " " + label; }

                return " " + time + " " + label + "s";
            };

            //Time and display correction.
            time = [properLabel(second % 60, "second"), properLabel(minute % 60, "minute"), properLabel(hour % 24, "hour"), properLabel(day, "day")];
            time = time.filter(function(t) { return t; });
            time.reverse();

            msg.channel.send("**__Current Statistics__**\n__Memory Usage:__ " + (process.memoryUsage().heapUsed / 1024 / 1024).toFixed(2) + "MB\n__Run time:__ " + time.join());
            break;
        case "reset":
            msg.channel.send("Okay!");
            discord.destroy();
            discord.login(settings.discordToken).then(() => {
                msg.channel.send("Systems reloaded!");
            });
            break;
        default:
            return;
    }
});

discord.login(settings.discordToken);