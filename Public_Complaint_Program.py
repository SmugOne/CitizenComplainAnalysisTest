from flask import Flask, jsonify, request
from flask_cors import CORS  

Main = Flask(__name__)
CORS(Main, resources={r"/api/*": {"origins": "http://localhost:3000"}})  # Allow React frontend to call the API

@Main.route('/api/data', methods=['GET'])
def get_data():
    data = {"message": "Hello from Flask!", "status": "success"}
    return jsonify(data)

@Main.route('/api/post', methods=['POST'])
def receive_data():
    received_data = request.json  # Get JSON data from React
    return jsonify({"received": received_data, "message": "Data received!"})

if __name__ == '__main__':
    Main.run(debug=True)

