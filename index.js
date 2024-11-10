
require('dotenv').config();
const { Client, GatewayIntentBits } = require('discord.js');
const { MongoClient } = require('mongodb');

// Initialize MongoDB client
const mongoClient = new MongoClient(process.env.MONGODB_URI);
let db, usersCollection, locationsCollection;

// Initialize Discord client with intents
const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.DirectMessages
  ],
});

// Connect to MongoDB and set up collections
mongoClient.connect().then(() => {
  db = mongoClient.db('FaithConnect');
  usersCollection = db.collection('users');
  locationsCollection = db.collection('locations');
  console.log('Connected to MongoDB');
});

// When the bot is ready
client.once('ready', () => {
  console.log(`Logged in as ${client.user.tag}`);
});

// Command for user registration
client.on('messageCreate', async (message) => {
  if (message.author.bot) return;

  console.log(`Received message: ${message.content}`);

  const args = message.content.split(' ');
  const command = args.shift().toLowerCase();
  if (message.content.toLowerCase() === '!hey') {
    try {
        // Try sending a DM to the user
        const dmChannel = await message.author.createDM();
        await dmChannel.send("Please enter your location for registration.");
        
        // Now listen for messages in the DM channel
        client.on('messageCreate', async (dmMessage) => {
            // Ensure the message is in a DM and is from the correct user
            if (dmMessage.author.id === message.author.id && dmMessage.channel.type === 'DM') {
                if (dmMessage.content) {
                    // Process the user's response (e.g., save the location)
                    await dmMessage.channel.send(`Your location is: ${dmMessage.content}. Thank you for registering!`);
                }
            }
        });
    } catch (error) {
        console.error("Error sending DM:", error);
    }
}

  switch (command) {
    case '!register':
      const location = args.join(' ');
      const userId = message.author.id;

      if (!location) {
        return message.reply('Please provide a location with the command: `!register <location>`');
      }

      // Save user location to MongoDB
      await usersCollection.updateOne(
        { userId },
        { $set: { userId, location } },
        { upsert: true }
      );

      message.reply(`You have been registered with location: ${location}`);
      break;

    case '!find':
      const searchLocation = args.join(' ');

      if (!searchLocation) {
        return message.reply('Please provide a location with the command: `!find <location>`');
      }

      // Search for channels associated with the location
      const locationData = await locationsCollection.findOne({ location: searchLocation });
      if (locationData && locationData.channels) {
        const channels = locationData.channels;
        message.reply(`Found the following channels for ${searchLocation}: ${channels.join(', ')}`);
      } else {
        message.reply(`No channels found for location: ${searchLocation}`);
      }
      break;

    case '!join':
      const joinLocation = args.join(' ');
      if (!joinLocation) {
        return message.reply('Please provide a location with the command: `!join <location>`');
      }

      // Notify admin for approval
      const adminChannel = message.guild.channels.cache.find((ch) => ch.name === 'admin-approvals');
      if (adminChannel) {
        adminChannel.send(`${message.author.tag} requested to join the channel for ${joinLocation}. Use !approve <user_id> <location> to approve.`);
        message.reply(`Your request to join the ${joinLocation} channel has been sent to the admin for approval.`);
      } else {
        message.reply('Could not find the admin-approvals channel.');
      }
      break;

    case '!approve':
      if (!message.member.permissions.has('ADMINISTRATOR')) {
        return message.reply('You do not have permission to approve users.');
      }

      const userIdToApprove = args[0];
      const locationToApprove = args.slice(1).join(' ');

      if (!userIdToApprove || !locationToApprove) {
        return message.reply('Please provide both user ID and location: `!approve <user_id> <location>`');
      }

      // Grant access to the user for the specified location
      const guild = message.guild;
      const user = await guild.members.fetch(userIdToApprove);
      const locationDataForApproval = await locationsCollection.findOne({ location: locationToApprove });

      if (locationDataForApproval && locationDataForApproval.channels) {
        const channels = locationDataForApproval.channels;
        for (const channelName of channels) {
          const channel = guild.channels.cache.find((ch) => ch.name === channelName);
          if (channel) {
            await channel.permissionOverwrites.create(user, {
              VIEW_CHANNEL: true,
            });
            message.reply(`${user.user.tag} has been granted access to ${channelName}`);
          }
        }
      } else {
        message.reply(`No channels found for the location ${locationToApprove}`);
      }
      break;

    case '!search':
      const searchLocationForUsers = args.join(' ');

      if (!searchLocationForUsers) {
        return message.reply('Please provide a location with the command: `!search <location>`');
      }

      // Find users with the specified location
      const users = await usersCollection.find({ location: searchLocationForUsers }).toArray();
      if (users.length > 0) {
        const userMentions = users.map((user) => `<@${user.userId}>`).join(', ');
        message.reply(`Users in ${searchLocationForUsers}: ${userMentions}`);
      } else {
        message.reply(`No users found in ${searchLocationForUsers}`);
      }
      break;

    case '!remove_from_channel':
      const channelNameToRemove = args[0];

      if (!channelNameToRemove) {
        return message.reply('Please specify a channel name with the command: `!remove_from_channel <channel_name>`');
      }

      const guildToRemoveFrom = message.guild;
      const channelToRemove = guildToRemoveFrom.channels.cache.find((ch) => ch.name === channelNameToRemove);

      if (channelToRemove) {
        await channelToRemove.permissionOverwrites.delete(message.author);
        message.reply(`You have been removed from ${channelNameToRemove} channel.`);
      } else {
        message.reply(`Channel ${channelNameToRemove} not found.`);
      }
      break;

    case '!mylocation':
      const currentUser = await usersCollection.findOne({ userId: message.author.id });
      if (!currentUser || !currentUser.location) {
        return message.reply('You have not registered a location yet. Use !register <location> to set your location.');
      }

      const userLocation = currentUser.location;

      // Find all users with the same location
      const usersWithSameLocation = await usersCollection.find({ location: userLocation }).toArray();
      if (usersWithSameLocation.length > 0) {
        const userMentions = usersWithSameLocation
          .filter((u) => u.userId !== message.author.id) // Exclude the current user
          .map((u) => `<@${u.userId}>`)
          .join(', ');

        message.reply(`Users in your location (${userLocation}): ${userMentions}`);
      } else {
        message.reply(`No other users found in your location (${userLocation}).`);
      }
      break;

    default:
      break;
  }
});

