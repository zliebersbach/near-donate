#!/usr/bin/env bash
set -e

[ -z "$NEAR_ENV" ] && echo "Missing \$NEAR_ENV environment variable"
[ -z "$CONTRACT" ] && echo "Missing \$CONTRACT environment variable" && exit 1
[ -z "$CHARITY" ] && echo "Missing \$CHARITY environment variable" && exit 1

echo
echo "About to call add_account() on the factory contract"
echo near call \$CONTRACT add_account '{}' --account_id \$CHARITY --amount 3 --gas 100000000000000
echo
echo \$CONTRACT is $CONTRACT
echo \$CHARITY is $CHARITY
echo
near call $CONTRACT add_account '{}' --account_id $CHARITY --amount 3 --gas 100000000000000


echo --------------------------------------------
echo run the following commands
echo
echo 'export DONATION=<myorg.dev-123-456>'
echo
