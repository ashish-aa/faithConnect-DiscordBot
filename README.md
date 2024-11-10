# Faith Connect - Discord Location-Based Channel Bot

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
