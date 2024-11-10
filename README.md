# Faith Connect

**Faith Connect** is a Discord bot that helps users register their location, find others with the same location, and automatically join location-based channels in the server. If a user's location doesn't match the channel's location, they can request to join, and admins can approve or deny the request.

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

## 2. Install Dependencies

Ensure you have Node.js installed. Then, install the required dependencies by running:

npm install

## 3. Create .env File

Create a .env file in the root of the project to store your bot token and MongoDB URI:

DISCORD_TOKEN=your-bot-token
MONGODB_URI=your-mongodb-connection-string

    Replace your-bot-token with your bot's token from the Discord Developer Portal.
    Replace your-mongodb-connection-string with your MongoDB URI.

## 4. Start the Bot

Once everything is set up, start the bot using the following command:

node index.js

Commands
User Commands
1. !register <location>

This command allows a user to register their location.

Example:

!register UK

This will register the user with the location UK in the MongoDB database.
2. !findUsers <location>

This command allows users to search for other users in a specific location.

Example:

!findUsers UK

This will return a list of users who have the location UK registered.
3. !joinChannel <location>

This command allows users to request to join a location-based channel. If the user’s location matches the channel’s location, they will be added automatically. If not, the bot will send a request to an admin for approval.

Example:

!joinChannel UK

This will either add the user to the UK channel if the locations match or request admin approval.
