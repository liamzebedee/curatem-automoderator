import { Subreddit } from "snoowrap"
import { POLL_NEW_POSTS_INTERVAL } from "../config"
import { MarketService } from "../curatem/MarketService"
const log = require('debug')('SubredditManager')

export class SubredditService {
    subreddit: Subreddit
    marketService: MarketService

    lastSeenPost: string
    
    constructor(subreddit: Subreddit, marketService: MarketService) {
        this.subreddit = subreddit
        this.marketService = marketService
        this.lastSeenPost = ''
    }

    async trackPost() {
        // const url = ``
        // const market = await this.marketService.getMarket(url)
        // market.onFinalized(() => {
        //     // Flair the post.
        // })
    }

    async pollNewPosts() {
        log(`Polling new posts`)
        const newPosts = await this.subreddit.getNew({
            after: this.lastSeenPost
        })
        log(`${newPosts.length} new posts`)
        if(newPosts.length) {
            this.lastSeenPost = `t3_${newPosts[0].id}`
        }
    }

    listenForNewPosts() {
        // Poll every minute.
        const timer = setInterval(
            () => this.pollNewPosts(),
            POLL_NEW_POSTS_INTERVAL
        )
        timer.ref()
        const done = new Promise((res, rej) => {
            
        })
        return done
    }

    ingestOldPosts(untilDate: number) {

    }
}