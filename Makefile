.PHONY: install serve build check

install:
	npm ci
	npx playwright install chromium

serve:
	npm run serve

build:
	npm run build

check:
	npm run audit
	npm run format:check
	npm run lint
	npm run typecheck
	npm run build:check
	npm run test:links
	npm test
	npm run test:browser
	npm run test:lighthouse
