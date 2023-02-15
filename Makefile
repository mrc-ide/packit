
frontend:
	@echo "Installing dependencies and building frontend"
	@cd app && \
	npm ci && npm run build

	@echo "Running eslint"
	npm run lint --prefix=app

	@echo "Testing frontend"
	npm test --prefix=app -- --coverage

#Builds install dependencies, builds, test frontend and linting
frontend.deploy:
	$(MAKE) frontend

db:
	./db/scripts/run
