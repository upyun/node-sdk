NODE ?=

TEST = test/*

test:
	@$(NODE) ./node_modules/.bin/mocha \
		--require should \
		--reporter spec \
		--slow 2s \
		--bail

test-cov:
	@NODE_ENV=test node  \
		node_modules/.bin/istanbul cover \
		./node_modules/.bin/_mocha \
		-- -u exports \
		--require should \
		--timeout 30000 \
		$(TESTS) \
		--bail

test-travis:
	@NODE_ENV=test node  \
		node_modules/.bin/istanbul cover \
		./node_modules/.bin/_mocha \
		--report lcovonly \
		-- -u exports \
		--require should \
		--slow 2s \
		--timeout 30000 \
		$(TESTS) \
		--bail
		
.PHONY: test