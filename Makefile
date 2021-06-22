LOCAL_FRONTEND=../frontend

js: 
	cp $(LOCAL_FRONTEND)/digital_land_frontend/static/javascripts/dl-maps.js docs/dl-maps.js
	rsync -r $(LOCAL_FRONTEND)/digital_land_frontend/static/javascripts docs

css:
	cp $(LOCAL_FRONTEND)/digital_land_frontend/static/stylesheets/dl-frontend.css docs/stylesheets/dl-frontend.css

map:
	mkdir -p docs/{stylesheets,javascripts}
	python3 render.py --local

local-assets: js css

render: map local-assets