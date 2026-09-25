#!/bin/bash
set -e

# Run from the project root no matter where the script is invoked from
cd "$(dirname "$0")"

if [ ! -f Dockerfile ]; then
  echo "ERROR: Dockerfile not found in $PWD. Run this script from the frontend project root." >&2
  exit 1
fi

IMAGE="${IMAGE:-registry.gitlab.comecommerceapplication-group/ecommerce-frontend}"
GITLAB_USER="${GITLAB_USER:-sarinitc}"
GITLAB_TOKEN="${GITLAB_TOKEN:-glpat-eik8iWKPDZxq8nTar2jBD2M6MQpvOjEKdTpwZDJ6dA8.01.170en6r59}"

if [ ! -f docker-version ]; then
  echo '1.0.0' > docker-version
  new_version='1.0.0'
else
  new_version=$(cat docker-version | awk -F '.' '{ print $1"."$2"."$3+1 }')
fi

if docker build --platform linux/amd64 -t "$IMAGE:$new_version" .; then
  if docker login -u "$GITLAB_USER" -p "$GITLAB_TOKEN" registry.gitlab.com; then
    if docker push "$IMAGE:$new_version"; then
      echo $new_version > docker-version
      echo "New version ($new_version) pushed successfully"
    fi
  fi
fi