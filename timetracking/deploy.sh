#!/bin/sh
export LANG='en_US.UTF-8'
export LC_ALL='en_US.UTF-8'
git pull
./manage.py syncdb
./manage.py runserver