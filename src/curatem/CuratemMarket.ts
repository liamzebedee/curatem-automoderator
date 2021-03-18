
import { SpamPredictionMarket, SpamPredictionMarket__factory } from '@curatem/contracts/typechain'
import * as ethers from 'ethers'
import { ETH_EVENTS_FROMBLOCK } from '../config'
const log = require('debug')('MarketService')

const outcomes = <const>['notspam', 'spam', 'invalid']

type Outcome = typeof outcomes[number];

export class CuratemMarket {
    contract: SpamPredictionMarket

    constructor(provider: ethers.Signer, address: string) {
        this.contract = SpamPredictionMarket__factory.connect(address, provider)
    }

    // getOdds() {
    // }

    async onFinalized(cb: (finalOutcome: Outcome) => void) {
        // Already finalized.
        const events = await this.contract.queryFilter(
            this.contract.filters.Finalized(), 
            ETH_EVENTS_FROMBLOCK
        )
        if(events.length > 0) {
            const outcome = await getOutcome(this.contract)
            await cb(outcome)
            return
        }

        // Future event.
        this.contract.once('Finalized', async ev => {
            const outcome = await getOutcome(this.contract)
            await cb(outcome)
        })
    }
}

async function getOutcome(contract: SpamPredictionMarket) {
    let outcome: Outcome

    const payouts = await contract.getPayouts()
    const totalSum = payouts.reduce((prev, curr) => prev.add(curr), ethers.BigNumber.from(0))
    
    if(totalSum.gt(ethers.BigNumber.from(1))) {
        outcome = 'invalid'
    } else {
        for(let i = 0; i < payouts.length; i++) {
            if(payouts[i].eq(1)) {
                outcome = outcomes[i]
                break
            }
        }
    }
    
    return outcome
}