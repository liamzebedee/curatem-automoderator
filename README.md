automoderator
=============

An automoderator bot for Reddit, which connects to Ethereum prediction markets to help classify posts as spam or not spam.

 * 

## Setup
You will need to configure the OAuth credentials for interacting with Reddit's API.

The parameters are `REDDIT_CLIENT_ID`, `REDDIT_CLIENT_SECRET` and `REDDIT_ACCESS_TOKEN`. You must configure them in an `.env` file.

```
cp .env.example .env
```

## Subreddit setup.

 1. Configure link flair position to "left" in order to display flairs.

 2. Create a Reddit app here - https://www.reddit.com/prefs/apps.

 3. Follow the instructions for the reddit-oauth-helper to get your OAuth credentials for Reddit. 
 
    You **must** authorise the app to use the OAuth scopes of `flair modflair modlog modposts read`.

    ```sh
    git submodule update --init --recursive
    cd reddit-oauth-helper/
    yarn
    node node-server.js
    # Read the README.md for more.
    ```

 4. Fill in the client ID, client secret and access token in `.env` you created earlier.

## Bot setup.

 
 1. `yarn`
 2. `yarn start`


 