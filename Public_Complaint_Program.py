from flask import Flask, jsonify, request
from flask_cors import CORS
from dotenv import load_dotenv
import os
import pandas as pd
from sklearn.feature_extraction.text import CountVectorizer
from sklearn.naive_bayes import MultinomialNB
from sklearn.pipeline import make_pipeline
from collections import Counter
import numpy as np

load_dotenv()
app = Flask(__name__)
CORS(app)

os.makedirs("CSVFile", exist_ok=True)

@app.route('/api/complaints', methods=['POST'])
def run_arrangement():
    data = request.get_json()
    name = data.get('name')
    complaint = data.get('complaint')
    location = data.get('location')
    Database = pd.read_csv("CSVFile/ComplaintsData.csv", encoding='cp1252')

    if Database.empty:
        ID = 1
    else:
        ID = Database['ID'].max() + 1

    new_row = {
        'ID': ID,
        'Name': name,
        'Raw Complaint': complaint,
        'Location': str(location) if location else ''
    }
    Database = pd.concat([Database, pd.DataFrame([new_row])], ignore_index=True)
    Database.to_csv("CSVFile/ComplaintsData.csv", index=False, encoding='cp1252')
    ArrangeLogic()
    return jsonify({"message": "Complaint submitted and arranged successfully"})

def assign_agency(complaint):
    if pd.isna(complaint):
        return ""
    complaint = complaint.lower()
    if "corrupt" in complaint or "kurakot" in complaint:
        return "Administrative Issues"
    elif "school" in complaint or "education" in complaint:
        return "Education Services"
    elif "garbage" in complaint or "basura" in complaint:
        return "Environment"
    elif "water" in complaint or "tubig" in complaint:
        return "Public Services"
    elif "electricity" in complaint or "blackout" in complaint:
        return "Infrastructure"
    elif "police" in complaint or "abuse" in complaint or "abusive" in complaint:
        return "Safety & Security"
    # Add more rules as needed
    return "Community Concerns"

def ArrangeLogic():
    Database = pd.read_csv("CSVFile/ComplaintsData.csv", encoding='cp1252')
    if not os.path.exists("CSVFile/TrainingDataset.csv"):
        pd.DataFrame({"Complaint":["test"],"Emotion":["neutral"]}).to_csv("CSVFile/TrainingDataset.csv", index=False)
    Training_Data = pd.read_csv("CSVFile/TrainingDataset.csv", encoding='cp1252')
    Training_Data['Emotion'] = Training_Data['Emotion'].str.strip().str.lower()
    X_train = Training_Data['Complaint'].fillna("").str.lower()
    y_train = Training_Data['Emotion']
    TrainingModel = make_pipeline(
        CountVectorizer(lowercase=True),
        MultinomialNB()
    )
    TrainingModel.fit(X_train, y_train)
    prioritizedWords = [
        "corruption", "corrupt", "kurakot", "kinurakot", "kinorakot",
        "kinukurakot", "kinukorakot", "fraud", "harassment", "abuse",
        "pang-aabuso", "inaabuso", "abuso", "pagsasamantala",
        "sinasamantala", "pagsasamantalahan", "discrimination", "diskriminasyon",
    ]
    textComplaints = Database['Raw Complaint'].fillna("").tolist()
    probabilities = TrainingModel.predict_proba(textComplaints)
    emotion_labels = TrainingModel.classes_
    emotion_scores = [dict(zip(emotion_labels, prob)) for prob in probabilities]
    Database['Anger Score'] = [score.get('anger', 0) for score in emotion_scores]
    Database['Fear Score'] = [score.get('fear', 0) for score in emotion_scores]
    Database['Joy Score'] = [score.get('joy', 0) for score in emotion_scores]
    Database['Neutral Score'] = [score.get('neutral', 0) for score in emotion_scores]
    Database['Sadness Score'] = [score.get('sadness', 0) for score in emotion_scores]
    Database['Surprise Score'] = [score.get('surprise', 0) for score in emotion_scores]
    Database['Flagged Words'] = Database['Raw Complaint'].str.lower().apply(
        lambda x: any(word in x for word in prioritizedWords)
    )
    Database['Max Severity Score'] = Database[['Anger Score', 'Sadness Score', 'Fear Score']].max(axis=1)
    Database = Database.sort_values(by=['Flagged Words', 'Max Severity Score'], ascending=[False, False])
    Database = Database.rename(columns={'Raw Complaint': 'Complaint'})
    # Assign predicted agency based on complaint
    Database['Predicted Agency'] = Database['Complaint'].apply(assign_agency)
    # If Status is not present, assign random for demo
    if 'Status' not in Database.columns:
        Database['Status'] = np.random.choice(['On Going', 'Accomplished', 'Failed'], size=len(Database))
    output = Database[[ 
        'ID', 'Name', 'Complaint', 'Location',
        'Anger Score', 'Fear Score', 'Joy Score', 'Neutral Score',
        'Sadness Score', 'Surprise Score',
        'Predicted Agency', 'Flagged Words', 'Status'
    ]]
    output.to_csv("CSVFile/ArrangedData.csv", index=False)
    return output

@app.route('/api/complaints', methods=['GET'])
def get_complaints():
    try:
        df = pd.read_csv('CSVFile/ArrangedData.csv')
    except FileNotFoundError:
        df = ArrangeLogic()
    df = df.replace({pd.NA: None, pd.NaT: None, float('nan'): None})
    return jsonify(df.to_dict(orient='records'))

@app.route('/api/admin/stats', methods=['GET'])
def get_admin_stats():
    try:
        df = pd.read_csv('CSVFile/ArrangedData.csv')
    except FileNotFoundError:
        df = ArrangeLogic()
    category_labels = [
        "Infrastructure", "Public Services", "Safety & Security",
        "Environment", "Administrative Issues", "Community Concerns"
    ]
    status_labels = ["On Going", "Accomplished", "Failed"]
    category_col = "Predicted Agency" if "Predicted Agency" in df.columns else "Category"
    status_col = "Status" if "Status" in df.columns else None
    category_counts = Counter(df[category_col].dropna()) if category_col in df else Counter()
    status_counts = Counter(df[status_col].dropna()) if status_col and status_col in df else Counter()
    category_result = {label: int(category_counts.get(label, 0)) for label in category_labels}
    status_result = {label: int(status_counts.get(label, 0)) for label in status_labels}
    return jsonify({
        "categoryCounts": category_result,
        "statusCounts": status_result
    })

if __name__ == '__main__':
    ArrangeLogic()
    app.run(host="0.0.0.0", port=5000, debug=True)