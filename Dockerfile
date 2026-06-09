FROM n8nio/n8n:latest

ENTRYPOINT ["sh", "-c"]
CMD ["node -e \"require('http').createServer((req,res)=>res.end('temporary n8n debug container')).listen(process.env.PORT || 5678, '0.0.0.0', () => console.log('Temporary debug HTTP server listening'))\""]
