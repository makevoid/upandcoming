# configs

app_name = "upandcoming"


# deploy

require 'mina/bundler'
require 'mina/git'

set :domain,      'makevoid.com'
set :deploy_to,   "/www/#{app_name}"
set :repository,  "git://github.com/makevoid/#{app_name}"
set :branch,      'master'

set :shared_paths, ['log']

set :user, 'www-data'


task :environment do
  # load env here...
end

task :setup => :environment do
  queue! %[mkdir -p "#{deploy_to}/shared/log"]
  queue! %[chmod g+rx,u+rwx "#{deploy_to}/shared/log"]
end

task :more_shared_paths => :environment do
  issues = "#{deploy_to}/current/public/issues"
  queue "rm -f #{issues}"
  queue "ln -s #{deploy_to}/shared/issues #{issues}"
end

desc "Deploys the current version to the server."
task :deploy => :environment do
  deploy do

    invoke :'git:clone'
    invoke :'deploy:link_shared_paths'
    invoke :'bundle:install'

    to :launch do
      invoke :'more_shared_paths'
      queue 'mkdir -p tmp'
      queue 'touch tmp/restart.txt'
    end

  end
end
