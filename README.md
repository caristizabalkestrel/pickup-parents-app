# pickup-parents-app

Remove-Item -Recurse -Force node_modules
Remove-Item package-lock.json

npm cache clean --force

npm install

ionic serve
