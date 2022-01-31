#!/usr/bin/env bash
set -e

DEFAULT_AMOUNT=1000000000000000000000000
AMOUNT=$1

[ -z "$NEAR_ENV" ] && echo "Missing \$NEAR_ENV environment variable"
[ -z "$CHARITY" ] && echo "Missing \$CHARITY environment variable" && exit 1
[ -z "$DONATION" ] && echo "Missing \$DONATION environment variable" && exit 1
[ -z "$AMOUNT" ] && echo "Missing argument \$AMOUNT" && AMOUNT=$DEFAULT_AMOUNT

echo
echo "About to call withdraw_donations() on the donation contract"
echo near call \$DONATION withdraw_donations "{\"amount\":\"\$AMOUNT\"}" --account_id \$CHARITY --gas 100000000000000
echo
echo \$CHARITY is $CHARITY
echo \$DONATION is $DONATION
echo \$AMOUNT is $AMOUNT
echo
near call $DONATION withdraw_donations "{\"amount\":\"$AMOUNT\"}" --account_id $CHARITY --gas 100000000000000
