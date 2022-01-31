/**
 * == CONSTANTS ================================================================
 *
 * ONE_NEAR = unit of NEAR token in yocto Ⓝ (1e24)
 * XCC_GAS = gas for cross-contract calls, ~5 Tgas (teragas = 1e12) per "hop"
 * MIN_ACCOUNT_BALANCE = 3 NEAR min to keep account alive via storage staking
 *
 * TODO: revist MIN_ACCOUNT_BALANCE after some real data is included b/c this
 *  could end up being much higher
 */
import {BN, Gas, NEAR} from "near-workspaces-ava";

export const ONE_NEAR = NEAR.parse('1')
export const XCC_GAS = Gas.parse('100000000000000')

export const INIT_ACCOUNT_BALANCE = ONE_NEAR.mul(new BN('150'))
export const MIN_ACCOUNT_BALANCE = ONE_NEAR.mul(new BN('3'))

export const MIN_DONATION_AMOUNT = ONE_NEAR
export const MIN_DONATION_AMOUNT_FEES = MIN_DONATION_AMOUNT.div(new BN('100'))
export const MIN_DONATION_AMOUNT_RECEIVED = MIN_DONATION_AMOUNT.sub(MIN_DONATION_AMOUNT_FEES)

export const LARGE_DONATION_AMOUNT = ONE_NEAR.mul(new BN('100'))
export const LARGE_DONATION_AMOUNT_FEES = LARGE_DONATION_AMOUNT.div(new BN('100'))
export const LARGE_DONATION_AMOUNT_RECEIVED = LARGE_DONATION_AMOUNT.sub(LARGE_DONATION_AMOUNT_FEES)
