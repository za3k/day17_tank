run-debug:
	flask --debug run
run-demo:
	gunicorn3 -e SCRIPT_NAME=/hackaday/tank --bind 0.0.0.0:8017 app:app
