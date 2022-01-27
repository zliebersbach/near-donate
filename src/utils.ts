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
export const XCC_GAS = 20000000000000;
export const MIN_ACCOUNT_BALANCE = u128.mul(ONE_NEAR, u128.from(3));
export const MIN_DONATION_AMOUNT = u128.mul(ONE_NEAR, u128.from(1));
export const PLATFORM_FEE_DIVISOR = u128.from("100")

export const PAGE_SIZE = 25

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
