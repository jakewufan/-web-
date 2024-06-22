#!/bin/bash

while true
do
    ansible-playbook playbook.yml
    sleep 60
    rm -f /var/www/html/*.json
done