// Log in to Discord
client.login(process.env.DISCORD_TOKEN);



// require('dotenv').config();
// const { Client, GatewayIntentBits } = require('discord.js');
// const { MongoClient } = require('mongodb');

// // Initialize MongoDB client
// const mongoClient = new MongoClient(process.env.MONGODB_URI);
// let db, usersCollection, locationsCollection;

// // Initialize Discord client with intents
// const client = new Client({
//   intents: [
//     GatewayIntentBits.Guilds,
//     GatewayIntentBits.GuildMessages,
//     GatewayIntentBits.MessageContent,
//     GatewayIntentBits.GuildMembers,
//   ],
// });

// // Connect to MongoDB and set up collections
// mongoClient.connect().then(() => {
//   db = mongoClient.db('FaithConnect');
//   usersCollection = db.collection('users');
//   locationsCollection = db.collection('locations');
//   console.log('Connected to MongoDB');
// });

// // When the bot is ready
// client.once('ready', () => {
//   console.log(`Logged in as ${client.user.tag}`);
// });

// // Command for user registration
// client.on('messageCreate', async (message) => {
//   if (message.author.bot) return;

//   console.log(`Received message: ${message.content}`);

//   const args = message.content.split(' ');
//   const command = args.shift().toLowerCase();

//   switch (command) {
//     case '!register':
//       const location = args.join(' ');
//       const userId = message.author.id;

//       if (!location) {
//         return message.reply('Please provide a location with the command: `!register <location>`');
//       }

//       // Save user location to MongoDB
//       await usersCollection.updateOne(
//         { userId },
//         { $set: { userId, location } },
//         { upsert: true }
//       );

