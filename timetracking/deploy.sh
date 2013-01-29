#!/bin/sh
git pull
./manage.py syncdb
./manage.py runserver