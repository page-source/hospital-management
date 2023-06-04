kill -9 $(lsof -t -i:5000)
nohup npm run start > nohup.out 2>&1 &