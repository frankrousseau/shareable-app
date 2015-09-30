

### Publish

Sign up to NPM :

```
npm set init.author.name "Brent Ertz"
npm set init.author.email "brent.ertz@gmail.com"
npm set init.author.url "http://brentertz.com"

npm adduser
```

Run publication command: 

```
npm version patch
npm publish
```


### Installation and run

Install your app as any global NPM module:

```
sudo npm install monapp -g
monapp
```


### Daemonize


You can use supervisor:

```
sudo apt-get install supervisor
```

Add file `/etc/supervisor/conf.d/monapp.conf` :

```
[program:monapp]
autorestart=false
command=monapp
redirect_stderr=true
user=nonuser
```

Then restart Supervisor :

```
supervisorctl update
```
