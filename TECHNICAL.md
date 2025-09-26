erverAPI.gd
extends Node

# The base URL of your backend server.
# For local development, this might be:
const BASE_URL = "http://localhost:3000"

# This variable will store the authentication token we get after logging in.
var auth_token = null

# We'll define signals to let the rest of the game know when things happen.
signal login_successful
signal login_failed(error_message)
signal state_updated(new_state)
