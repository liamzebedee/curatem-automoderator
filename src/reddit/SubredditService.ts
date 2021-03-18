import { Submission, Subreddit } from "snoowrap"
import { FlairTemplate } from "snoowrap/dist/objects/Subreddit"
import { POLL_NEW_POSTS_INTERVAL } from "../config"
import { MarketService } from "../curatem/MarketService"
import { thenable } from "../utilts"
import * as _ from 'lodash'
const log = require('debug')('SubredditService')

interface Flairs {
    spam: FlairTemplate
    notspam: FlairTemplate
}
export class SubredditService {
    subreddit: Subreddit
    marketService: MarketService
    flairs: Flairs = {
        spam: null,
        notspam: null
    }

    lastSeenPost: string
    
    constructor(subreddit: Subreddit, marketService: MarketService) {
        this.subreddit = subreddit
        this.marketService = marketService
        this.lastSeenPost = ''
    }

    async setupLinkFlairs() {
        const subreddit = this.subreddit

        const newPosts = await subreddit.getNew()
        if(newPosts.length == 0) {
            throw new Error("Subreddit must have at least one post, so we can get link flair templates.")
        }
    
        const getLinkFlairTemplates = () => subreddit.getLinkFlairTemplates(`t3_${newPosts[0].id}`)
        let linkFlairTemplates = await getLinkFlairTemplates()
        
        const getSpamTemplate = () => _.find(linkFlairTemplates, { flair_css_class: 'curatem-spam' })
        let spamTemplate = getSpamTemplate()
        if(!spamTemplate) {
            log(`No spam link flair template found, creating one now.`)
            await thenable(subreddit.createLinkFlairTemplate({
                text: "Spam",
                cssClass: "curatem-spam",
                textEditable: true
            }))
        }
    
        const getNotSpamTemplate = () => _.find(linkFlairTemplates, { flair_css_class: 'curatem-notspam' })
        let notSpamTemplate = getNotSpamTemplate()
        if(!notSpamTemplate) {
            log(`No not spam link flair template found, creating one now.`)
            await thenable(subreddit.createLinkFlairTemplate({
                text: "Not Spam",
                cssClass: "curatem-notspam",
                textEditable: true
            }))
        }
    
        linkFlairTemplates = await getLinkFlairTemplates()
        spamTemplate = await getSpamTemplate()
        notSpamTemplate = await getNotSpamTemplate()
    
        if(!spamTemplate || !notSpamTemplate) {
            throw new Error("Unexpected error - could not create custom link flair templates.")
        }
    
        this.flairs = {
            spam: spamTemplate,
            notspam: notSpamTemplate
        }
    }

    async trackPost(post: Submission) {
        const market = await this.marketService.getOrCreateMarket(post.url)

        market.onFinalized(async (finalOutcome) => {
            log(`Market for post ${post.url} was finalised, with final outcome as ${finalOutcome}`)
            
            // Flair the post.
            await thenable(post.selectFlair({
                flair_template_id: this.flairs[finalOutcome].flair_template_id,
                text: ""
            }))
        })
    }

    async pollNewPosts() {
        log(`Polling new posts`)
        const newPosts = await this.subreddit.getNew({
            after: this.lastSeenPost
        })

        log(`${newPosts.length} new posts`)
        if(newPosts.length === 0) 
            return

        for(let post of newPosts) {
            this.trackPost(post)
        }
        this.lastSeenPost = `t3_${newPosts[0].id}`

        // See below for why we don't use `setInterval`.
        // https://stackoverflow.com/questions/6685396/execute-the-setinterval-function-without-delay-the-first-time
        setTimeout(() => this.pollNewPosts(), POLL_NEW_POSTS_INTERVAL)
    }

    listenForNewPosts() {
        // Poll every minute.
        this.pollNewPosts()
        
        const done = new Promise((res, rej) => {
        })
        return done
    }
}

