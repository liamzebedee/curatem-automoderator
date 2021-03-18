import * as snoowrap from "snoowrap"
import * as _ from 'lodash'
import { thenable } from "./utilts"

import {
    USER_AGENT,
    REDDIT_CLIENT_ID,
    REDDIT_CLIENT_SECRET,
    REDDIT_ACCESS_TOKEN,
    SUBREDDIT_NAME
} from './config'



async function setupLinkFlairs(subreddit: snoowrap.Subreddit) {
    const newPosts = await subreddit.getNew()
    if(newPosts.length == 0) {
        throw new Error("Subreddit must have at least one post, so we can get link flair templates.")
    }

    const getLinkFlairTemplates = () => subreddit.getLinkFlairTemplates(`t3_${newPosts[0].id}`)
    let linkFlairTemplates = await getLinkFlairTemplates()
    
    const getSpamTemplate = () => _.find(linkFlairTemplates, { flair_css_class: 'curatem-spam' })
    let spamTemplate = getSpamTemplate()
    if(!spamTemplate) {
        await thenable(subreddit.createLinkFlairTemplate({
            text: "Spam",
            cssClass: "curatem-spam",
            textEditable: true
        }))
    }

    const getNotSpamTemplate = () => _.find(linkFlairTemplates, { flair_css_class: 'curatem-notspam' })
    let notSpamTemplate = getNotSpamTemplate()
    if(!notSpamTemplate) {
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

    return {
        spamTemplate,
        notSpamTemplate
    }
}






import { SubredditService } from './reddit'
import { MarketService } from './curatem'



async function main() {
    const reddit = new snoowrap({
        userAgent: USER_AGENT,
        clientId: REDDIT_CLIENT_ID,
        clientSecret: REDDIT_CLIENT_SECRET,
        accessToken: REDDIT_ACCESS_TOKEN
    });

    const subreddit = reddit.getSubreddit(SUBREDDIT_NAME)
    const { 
        spamTemplate, 
        notSpamTemplate 
    } = await setupLinkFlairs(subreddit)

    const marketService = new MarketService()
    const subredditService = new SubredditService(subreddit, marketService)
    await subredditService.listenForNewPosts()

    // Detects post
    // Creates prediction market (without posting liquidity)
    // Read out market states
    // Gives post a “Spam” flair if thats the market outcome
    // Stretch goal: show probability of spam on posts


    // Fetch new subreddit posts every minute.
}




export default main