#!/usr/bin/env bash
set -e

DEFAULT_AMOUNT=1000000000000000000000000
AMOUNT=$1

[ -z "$NEAR_ENV" ] && echo "Missing \$NEAR_ENV environment variable"
[ -z "$OWNER" ] && echo "Missing \$OWNER environment variable" && exit 1
[ -z "$CONTRACT" ] && echo "Missing \$CONTRACT environment variable" && exit 1
[ -z "$AMOUNT" ] && echo "Missing argument \$AMOUNT" && AMOUNT=$DEFAULT_AMOUNT

echo
echo "About to call withdraw_fees() on the factory contract"
echo near call \$CONTRACT withdraw_fees "{\"amount\":\"\$AMOUNT\"}" --account_id \$OWNER --gas 100000000000000
echo
echo \$CHARITY is $CHARITY
echo \$DONATION is $DONATION
echo \$AMOUNT is $AMOUNT
echo
near call $CONTRACT withdraw_fees "{\"amount\":\"$AMOUNT\"}" --account_id $OWNER --gas 100000000000000
