#!/usr/bin/env bash

# use noninteractive mode since this is automated
# this will suppress prompts like the root password prompt
# that normally comes up when installing MySQL
export DEBIAN_FRONTEND=noninteractive

# suppress erroneous error messages from dpkg-preconfigure
rm /etc/apt/apt.conf.d/70debconf

# update the package index 
apt-get update

#install vim
sudo apt-get install vim

# install git
apt-get install -y git

# install software-properties-common
# (gets us add-apt-repository command)
apt-get install -y software-properties-common

# install Node.js v5.x
# curl -sL https://deb.nodesource.com/setup_6.x | bash -
curl -sL https://deb.nodesource.com/setup_7.x | sudo -E bash -
sudo apt-get install -y nodejs

# install build-essential for Node modules w/native code
apt-get install -y build-essential

# allow Node.js servers to bind to low ports
apt-get install -y chase libcap2-bin
setcap cap_net_bind_service=+ep $(chase $(which node))

# install MariaDB 10.1
apt-key adv --recv-keys --keyserver hkp://keyserver.ubuntu.com:80 0xcbcb082a1bb943db
add-apt-repository 'deb [arch=amd64,i386] http://sfo1.mirrors.digitalocean.com/mariadb/repo/10.1/ubuntu trusty main'
apt-get update
apt-get install -y mariadb-server

# run the SQL commands from the mysql_secure_installation script
# except for setting the root password (so that we don't embed)
# the root password in our provisioning script
mysql -u root <<-EOF
DELETE FROM mysql.user WHERE User='root' AND Host NOT IN ('localhost', '127.0.0.1', '::1');
DELETE FROM mysql.user WHERE User='';
DELETE FROM mysql.db WHERE Db='test' OR Db='test\_%';
FLUSH PRIVILEGES;
EOF

# install recent version of redis
add-apt-repository -y ppa:rwky/redis
apt-get update
apt-get install -y redis-server

# Installing java and solr
# https://www.vultr.com/docs/how-to-install-and-configure-solr-on-ubuntu-14-04
# 
# apt-get install python-software-properties
# add-apt-repository ppa:webupd8team/java -y
# apt-get update -y
# apt-get install oracle-java8-installer -y
# apt-get install ant -y
# wget http://apache.mirror1.spango.com/lucene/solr/5.2.1/solr-5.2.1.tgz
# tar xzf solr-5.2.1.tgz solr-5.2.1/bin/install_solr_service.sh --strip-components=2
# ./install_solr_service.sh solr-5.2.1.tgz

# set the loglevel for npm to show errors only
npm config set loglevel error -g

# create database
mysql -u root < /vagrant/server/database/schema.sql
mysql -u root < /vagrant/server/database/populate.sql