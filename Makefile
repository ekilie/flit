backend:
	cd apps/backend && npm run start:dev

rider-app:
	cd apps/rider-app && npm run start

driver-app:
	cd apps/driver-app && npm run start

all: backend rider-app driver-app