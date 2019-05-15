COMPILE = node_modules/.bin/compile

all: haunted.js index.js web.js
.PHONY: all

haunted.js: src/*.js
	$(COMPILE) -f es -o $@ -e https://unpkg.com/lit-element@^2.1.0/lit-element.js src/haunted.js

index.js: haunted.js
	sed 's/https:\/\/unpkg\.com\/lit-element@\^2\.1\.0\/lit-element\.js/lit-element/' $^ > $@

web.js: haunted.js
	sed 's/https:\/\/unpkg\.com\/lit-element@\^2\.1\.0\/lit-element\.js/\.\.\/lit-element\/lit-element\.js/' $^ > $@

clean:
	@rm -f haunted.js index.js web.js
.PHONY: clean
