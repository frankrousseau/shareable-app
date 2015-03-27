

### Publication

```
npm version patch
npm publish
```


### Installation et utilisation


```
sudo npm install monapp -g
monapp
```


### Démonisation


On utilse Supervisor:

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

On met à jour Supervisor :

```
supervisorctl update
```
