TESTS = test/*.js

test:
	@NODE_ENV=test ./node_modules/.bin/mocha \
		--require should \
		--reporter spec \
		--timeout 50000 \
		$(TESTS)

test-travis:
	@NODE_ENV=test node  \
		node_modules/.bin/istanbul cover \
		./node_modules/.bin/_mocha \
		--report lcovonly \
		-- -u exports \
		--require should \
		--slow 5s \
		--timeout 50000 \
		$(TESTS) \
		--bail

.PHONY: test
