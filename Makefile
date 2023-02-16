
frontend:
	@echo "Installing dependencies and building frontend"
	@cd app && \
	npm ci && npm run build

	@echo "Running eslint"
	npm run lint --prefix=app

	@echo "Testing frontend"
	npm test --prefix=app -- --coverage

#Install dependencies, run eslint, build and test frontend
frontend.deploy:
	$(MAKE) frontend
