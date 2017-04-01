# lynx
Web app for sharing and archiving web content

## Installation & Development

### Prerequisites
Assuming you are on OSX...
If you do not have Node.js, install Node.js
If you do not have VirtualBox, install VirtualBox
If you do not have Vagrant, install Vagrant

### Installing on your machine

```
$ cd <project>
$ npm install
```

Add project secrets:
```
$ mkdir secret
$ touch secret/config-maria.json
```
In the maria config, add this json object, filling in the blanks
```
{
	"host": 127.0.0.1,
	"user": [user],
	"password": [password]
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

Some things don't transfer well between osx & ubuntu, so we gotta install these again:

```
$ npm install bcrypt
$ npm install mariasql
```

Now we're ready for the good stuff:

```
$ node server.js
```

It should say:
```
listening at http://localhost:80
```

Which gets remapped in the `Vagrantfile` to `1234` on your machine:
```
http://localhost:1234
```

### Starting Webpack

Webpack runs in OSX to watch for file changes and build the result:

```
$ cd <project>
$ npm run dev
```

Watch this output to make sure you don't have syntax errors caught by Babel, and be patient to let the build run before refreshing your browser and seeing your changes.

### YOU ARE GOOD TO GO
