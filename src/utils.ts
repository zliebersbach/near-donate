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
import {u128} from "near-sdk-as";

export const ONE_NEAR = u128.from('1000000000000000000000000');
export const XCC_GAS = 30000000000000;
export const MIN_ACCOUNT_BALANCE = u128.mul(ONE_NEAR, u128.from(3));
export const MIN_DONATION_AMOUNT = ONE_NEAR;
export const MIN_WITHDRAWAL_AMOUNT = ONE_NEAR;
export const PLATFORM_FEE_DIVISOR = u128.from("100")

/**
 * Account IDs in NEAR are just strings.
 */
export type AccountId = string;

/**
 * Amounts in NEAR are stored as u128.
 */
export type Amount = u128;

/**
 * Timestamp in NEAR is a number.
 */
export type Timestamp = u64;


/**
 * == FUNCTIONS ================================================================
 */

/**
 * @function asNEAR
 * @param amount {u128} - Yocto Ⓝ token quantity as an unsigned 128-bit integer
 * @returns {string}    - Amount in NEAR, as a string
 *
 * @example
 *
 *    asNEAR(7000000000000000000000000)
 *    // => '7'
 */
export function asNEAR(amount: u128): string {
  return u128.div(amount, ONE_NEAR).toString();
}