//       message.reply(`You have been registered with location: ${location}`);
//       break;

//     case '!find':
//       const searchLocation = args.join(' ');

//       if (!searchLocation) {
//         return message.reply('Please provide a location with the command: `!find <location>`');
//       }

//       // Search for channels associated with the location
//       const locationData = await locationsCollection.findOne({ location: searchLocation });
//       if (locationData && locationData.channels) {
//         const channels = locationData.channels;
//         message.reply(`Found the following channels for ${searchLocation}: ${channels.join(', ')}`);
//       } else {
//         message.reply(`No channels found for location: ${searchLocation}`);
//       }
//       break;

//     case '!join':
//       const joinLocation = args.join(' ');
//       if (!joinLocation) {
//         return message.reply('Please provide a location with the command: `!join <location>`');
//       }

//       // Notify admin for approval
//       const adminChannel = message.guild.channels.cache.find((ch) => ch.name === 'admin-approvals');
//       if (adminChannel) {
//         adminChannel.send(`${message.author.tag} requested to join the channel for ${joinLocation}. Use !approve <user_id> <location> to approve.`);
//         message.reply(`Your request to join the ${joinLocation} channel has been sent to the admin for approval.`);
//       } else {
//         message.reply('Could not find the admin-approvals channel.');
//       }
//       break;

//     case '!approve':
//       if (!message.member.permissions.has('ADMINISTRATOR')) {
//         return message.reply('You do not have permission to approve users.');
//       }

//       const userIdToApprove = args[0];
//       const locationToApprove = args.slice(1).join(' ');

//       if (!userIdToApprove || !locationToApprove) {
//         return message.reply('Please provide both user ID and location: `!approve <user_id> <location>`');
//       }

//       // Grant access to the user for the specified location
//       const guild = message.guild;
//       const user = await guild.members.fetch(userIdToApprove);
//       const locationDataForApproval = await locationsCollection.findOne({ location: locationToApprove });

//       if (locationDataForApproval && locationDataForApproval.channels) {
//         const channels = locationDataForApproval.channels;
//         for (const channelName of channels) {
//           const channel = guild.channels.cache.find((ch) => ch.name === channelName);
//           if (channel) {
//             await channel.permissionOverwrites.create(user, {
//               VIEW_CHANNEL: true,
//             });
//             message.reply(`${user.user.tag} has been granted access to ${channelName}`);
//           }
//         }
//       } else {
//         message.reply(`No channels found for the location ${locationToApprove}`);
//       }
//       break;

//     case '!search':
//       const searchLocationForUsers = args.join(' ');

//       if (!searchLocationForUsers) {
//         return message.reply('Please provide a location with the command: `!search <location>`');
//       }

//       // Find users with the specified location
//       const users = await usersCollection.find({ location: searchLocationForUsers }).toArray();
//       if (users.length > 0) {
//         const userMentions = users.map((user) => `<@${user.userId}>`).join(', ');
//         message.reply(`Users in ${searchLocationForUsers}: ${userMentions}`);
//       } else {
//         message.reply(`No users found in ${searchLocationForUsers}`);
//       }
//       break;

//     case '!remove_from_channel':
//       const channelNameToRemove = args[0];

//       if (!channelNameToRemove) {
//         return message.reply('Please specify a channel name with the command: `!remove_from_channel <channel_name>`');
//       }

//       const guildToRemoveFrom = message.guild;
//       const channelToRemove = guildToRemoveFrom.channels.cache.find((ch) => ch.name === channelNameToRemove);

//       if (channelToRemove) {
//         await channelToRemove.permissionOverwrites.delete(message.author);
//         message.reply(`You have been removed from ${channelNameToRemove} channel.`);
//       } else {
//         message.reply(`Channel ${channelNameToRemove} not found.`);
//       }
//       break;

//     default:
//       break;
//   }
// });

// // Log in to Discord
// client.login(process.env.DISCORD_TOKEN);

// require('dotenv').config();
// const { Client, GatewayIntentBits } = require('discord.js');
// const { MongoClient } = require('mongodb');

