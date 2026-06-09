FROM n8nio/n8n:latest

ENTRYPOINT ["sh", "-c"]
CMD ["echo 'Temporary debug container running for /data inspection'; sleep infinity"]
