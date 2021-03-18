import * as snoowrap from "snoowrap"
import * as _ from 'lodash'
import * as ethers from 'ethers'
import { Wallet } from 'ethers'
import { SubredditService } from './reddit'
import { MarketService } from './curatem'
import {
    USER_AGENT,
    REDDIT_CLIENT_ID,
    REDDIT_CLIENT_SECRET,
    REDDIT_ACCESS_TOKEN,
    REDDIT_REFRESH_TOKEN,
    SUBREDDIT_NAME,
    ETH_ACCOUNT_PRIVKEY,
    ETH_RPC_URL
} from './config'
const log = require('debug')('Core')

async function main() {
    const reddit = new snoowrap({
        userAgent: USER_AGENT,
        clientId: REDDIT_CLIENT_ID,
        clientSecret: REDDIT_CLIENT_SECRET,
        accessToken: REDDIT_ACCESS_TOKEN,
        refreshToken: REDDIT_REFRESH_TOKEN
    });


    log(`Connecting to Ethereum RPC node at ${ETH_RPC_URL}`)
    const provider = new ethers.providers.JsonRpcProvider(ETH_RPC_URL)
    const signer = new Wallet(ETH_ACCOUNT_PRIVKEY, provider)
    log(`Connected to Ethereum RPC node.`)

    const subreddit = reddit.getSubreddit(SUBREDDIT_NAME)

    const marketService = new MarketService(signer)
    const subredditService = new SubredditService(subreddit, marketService)

    log(`Checking subreddit flairs for subreddit r/${SUBREDDIT_NAME}`)
    await subredditService.setupLinkFlairs()
    
    log(`Listening for new posts for subreddit r/${SUBREDDIT_NAME}`)
    await subredditService.listenForNewPosts()
}

export default main