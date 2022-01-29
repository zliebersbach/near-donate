
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

export const ONE_NEAR = '1000000000000000000000000'
export const XCC_GAS = '100000000000000'
export const INIT_ACCOUNT_BALANCE = '100' + ONE_NEAR.substr(1)
export const DONATE_ACCOUNT_BALANCE = '4' + ONE_NEAR.substr(1)
export const MIN_ACCOUNT_BALANCE = '3' + ONE_NEAR.substr(1)
export const MIN_DONATION_AMOUNT = '1' + ONE_NEAR.substr(1)
