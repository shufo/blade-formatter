DOCKER_IMAGE_NAME ?= shufo/blade-formatter
# Please specify the directory and file name where the target file exists.
TARGET_DIRECTORY ?= $(PWD)
TARGET_FILE_NAME ?= sample.php

.PHONY: build
build:
	docker image build -t $(DOCKER_IMAGE_NAME) .

.PHONY: run
run:
	docker container run --rm -v $(TARGET_DIRECTORY)/$(TARGET_FILE_NAME):/app/$(TARGET_FILE_NAME) -w /app $(DOCKER_IMAGE_NAME) $(TARGET_FILE_NAME)

.PHONY: test
test:
	docker container run --rm --entrypoint=/bin/sh -v $(PWD)/__tests__:/app/__tests__ $(DOCKER_IMAGE_NAME) -c "yarn install && yarn run test"

.PHONY: debug
debug: 
	docker container run --rm -it --entrypoint=/bin/sh $(DOCKER_IMAGE_NAME) 