#!/bin/bash

# set default environment (if no argument passed, default to pre, support prod, pre)
MODE="pre"

# set default version (if no argument passed, default to latest)
VERSION="latest"

# parse arguments
while [[ $# -gt 0 ]]; do
    case $1 in
        --mode=*)
            MODE="${1#*=}"
            shift
            ;;
        --version=*)
            VERSION="${1#*=}"
            shift
            ;;
        *)
            echo "❌ Unknown option: $1"
            echo "Usage: ./build.sh [--mode=prod|pre] [--version=xxx]"
            exit 1
            ;;
    esac
done

# check arguments
if [ "$MODE" != "prod" ] && [ "$MODE" != "pre" ]; then
    echo "❌  invalid argument: $MODE 'prod' or 'pre'"
    exit 1
fi

# ensure buildx is usable
docker buildx inspect --bootstrap > /dev/null 2>&1
if [ $? -ne 0 ]; then
    echo "⚙️  Creating buildx builder..."
    docker buildx create --use
fi

# build image
IMAGE_HEAD="ccr.ccs.tencentyun.com/thld/${MODE}-nebulai-block-scan-scanner"
IMAGE_NAME="${IMAGE_HEAD}:${VERSION}"
echo "🔨 start building $IMAGE_NAME..."
if ! docker buildx build --platform linux/amd64 -f ./Dockerfile --build-arg BUILD_MODE=$MODE -t $IMAGE_NAME ../../ --load; then
    echo "❌ image build failed"
    exit 1
fi

# login image registry
echo "🔐 login image registry..."
if ! docker login -u 100042710641 -p t913d638l12h5 https://ccr.ccs.tencentyun.com; then
    echo "❌ login failed"
    exit 1
fi

echo "📤 start pushing $IMAGE_NAME..."
if ! docker push $IMAGE_NAME; then
    echo "❌ image push failed"
    docker logout
    exit 1
fi

# build complete
echo "✅ images built and pushed successfully: $IMAGE_NAME"