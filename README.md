# README

## Local environment

Run `bundle install` and `bundle exec yarn install` to install all dependencies.

## Heroku

To deploy it on Heroku:

```
heroku create
git push heroku master
heroku run rails db:schema:load
heroku run rails db:seed
```
