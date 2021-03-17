import * as snoowrap from "snoowrap"
import { VERSION } from "./version"
import 'dotenv'
import * as _ from 'lodash'

const {
    REDDIT_CLIENT_ID,
    REDDIT_CLIENT_SECRET,
    REDDIT_ACCESS_TOKEN
} = process.env

checkEnvVar(REDDIT_CLIENT_ID,     'REDDIT_CLIENT_ID')
checkEnvVar(REDDIT_CLIENT_SECRET, 'REDDIT_CLIENT_SECRET')
checkEnvVar(REDDIT_ACCESS_TOKEN,  'REDDIT_ACCESS_TOKEN')

function checkEnvVar(key, value) {
    if(!value) {
        throw new Error(`${key} env var is not defined.`)
    }
}


const USER_AGENT = `User-Agent: node:eth.curatem.automoderator:v${VERSION} (built by /u/liamzebedee)`

const reddit = new snoowrap({
    userAgent: USER_AGENT,
    clientId: REDDIT_CLIENT_ID,
    clientSecret: REDDIT_CLIENT_SECRET,
    accessToken: REDDIT_ACCESS_TOKEN
    // refreshToken: REDDIT_REFRESH_TOKEN
});

interface Thenable<T> {
    then(res: T)
    catch(error: unknown)
}
async function thenable(x: Promise<unknown>) {
    return await new Promise((res, rej) => {
        x.then(res).catch(rej)
    })
}

async function main() {
    const subreddit = reddit.getSubreddit('bitweav')
    const newPosts = await subreddit.getNew()
    console.log(newPosts)

    let linkFlairTemplates = await subreddit.getLinkFlairTemplates(`t3_`+newPosts[0].id)
    
    // await thenable(subreddit.createLinkFlairTemplate({
    //     text: "Spam",
    //     cssClass: "curatem-spam",
    //     textEditable: true
    // }))
    await thenable(subreddit.createLinkFlairTemplate({
        text: "Not Spam",
        cssClass: "curatem-notspam",
        textEditable: true
    }))

    linkFlairTemplates = await subreddit.getLinkFlairTemplates(`t3_`+newPosts[0].id)
    const spamTemplate = _.find(linkFlairTemplates, { flair_css_class: 'curatem-spam' })
    const notSpamTemplate = _.find(linkFlairTemplates, { flair_css_class: 'curatem-notspam' })
    console.log(
        spamTemplate,
        notSpamTemplate
    )

    await thenable(newPosts[0].selectFlair({
        text: "Spam (52%)",
        flair_template_id: spamTemplate.flair_template_id
    }))
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error)
        process.exit(1)
    })
