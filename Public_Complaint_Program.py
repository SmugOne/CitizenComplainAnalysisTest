from flask import Flask, jsonify, request
from flask_cors import CORS  
import pandas as pd

#database = pd.read_csv('complaints.csv')

#READ REACT NATIVE:
Main = Flask(__name__)
CORS(Main, resources={r"/api/*": {"origins": "*"}})  # Allow React frontend to call the API

@Main.route('/api/data', methods=['GET'])
def get_data():
    return jsonify({"message": "testing", "status": "success"})

@Main.route('/api/post', methods=['POST'])
def receive_data():
    received_data = request.json  # Get JSON data from React
    return jsonify({"received": received_data, "message": "Data received!"})

if __name__ == '__main__':
    Main.run(host='0.0.0.0', port=5000, debug=True)

