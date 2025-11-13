FROM n8nio/n8n:latest
WORKDIR /usr/src/app
COPY . .
EXPOSE 5678
CMD ["n8n"]
