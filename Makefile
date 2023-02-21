
build-and-test-frontend:
	@echo "Installing dependencies and building frontend"
	@cd app && \
	npm ci && npm run build

	@echo "Running eslint"
	npm run lint --prefix=app

	@echo "Testing frontend"
	npm test --prefix=app -- --coverage

test-backend:
	@echo "Unit test backend"
 	./gradlew :app:test --stacktrace

build-and-push-database:
	./db/scripts/build-and-push