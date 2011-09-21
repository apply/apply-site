NODE = node
TEST = NODE_ENV=test

test:
	@$(TEST) $(NODE) tests/models/blob_test.js
	@$(TEST) $(NODE) tests/models/item_test.js
	@$(TEST) $(NODE) scripts/clear_db.js
	@$(TEST) $(NODE) tests/integration/api.js

clear_search:
	@$(NODE) scripts/clear_search.js

clear_db:
	@$(NODE) scripts/clear_db.js

seed: clear_search clear_db
	@$(NODE) scripts/seed.js
	@$(NODE) scripts/reindex.js

reindex:
	@$(NODE) scripts/reindex.js

.PHONY: test reindex
