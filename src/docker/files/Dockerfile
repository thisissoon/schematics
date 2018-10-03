#
# Builds a docker image to run <%= name %>
#
<% if (universal) { %>
# Pull node base image
FROM mhart/alpine-node:8

# Create app directory
RUN mkdir -p /usr/src/app
WORKDIR /usr/src/app

# Install app dependencies
COPY package.json /usr/src/app/
COPY package-lock.json /usr/src/app/
RUN npm i --no-progress -g forever
RUN npm i --no-progress --production

# Bundle app source
COPY ./dist/ /usr/src/app/dist/

EXPOSE 4000
CMD forever -o ${OUTFILE:-OUTFILE.log} -e ${ERRFILE:-ERRFILE.log} -l ${LOGFILE:-LOGFILE.log} ./dist/server.js<% } else { %>
# Pull alpine base image
FROM alpine:3.8

# Install Nginx
RUN apk add --update nginx && \
    rm -rf /var/cache/apk/*

RUN mkdir -p /run/nginx

# Bundle app build
COPY /<%= distFolder %> /<%= name %>

WORKDIR /<%= name %>

# Add nginx config - overwrite bundled nginx.conf
COPY nginx.conf /etc/nginx/

# Volumes
VOLUME ["/etc/nginx"]

# Expose ports
EXPOSE 80

CMD nginx<% } %>
