from flask import Flask, jsonify, request
from flask_cors import CORS  
from dotenv import load_dotenv
import os
import pandas as pd
import joblib
from oauth2client.service_account import ServiceAccountCredentials
from sklearn.preprocessing import PolynomialFeatures
from sklearn.feature_extraction.text import CountVectorizer
from sklearn.naive_bayes import MultinomialNB
from sklearn.pipeline import make_pipeline
from transformers import pipeline

app = Flask(__name__)

if __name__ == '__main__':
    app.run(host="0.0.0.0", port=5000, debug=True, use_reloader=False)
    app.run(debug=True)

#BACKEND DEVELOPMENT ----------------------------------
# Flask-React Connect:
@app.route('/api/complaints', methods=['POST'])
def run_arrangement():

    #Distribute Data from ComplaintsFormScreen

    name = request.form.get('name')
    complaint = request.form.get('complaint')
    location = request.form.get('location')
    #Datasets:
    Database = pd.read_csv("CSVFile/ComplaintsData.csv", encoding='cp1252')

    #Assign new ID based on the last one
    if Database.empty:
        ID = 1
    else:
        ID = Database['ID'].max() + 1

    # Add new entry to the database
    new_row = {
        'ID': ID,
        'Name': name,
        'Raw Complaint': complaint,
        'Location': str(location) if location else ''
    }

    Database = pd.concat([Database, pd.DataFrame([new_row])], ignore_index=True)

    #Save updated database
    Database.to_csv("CSVFile/ComplaintsData.csv", index=False, encoding='cp1252')

    return Arrange()


#Training Model and Classification Algorithm:
def ArrangeLogic():
    #Datasets:
    Database = pd.read_csv("CSVFile/ComplaintsData.csv", encoding='cp1252')
    Training_Data = pd.read_csv("CSVFile/TrainingDataset.csv", encoding='cp1252')

    #Training Model:
    Training_Data['Emotion'] = Training_Data['Emotion'].str.strip().str.lower()

    X_train = Training_Data['Complaint'].fillna("").str.lower()
    y_train = Training_Data['Emotion']
    TrainingModel = make_pipeline(
        CountVectorizer(lowercase=True),
        MultinomialNB()
    )
    TrainingModel.fit(X_train, y_train)

    #Flagged Words
    prioritizedWords = [
        "corruption", 
        "corrupt",
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

    #Predict emotion scores
    textComplaints = Database['Raw Complaint'].fillna("").tolist()
    probabilities = TrainingModel.predict_proba(textComplaints)
    emotion_labels = TrainingModel.classes_
    emotion_scores = [dict(zip(emotion_labels, prob)) for prob in probabilities]

    #Scores the Database
    Database['Anger Score'] = [score.get('anger', 0) for score in emotion_scores]
    Database['Fear Score'] = [score.get('fear', 0) for score in emotion_scores]
    Database['Joy Score'] = [score.get('joy', 0) for score in emotion_scores]
    Database['Neutral Score'] = [score.get('neutral', 0) for score in emotion_scores]
    Database['Sadness Score'] = [score.get('sadness', 0) for score in emotion_scores]
    Database['Surprise Score'] = [score.get('surprise', 0) for score in emotion_scores]

    #Adds priority words based on prioritizedwords list
    Database['Flagged Words'] = Database['Raw Complaint'].str.lower().apply(
        lambda x: any(word in x for word in prioritizedWords)
    )

    #Sorts by maximum score
    Database['Max Severity Score'] = Database[['Anger Score', 'Sadness Score', 'Fear Score']].max(axis=1)
    Database = Database.sort_values(by=['Flagged Words', 'Max Severity Score'], ascending=[False, False])

    #Rename from Raw Complaint (ComplaintsData) to Complaint (ArrangedData)
    Database = Database.rename(columns={'Raw Complaint': 'Complaint'})

    #Add Predicted Agency (WIP)
    if 'Predicted Agency' not in Database.columns:
        Database['Predicted Agency'] = ""

    #Final selected output
    output = Database[[ 
        'ID', 'Name', 'Complaint',
        'Anger Score', 'Fear Score', 'Joy Score', 'Neutral Score',
        'Sadness Score', 'Surprise Score',
        'Predicted Agency', 'Flagged Words'
    ]]

    #Save and return file
    output.to_csv("CSVFile/ArrangedData.csv", index=False)
    return output

def Arrange():
    output = ArrangeLogic()
    return jsonify(output.to_dict(orient='records'))

#Back and Front end connection:
if __name__ == '__main__':
    ArrangeLogic()  #Run once

    app.run(host='0.0.0.0', port=5000, debug=True)