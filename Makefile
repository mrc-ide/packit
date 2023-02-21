
dependencies:
	@echo "Running dependencies"
	./scripts/run-dependencies

start-frontend:
	@echo "Installing dependencies and building frontend"
	@cd app && npm start

start-backend:
	@echo "Build backend"
	./api/gradlew -p api/app :app:run

test-frontend:
	@echo "Installing dependencies and building frontend"
	@cd app && \
	npm ci && npm run build

	@echo "Running eslint"
	npm run lint --prefix=app

	@echo "Testing frontend"
	npm test --prefix=app -- --coverage

test-backend:
	@echo "Build backend"
	./gradlew :app:test --stacktrace

build-and-push-database:
	./db/scripts/build-and-push

dummy-data:
	./db/scripts/populate