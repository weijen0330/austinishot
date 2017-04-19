# lynx
Web app for sharing and archiving web content

## Installation & Development

### Prerequisites
Assuming you are on OSX...

If you do not have Node.js, download & install [Node.js](https://nodejs.org/en/download/)

If you do not have VirtualBox, download & install [VirtualBox](https://www.virtualbox.org/wiki/Downloads)

If you do not have Vagrant, download & install [Vagrant](https://www.vagrantup.com/downloads.html)

### Installing on your machine

```
$ cd <project>
$ npm install
```

Add project secrets:
```
$ mkdir secret
$ touch secret/config-db.json
```
In the db config, add this json object, filling in the blanks
```
{
	"host" : "127.0.0.1",
	"user" : "root",
	"password" : ""
}
```

### Starting Vagrant

```
$ vagrant up
$ vagrant ssh
```

**You're in!**

### Installing in Vagrant

```
$ cd /vagrant
$ export SIGSECRET=$(uuidgen)
```

Now we're ready for the good stuff:

```
$ node server
```

It should say:
```
listening at http://localhost:1234 (mapped from :80)
```

### YOU ARE GOOD TO GO
