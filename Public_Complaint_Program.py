from flask import Flask, jsonify, request
from flask_cors import CORS  
import os
import pandas as pd
from oauth2client.service_account import ServiceAccountCredentials
from sklearn.preprocessing import PolynomialFeatures
from sklearn.feature_extraction.text import CountVectorizer
from sklearn.naive_bayes import MultinomialNB
from sklearn.pipeline import make_pipeline
from transformers import pipeline

#READ REACT NATIVE: ---------------------------
Main = Flask(__name__)
CORS(Main, resources={r"/api/*": {"origins": "*"}})  # Allow React frontend to call the API

@Main.route('/api/data', methods=['GET'])
def get_data():
    return jsonify({"message": "testing", "status": "success"})

@Main.route('/api/post', methods=['POST'])
def receive_data():
    received_data = request.json  # Get JSON data from React
    return jsonify({"received": received_data, "message": "Data received!"})
#Back and Front end connection:
if __name__ == '__main__':
    Main.run(host='0.0.0.0', port=5000, debug=True)

#BACKEND DEVELOPMENT ----------------------------------
# Output and Training Model:
@Main.route('/api/complaints', methods=['GET'])
def Model():

    #Datasets:
    Database = pd.read_csv("CSVFile/ComplaintsData.csv") #Placeholder 
    Training_Data = { } #Placeholder

    #Training Model:
    training = pd.DataFrame(Training_Data)
    X_train, y_train = training['text'], training['label']
    model = make_pipeline(CountVectorizer(), MultinomialNB())
    model.fit(X_train, y_train)
    
    textComplaints = Database['Raw Complaint'].tolist()
    #Predicted = model.predict(textComplaints)

    # Scores the Database
    probabilities = model.predict_proba(textComplaints)
    emotion_labels = model.classes_
    emotion_scores = []
    for prob in probabilities:
        score_dict = dict(zip(emotion_labels, prob))  
        emotion_scores.append(score_dict) 

    Anger_Score = [score.get('anger', 0) for score in emotion_scores]
    Fear_Score = [score.get('fear', 0) for score in emotion_scores]
    Joy_Score = [score.get('joy', 0) for score in emotion_scores]
    Sadness_Score = [score.get('sadness', 0) for score in emotion_scores]
    Neutral_Score = [score.get('neutral', 0) for score in emotion_scores]
    Surprise_Score = [score.get('surprise', 0) for score in emotion_scores]

    # Adds scores to the database:
    Database['Anger Score'] = Anger_Score
    Database['Fear Score'] = Fear_Score
    Database['Joy Score'] = Joy_Score
    Database['Neutral Score'] = Neutral_Score
    Database['Sadness Score'] = Sadness_Score
    Database['Surprise Score'] = Surprise_Score
    
    # Converts all database and results to "Model Output"
    return jsonify(Database.to_dict(orient='Model Output'))

def NLP():
    prioritize=[
        "Corruption",
        "Fraud",
        "Harassment",
        "Discrimination",
    ]

    # converts prioritization words to "Prioritize"
    return jsonify(prioritize.to_dict(orient='Prioritize'))

#Placeholder:
def Dataframe():
    return jsonify(
        {
             "Columns": [
                 {"Raw Complaint": None},
                 {"Anger Score": None},
                 {"Fear Score": None},
                 {"Joy Score": None},
                 {"Neutral Score": None},
                 {"Sadness Score": None},
                 {"Surprise Score": None},
            ]
        }
    )
