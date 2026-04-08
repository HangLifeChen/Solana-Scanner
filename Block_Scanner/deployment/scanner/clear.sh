#!/bin/bash

# set default environment (if no argument passed, default to pre, support prod, pre)
MODE="pre"

# parse arguments
while [[ $# -gt 0 ]]; do
    case $1 in
        --mode=*)
            MODE="${1#*=}"
            shift
            ;;
        *)
            echo "❌ Unknown option: $1"
            echo "📘 Usage: ./build.sh [--mode=prod|pre]"
            exit 1
            ;;
    esac
done

IMAGE_HEAD="ccr.ccs.tencentyun.com/thld/${MODE}-nebulai-block-scan-scanner"
IMAGES=$(docker images | grep "${IMAGE_HEAD}" | awk '{print $3}')

# if no images are found, output a message and exit
if [ -z "$IMAGES" ]; then
    echo "❌ No images found matching '${IMAGE_HEAD}'. Nothing to remove."
    exit 0
fi

# delete the images
echo "🧹 Removing images with '${IMAGE_HEAD}':"
docker rmi $IMAGES

echo "✅ Cleanup completed!"
