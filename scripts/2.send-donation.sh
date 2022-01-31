#!/usr/bin/env bash
set -e

DEFAULT_AMOUNT=110
AMOUNT=$1

[ -z "$NEAR_ENV" ] && echo "Missing \$NEAR_ENV environment variable"
[ -z "$OWNER" ] && echo "Missing \$OWNER environment variable" && exit 1
[ -z "$DONATION" ] && echo "Missing \$DONATION environment variable" && exit 1
[ -z "$AMOUNT" ] && echo "Missing argument \$AMOUNT" && AMOUNT=$DEFAULT_AMOUNT

echo
echo "About to call send_donation() on the donation contract"
echo near call \$DONATION send_donation '{}' --account_id \$OWNER --amount \$AMOUNT --gas 100000000000000
echo
echo \$DONATION is $DONATION
echo \$OWNER is $OWNER
echo \$AMOUNT is $AMOUNT
echo
near call $DONATION send_donation '{}' --account_id $OWNER --amount $AMOUNT --gas 100000000000000
