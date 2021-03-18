
import * as ethers from 'ethers'
import { Wallet } from 'ethers'
import { ETH_RPC_URL, ETH_ACCOUNT_PRIVKEY } from '../config'
import { CuratemCommunity, CuratemCommunity__factory, SpamPredictionMarket, SpamPredictionMarket__factory } from '@curatem/contracts/typechain'
import { CuratemMarket } from './CuratemMarket'
const log = require('debug')('MarketService')


export class MarketService {
    provider: ethers.Signer
    curatemCommunity: CuratemCommunity

    constructor(provider: ethers.Signer) {
        this.provider = provider
        this.curatemCommunity = CuratemCommunity__factory.connect(
            '0xE532C5f587e68EC0054290C7aE57729fDb3cfDf3',  // TODO
            provider
        )
    }

    async getOrCreateMarket(url: string) {
        let market = await this.getMarket(url)
        if(market) {
            return market
        }

        market = await this.createMarket(url)
        if(market) {
            return market
        }
        
        throw new Error("Unexpected error in getOrCreateMarket")
    }

    async getMarket(url: string): Promise<CuratemMarket> {
        const hashDigest = ethers.utils.sha256(ethers.utils.toUtf8Bytes(url))
        const filter = this.curatemCommunity.filters.NewSpamPredictionMarket(hashDigest, null, null)
        const creationEvents = await this.curatemCommunity.queryFilter(filter)
        
        if(creationEvents.length) {
            const { market: marketAddress } = creationEvents[0].args
            const market = new CuratemMarket(this.provider, marketAddress)
            return market
        }
        
        return null
    }
    
    async createMarket(url: string): Promise<CuratemMarket> {
        log(`Creating market for url=${url}`)
        const createMarketTx = await this.curatemCommunity.createMarket(url)
        const receipt = await createMarketTx.wait(1)
        const { market: marketAddress } = receipt.events.filter(event => event.event == 'NewSpamPredictionMarket')[0].args
        log(`Created new market url=${url} marketAddress=${marketAddress}`)
        const market = new CuratemMarket(this.provider, marketAddress)
        return market
    }
}