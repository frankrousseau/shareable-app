

### Publication

```
npm version patch
npm publish
```


### Publication


```
sudo npm install monapp -g
monapp
```


### Démonisation


*Supervisor*

```
sudo apt-get install supervisor
```

Ajouter le fichier `/etc/supervisor/conf.d/monapp.conf` :

```
[program:monapp]
autorestart=false
command=monapp
redirect_stderr=true
user=nonuser
```

