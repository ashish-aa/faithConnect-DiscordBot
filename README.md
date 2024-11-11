# Faith Connect

**Faith Connect** Faith Connect is a location-based community bot for Discord, tailored to help Christians connect with others based on shared geographical areas. This bot enables members to register their locations, find friends nearby, and join relevant channels within a server, fostering faith-based connections and support within local communities.
## Features

- **User Registration**: Register and store your location in the database.
- **Search Users by Location**: Find users who share the same location.
- **Location-Based Channel Access**: Join channels automatically if your location matches the channel's location.
- **Join Requests**: Request to join a channel if the locations don't match, and wait for admin approval.
- **Admin Commands**: Approve or deny join requests for users based on their location.

## Prerequisites

- **Node.js**: Ensure you have Node.js version 16 or above installed.
- **MongoDB**: You need a MongoDB database to store user information and location data.
- **Discord Developer Account**: Create a bot on the [Discord Developer Portal](https://discord.com/developers/applications) and get your bot token.

## Installation

### 1. Clone the Repository

```bash
git clone https://github.com/your-username/faith-connect-bot.git
cd faith-connect-bot
```
## 2. Install Dependencies

Ensure you have Node.js installed. Then, install the required dependencies by running:
```bash
npm install
```

## 3. Create .env File

Create a .env file in the root of the project to store your bot token and MongoDB URI:
```bash
DISCORD_TOKEN=your-bot-token
MONGODB_URI=your-mongodb-connection-string

Replace your-bot-token with your bot's token from the Discord Developer Portal.
Replace your-mongodb-connection-string with your MongoDB URI.
```
## 4. Start the Bot

Once everything is set up, start the bot using the following command:
```bash
node index.js
```

## 5. Commands
1. !hey

Sends a DM to the user asking for their location to register. Listens for the user's reply in the DM.
2. !register <location>

Registers the user with a location in the MongoDB database.

Example:

!register UK

3. !find <location>

Searches for Discord channels associated with a location and sends a list of channels.

Example:

!find UK

4. !join <location>

Sends a request to join a channel associated with a location to the admin for approval.

Example:

!join UK

5. !approve <user_id> <location>

Grants the user access to channels associated with a location after admin approval.

Example:

!approve 123456789012345678 UK

6. !search <location>

Searches for users registered in a specified location and mentions them.

Example:

!search UK

7. !remove_from_channel <channel_name>

Removes the user from a specified channel.

Example:

!remove_from_channel uk-channel

8. !mylocation

Displays the user's registered location and lists other users in the same location.

Example:

!mylocation

This will either add the user to the UK channel if the locations match or request admin approval.
