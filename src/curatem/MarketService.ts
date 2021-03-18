
export class MarketService {
    log = require('debug')('MarketService')
    
    async getMarket(url: string): Promise<CuratemMarket> {
        // setup ethers contract.
        return
    }
}


export class CuratemMarket {
    contract: any

    checkMarket() {
        // Listen for finalization event.
    }

    onFinalized() {

    }
}