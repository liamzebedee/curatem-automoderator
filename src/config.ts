require('dotenv').config()
import { checkEnvVar } from './utilts'

const {
    REDDIT_CLIENT_ID,
    REDDIT_CLIENT_SECRET,
    REDDIT_ACCESS_TOKEN,
    SUBREDDIT_NAME
} = process.env

checkEnvVar(REDDIT_CLIENT_ID,     'REDDIT_CLIENT_ID')
checkEnvVar(REDDIT_CLIENT_SECRET, 'REDDIT_CLIENT_SECRET')
checkEnvVar(REDDIT_ACCESS_TOKEN,  'REDDIT_ACCESS_TOKEN')
checkEnvVar(SUBREDDIT_NAME,       'SUBREDDIT_NAME')

export {
    REDDIT_CLIENT_ID,
    REDDIT_CLIENT_SECRET,
    REDDIT_ACCESS_TOKEN,
    SUBREDDIT_NAME
}

export const VERSION = '0.1.0'
export const USER_AGENT = `User-Agent: node:eth.curatem.automoderator:v${VERSION} (built by /u/liamzebedee)`

export const POLL_NEW_POSTS_INTERVAL = 1000 * 1