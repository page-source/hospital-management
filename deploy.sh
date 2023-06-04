kill -9 $(lsof -t -i:5000)
rm -rf .next/
npm i
npm run build
nohup npm run start > nohup.out 2>&1 &