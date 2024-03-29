DOCKER_IMAGE_NAME ?= local/blade-formatter
TARGET_DIRECTORY ?= $(PWD)

ifeq (run,$(firstword $(MAKECMDGOALS)))
  TARGET_FILE_NAME := $(wordlist 2,2,$(MAKECMDGOALS))
  $(eval $(TARGET_FILE_NAME):;@:)
endif

.PHONY: build
build:
	docker build -t $(DOCKER_IMAGE_NAME) .

.PHONY: run
run:
	docker run --rm -v $(TARGET_DIRECTORY)/$(TARGET_FILE_NAME):/app/$(TARGET_FILE_NAME) -w /app $(DOCKER_IMAGE_NAME) $(TARGET_FILE_NAME)

.PHONY: test
test:
	docker run --rm --entrypoint=/bin/sh -v $(PWD)/__tests__:/app/__tests__ $(DOCKER_IMAGE_NAME) -c "yarn install && yarn run test"

.PHONY: debug
debug: 
	docker run --rm -it --entrypoint=/bin/sh $(DOCKER_IMAGE_NAME) 