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
#Datasets:
Database = pd.read_csv("CSVFile/ComplaintsData.csv") #Placeholder
Training_Data = pd.read_csv("") #Placeholder
ArrangedDatabase = pd.read_csv("CSVFile\ArrangedData.csv")

# Output and Training Model:
@Main.route('/api/complaints', methods=['GET'])
def Emotion_Model():
    #Training Model:
    training = pd.DataFrame(Training_Data)
    X_train, y_train = training['text'], training['label']
    TrainingModel = make_pipeline(CountVectorizer(), MultinomialNB())
    TrainingModel.fit(X_train, y_train)
    return TrainingModel
    

def Arrange():
    prioritizedWords=[
        "corruption",
        "kurakot",
        "kinurakot",
        "kinorakot",
        "kinukurakot",
        "kinukorakot",
        "fraud",
        "harassment",
        "abuse",
        "pang-aabuso",
        "inaabuso",
        "abuso",
        "pagsasamantala",
        "sinasamantala",
        "pagsasamantalahan",
        "discrimination",
        "diskriminasyon",
    ]
    
    ArrangedDatabase = Database.copy()
    textComplaints = Database['Raw Complaint'].tolist()
    TrainingModel = Emotion_Model()

    #Scores the Database:
    probabilities = TrainingModel.predict_proba(textComplaints)
    emotion_labels = TrainingModel.classes_
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

    #Adds scores to the database:
    ArrangedDatabase['Anger Score'] = Anger_Score
    ArrangedDatabase['Fear Score'] = Fear_Score
    ArrangedDatabase['Joy Score'] = Joy_Score
    ArrangedDatabase['Neutral Score'] = Neutral_Score
    ArrangedDatabase['Sadness Score'] = Sadness_Score
    ArrangedDatabase['Surprise Score'] = Surprise_Score

    #Adds priority words based on prioritizedwords list
    ArrangedDatabase['Priority Word'] = ArrangedDatabase['Raw Complaint'].str.lower().apply(
        lambda x: any(word in x for word in prioritizedWords) if pd.notnull(x) else False #checks every word if true in list
    )

    #Sorts by maximum score
    ArrangedDatabase['Max Severity Score'] = ArrangedDatabase[['Anger Score', 'Sadness Score', 'Fear Score']].max(axis=1)

    #Sort Flagged Words
    ArrangedDatabase = ArrangedDatabase.sort_values(
        by=['Priority Word', 'Max Severity Score'],
        ascending=[False, False]
    )

    #Arranges
    ArrangedDatabase = ArrangedDatabase[[
        'ID', 
        'Arranged Name', 
        'Arranged Complaint', 
        'Anger Score',
        'Arranged Fear Score', 
        'Arranged Joy Score', 
        'Arranged Neutral Score',
        'Arranged Sadness Score', 
        'Arranged Surprise Score',
        'Predicted Agency', 
        'Priority Word'
    ]]

    # Save or return
    ArrangedDatabase.to_csv("CSVFile/ArrangedData.csv", index=False)
    return jsonify(ArrangedDatabase.to_dict(orient='records'))
