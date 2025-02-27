# Use ubuntu as base image (to mimic wsl/linux environment)
FROM ubuntu:latest

# Update the package list and install Ruby and Bundler
# -y flag automatically answers "Yes" to the installation prompt.
RUN apt-get update && apt-get install -y \
    ruby-full \
    build-essential

# Use version 2.5.9 of Bundler specified in Gemfile.lock
RUN gem install bundler -v '2.5.9' --user-install

# Set PATH to include the user-installed gems
ENV PATH="/root/.local/share/gem/ruby/3.2.0/bin:$PATH"

# Install Jekyll, version 4.4.1 specified in Gemfile.lock
RUN gem install jekyll -v '4.4.1' --user-install

# Copy files from /docs into the container
WORKDIR /app

COPY ./docs .

RUN bundle install

# Run the command to start the Jekyll server
# host 0.0.0.0 allows us to access the server from outside the container
# port 4000 is the default port for Jekyll
CMD ["bundle", "exec", "jekyll", "serve", "--host", "0.0.0.0", "--port", "4000"]

