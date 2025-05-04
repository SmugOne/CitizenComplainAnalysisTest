from flask import Flask, jsonify, request
from flask_cors import CORS  
import pandas as pd
import os
from oauth2client.service_account import ServiceAccountCredentials
from sklearn.preprocessing import PolynomialFeatures
from sklearn.feature_extraction.text import CountVectorizer
from sklearn.naive_bayes import MultinomialNB
from sklearn.pipeline import make_pipeline
from transformers import pipeline
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

def Database():
    return jsonify {
        "Dataset": {
            "Name": "Public_Complaint_Program",
            "Description": "This dataset contains information about public complaints received by the program.",
            "Columns": {
                "Complaint_ID": "Unique identifier for each complaint",
                "Date": "Date of the complaint",
                "Category": "Category of the complaint",
                "Status": "Current status of the complaint",
                "Resolution": "Resolution provided for the complaint"
            },
            "Sample_Data": [
                {"Complaint_ID": 1, "Date": "2023-01-01", "Category": "Noise", "Status": "Resolved", "Resolution": "Apology issued"},
                {"Complaint_ID": 2, "Date": "2023-01-02", "Category": "Traffic", "Status": "Pending", "Resolution": None}
            ]   
        }
    }