// // Initialize MongoDB client
// const mongoClient = new MongoClient("mongodb+srv://hackpunedeveloper:1TxXrVFqrXCT79p4@hackpune.abu49.mongodb.net/?retryWrites=true&w=majority&appName=HackPune&ssl=true");
// let db, usersCollection, locationsCollection;

// // Initialize Discord client with intents
// const client = new Client({
//   intents: [
//     GatewayIntentBits.Guilds,
//     GatewayIntentBits.GuildMessages,
//     GatewayIntentBits.MessageContent,
//     GatewayIntentBits.GuildMembers,
//   ],
// });

// // Connect to MongoDB and set up collections
// mongoClient.connect().then(() => {
//   db = mongoClient.db('FaithConnect');
//   usersCollection = db.collection('users');
//   locationsCollection = db.collection('locations');
//   console.log('Connected to MongoDB');
// });

// // When the bot is ready
// client.once('ready', () => {
//   console.log(`Logged in as ${client.user.tag}`);
// });

// // Command for user registration
// client.on('messageCreate', async (message) => {
//   if (message.content.startsWith('!register')) {
//     const args = message.content.split(' ');
//     const location = args.slice(1).join(' ');
//     const userId = message.author.id;

//     if (!location) {
//       return message.reply('Please provide a location with the command: `!register <location>`');
//     }

//     // Save user location to MongoDB
//     await usersCollection.updateOne(
//       { userId },
//       { $set: { userId, location } },
//       { upsert: true }
//     );

//     message.reply(`You have been registered with location: ${location}`);
//   }
// });

// // Command to find channels based on location
// client.on('messageCreate', async (message) => {
//   if (message.content.startsWith('!find')) {
//     const args = message.content.split(' ');
//     const location = args.slice(1).join(' ');

//     if (!location) {
//       return message.reply('Please provide a location with the command: `!find <location>`');
//     }

//     // Search for channels associated with the location
//     const locationData = await locationsCollection.findOne({ location });
//     if (locationData && locationData.channels) {
//       const guild = message.guild;
//       const channels = locationData.channels;

//       for (const channelName of channels) {
//         const channel = guild.channels.cache.find((ch) => ch.name === channelName);
//         if (channel) {
//           await channel.permissionOverwrites.create(message.author, {
//             VIEW_CHANNEL: true,
//           });
//           message.reply(`You have been granted access to ${channelName} channel.`);
//         } else {
//           message.reply(`Channel ${channelName} not found.`);
//         }
//       }
//     } else {
//       message.reply(`No channels found for location: ${location}`);
//     }
//   }
// });

// // Command to search for users by location
// client.on('messageCreate', async (message) => {
//   if (message.content.startsWith('!search')) {
//     const args = message.content.split(' ');
//     const location = args.slice(1).join(' ');

//     if (!location) {
//       return message.reply('Please provide a location with the command: `!search <location>`');
//     }

//     // Find users with the specified location
//     const users = await usersCollection.find({ location }).toArray();
//     if (users.length > 0) {
//       const userMentions = users.map((user) => `<@${user.userId}>`).join(', ');
//       message.reply(`Users in ${location}: ${userMentions}`);
//     } else {
//       message.reply(`No users found in ${location}`);
//     }
//   }
// });

// // Command to remove user from a channel
// client.on('messageCreate', async (message) => {
//   if (message.content.startsWith('!remove_from_channel')) {
//     const args = message.content.split(' ');
//     const channelName = args[1];

//     if (!channelName) {
//       return message.reply('Please specify a channel name with the command: `!remove_from_channel <channel_name>`');
//     }

//     const guild = message.guild;
//     const channel = guild.channels.cache.find((ch) => ch.name === channelName);

//     if (channel) {
//       await channel.permissionOverwrites.delete(message.author);
//       message.reply(`You have been removed from ${channelName} channel.`);
//     } else {
//       message.reply(`Channel ${channelName} not found.`);
//     }
//   }
// });

// // Log in to Discord
// client.login(process.env.DISCORD_TOKEN);
